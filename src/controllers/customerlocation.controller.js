import { searchLocations } from "../services/customerlocation.service.js";

export const searchLocationsController = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.json({
        success: true,
        data: []
      });
    }

    const { data, error } = await searchLocations(search);

    if (error) throw error;

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error("Location Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};