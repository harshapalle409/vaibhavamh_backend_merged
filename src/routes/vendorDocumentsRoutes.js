import express from "express";
import multer from "multer";

import {
  uploadDocuments,
} from "../controllers/vendorDocumentsController.js";

const router =
  express.Router();

const upload = multer({
  storage:
    multer.memoryStorage(),

  limits: {
    fileSize:
      5 *
      1024 *
      1024, // 5MB
  },

  fileFilter: (
    req,
    file,
    cb
  ) => {

    const allowedMimeTypes =
      [
        "application/pdf",

        "image/jpeg",

        "image/png",
      ];

    if (
      allowedMimeTypes.includes(
        file.mimetype
      )
    ) {
      return cb(
        null,
        true
      );
    }

    cb(
      new Error(
        "Only PDF, JPG and PNG files are allowed"
      )
    );
  },
});

router.post(
  "/upload",
  upload.fields([
    {
      name:
        "pan_card",
      maxCount: 1,
    },
    {
      name:
        "aadhaar_card",
      maxCount: 1,
    },
    {
      name:
        "gst_certificate",
      maxCount: 1,
    },
    {
      name:
        "business_license",
      maxCount: 1,
    },
    {
      name:
        "fssai_license",
      maxCount: 1,
    },
    {
      name:
        "bank_proof",
      maxCount: 1,
    },
    {
      name:
        "other_document",
      maxCount: 1,
    },
  ]),
  (req, res, next) => {
    const parsedFiles =
      {};

    Object.keys(
      req.files ||
        {}
    ).forEach(
      (key) => {
        parsedFiles[
          key
        ] =
          req.files[
            key
          ][0];
      }
    );

    req.files =
      parsedFiles;

    next();
  },
  uploadDocuments
);

export default router;

