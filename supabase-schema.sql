-- ============================================================
-- ZARIKA STUDIO — Complete Database Schema
-- Run this in Supabase > SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── CATEGORIES ──────────────────────────────────────────────
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── PRODUCTS ────────────────────────────────────────────────
CREATE TABLE products (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT,
  price            NUMERIC(10,2) NOT NULL,
  mrp              NUMERIC(10,2),
  fabric           TEXT,
  color            TEXT,
  occasion         TEXT,
  length_meters    NUMERIC(4,1),
  blouse_piece     TEXT DEFAULT 'Included (0.8m)',
  care_instructions TEXT DEFAULT 'Dry clean only',
  stock_quantity   INT NOT NULL DEFAULT 0,
  sku              TEXT UNIQUE,
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active        BOOLEAN DEFAULT TRUE,
  is_featured      BOOLEAN DEFAULT FALSE,
  badge            TEXT CHECK (badge IN ('new','sale','bridal',NULL)),
  delivery_days    TEXT DEFAULT '5–7 business days',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── PRODUCT IMAGES ──────────────────────────────────────────
CREATE TABLE product_images (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  storage_path TEXT,
  sort_order   INT DEFAULT 0,
  is_primary   BOOLEAN DEFAULT FALSE
);

-- ── PROFILES (extends Supabase auth.users) ──────────────────
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  phone         TEXT,
  email         TEXT,
  date_of_birth DATE,
  gender        TEXT,
  avatar_url    TEXT,
  is_admin      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── ADDRESSES ───────────────────────────────────────────────
CREATE TABLE addresses (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label      TEXT DEFAULT 'Home',
  full_name  TEXT NOT NULL,
  phone      TEXT NOT NULL,
  line1      TEXT NOT NULL,
  line2      TEXT,
  city       TEXT NOT NULL,
  state      TEXT NOT NULL,
  pincode    TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ORDERS ──────────────────────────────────────────────────
CREATE TABLE orders (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id),
  status         TEXT NOT NULL DEFAULT 'placed'
                 CHECK (status IN ('placed','processing','shipped','delivered','cancelled','refunded')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('upi','card','cod')),
  payment_status TEXT NOT NULL DEFAULT 'pending'
                 CHECK (payment_status IN ('pending','paid','failed','refunded')),
  subtotal       NUMERIC(10,2) NOT NULL,
  shipping       NUMERIC(10,2) DEFAULT 0,
  discount       NUMERIC(10,2) DEFAULT 0,
  total          NUMERIC(10,2) NOT NULL,
  address_id     UUID REFERENCES addresses(id),
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── ORDER ITEMS ─────────────────────────────────────────────
CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  product_image TEXT,
  price         NUMERIC(10,2) NOT NULL,
  quantity      INT NOT NULL DEFAULT 1
);

-- ── WISHLIST ────────────────────────────────────────────────
CREATE TABLE wishlist (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at on products
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.phone,
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist      ENABLE ROW LEVEL SECURITY;
ALTER TABLE products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Products & categories: anyone can read
CREATE POLICY "Public read products"    ON products       FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read categories"  ON categories     FOR SELECT USING (TRUE);
CREATE POLICY "Public read images"      ON product_images FOR SELECT USING (TRUE);

-- Admin can do everything on products
CREATE POLICY "Admin all products"   ON products
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Admin all categories" ON categories
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Admin all images"     ON product_images
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Profiles: users manage their own
CREATE POLICY "Own profile"     ON profiles FOR ALL USING (id = auth.uid());
CREATE POLICY "Admin profiles"  ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Addresses: users manage their own
CREATE POLICY "Own addresses"   ON addresses FOR ALL USING (user_id = auth.uid());

-- Orders: users see their own, admins see all
CREATE POLICY "Own orders"      ON orders FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admin orders"    ON orders FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Order items: follow order access
CREATE POLICY "Own order items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY "Insert order items" ON order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY "Admin order items" ON order_items FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Wishlist: users manage their own
CREATE POLICY "Own wishlist" ON wishlist FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', TRUE)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admin delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ============================================================
-- SEED DATA — Categories
-- ============================================================

INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Silk Sarees',    'silk',    'Handwoven pure silk sarees', 1),
  ('Cotton Sarees',  'cotton',  'Breathable handloom cotton sarees', 2),
  ('Bridal',         'bridal',  'Exquisite bridal collection', 3),
  ('Party Wear',     'party',   'Elegant party and festive sarees', 4),
  ('Everyday',       'everyday','Comfortable everyday sarees', 5);

-- ============================================================
-- SEED DATA — Sample Products
-- ============================================================

INSERT INTO products (
  name, slug, description, price, mrp, fabric, color,
  occasion, length_meters, blouse_piece, stock_quantity,
  sku, category_id, is_featured, badge, delivery_days
) VALUES
(
  'Kanjivaram Heritage Crimson',
  'kanjivaram-heritage-crimson',
  'A timeless masterpiece handwoven by artisans in Kanchipuram over 3 days, featuring intricate temple border motifs and a rich zari pallu. The weight of the silk and the brilliance of the gold thread make it a prized possession for any bridal trousseau.',
  8999, 12000, 'Pure Kanjivaram Silk', 'Deep Crimson with Gold Zari',
  'Bridal, Wedding, Festive', 6.3, 'Included (0.8m)', 8,
  'ZS-SK-001',
  (SELECT id FROM categories WHERE slug = 'silk'),
  TRUE, 'new', '5–7 business days'
),
(
  'Banarasi Royal Blue',
  'banarasi-royal-blue',
  'Woven in the heart of Varanasi, this Banarasi silk saree features classic floral brocade work with real silver and gold zari. A statement piece for weddings and grand celebrations.',
  6500, 9000, 'Silk Brocade', 'Royal Blue with Silver Zari',
  'Wedding, Party, Festive', 6.3, 'Included (0.8m)', 5,
  'ZS-SK-002',
  (SELECT id FROM categories WHERE slug = 'silk'),
  TRUE, NULL, '5–7 business days'
),
(
  'Cotton Ikkat Forest Green',
  'cotton-ikkat-forest-green',
  'Handloom Ikkat saree from Andhra Pradesh, featuring traditional geometric patterns in vibrant forest green. Perfect for office wear and casual occasions.',
  2200, 3500, 'Handloom Cotton', 'Forest Green',
  'Everyday, Office, Casual', 5.5, 'Included (0.8m)', 34,
  'ZS-CT-001',
  (SELECT id FROM categories WHERE slug = 'cotton'),
  TRUE, 'sale', '3–5 business days'
),
(
  'Purple Patola Silk',
  'purple-patola-silk',
  'The legendary double-ikat Patola from Patan, Gujarat. Each saree takes months to weave and features the iconic geometric Patola patterns in royal violet. A collector''s treasure.',
  15500, 20000, 'Pure Silk (Double Ikat)', 'Royal Violet',
  'Bridal, Festive, Special Occasions', 6.3, 'Included (0.8m)', 2,
  'ZS-SK-003',
  (SELECT id FROM categories WHERE slug = 'bridal'),
  TRUE, 'bridal', '7–10 business days'
),
(
  'Chanderi Kasuti Terracotta',
  'chanderi-kasuti-terracotta',
  'Lightweight Chanderi silk-cotton blend with traditional Kasuti embroidery. The warm terracotta tone and delicate embroidery make it a versatile choice for festive occasions.',
  4100, NULL, 'Chanderi Silk-Cotton', 'Terracotta',
  'Festive, Party, Semi-Formal', 6.0, 'Included (0.8m)', 22,
  'ZS-CH-001',
  (SELECT id FROM categories WHERE slug = 'party'),
  FALSE, 'new', '4–6 business days'
),
(
  'Teal Linen Drape',
  'teal-linen-drape',
  'Pure linen saree in a refreshing ocean teal, hand-dyed using natural indigo extracts. Breathable, sustainable, and effortlessly elegant for the modern woman.',
  3200, NULL, 'Pure Linen', 'Ocean Teal',
  'Everyday, Office, Brunch', 5.5, 'Included (0.8m)', 18,
  'ZS-LN-001',
  (SELECT id FROM categories WHERE slug = 'everyday'),
  FALSE, 'new', '3–5 business days'
),
(
  'Tussar Gold Silk',
  'tussar-gold-silk',
  'Wild Tussar silk from Jharkhand with a natural golden sheen and raw texture. Features hand-painted Madhubani art on the pallu — every piece is unique.',
  5800, 7500, 'Tussar Silk', 'Antique Gold',
  'Festive, Cultural Events, Puja', 6.0, 'Included (0.8m)', 12,
  'ZS-TS-001',
  (SELECT id FROM categories WHERE slug = 'silk'),
  FALSE, 'new', '5–7 business days'
),
(
  'Magenta Paithani',
  'magenta-paithani',
  'The royal Paithani from Paithan, Maharashtra. Known for its vibrant peacock motifs and intricate zari border, this saree is woven on a traditional handloom.',
  11200, 14500, 'Pure Silk (Paithani)', 'Deep Magenta',
  'Bridal, Festive, Weddings', 6.3, 'Included (0.8m)', 7,
  'ZS-PT-001',
  (SELECT id FROM categories WHERE slug = 'bridal'),
  FALSE, 'new', '6–8 business days'
);

-- ============================================================
-- SET ADMIN USER (run this AFTER signing up your admin account)
-- Replace the email below with your actual admin email
-- ============================================================
-- UPDATE profiles
-- SET is_admin = TRUE
-- WHERE email = 'your-admin-email@gmail.com';
