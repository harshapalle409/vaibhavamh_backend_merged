import crypto from "crypto";

const OTP_LENGTH = 6;

// Generate random 6-digit OTP
export const generateOtp = () => {
  const min = 100000;
  const max = 999999;

  return String(
    Math.floor(Math.random() * (max - min + 1)) + min
  );
};

// Hash OTP before storing in DB
export const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
};

// Compare entered OTP with stored hash
export const verifyOtpHash = (
  enteredOtp,
  storedHash
) => {
  const enteredHash =
    hashOtp(enteredOtp);

  return enteredHash === storedHash;
};

// OTP expiry helper
export const getOtpExpiry = (
  minutes = 5
) => {
  const expiry = new Date();

  expiry.setMinutes(
    expiry.getMinutes() + minutes
  );

  return expiry.toISOString();
};