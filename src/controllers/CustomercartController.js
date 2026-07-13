import {
  addCartItem,
  getCartCount,
  getCartDetails,
  getCartIds,
  removeCartItem,
} from "../services/CustomercartService.js";

export const getCart = async (req, res) => {
  try {
    const { customerId } = req.query;
    const ids = await getCartIds(customerId);
    return res.json({ success: true, ids });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { customerId, vendorCategoryId } = req.body;
    const result = await addCartItem(customerId, vendorCategoryId);
    return res.json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { customerId, vendorCategoryId } = req.body;
    const result = await removeCartItem(customerId, vendorCategoryId);
    return res.json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCartWithDetails = async (req, res) => {
  try {
    const { customerId } = req.query;
    const items = await getCartDetails(customerId);
    return res.json({ success: true, items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCount = async (req, res) => {
  try {
    const { customerId } = req.query;
    const count = await getCartCount(customerId);
    return res.json({ success: true, count });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
