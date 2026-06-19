import { supabase }
from "../../config/supabase.js";

export const getVenueDetails =
async (serviceId) => {

  const { data: venue, error }
    = await supabase
      .from("venues")
      .select("*")
      .eq("id", serviceId)
      .single();

  if (error) {
    throw error;
  }

  const { data: pricing } =
    await supabase
      .from("venue_pricing")
      .select("*")
      .eq("venue_id", serviceId)
      .single();
  
const { data: amenities } =
  await supabase
    .from("venue_amenities")
    .select(`
      *,
      amenities(*)
    `)
    .eq(
      "venue_id",
      serviceId
    );

  const facilities =
  (amenities || [])
    .map(item => ({
      name:
        item.amenities?.name
    }));

  const { data: rules } =
    await supabase
      .from("venue_rules")
      .select("*")
      .eq(
        "venue_id",
        serviceId
      );

  const { data: additionalServices }
    = await supabase
      .from(
        "venue_additional_services"
      )
      .select("*")
      .eq(
        "venue_id",
        serviceId
      );

      const { data: images } =
await supabase
  .from("venue_images")
  .select("*")
  .eq(
    "venue_id",
    serviceId
  );

  return {

  service: venue,

  packageData: {

    pricing:
      pricing || {},

    additionalServices:
      additionalServices || []

  },

  facilities,

  rules:
    rules || [],

  images:
    images || []

};
};