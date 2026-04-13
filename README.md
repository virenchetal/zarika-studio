# Zarika Studio — Next.js + Supabase Setup Guide

## What you have
- Complete Next.js 15 project with TypeScript + Tailwind
- Supabase integration (auth, database, storage)
- Real OTP authentication (phone + Google)
- Products loaded from database
- Cart with Zustand (persisted in localStorage)
- Admin panel with RLS security

---

## STEP 1 — Run the Database Schema

1. Go to **supabase.com** → your `zarika-studioDB` project
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Open the file `supabase-schema.sql` from this project
5. Copy all the SQL and paste it into the editor
6. Click **Run** (green button)
7. You should see "Success. No rows returned"

---

## STEP 2 — Enable Phone Auth (for OTP)

1. In Supabase → **Authentication** → **Providers**
2. Find **Phone** → toggle it ON
3. For testing, use Supabase's built-in SMS (limited free messages)
4. For production, connect **Twilio**:
   - Sign up at twilio.com (free trial gives ~$15 credit)
   - Get Account SID, Auth Token, and a phone number
   - Enter them in Supabase → Phone provider settings

---

## STEP 3 — Enable Google Auth

1. Go to **console.cloud.google.com**
2. Create a new project → Enable **Google+ API**
3. Go to **Credentials** → Create **OAuth 2.0 Client ID**
4. Add authorized redirect URI:
   `https://rmurglnhogkskpjdimay.supabase.co/auth/v1/callback`
5. Copy the **Client ID** and **Client Secret**
6. In Supabase → **Authentication** → **Providers** → **Google**
7. Paste the Client ID and Secret → Save

---

## STEP 4 — Get Service Role Key

1. In Supabase → **Settings** → **API**
2. Copy the **service_role** key (keep this SECRET — never commit to GitHub)
3. Open `.env.local` and replace `your_service_role_key_here` with it

---

## STEP 5 — Install & Run Locally

```bash
cd zarika-studio
npm install
npm run dev
```

Open http://localhost:3000

---

## STEP 6 — Set Yourself as Admin

1. First, sign up on the website using your email/phone
2. Go to Supabase → **SQL Editor** → run:

```sql
UPDATE profiles
SET is_admin = TRUE
WHERE email = 'your-email@gmail.com';
```

Or if you signed up with phone:
```sql
UPDATE profiles
SET is_admin = TRUE
WHERE phone = '+919876543210';
```

Then go to `/admin` on your site.

---

## STEP 7 — Deploy to Vercel

1. Push this project to a **new GitHub repo** (separate from your HTML prototype):

```bash
cd zarika-studio
git init
git add .
git commit -m "Initial Zarika Studio Next.js app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/zarika-studio-app.git
git push -u origin main
```

2. Go to **vercel.com** → New Project → Import the new repo
3. Add **Environment Variables** in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://rmurglnhogkskpjdimay.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key
   - `NEXT_PUBLIC_SITE_URL` = `https://zarikastudio.com`
4. Deploy!
5. Move your domain `zarikastudio.com` from the old project to this one in Vercel

---

## STEP 8 — Upload Product Images

1. Go to Supabase → **Storage** → **product-images** bucket
2. Upload images for each product
3. Copy the public URL
4. Go to **Table Editor** → `product_images` table → Insert rows with the URLs

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              ← Homepage (loads from DB)
│   ├── shop/page.tsx         ← Product listing with filters
│   ├── product/[slug]/       ← Product detail page
│   ├── checkout/             ← Checkout flow
│   ├── profile/              ← Customer profile
│   ├── admin/                ← Admin dashboard
│   └── auth/callback/        ← OAuth callback
├── components/
│   ├── layout/               ← Navbar, Footer, Hero
│   ├── shop/                 ← ProductCard, ProductGrid, Filters
│   ├── cart/                 ← CartDrawer
│   └── auth/                 ← AuthModal
├── lib/
│   ├── supabase/             ← Client & server helpers
│   ├── api/                  ← Products, Orders, Auth helpers
│   └── store/                ← Zustand cart store
└── types/
    └── database.ts           ← Full TypeScript types
```

---

## Credentials Summary

| Item | Value |
|------|-------|
| Supabase URL | https://rmurglnhogkskpjdimay.supabase.co |
| Project | zarika-studioDB |
| Admin login | Set via SQL (Step 6) |
| Admin credentials | zarika / zarika2024 (your current prototype) |

---

## Next Steps After Setup

1. Add Razorpay payment integration
2. Set up order confirmation emails (Supabase + Resend)
3. Add WhatsApp notifications (Twilio WhatsApp API)
4. Upload real product photos
5. Connect zarikastudio.com to the new Vercel deployment
