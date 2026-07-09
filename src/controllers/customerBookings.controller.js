import {
  createBookingService,
  getMyBookingsService,
  cancelBookingService,
} from "../services/customerBookings.service.js";

/* ── CREATE ── */
export const createBooking = async (req, res) => {
  try {
    const data = await createBookingService(req.body);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

/* ── GET MY BOOKINGS ── */
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.query.userId || req.params.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }
    const data = await getMyBookingsService(userId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── CANCEL BOOKING ── */
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    // userId can come from body or query (no auth middleware yet)
    const userId = req.body.userId || req.query.userId;

    if (!bookingId || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "bookingId and userId are required" });
    }

    const data = await cancelBookingService(bookingId, userId);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ success: false, message: err.message });
  }
};
