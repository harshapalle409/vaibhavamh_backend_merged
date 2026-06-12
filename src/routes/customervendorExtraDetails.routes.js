import express from "express";

import {
  vendorExtraDetails
} from "../controllers/customervendorExtraDetails.controller.js";

const router = express.Router();

router.get(
  "/:categoryId/:serviceId",
  vendorExtraDetails
);

export default router;