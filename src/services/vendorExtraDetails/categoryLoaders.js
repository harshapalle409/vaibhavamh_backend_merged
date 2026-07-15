import { getVenueDetails }       from "./venue.loader.js";
import { getCateringDetails }    from "./catering.loader.js";
import { getPhotographyDetails } from "./photography.loader.js";

export const CATEGORY_LOADERS = {
  201: getVenueDetails,
  203: getPhotographyDetails,
  205: getCateringDetails,
};