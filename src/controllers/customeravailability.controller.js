import { getAvailability } from "../services/customeravailability.service.js";

export const checkAvailability = async (req, res) => {
  try {

    const {
      vendorCategoryId,
      date,
      guestCount
    } = req.body;

    const result = await getAvailability(
      vendorCategoryId,
      date,
      guestCount
    );

    res.json({
      success: true,
      ...result
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};