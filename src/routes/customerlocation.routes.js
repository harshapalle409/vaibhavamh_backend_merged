import express from "express";
import { searchLocationsController } from "../controllers/customerlocation.controller.js";

const router = express.Router();

router.get("/", searchLocationsController);

export default router;