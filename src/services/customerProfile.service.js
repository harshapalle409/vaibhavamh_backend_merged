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
      .eq("status", "active")
      .single();

  if (error) {
    throw error;
  }

  return user;
};

export const updateCustomerProfileService =
async (userId, body) => {

  const {
    full_name,
    phone,
    address,
    city,
    state,
    country
  } = body;

  const { error: userError } =
    await supabase
      .from("users")
      .update({
        full_name,
        phone
      })
      .eq("id", userId);

  if (userError) throw userError;

  const { error: profileError } =
    await supabase
      .from("customer_profiles")
      .update({
        address,
        city,
        state,
        country,
        is_profile_completed: true
      })
      .eq("user_id", userId);

  if (profileError) throw profileError;

  return true;
};

export const updateProfileImageService =
async (userId, imageUrl) => {

  const { error } =
    await supabase
      .from("customer_profiles")
      .update({
        profile_image_url: imageUrl
      })
      .eq("user_id", userId);

  if (error) throw error;

  return true;
};

export const deleteCustomerAccountService =
async (userId) => {

  const { error } =
    await supabase
      .from("users")
      .update({
        status: "deleted"
      })
      .eq("id", userId);

  if (error) {
    throw error;
  }

  return true;
};