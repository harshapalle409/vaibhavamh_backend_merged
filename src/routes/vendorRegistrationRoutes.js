
import express from "express";
import multer from "multer";

import {
  saveProfile,
  updateVenue,
  savePricing,
  saveAmenities,
  uploadPortfolio,
  completeVendorProfile,
  createCatering,
  createDecoration,
  createPhotography,
  getDecorationReview,
} from "../controllers/vendorRegistrationController.js";

const router =
  express.Router();

/* ==========================================
   MULTER MEMORY STORAGE
========================================== */
const upload = multer({
  storage:
    multer.memoryStorage(),

  limits: {
    fileSize:
      10 *
      1024 *
      1024, // 10MB
  },

  fileFilter: (
    req,
    file,
    cb
  ) => {

    if (
      file.mimetype.startsWith(
        "image/"
      )
    ) {
      return cb(
        null,
        true
      );
    }

    cb(
      new Error(
        "Only image files are allowed"
      )
    );
  },
});

router.post(
  "/profile",
  saveProfile
);

router.put(
  "/venue",
  updateVenue
);

router.post(
  "/pricing",
  savePricing
);

router.post(
  "/amenities",
  saveAmenities
);
router.post(
  "/catering",
  createCatering
);

router.post(
  "/decoration",
  createDecoration
);

router.post(
  "/photography",
  createPhotography
);

router.get(
  "/decoration-review",
  getDecorationReview
);
/* ==========================================
   PORTFOLIO IMAGES
========================================== */

router.post(
  "/portfolio",
  upload.array(
    "images",
    20
  ),
  uploadPortfolio
);
router.post(
  "/complete",
  completeVendorProfile
);

export default router;
