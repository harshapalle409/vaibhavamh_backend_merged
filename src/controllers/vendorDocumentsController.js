import {
  uploadVendorDocumentsService,
} from "../services/vendorDocumentsService.js";

export const uploadDocuments =
  async (
    req,
    res
  ) => {
    try {
      const {
        vendorId,
      } =
        req.body;

      if (
        !vendorId
      ) {
        return res
          .status(400)
          .json({
            message:
              "Vendor ID is required",
          });
      }

      const result =
        await uploadVendorDocumentsService(
          vendorId,
          req.files
          
        );
console.log(
  "[DOCUMENT_VENDOR_ID]",
  vendorId
);
     return res.json({
  success:
    true,

  message:
    "Documents uploaded successfully",

  ...result,
});
    } catch (
      error
    ) {
      console.error(
        "Upload documents error",
        error
      );

      return res
        .status(500)
        .json({
          message:
            error.message ||
            "Document upload failed",
        });
    }
  };

