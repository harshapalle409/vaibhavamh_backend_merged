import { supabase } from "../config/supabase.js";
const getVendorCategoryIds =
  async (
    vendorId
  ) => {

    const {
      data,
      error,
    } = await supabase
      .from(
        "vendor_categories"
      )
      .select("id")
      .eq(
        "vendor_id",
        vendorId
      );

    if (error)
      throw error;

    return (
      data || []
    ).map(
      (row) =>
        row.id
    );
  };
export const getDashboardStats = async (vendorId) => {
  // Count services across split tables
  const categoryIds =
  await getVendorCategoryIds(
    vendorId
  );

const [
  venuesRes,
  cateringRes,
] = await Promise.all([

  supabase
    .from("venues")
    .select("id", {
      count: "exact",
      head: true,
    })
    .in(
      "vendor_category_id",
      categoryIds
    ),

  supabase
    .from(
      "catering_services"
    )
    .select("id", {
      count: "exact",
      head: true,
    })
    .in(
      "vendor_category_id",
      categoryIds
    ),
]);

  const totalServices = (venuesRes.count || 0) + (cateringRes.count || 0);

  // Bookings and revenue
  const [bookingsRes, revenueRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("vendor_id", vendorId),
    supabase
      .from("bookings")
      .select("total_amount")
      .eq("vendor_id", vendorId)
      .eq("payment_status", "paid"),
  ]);

  const totalBookings = bookingsRes.count || 0;

  const totalRevenue = (revenueRes.data || []).reduce((s, r) => s + Number(r.total_amount || 0), 0);

  return {
    totalServices,
    totalBookings,
    totalRevenue,
  };
};

export const getServices = async (vendorId) => {
  const categoryIds =
  await getVendorCategoryIds(
    vendorId
  );

const [
  venuesRes,
  cateringRes,
] = await Promise.all([

  supabase
    .from("venues")
    .select("*")
    .in(
      "vendor_category_id",
      categoryIds
    ),

  supabase
    .from(
      "catering_services"
    )
    .select("*")
    .in(
      "vendor_category_id",
      categoryIds
    ),
]);

  if (venuesRes.error || cateringRes.error) {
    throw new Error(venuesRes.error?.message || cateringRes.error?.message);
  }

  const venueData = (venuesRes.data || []).map((s) => ({
    id: s.id,
    sourceTable: "venues",
    category: "venues",
    title: s.name,
    city: s.city,
    price: s.base_price,
    description: s.description || "",
    is_active: s.is_active ?? true,
    created_at: s.created_at,
  }));

  const cateringData =
  (cateringRes.data || [])
  .map((s) => ({
    id: s.id,

    sourceTable:
      "catering_services",

    category:
      "catering",

    title:
      s.name,

    city:
      s.Address,

    price:
      s.starting_price,

    description:
      s.description || "",

    is_active:
      s.is_active ?? true,

    created_at:
      s.created_at,
  }));

  return [...venueData, ...cateringData].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const getCalendar = async (vendorId, start, end) => {
  const { data, error } = await supabase
    .from("vendor_calendar")
    .select("date, status, price")
    .eq("vendor_id", vendorId)
    .gte("date", start)
    .lte("date", end);

  if (error) throw error;

  return data || [];
};
