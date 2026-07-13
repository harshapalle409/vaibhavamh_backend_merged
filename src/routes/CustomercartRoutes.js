import express from "express";
import {
  addToCart,
  getCart,
  getCartWithDetails,
  getCount,
  removeFromCart,
} from "../controllers/CustomercartController.js";

const router = express.Router();

router.get("/ids", getCart);
router.post("/add", addToCart);
router.post("/remove", removeFromCart);
router.get("/details", getCartWithDetails);
router.get("/count", getCount);

export default router;
