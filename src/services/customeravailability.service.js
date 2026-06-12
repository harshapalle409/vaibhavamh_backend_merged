import {supabase }from "../config/supabase.js";

export const getAvailability = async (
  vendorCategoryId,
  date,
  guestCount
) => {

  /*
  ---------------------------------
  CHECK VENUE CAPACITY
  ---------------------------------
  */

  const { data: venue } =
    await supabase
      .from("venues")
      .select("capacity")
      .eq(
        "vendor_category_id",
        vendorCategoryId
      )
      .single();

  if (
    venue?.capacity &&
    Number(guestCount) > venue.capacity
  ) {

    return {
      available: false,
      reason: `Maximum capacity is ${venue.capacity}`
    };
  }

  /*
  ---------------------------------
  CHECK DATE
  ---------------------------------
  */

  const { data: availability } =
    await supabase
      .from(
        "vendor_category_availability"
      )
      .select("*")
      .eq(
        "vendor_category_id",
        vendorCategoryId
      )
      .eq("date", date)
      .maybeSingle();

  if (availability) {

    return {
      available: false,
      reason:
        availability.status ||
        "Booked"
    };
  }

  return {
    available: true,
    reason: "Available"
  };
};