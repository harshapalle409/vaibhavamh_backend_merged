import express from "express";

import {
  getCustomerProfile,
  updateCustomerProfile,
  uploadCustomerProfileImage,
  deleteCustomerAccount
} from "../controllers/customerProfile.controller.js";

const router = express.Router();

router.get("/:userId", getCustomerProfile);

router.put("/:userId", updateCustomerProfile);

router.post(
  "/upload-image/:userId",
  uploadCustomerProfileImage
);

router.delete(
  "/:userId",
  deleteCustomerAccount
);

export default router;