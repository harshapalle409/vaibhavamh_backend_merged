import express from "express";
import { getStats, getServices, getCalendar, upsertCalendar } from "../controllers/dashboardController.js";

const router = express.Router();

// GET /api/dashboard/stats?vendor_id=...
router.get("/stats", getStats);

// GET /api/dashboard/services?vendor_id=...
router.get("/services", getServices);

// GET /api/dashboard/calendar?vendor_id=...&start=YYYY-MM-DD&end=YYYY-MM-DD
router.get("/calendar", getCalendar);
router.post("/calendar", upsertCalendar);

export default router;
