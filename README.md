# Vendorside Backend

This backend hosts the authentication API for the Vendorside application.

## Features

- Express-based auth API
- Supabase auth proxy using service role key
- Email/password signup
- SMS OTP login using Supabase OTP flow
- User profile insert into `users` table

## Setup

1. Copy `.env.example` to `.env`
2. Set the values:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FRONTEND_URL` (e.g. `http://localhost:3000`)

3. Install dependencies:

```bash
cd backend
npm install
```

4. Run in development:

```bash
npm run dev
```

## API Routes

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `GET /api/auth/me`
- `GET /api/health`
