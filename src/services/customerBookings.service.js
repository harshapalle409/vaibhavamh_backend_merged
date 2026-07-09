import { supabase }
from "../config/supabase.js";

export const createBookingService =
async (payload) => {

const {
user_id,
vendor_category_id,
booking_date,
booking_time,
to_time,
booking_details,
enquiry_notes
} = payload;

// ── Look up customer profile ──
const { data: customer, error: customerError } =
  await supabase
    .from("customer_profiles")
    .select("id")
    .eq("user_id", user_id)
    .single();

if (customerError || !customer) {
  throw new Error("Customer profile not found for this user.");
}

// ── FIX #5: Duplicate booking check ──
// Block if the same customer already has a pending/confirmed booking
// for the same vendor on the same date
const { data: existing } =
  await supabase
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

// ── Derive total amount ──
const total_amount =
  Number(booking_details?.selected_price) ||
  (
    Number(booking_details?.plates_count || 0) *
    Number(booking_details?.price_per_plate || 0)
  ) ||
  null;

const { data, error } =
  await supabase
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
      status: "pending"
    })
    .select()
    .single();

if (error) throw error;

return data;
};




export const getMyBookingsService =
async (userId) => {

const { data: customer, error: customerError } =
  await supabase
    .from("customer_profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

if (customerError || !customer) {
  throw new Error("Customer profile not found.");
}

const { data, error } =
  await supabase
    .from("customer_bookings")
    .select("*")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false });

if (error) throw error;

return data;
};