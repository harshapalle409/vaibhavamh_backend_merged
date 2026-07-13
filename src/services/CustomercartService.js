import { supabase } from "../config/supabase.js";

const CATEGORY_TABLES = {
  201: "venues",
  202: "makeup",
  203: "photography",
  204: "dj",
  205: "catering_services",
  206: "decoration_services",
};

const PLACEHOLDER_IMAGES = {
  venue: "https://images.unsplash.com/photo-1519167758481-83f550bb49b8?q=80&w=800&auto=format&fit=crop",
  catering:
    "https://media.istockphoto.com/id/175506580/photo/luxury-buffet.jpg?s=612x612&w=0&k=20&c=--XhWIS-ay9tgXjXNXlrtTs2wRG97JZLB4sqFE_Vx24=",
  decoration:
    "https://img.staticmb.com/mbcontent/images/crop/uploads/2023/8/Heaven_4_0_1200.jpg.webp",
  photography: "/static/media/photography.jpg",
  makeup: "/static/media/makeup.webp",
  music: "/static/media/musicanddj.jpg",
};

function getImageType(categoryId) {
  switch (Number(categoryId)) {
    case 201:
      return "venue";
    case 205:
      return "catering";
    case 206:
      return "decoration";
    case 203:
      return "photography";
    case 202:
      return "makeup";
    case 204:
      return "music";
    default:
      return "venue";
  }
}

function getPlaceholderImage(categoryId) {
  return PLACEHOLDER_IMAGES[getImageType(categoryId)] || PLACEHOLDER_IMAGES.venue;
}

export function formatIndianPrice(amount) {
  if (amount == null || amount === "") return "Price on Request";
  const num = Number(amount);
  if (Number.isNaN(num)) return "Price on Request";
  if (num >= 100000) {
    const lakhs = num / 100000;
    return `${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1)}L`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
}

export function formatPriceRange(min, max) {
  const minNum = min != null ? Number(min) : null;
  const maxNum = max != null ? Number(max) : null;

  if (minNum && maxNum && minNum !== maxNum) {
    return `${formatIndianPrice(minNum).replace("₹", "")} - ${formatIndianPrice(maxNum)}`.replace(
      /^ - /,
      ""
    );
  }

  if (minNum) return formatIndianPrice(minNum);
  if (maxNum) return formatIndianPrice(maxNum);
  return "Price on Request";
}

export async function getCartIds(customerId) {
  if (!customerId) return [];

  const { data, error } = await supabase
    .from("cart")
    .select("vendor_category_id")
    .eq("customer_id", customerId);

  if (error) {
    console.error("getCartIds error:", error);
    throw error;
  }

  return (data || []).map((row) => row.vendor_category_id);
}

export async function addCartItem(customerId, vendorCategoryId) {
  if (!customerId || !vendorCategoryId) {
    throw new Error("Missing customer or vendor");
  }

  const { data: existing, error: checkError } = await supabase
    .from("cart")
    .select("id")
    .eq("customer_id", customerId)
    .eq("vendor_category_id", vendorCategoryId)
    .maybeSingle();

  if (checkError) throw checkError;
  if (existing) return { added: false, alreadyExists: true };

  const { data, error } = await supabase
    .from("cart")
    .insert({
      customer_id: customerId,
      vendor_category_id: vendorCategoryId,
    })
    .select()
    .single();

  if (error) throw error;
  return { added: true, data };
}

export async function removeCartItem(customerId, vendorCategoryId) {
  if (!customerId || !vendorCategoryId) {
    throw new Error("Missing customer or vendor");
  }

  const { error } = await supabase
    .from("cart")
    .delete()
    .eq("customer_id", customerId)
    .eq("vendor_category_id", vendorCategoryId);

  if (error) throw error;
  return { removed: true };
}

export async function getCartCount(customerId) {
  if (!customerId) return 0;

  const { count, error } = await supabase
    .from("cart")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", customerId);

  if (error) {
    console.error("getCartCount error:", error);
    throw error;
  }

  return count ?? 0;
}

export async function getCartDetails(customerId) {
  if (!customerId) return [];

  const { data: cartRows, error } = await supabase
    .from("cart")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!cartRows?.length) return [];

  const vendorCategoryIds = cartRows.map((row) => row.vendor_category_id);

  const { data: vendorCategories, error: vcError } = await supabase
    .from("vendor_categories")
    .select("id, category_id")
    .in("id", vendorCategoryIds);

  if (vcError) throw vcError;

  const { data: locations, error: locError } = await supabase
    .from("vendor_service_locations")
    .select("vendor_category_id, area, city")
    .in("vendor_category_id", vendorCategoryIds);

  if (locError) throw locError;

  const locationMap = {};
  (locations || []).forEach((loc) => {
    locationMap[loc.vendor_category_id] = loc;
  });

  const categoryMap = {};
  (vendorCategories || []).forEach((vc) => {
    categoryMap[vc.id] = vc.category_id;
  });

  const vendorsByCategoryId = {};

  const groupedByTable = {};
  (vendorCategories || []).forEach((vc) => {
    const table = CATEGORY_TABLES[vc.category_id];
    if (!table) return;
    if (!groupedByTable[table]) groupedByTable[table] = [];
    groupedByTable[table].push(vc.id);
  });

  await Promise.all(
    Object.entries(groupedByTable).map(async ([table, ids]) => {
      const { data: vendors } = await supabase
        .from(table)
        .select("*")
        .in("vendor_category_id", ids)
        .eq("is_active", true);

      (vendors || []).forEach((vendor) => {
        if (!vendorsByCategoryId[vendor.vendor_category_id]) {
          vendorsByCategoryId[vendor.vendor_category_id] = vendor;
        }
      });
    })
  );

  return cartRows
    .map((row) => {
      const vendor = vendorsByCategoryId[row.vendor_category_id];
      const location = locationMap[row.vendor_category_id];
      const categoryId = categoryMap[row.vendor_category_id];

      if (!vendor) return null;

      const locationText = location
        ? `${location.area || ""}${location.area ? ", " : ""}${location.city || ""}`
        : vendor.address || "Location unavailable";

      const minPrice = vendor.base_price ?? vendor.starting_price ?? vendor.weekday_price;
      const maxPrice = vendor.weekend_price ?? vendor.max_price ?? minPrice;

      return {
        cartId: row.id,
        vendor_category_id: row.vendor_category_id,
        serviceId: vendor.id,
        categoryId,
        name: vendor.name,
        description: vendor.description || vendor.tagline || "",
        rating: vendor.avg_rating ?? vendor.rating ?? "0.0",
        location: locationText,
        price: formatPriceRange(minPrice, maxPrice),
        rawMinPrice: minPrice || 0,
        image: getPlaceholderImage(categoryId),
        isAvailable: true,
        created_at: row.created_at,
      };
    })
    .filter(Boolean);
}
