import { supabase } from "../config/supabase.js";
import { sendOtpSms } from "../services/smsService.js";
import {
  generateOtp,
  hashOtp,
  getOtpExpiry,
  verifyOtpHash,
} from "../utils/otp.js";

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const normalizePhone = (phone) => {
  if (!phone || typeof phone !== "string") {
    throw new Error("Phone number is required");
  }

  const cleaned = phone.replace(/[^\d+]/g, "").trim();

  if (!/^\+?\d{10,15}$/.test(cleaned)) {
    throw new Error("Please enter a valid phone number");
  }

  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  return `+${cleaned}`;
};

// ==========================================
// 1. SEND OTP
// ==========================================
export const sendOtp = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone: rawPhone,
      password,
      role = "customer",
    } = req.body;

    // Validation
    if (!firstName?.trim()) {
      return res.status(400).json({ message: "First name is required" });
    }

    if (!lastName?.trim()) {
      return res.status(400).json({ message: "Last name is required" });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const phone = normalizePhone(rawPhone);
    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate phone
    const { data: existingPhone } = await supabase
      .from("users")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (existingPhone) {
      return res.status(409).json({ message: "Phone number already registered" });
    }

    // Check duplicate email
    const { data: existingEmail } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Remove old OTP rows
    await supabase
      .from("auth_otps")
      .delete()
      .or(`phone.eq.${phone},email.eq.${normalizedEmail}`);

    // Generate OTP
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = getOtpExpiry(5);

    // Save temp signup
    const { error: otpInsertError } = await supabase
      .from("auth_otps")
      .insert({
        phone,
        email: normalizedEmail,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password_temp: password,
        role,
        otp_hash: otpHash,
        expires_at: expiresAt,
      });

    if (otpInsertError) {
      throw new Error(otpInsertError.message);
    }

    // Send SMS
    await sendOtpSms(phone, otp);

    return res.json({
      success: true,
      message: "Verification code sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error", error);
    return res.status(500).json({
      message: error.message || "Failed to send verification code",
    });
  }
};

// ==========================================
// 2. RESEND OTP
// ==========================================
export const resendOtp = async (req, res) => {
  try {
    const { phone: rawPhone } = req.body;

    if (!rawPhone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const phone = normalizePhone(rawPhone);

    const { data: otpRecord, error: fetchError } = await supabase
      .from("auth_otps")
      .select("*")
      .eq("phone", phone)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);

    if (!otpRecord) {
      return res.status(404).json({
        message: "No sign-up request found for this phone number. Please register again.",
      });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = getOtpExpiry(5);

    const { error: updateError } = await supabase
      .from("auth_otps")
      .update({
        otp_hash: otpHash,
        expires_at: expiresAt,
        attempts: 0, 
      })
      .eq("id", otpRecord.id);

    if (updateError) throw new Error(updateError.message);

    await sendOtpSms(phone, otp);

    return res.json({
      success: true,
      message: "Verification code resent successfully",
    });
  } catch (error) {
    console.error("Resend OTP Error", error);
    return res.status(500).json({
      message: error.message || "Failed to resend verification code",
    });
  }
};

// ==========================================
// 3. VERIFY OTP
// ==========================================
export const verifyOtp = async (req, res) => {
  try {
    const { phone: rawPhone, otp } = req.body;

    if (!rawPhone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    if (!otp?.trim()) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const phone = normalizePhone(rawPhone);

    // Get latest OTP record
    const { data: otpRecord, error: otpFetchError } = await supabase
      .from("auth_otps")
      .select("*")
      .eq("phone", phone)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpFetchError) throw new Error(otpFetchError.message);

    if (!otpRecord) {
      return res.status(400).json({ message: "Verification code not found" });
    }

    // Expiry check
    const now = new Date();
    const expiry = new Date(otpRecord.expires_at);

    if (now > expiry) {
      await supabase.from("auth_otps").delete().eq("id", otpRecord.id);
      return res.status(400).json({ message: "Verification code expired" });
    }

    // Attempts check
    if (otpRecord.attempts >= 5) {
      await supabase.from("auth_otps").delete().eq("id", otpRecord.id);
      return res.status(429).json({
        message: "Too many invalid attempts. Please request a new OTP.",
      });
    }

    // Verify OTP hash
    const isOtpValid = verifyOtpHash(otp, otpRecord.otp_hash);

    if (!isOtpValid) {
      await supabase
        .from("auth_otps")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("id", otpRecord.id);

      return res.status(400).json({ message: "Invalid verification code" });
    }

    const fullName = `${otpRecord.first_name} ${otpRecord.last_name}`;

    // Public profile anti-duplication re-check safety boundary
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("phone", otpRecord.phone)
      .maybeSingle();

    if (existingUser) {
      return res.status(409).json({
        message: "Account already exists. Please login instead.",
      });
    }

    const { data: emailConflict } = await supabase
      .from("users")
      .select("id")
      .eq("email", otpRecord.email)
      .maybeSingle();

    if (emailConflict) {
      return res.status(409).json({
        message: "An account with this email address already exists.",
      });
    }

    // Programmatically seed verified auth entities via Admin API
    const { data: signupData, error: signupError } = await supabase.auth.admin.createUser({
      email: otpRecord.email,
      password: otpRecord.password_temp,
      email_confirm: true,
      phone_confirm: true
    });

    if (signupError || !signupData?.user) {
      throw new Error(signupError?.message || "Failed to create account primitives");
    }

    const userId = signupData.user.id;
    console.log("ADMIN ROUTE AUTH IDENTITY CREATED:", userId);

    // Insert users row
    const { error: userInsertError } = await supabase
      .from("users")
      .insert({
        id: userId,
        full_name: fullName,
        email: otpRecord.email,
        phone: otpRecord.phone,
        role: otpRecord.role,
        is_verified: true,
      });

    if (userInsertError) throw new Error(userInsertError.message);

    // Create profile hierarchy
    if (otpRecord.role === "vendor") {
      const { error: vendorInsertError } = await supabase
        .from("vendor_profiles")
        .insert({ user_id: userId, owner_name: fullName });

      if (vendorInsertError) throw new Error(vendorInsertError.message);
    } else {
      const { error: customerInsertError } = await supabase
        .from("customer_profiles")
        .insert({ user_id: userId });

      if (customerInsertError) throw new Error(customerInsertError.message);
    }

    // ✅ Fix 1: Programmatically spin up a live session payload before returning
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: otpRecord.email,
      password: otpRecord.password_temp,
    });

    if (loginError || !loginData?.session) {
      throw new Error("Failed to generate user login session context");
    }

    // Cleanup tracking record now that transactions succeeded flawlessly
    await supabase.from("auth_otps").delete().eq("id", otpRecord.id);

    // ✅ Fix 3: Altered landing targets to route authenticated users seamlessly
    return res.json({
      success: true,
      userId,
      role: otpRecord.role,
      session: loginData.session,
      redirectTo: otpRecord.role === "vendor" ? "/vendor-registration" : "/",
    });
  } catch (error) {
    console.error("Verify OTP error", error);
    return res.status(500).json({
      message: error.message || "OTP verification failed",
    });
  }
};

// ==========================================
// 4. SIGN IN
// ==========================================
export const signIn = async (req, res) => {
  try {
    const { phone: rawPhone, password } = req.body;

    if (!rawPhone?.trim()) {
      return res.status(400).json({ message: "Phone number is required" });
    }
    if (!password?.trim()) {
      return res.status(400).json({ message: "Password is required" });
    }

    const phone = normalizePhone(rawPhone);

    // ── TARGETED TRACE LOG #1: NORMALIZED PHONE FORMAT OUTPUT ──
    console.log("LOGIN PHONE:", phone);

    // Find user by phone
    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("id, email, role, status")
      .eq("phone", phone)
      .maybeSingle();

    if (userError) throw new Error(userError.message);

    // ── TARGETED TRACE LOG #2: DATABASE OBJECT LOOKUP RESULTS ──
    console.log("USER RECORD:", userRecord);

    if (!userRecord || !userRecord.email) {
      return res.status(401).json({ message: "Invalid phone number or password" });
    }

    // Status safety ceiling
    if (userRecord.status !== "active") {
      return res.status(403).json({ message: "Your account is inactive or blocked" });
    }

    // Internal login via email mapping
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userRecord.email,
      password,
    });

    // ── TARGETED TRACE LOG #3: SUPABASE ENGINE DISPATCH SESSION RESULTS ──
    console.log("SIGNIN DATA:", signInData);

    if (signInError || !signInData?.session) {
      return res.status(401).json({ message: "Invalid phone number or password" });
    }

    // Update login timestamp tracking
    await supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", userRecord.id);

    return res.json({
      success: true,
      session: signInData.session,
      user: signInData.user,
      role: userRecord.role,
    });
  } catch (error) {
    console.error("Sign in error", error);
    return res.status(500).json({
      message: error.message || "Sign in failed",
    });
  }
};

// ==========================================
// 5. START GOOGLE OAUTH
// ==========================================
export const startGoogleAuth = async (req, res) => {
  try {
    const {
      mode = "signin",
      role = "customer",
      next = "/",
    } = req.body || {};

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `http://localhost:3000/auth/callback?mode=${mode}&role=${role}`,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });

    if (error || !data?.url) {
      throw new Error(error?.message || "Failed to start Google authentication");
    }

    return res.json({
      success: true,
      url: data.url,
      next,
    });
  } catch (error) {
    console.error("Google auth start error", error);
    return res.status(500).json({
      message: error.message || "Failed to start Google authentication",
    });
  }
};

// ==========================================
// 6. COMPLETE GOOGLE OAUTH
// ==========================================
export const completeGoogleAuth = async (req, res) => {
  try {
    const { mode, role = "customer", user = {} } = req.body;

    if (!user?.id) {
      return res.status(400).json({ message: "Invalid Google user" });
    }

    const email = user.email?.trim()?.toLowerCase() || null;
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";

    // Verify existence of user record by absolute UUID mapping
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    // SIGNIN FLOW
    if (mode === "signin") {
      if (!existingUser) {
        return res.status(404).json({
          message: "Account not found. Please sign up first.",
        });
      }

      return res.json({
        success: true,
        redirectTo: existingUser.role === "vendor" ? "/vendor-registration" : "/",
      });
    }

    // SIGNUP FLOW
    if (!existingUser) {
      // CRITICAL ANTI-COLLISION CHECK
      if (email) {
        const { data: emailConflict } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (emailConflict) {
          return res.status(409).json({
            message: "An account with this email already exists via phone authentication.",
          });
        }
      }

      // Safe initialization insert
      const { error: userError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          full_name: fullName,
          email,
          phone: null,
          role: role,
          is_verified: true,
        });

      if (userError) throw new Error(userError.message);

      // Branch profile dependency creations
      if (role === "vendor") {
        const { error: vendorError } = await supabase
          .from("vendor_profiles")
          .insert({
            user_id: user.id,
            owner_name: fullName,
          });

        if (vendorError) throw new Error(vendorError.message);
      } else {
        const { error: customerError } = await supabase
          .from("customer_profiles")
          .insert({
            user_id: user.id,
          });

        if (customerError) throw new Error(customerError.message);
      }
    } 

    return res.json({
      success: true,
      redirectTo: role === "vendor" ? "/vendor-registration" : "/",
    });
  } catch (error) {
    console.error("Google auth completion error", error);
    return res.status(500).json({
      message: error.message || "Google authentication failed",
    });
  }
};