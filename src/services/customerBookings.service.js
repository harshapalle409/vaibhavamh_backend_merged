import { supabase } from "../config/supabase.js";

/* ══════════════════════════════════════════════
   CREATE BOOKING
══════════════════════════════════════════════ */
export const createBookingService = async (payload) => {
  const {
    user_id,
    vendor_category_id,
    booking_date,
    booking_time,
    to_time,
    booking_details,
    enquiry_notes,
  } = payload;

  // Look up customer profile
  const { data: customer, error: customerError } = await supabase
    .from("customer_profiles")
    .select("id")
    .eq("user_id", user_id)
    .single();

  if (customerError || !customer) {
    throw new Error("Customer profile not found for this user.");
  }

  // Duplicate booking guard
  const { data: existing } = await supabase
    .from("customer_bookings")
    .select("id, status")
    .eq("customer_id", customer.id)
    .eq("vendor_category_id", vendor_category_id)
    .eq("booking_date", booking_date)
    .in("status", ["pending", "confirmed"])
    .maybeSingle();

  if (existing) {
    const err = new Error(
      "You have already sent a booking request to this vendor for the same date. " +
        "Please check your bookings or choose a different date."
    );
    err.statusCode = 409;
    throw err;
  }

  // Derive total amount
  const total_amount =
    Number(booking_details?.selected_price) ||
    Number(booking_details?.plates_count || 0) *
      Number(booking_details?.price_per_plate || 0) ||
    null;

  const { data, error } = await supabase
    .from("customer_bookings")
    .insert({
      customer_id: customer.id,
      vendor_category_id,
      booking_date,
      booking_time: booking_time || null,
      to_time: to_time || null,
      booking_details,
      enquiry_notes: enquiry_notes || null,
      total_amount,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/* ══════════════════════════════════════════════
   GET MY BOOKINGS  — joins payments table
   Returns every customer_bookings column + 
   payment { status, amount, transaction_id }
══════════════════════════════════════════════ */
export const getMyBookingsService = async (userId) => {
  // Resolve customer_id from auth user id
  const { data: customer, error: customerError } = await supabase
    .from("customer_profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (customerError || !customer) {
    throw new Error("Customer profile not found.");
  }

  // Fetch bookings with nested payments (one-to-one via uq_payment_booking)
  const { data, error } = await supabase
    .from("customer_bookings")
    .select(`
      id,
      customer_id,
      vendor_category_id,
      booking_date,
      to_date,
      booking_time,
      to_time,
      status,
      total_amount,
      booking_details,
      enquiry_notes,
      created_at,
      updated_at,
      payments (
        id,
        status,
        amount,
        transaction_id,
        created_at,
        updated_at
      )
    `)
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Flatten payments: each booking has at most 1 payment (unique constraint)
  return (data || []).map((b) => ({
    ...b,
    payment: Array.isArray(b.payments) ? (b.payments[0] || null) : b.payments || null,
    payments: undefined, // remove the array key
  }));
};

/* ══════════════════════════════════════════════
   CANCEL BOOKING
   Only allows cancellation when status = 'pending'
══════════════════════════════════════════════ */
export const cancelBookingService = async (bookingId, userId) => {
  // Verify the booking belongs to this user
  const { data: customer } = await supabase
    .from("customer_profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!customer) throw new Error("Customer profile not found.");

  const { data: booking, error: fetchError } = await supabase
    .from("customer_bookings")
    .select("id, status, customer_id")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) throw new Error("Booking not found.");

  if (booking.customer_id !== customer.id) {
    const err = new Error("You are not authorised to cancel this booking.");
    err.statusCode = 403;
    throw err;
  }

  if (booking.status !== "pending") {
    const err = new Error(
      `Cannot cancel a booking with status '${booking.status}'. Only pending bookings can be cancelled.`
    );
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await supabase
    .from("customer_bookings")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
