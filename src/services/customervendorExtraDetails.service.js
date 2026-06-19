import {
  CATEGORY_LOADERS
}
from "./vendorExtraDetails/categoryLoaders.js";

export const getVendorExtraDetails =
async (
  categoryId,
  serviceId
) => {

  const loader =
    CATEGORY_LOADERS[
      Number(categoryId)
    ];

  if (!loader) {

    throw new Error(
      "Category not supported"
    );

  }

  return await loader(
    serviceId
  );
};








// import {supabase} from "../config/supabase.js";

// export const getVendorExtraDetails = async (
//   categoryId,
//   serviceId
// ) => {

//   if (Number(categoryId) !== 201) {
//     throw new Error("Only Venue category supported");
//   }

//   const { data: venue, error } =
//     await supabase
//       .from("venues")
//       .select("*")
//       .eq("id", serviceId)
//       .single();

//   if (error) {
//     throw error;
//   }

//   const { data: pricing } =
//     await supabase
//       .from("venue_pricing")
//       .select("*")
//       .eq("venue_id", serviceId)
//       .single();

//   const { data: amenities } =
//     await supabase
//       .from("venue_amenities")
//       .select(`
//         *,
//         amenities(*)
//       `)
//       .eq("venue_id", serviceId);

//   const { data: rules } =
//     await supabase
//       .from("venue_rules")
//       .select("*")
//       .eq("venue_id", serviceId);

//   const { data: additionalServices } =
//     await supabase
//       .from("venue_additional_services")
//       .select("*")
//       .eq("venue_id", serviceId);

//   return {
//     venue,

//     pricing: pricing || {},

//     amenities: amenities || [],

//     rules: rules || [],

//     additionalServices:
//       additionalServices || []
//   };
// };





// import supabase from "../config/supabaseClient.js";

// export const getVendorExtraDetails = async (
//   categoryId,
//   serviceId
// ) => {

//   const category = Number(categoryId);

//   switch (category) {

//     /*
//     |--------------------------------------------------------------------------
//     | VENUES
//     |--------------------------------------------------------------------------
//     */

//     case 201: {

//       const { data: service, error: venueError } =
//         await supabase
//           .from("venues")
//           .select("*")
//           .eq("id", serviceId)
//           .single();

//       if (venueError) {
//         throw venueError;
//       }

//       const { data: pricing } =
//         await supabase
//           .from("venue_pricing")
//           .select("*")
//           .eq("venue_id", serviceId)
//           .single();

//       const { data: amenities } =
//         await supabase
//           .from("venue_amenities")
//           .select(`
//             *,
//             amenities(*)
//           `)
//           .eq("venue_id", serviceId);

//       const { data: rules } =
//         await supabase
//           .from("venue_rules")
//           .select("*")
//           .eq("venue_id", serviceId);

//       const { data: additionalServices } =
//         await supabase
//           .from("venue_additional_services")
//           .select("*")
//           .eq("venue_id", serviceId);

//       return {
//         categoryId: 201,

//         service,

//         pricing: pricing || {},

//         amenities: amenities || [],

//         rules: rules || [],

//         additionalServices:
//           additionalServices || [],

//         images: []
//       };
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | CATERING
//     |--------------------------------------------------------------------------
//     */

//     case 205: {

//       const { data: service, error } =
//         await supabase
//           .from("catering_services")
//           .select("*")
//           .eq("id", serviceId)
//           .single();

//       if (error) {
//         throw error;
//       }

//       return {
//         categoryId: 205,

//         service,

//         pricing: {},

//         amenities: [],

//         rules: [],

//         additionalServices: [],

//         images: []
//       };
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | DECORATION
//     |--------------------------------------------------------------------------
//     */

//     case 206: {

//       const { data: service, error } =
//         await supabase
//           .from("decoration_services")
//           .select("*")
//           .eq("id", serviceId)
//           .single();

//       if (error) {
//         throw error;
//       }

//       return {
//         categoryId: 206,

//         service,

//         pricing: {},

//         amenities: [],

//         rules: [],

//         additionalServices: [],

//         images: []
//       };
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | PHOTOGRAPHY
//     |--------------------------------------------------------------------------
//     */

//     case 203: {

//       const { data: service, error } =
//         await supabase
//           .from("photography")
//           .select("*")
//           .eq("id", serviceId)
//           .single();

//       if (error) {
//         throw error;
//       }

//       return {
//         categoryId: 203,

//         service,

//         pricing: {},

//         amenities: [],

//         rules: [],

//         additionalServices: [],

//         images: []
//       };
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | DJ
//     |--------------------------------------------------------------------------
//     */

//     case 204: {

//       const { data: service, error } =
//         await supabase
//           .from("dj")
//           .select("*")
//           .eq("id", serviceId)
//           .single();

//       if (error) {
//         throw error;
//       }

//       return {
//         categoryId: 204,

//         service,

//         pricing: {},

//         amenities: [],

//         rules: [],

//         additionalServices: [],

//         images: []
//       };
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | MAKEUP
//     |--------------------------------------------------------------------------
//     */

//     case 202: {

//       const { data: service, error } =
//         await supabase
//           .from("makeup")
//           .select("*")
//           .eq("id", serviceId)
//           .single();

//       if (error) {
//         throw error;
//       }

//       return {
//         categoryId: 202,

//         service,

//         pricing: {},

//         amenities: [],

//         rules: [],

//         additionalServices: [],

//         images: []
//       };
//     }

//     default:
//       throw new Error(
//         `Unsupported categoryId: ${categoryId}`
//       );
//   }
// };