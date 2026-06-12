import { searchVendors } from "../services/customersearchVendors.service.js";

export const searchVendorsController = async (req, res) => {
  try {
    const {
      location,
      categoryId,
      eventDate
    } = req.query;

    const data = await searchVendors({
      location,
      categoryId,
      eventDate
    });

    res.json({
      success: true,
      data
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};