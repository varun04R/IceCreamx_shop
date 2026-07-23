/*
# IceCreamX — Initial Schema

## Overview
Creates the full data model for the IceCreamX ice cream shop management system:
staff profiles, product catalog (categories, ice creams, toppings), inventory,
customers, orders, coupons, reviews, notifications, and settings.

## Tables
1. `profiles` — extends `auth.users` with shop role, name, phone, avatar.
2. `categories` — product categories (Cone, Cup, Sundae, Milkshake, etc.).
3. `ice_creams` — product catalog with pricing, stock, sizes, flags.
4. `toppings` — add-on toppings with price and availability.
5. `inventory_items` — raw materials with supplier, expiry, min-stock alerts.
6. `customers` — customer profiles with reward points and membership tier.
7. `orders` — orders with line items (jsonb), totals, payment, status.
8. `coupons` — discount codes (flat / percentage / BOGO).
9. `reviews` — product ratings and comments.
10. `notifications` — in-app notification feed.
11. `settings` — key/value shop configuration (business info, GST, currency).

## Security
- RLS enabled on every table.
- All tables are shared among authenticated staff (shop data), so policies
  use `TO authenticated` with `USING (true)` / `WITH CHECK (true)` — the data
  is intentionally shared across all signed-in staff members.
- `profiles` is owner-scoped: a user can read/update only their own profile row,
  but all authenticated users can read profiles (staff directory).
*/

-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'employee' CHECK (role IN ('admin','manager','cashier','employee','customer')),
  phone text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_profiles" ON public.profiles;
CREATE POLICY "read_profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- categories
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  icon text DEFAULT '',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_categories" ON public.categories;
CREATE POLICY "read_categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "write_categories" ON public.categories;
CREATE POLICY "write_categories" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ice_creams
CREATE TABLE IF NOT EXISTS public.ice_creams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  flavor text DEFAULT '',
  description text DEFAULT '',
  ingredients text[] DEFAULT '{}',
  calories int DEFAULT 0,
  price numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(5,2) DEFAULT 0,
  stock int DEFAULT 0,
  sku text DEFAULT '',
  barcode text DEFAULT '',
  image_url text DEFAULT '',
  sizes text[] DEFAULT '{}',
  availability boolean DEFAULT true,
  seasonal boolean DEFAULT false,
  featured boolean DEFAULT false,
  best_seller boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.ice_creams ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_ice_creams_category ON public.ice_creams(category_id);
CREATE INDEX IF NOT EXISTS idx_ice_creams_name ON public.ice_creams USING gin (to_tsvector('english', name));
DROP POLICY IF EXISTS "read_ice_creams" ON public.ice_creams;
CREATE POLICY "read_ice_creams" ON public.ice_creams FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "write_ice_creams" ON public.ice_creams;
CREATE POLICY "write_ice_creams" ON public.ice_creams FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- toppings
CREATE TABLE IF NOT EXISTS public.toppings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10,2) DEFAULT 0,
  image_url text DEFAULT '',
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.toppings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_toppings" ON public.toppings;
CREATE POLICY "read_toppings" ON public.toppings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "write_toppings" ON public.toppings;
CREATE POLICY "write_toppings" ON public.toppings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- inventory_items
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  unit text DEFAULT 'pcs',
  stock numeric(12,2) DEFAULT 0,
  supplier text DEFAULT '',
  purchase_date date,
  expiry_date date,
  min_stock numeric(12,2) DEFAULT 0,
  category text DEFAULT 'general',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_inventory" ON public.inventory_items;
CREATE POLICY "read_inventory" ON public.inventory_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_inventory" ON public.inventory_items;
CREATE POLICY "write_inventory" ON public.inventory_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- customers
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  birthday date,
  favorite_flavor text DEFAULT '',
  reward_points int DEFAULT 0,
  membership_level text DEFAULT 'bronze' CHECK (membership_level IN ('bronze','silver','gold','diamond')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_customers" ON public.customers;
CREATE POLICY "read_customers" ON public.customers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_customers" ON public.customers;
CREATE POLICY "write_customers" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  items jsonb NOT NULL DEFAULT '[]',
  subtotal numeric(12,2) DEFAULT 0,
  discount numeric(12,2) DEFAULT 0,
  tax numeric(12,2) DEFAULT 0,
  total numeric(12,2) DEFAULT 0,
  payment_method text DEFAULT 'cash',
  status text DEFAULT 'pending' CHECK (status IN ('pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled','refunded')),
  notes text DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
DROP POLICY IF EXISTS "read_orders" ON public.orders;
CREATE POLICY "read_orders" ON public.orders FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_orders" ON public.orders;
CREATE POLICY "write_orders" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  type text DEFAULT 'percentage' CHECK (type IN ('flat','percentage','bogo')),
  value numeric(10,2) DEFAULT 0,
  active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_coupons" ON public.coupons;
CREATE POLICY "read_coupons" ON public.coupons FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_coupons" ON public.coupons;
CREATE POLICY "write_coupons" ON public.coupons FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ice_cream_id uuid REFERENCES public.ice_creams(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name text DEFAULT '',
  rating int NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  comment text DEFAULT '',
  image_url text DEFAULT '',
  likes int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_reviews" ON public.reviews;
CREATE POLICY "read_reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "write_reviews" ON public.reviews;
CREATE POLICY "write_reviews" ON public.reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  message text DEFAULT '',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_notifications" ON public.notifications;
CREATE POLICY "read_notifications" ON public.notifications FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_notifications" ON public.notifications;
CREATE POLICY "write_notifications" ON public.notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- settings (key/value)
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_settings" ON public.settings;
CREATE POLICY "read_settings" ON public.settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "write_settings" ON public.settings;
CREATE POLICY "write_settings" ON public.settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'), COALESCE(NEW.raw_user_meta_data->>'role', 'customer'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_new_user AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
