const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

const randomNumeric = (length) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
};

const createTempOtp = async (phone, email, firstName, lastName, password, otp) => {
  const hashed = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await supabase.from('auth_otps').delete().or(`phone.eq.${phone},email.eq.${email}`);

  const { error } = await supabase.from('auth_otps').insert({
    phone,
    email,
    first_name: firstName,
    last_name: lastName,
    password_temp: password,
    otp_hash: hashed,
    expires_at: expiresAt,
  });

  if (error) {
    throw error;
  }
};

const main = async () => {
  const timestamp = Date.now();
  const phone = `+1555${randomNumeric(6)}`;
  const email = `test.vendor.${timestamp}@example.com`;
  const password = `VendorPass!${randomNumeric(4)}`;
  const firstName = 'Test';
  const lastName = 'Vendor';
  const otp = '123456';

  console.log('Creating vendor auth OTP record for:', { phone, email });

  await createTempOtp(phone, email, firstName, lastName, password, otp);
  console.log('OTP record inserted with OTP:', otp);

  const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp }),
  });

  const body = await response.json();

  if (!response.ok) {
    console.error('Verify OTP failed:', response.status, body);
    process.exit(1);
  }

  console.log('Vendor created successfully');
  console.log('Signup response:', body);

  const userId = body?.user?.id;
  if (!userId) {
    console.error('Unable to determine user ID from signup response');
    process.exit(1);
  }

  const { data: vendorProfile, error: profileError } = await supabase
    .from('vendor_profiles')
    .select('id, user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (profileError) {
    console.error('Vendor profile lookup error:', profileError);
    process.exit(1);
  }

  if (!vendorProfile) {
    console.error('Vendor profile not found for user', userId);
    process.exit(1);
  }

  console.log('Vendor profile created:', vendorProfile);
  console.log('Use VENDOR_ID=' + vendorProfile.id + ' for upload testing');
};

main().catch((error) => {
  console.error('Vendor creation script failed:', error);
  process.exit(1);
});
