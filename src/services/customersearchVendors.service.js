import { supabase } from "../config/supabase.js";

export const searchVendors = async ({
  location,
  categoryId,
  eventDate
}) => {

  const CATEGORY_TABLES = {
  201: "venues",
  202: "makeup",
  203: "photography",
  204: "dj",
  205: "catering_services",
  206: "decoration_services"
};

  /*
   * STEP 1
   * Find vendor_category_ids from location
   */

  let vendorCategoryIds = [];

  if (location?.trim()) {

    const { data: locations } = await supabase
      .from("vendor_service_locations")
      .select("vendor_category_id")
      .or(
        `area.ilike.%${location}%,city.ilike.%${location}%`
      );

    if (!locations?.length) {
      return [];
    }

    vendorCategoryIds =
      locations.map(
        x => x.vendor_category_id
      );
  }


  const tableName = CATEGORY_TABLES[categoryId];

  if (!tableName) {
    throw new Error(
      `Unsupported category: ${categoryId}`
    );
  }
  /*
   * STEP 2
   * Category filter
   */

  let categoryQuery =
    supabase
      .from("vendor_categories")
      .select("id")
      .eq("category_id", categoryId);

  if (vendorCategoryIds.length > 0) {
    categoryQuery =
      categoryQuery.in(
        "id",
        vendorCategoryIds
      );
  }

  const {
    data: vendorCategories
  } = await categoryQuery;

  vendorCategoryIds =
    vendorCategories.map(
      x => x.id
    );

  /*
   * STEP 3
   * Date availability filter
   */

  if (eventDate) {

    const { data: blocked } =
      await supabase
        .from("vendor_category_availability")
        .select("vendor_category_id")
        .eq("date", eventDate)
        .in("status", [
          "booked",
          "hold",
          "unavailable"
        ]);

    const blockedIds =
      blocked.map(
        x => x.vendor_category_id
      );

    vendorCategoryIds =
      vendorCategoryIds.filter(
        id => !blockedIds.includes(id)
      );
  }

  /*
   * STEP 4
   * Get Subcategories
   */

  const { data: mappings } =
    await supabase
      .from("vendor_subcategory_mapping")
      .select(`
        vendor_category_id,
        subcategory_id,
        subcategories (
          id,
          name
        )
      `)
      .in(
        "vendor_category_id",
        vendorCategoryIds
      );

  /*
   * STEP 5
   * Get vendorsData
   */

  const { data: vendorsData } =
  await supabase
    .from(tableName)
    .select("*")
    .eq("is_active", true)
    .in(
      "vendor_category_id",
      vendorCategoryIds
    );
  
  // for loactions for each vendor
  const { data: locationsData } = await supabase
  .from("vendor_service_locations")
  .select(`
    vendor_category_id,
    area,
    city,
    state
  `)
  .in("vendor_category_id", vendorCategoryIds);
  
  const locationMap = {};

locationsData.forEach(loc => {
  locationMap[loc.vendor_category_id] = loc;
});

  /*
   * STEP 6
   * Group by subcategory
   */

  const grouped = [];

  mappings.forEach(mapping => {

    const subId =
      mapping.subcategories.id;

    let section =
      grouped.find(
        x => x.id === subId
      );

    if (!section) {

      section = {
        id: subId,
        name:
          mapping.subcategories.name,
        vendors: []
      };

      grouped.push(section);
    }

    const matchedvendorsData =
      vendorsData.filter(
        v =>
          v.vendor_category_id ===
          mapping.vendor_category_id
      )
    .map(v => ({
      ...v,
      location:
        locationMap[v.vendor_category_id] || null
    }));

    section.vendors.push(
      ...matchedvendorsData
    );
  });

  return grouped;
};