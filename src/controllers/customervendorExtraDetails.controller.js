import {
  getVendorExtraDetails
} from "../services/customervendorExtraDetails.service.js";

export const vendorExtraDetails =
async (req, res) => {

  try {

    const {
      categoryId,
      serviceId
    } = req.params;

    const data =
      await getVendorExtraDetails(
        categoryId,
        serviceId
      );

    res.json({
      success: true,
      data
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};