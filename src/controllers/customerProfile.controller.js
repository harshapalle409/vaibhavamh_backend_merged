import {
  getCustomerProfileService
} from "../services/customerProfile.service.js";

export const getCustomerProfile = async (
  req,
  res
) => {

  try {

    const { userId } = req.params;

    const data =
      await getCustomerProfileService(
        userId
      );

    return res.json({
      success: true,
      data
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};