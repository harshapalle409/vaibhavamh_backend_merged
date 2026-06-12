import { supabase } from "../config/supabase.js";

export const searchLocations = async (search) => {
  const searchTerm = search.split(",")[0].trim();

  const { data, error } = await supabase
    .from("vendor_service_locations")
    .select("id, area, city, state")
    .or(
      `area.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`
    )
    .order("area");

  if (error) {
    console.error("Location Error:", error);
    return { data: null, error };
  }

  const uniqueLocations = Array.from(
    new Map(
      data.map(item => [
        `${item.area}-${item.city}`,
        item
      ])
    ).values()
  );

  return {
    data: uniqueLocations,
    error: null
  };
};