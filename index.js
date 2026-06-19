
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./src/routes/authRoutes.js";
import vendorRegistrationRoutes from "./src/routes/vendorRegistrationRoutes.js";
import vendorDocumentsRoutes from "./src/routes/vendorDocumentsRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";

import customerlocationRoutes from "./src/routes/customerlocation.routes.js";
import customersearchVendorRoutes from "./src/routes/customersearchVendors.routes.js";
import customervendorExtraDetailsRoutes from "./src/routes/customervendorExtraDetails.routes.js";
import customeravailabilityRoutes from "./src/routes/customeravailability.routes.js";
import customerProfileRoutes
from "./src/routes/customerProfile.routes.js";
import customerBookingsRoutes
from "./src/routes/customerBookings.routes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:3000";

app.use(morgan("dev"));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      FRONTEND_URL
    ],
    credentials: true,
  })
);

app.use(express.json());

/* Routes */
app.use("/api/auth", authRoutes);

app.use(
  "/api/vendor-registration",
  vendorRegistrationRoutes
);

app.use(
  "/api/vendor-documents",
  vendorDocumentsRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);


// customer routes

app.use(
  "/api/locations",
  customerlocationRoutes
);

app.use(
  "/api/search-vendors",
  customersearchVendorRoutes
);

app.use(
  "/api/vendor-extra-details", 
  customervendorExtraDetailsRoutes
);

app.use(
  "/api/availability",
  customeravailabilityRoutes
);

app.use(
  "/api/customer-profile",
  customerProfileRoutes
);


app.use(
"/api/bookings",
customerBookingsRoutes
);

/* Health Check */
app.get("/api/health", (_req, res) => {
  return res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

/* Global Error Handler */
app.use((err, _req, res, _next) => {
  console.error(err);

  return res.status(500).json({
    message: "Internal server error",
  });
});

/* Start Server */
app.listen(PORT, () => {
  console.log(
    `Auth backend running on http://localhost:${PORT}`
  );
});