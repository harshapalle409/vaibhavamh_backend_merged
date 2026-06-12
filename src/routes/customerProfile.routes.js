import express from "express";
import { getCustomerProfile } from "../controllers/customerProfile.controller.js";

const router = express.Router();

router.get("/:userId", getCustomerProfile);

export default router;