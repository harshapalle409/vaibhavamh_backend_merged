import axios from "axios";

const BREVO_API_URL = "https://api.brevo.com/v3/transactionalSMS/sms";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SMS_SENDER =
  process.env.BREVO_SMS_SENDER || "Vaibhavamh";

if (!BREVO_API_KEY) {
  throw new Error(
    "Missing BREVO_API_KEY in environment variables"
  );
}

const SMS_DEV_MODE =
  process.env.SMS_DEV_MODE === "true";

export const sendOtpSms = async (
  phone,
  otp
) => {
  // DEV MODE
  if (SMS_DEV_MODE) {
    console.log("\n");
    console.log(
      "=".repeat(50)
    );
    console.log(
      "DEV OTP MODE"
    );
    console.log(
      "Phone:",
      phone
    );
    console.log(
      "OTP:",
      otp
    );
    console.log(
      "=".repeat(50)
    );
    console.log("\n");

    return {
      success: true,
      mode: "development",
    };
  }

  try {
    if (!BREVO_API_KEY) {
      throw new Error(
        "Missing BREVO_API_KEY"
      );
    }

    const message = `Vaibhavamh verification code: ${otp}

This OTP expires in 5 minutes.
Do not share this code.`;

    const response =
      await axios.post(
        BREVO_API_URL,
        {
          sender:
            BREVO_SMS_SENDER,
          recipient:
            phone,
          content:
            message,
          type:
            "transactional",
        },
        {
          headers: {
            accept:
              "application/json",
            "api-key":
              BREVO_API_KEY,
            "content-type":
              "application/json",
          },
        }
      );

    return response.data;
  } catch (error) {
    console.error(
      "Brevo SMS error:",
      error?.response?.data ||
        error.message
    );

    throw new Error(
      "Failed to send verification code"
    );
  }
};