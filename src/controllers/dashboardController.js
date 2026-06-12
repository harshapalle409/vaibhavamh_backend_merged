import * as dashboardService from "../services/dashboardService.js";
import { supabase } from "../config/supabase.js";

export const getStats = async (req, res, next) => {
  try {
    const vendorId = req.query.vendor_id;

    if (!vendorId) {
      return res.status(400).json({ message: "vendor_id is required" });
    }

    const stats = await dashboardService.getDashboardStats(vendorId);

    return res.json(stats);
  } catch (err) {
    next(err);
  }
};

export const getServices = async (req, res, next) => {
  try {
    const vendorId = req.query.vendor_id;

    if (!vendorId) {
      return res.status(400).json({ message: "vendor_id is required" });
    }

    const services = await dashboardService.getServices(vendorId);

    return res.json({ services });
  } catch (err) {
    next(err);
  }
};

export const getCalendar = async (req, res, next) => {
  try {
    const vendorId = req.query.vendor_id;
    const { start, end } = req.query;

    if (!vendorId || !start || !end) {
      return res.status(400).json({ message: "vendor_id, start and end are required" });
    }

    const data = await dashboardService.getCalendar(vendorId, start, end);

    return res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const upsertCalendar = async (req, res, next) => {
  try {
    const { vendor_id, date, status, price } = req.body;

    if (!vendor_id || !date) {
      return res.status(400).json({ message: "vendor_id and date are required" });
    }


    // Try update first
    const { error: updateError } = await supabase
      .from("vendor_calendar")
      .update({ status, price, updated_at: new Date().toISOString() })
      .match({ vendor_id, date });

    if (!updateError) {
      return res.json({ success: true });
    }

    // Insert if update did not affect (or error)
    const { error: insertError } = await supabase
      .from("vendor_calendar")
      .insert({ vendor_id, date, status, price });

    if (insertError) throw insertError;

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
