import express from "express";
import {
  signIn,
  sendOtp,
  resendOtp,
  verifyOtp,
  startGoogleAuth,
  completeGoogleAuth,
} from "../controllers/authController.js";
const router = express.Router();

// router.post("/signup", signup);
router.post("/signin", signIn);
router.post("/send-otp", sendOtp);
router.post(
  "/resend-otp",
  resendOtp
);
router.post("/google/start", startGoogleAuth);
router.post("/verify-otp", verifyOtp);
router.post(
  "/google/complete",
  completeGoogleAuth
);

// router.get("/me", me);

export default router;
