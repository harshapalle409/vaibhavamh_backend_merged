import express from "express";
import {
createBooking,
getMyBookings
} from "../controllers/customerBookings.controller.js";

const router = express.Router();

// POST /api/bookings — create a new booking
router.post(
"/",
createBooking
);

// GET /api/bookings?userId=<id>  — fetch bookings by query param
router.get(
"/",
getMyBookings
);

// GET /api/bookings/:userId — fetch bookings by URL param (alternate)
router.get(
"/:userId",
getMyBookings
);

export default router;