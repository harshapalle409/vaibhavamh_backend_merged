import { supabase }
from "../config/supabase.js";

export const getCustomerProfileService =
async (userId) => {

  const { data: user, error } =
    await supabase
      .from("users")
      .select(`
        id,
        full_name,
        email,
        phone,
        customer_profiles (
          id,
          address,
          city,
          state,
          country,
          profile_image_url,
          is_profile_completed
        )
      `)
      .eq("id", userId)
      .single();

  if (error) {
    throw error;
  }

  return user;
};