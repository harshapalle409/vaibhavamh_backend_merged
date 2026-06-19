import express from "express";
import {
createBooking,
getMyBookings
} from "../controllers/customerBookings.controller.js";

const router = express.Router();

router.post(
"/",
createBooking
);

router.get(
"/",
getMyBookings
);

export default router;