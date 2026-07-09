import express from "express";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
} from "../controllers/customerBookings.controller.js";

const router = express.Router();

// POST   /api/bookings              — create a new booking
router.post("/", createBooking);

// GET    /api/bookings?userId=<id>  — fetch bookings by query param
router.get("/", getMyBookings);

// GET    /api/bookings/:userId      — fetch bookings by URL param
router.get("/:userId", getMyBookings);

// PATCH  /api/bookings/:bookingId/cancel — cancel a pending booking
router.patch("/:bookingId/cancel", cancelBooking);

export default router;
