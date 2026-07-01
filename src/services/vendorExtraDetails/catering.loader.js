import { supabase }
from "../../config/supabase.js";

export const getCateringDetails =
async (serviceId) => {

  const {
    data: cateringService,
    error
  } = await supabase
    .from("catering_services")
    .select("*")
    .eq("id", serviceId)
    .single();

  if (error) {
    throw error;
  }


      const { data: packages } =
await supabase
  .from("catering_packages")
  .select(`
    *,
    catering_package_types(*),

    catering_menu_categories(
      *,
      catering_menu_items(*)
    )
  `)
  .eq(
    "catering_service_id",
    serviceId
  );

  packages.forEach(pkg => {

  pkg.catering_menu_categories
    ?.sort(
      (a, b) =>
        a.display_order -
        b.display_order
    );

});

  const { data: rules } =
    await supabase
      .from("catering_rules")
      .select("*")
      .eq(
        "catering_service_id",
        serviceId
      );

  const { data: facilities } =
    await supabase
      .from("catering_facilities")
      .select("*")
      .eq(
        "catering_service_id",
        serviceId
      );

  const formattedFacilities =
  (facilities || []).map(item => ({

    id: item.id,

    name: item.facility_name

  }));

  const { data: images } =
    await supabase
      .from("catering_images")
      .select("*")
      .eq(
        "catering_service_id",
        serviceId
      );

  const formattedImages =
(images || []).sort(
(a,b)=>
Number(b.is_primary)-
Number(a.is_primary)
);

  return {

  service:
    cateringService,

  packageData: {
    
    packages:
      packages || []

  },

  facilities:
formattedFacilities,

  rules:
    rules || [],

  images:
(images || []).sort(

(a,b)=>

Number(b.is_primary)-Number(a.is_primary)

)

};
};