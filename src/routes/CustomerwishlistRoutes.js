import express from "express";
import {
  addToWishlist,
  checkStatus,
  getCount,
  getCustomerId,
  getWishlist,
  getWishlistWithDetails,
  removeFromWishlist,
} from "../controllers/CustomerwishlistController.js";

const router = express.Router();

router.get("/customer-id/:userId", getCustomerId);
router.post("/add", addToWishlist);
router.post("/remove", removeFromWishlist);
router.get("/status", checkStatus);
router.get("/ids", getWishlist);
router.get("/details", getWishlistWithDetails);
router.get("/count", getCount);

export default router;
