import {
  saveVendorProfileService,
  updateVenueService,
  savePricingService,
  saveAmenitiesService,
  uploadPortfolioService,
  completeVendorProfileService,
  createCateringService,
  createDecorationService,
  createPhotographyService, 
  getDecorationReviewService,
} from "../services/vendorRegistrationService.js";

export const saveProfile =
  async (
    req,
    res
  ) => {
    try {
      const {
        userId,
        ...payload
      } = req.body;

      if (!userId) {
        return res
          .status(400)
          .json({
            message:
              "User ID is required",
          });
      }

      const result =
        await saveVendorProfileService(
          userId,
          payload
        );

      return res.json({
        success:
          true,
        message:
          "Profile saved successfully",
        ...result,
      });
    } catch (
      error
    ) {
      console.error(
        "Save profile error",
        error
      );

      return res
        .status(500)
        .json({
          message:
            error.message ||
            "Failed to save profile",
        });
    }
  };
export const updateVenue =
  async (
    req,
    res
  ) => {

    const {
      vendorId,
      venueId,
    } = req.body;

    if (
      !vendorId ||
      !venueId
    ) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            "Vendor ID and Venue ID are required",
        });
    }

    try {

      const result =
        await updateVenueService(
          req.body
        );

      return res.json({
        success:
          true,

        message:
          "Venue updated successfully",

        ...result,
      });

    } catch (
      error
    ) {

      console.error(
        "[VendorRegistrationController.updateVenue]",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            error.message ||
            "Failed to update venue",
        });
    }
  };
  
export const savePricing =
  async (
    req,
    res
  ) => {

    const {
      venueId,
    } = req.body;

    if (
      !venueId
    ) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            "Venue ID is required",
        });
    }

    try {

      const result =
        await savePricingService(
          req.body
        );

      return res.json({
        success:
          true,

        message:
          "Pricing saved successfully",

        ...result,
      });

    } catch (
      error
    ) {

      console.error(
        "[VendorRegistrationController.savePricing]",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            error.message ||
            "Failed to save pricing",
        });
    }
  };
export const saveAmenities =
  async (
    req,
    res
  ) => {

    const {
      venueId,
    } = req.body;

    if (
      !venueId
    ) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            "Venue ID is required",
        });
    }

    try {

      const result =
        await saveAmenitiesService(
          req.body
        );

      return res.json({
        success:
          true,

        message:
          "Amenities saved successfully",

          ...result,
      });

    } catch (
      error
    ) {

      console.error(
        "[VendorRegistrationController.saveAmenities]",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            error.message ||
            "Failed to save amenities",
        });
    }
  };

export const uploadPortfolio =
  async (
    req,
    res
  ) => {
    try {

      const result =
        await uploadPortfolioService(
          req
        );

      return res.json({
        success:
          true,
        message:
          "Portfolio uploaded successfully",
        ...result,
      });

    } catch (
      error
    ) {

      console.error(
        "Portfolio upload error",
        error
      );

      return res
        .status(500)
        .json({
          message:
            error.message ||
            "Upload failed",
        });
    }
  };
export const completeVendorProfile =
  async (
    req,
    res
  ) => {

    const {
      vendorId,
    } = req.body;

    if (
      !vendorId
    ) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            "Vendor ID is required",
        });
    }

    try {

      const result =
        await completeVendorProfileService(
          req.body
        );

      return res.json({
        success:
          true,

        message:
          "Profile completed successfully",

        ...result,
      });

    } catch (
      error
    ) {

      console.error(
        "[VendorRegistrationController.completeVendorProfile]",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            error.message ||
            "Failed to complete profile",
        });
    }
  };
  export const createCatering = async (
  req,
  res
) => {
  try {
    const result =
      await createCateringService(
        req.body
      );

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createDecoration = async (
  req,
  res
) => {
  try {
    const result =
      await createDecorationService(
        req.body
      );

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDecorationReview = async (
  req,
  res
) => {
  const { vendorId } = req.query;

  if (!vendorId) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Vendor ID is required",
      });
  }

  try {
    const result =
      await getDecorationReviewService({
        vendorId,
      });

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "[VendorRegistrationController.getDecorationReview]",
      error
    );
    return res
      .status(500)
      .json({
        success: false,
        message:
          error.message ||
          "Failed to load decoration review details",
      });
  }
};
export const createPhotography = async (
  req,
  res
) => {
  try {

    const result =
      await createPhotographyService(
        req.body
      );

    return res.json({
      success: true,
      ...result,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};