import express from "express";
import { searchVendorsController } from "../controllers/customersearchVendors.controller.js";

const router = express.Router();

router.get("/", searchVendorsController);

export default router;