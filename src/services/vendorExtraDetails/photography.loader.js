import { supabase } from "../../config/supabase.js";

export const getPhotographyDetails = async (serviceId) => {

  // 1. Core photography record
  const { data: photography, error } = await supabase
    .from("photography")
    .select("*")
    .eq("id", serviceId)
    .single();

  if (error) throw error;

  // 2. Packages → package_type + items + albums (nested)
  const { data: packages } = await supabase
    .from("photography_packages")
    .select(`
      *,
      photography_package_types ( id, type_name ),
      photography_items (
        id,
        item_name,
        max_units,
        price_per_unit_hourly,
        hours
      ),
      photography_albums (
        id,
        album_type_name,
        units,
        sheets,
        price
      )
    `)
    .eq("photography_id", serviceId)
    .order("created_at", { ascending: true });

  // 3. Amenities
  const { data: amenitiesRaw } = await supabase
    .from("photography_amenities")
    .select("id, amenity_name")
    .eq("photography_id", serviceId);

  const facilities = (amenitiesRaw || []).map(a => ({
    id:   a.id,
    name: a.amenity_name,
  }));

  // 4. Rules
  const { data: rulesRaw } = await supabase
    .from("photography_rules")
    .select("id, rule_text")
    .eq("photography_id", serviceId);

  const rules = (rulesRaw || []).map(r => ({
    id:   r.id,
    rule: r.rule_text,
  }));

  // 5. Active discounts (valid today or future)
  const today = new Date().toISOString().split("T")[0];
  const { data: discounts } = await supabase
    .from("photography_discounts")
    .select("*")
    .eq("photography_id", serviceId)
    .eq("is_active", true)
    .lte("valid_from", today)
    .or(`valid_to.is.null,valid_to.gte.${today}`)
    .order("discount_value", { ascending: false });

  return {
    service: photography,

    packageData: {
      packages: packages || [],
    },

    facilities,

    rules,

    discounts: discounts || [],

    images: [],  // photography_images table not in schema — placeholder
  };
};
