import {
  getVenueDetails
}
from "./venue.loader.js";

import {
  getCateringDetails
}
from "./catering.loader.js";

export const CATEGORY_LOADERS = {

  201: getVenueDetails,

  205: getCateringDetails

};