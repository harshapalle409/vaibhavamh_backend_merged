import {
  getCustomerProfileService,
  updateCustomerProfileService,
  updateProfileImageService,
  deleteCustomerAccountService
}from "../services/customerProfile.service.js";

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

export const updateCustomerProfile =
async (req,res) => {

  try {

    await updateCustomerProfileService(
      req.params.userId,
      req.body
    );

    return res.json({
      success:true,
      message:"Profile updated"
    });

  } catch(error){

    return res.status(500).json({
      success:false,
      message:error.message
    });

  }
};

export const uploadCustomerProfileImage =
async (req,res) => {

  try {

    const { imageUrl } = req.body;

    await updateProfileImageService(
      req.params.userId,
      imageUrl
    );

    return res.json({
      success:true
    });

  } catch(error){

    return res.status(500).json({
      success:false,
      message:error.message
    });

  }
};

export const deleteCustomerAccount =
async (req,res) => {

  try {

    await deleteCustomerAccountService(
      req.params.userId
    );

    return res.json({
      success:true
    });

  } catch(error){

    return res.status(500).json({
      success:false,
      message:error.message
    });

  }
};

