import {
  addWishlistItem,
  checkWishlistStatus,
  getCustomerIdByUserId,
  getWishlistCount,
  getWishlistDetails,
  getWishlistIds,
  removeWishlistItem,
} from "../services/CustomerwishlistService.js";

export const getCustomerId = async (req, res) => {
  try {
    const { userId } = req.params;
    const customerId = await getCustomerIdByUserId(userId);

    return res.json({ success: true, customerId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { customerId, vendorCategoryId } = req.body;
    const result = await addWishlistItem(customerId, vendorCategoryId);

    return res.json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { customerId, vendorCategoryId } = req.body;
    const result = await removeWishlistItem(customerId, vendorCategoryId);

    return res.json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkStatus = async (req, res) => {
  try {
    const { customerId, vendorCategoryId } = req.query;
    const isInWishlist = await checkWishlistStatus(customerId, vendorCategoryId);

    return res.json({ success: true, isInWishlist });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const { customerId } = req.query;
    const ids = await getWishlistIds(customerId);

    return res.json({ success: true, ids });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getWishlistWithDetails = async (req, res) => {
  try {
    const { customerId } = req.query;
    const items = await getWishlistDetails(customerId);

    return res.json({ success: true, items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCount = async (req, res) => {
  try {
    const { customerId } = req.query;
    const count = await getWishlistCount(customerId);

    return res.json({ success: true, count });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
