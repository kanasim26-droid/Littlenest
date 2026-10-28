-- Supabase & PostgreSQL Migration for Little Nest E-Commerce Store
-- Generated: 2026-10-28

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description TEXT,
    full_description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    category_slug VARCHAR(100),
    regular_price NUMERIC(10, 2) NOT NULL,
    sale_price NUMERIC(10, 2),
    cost_price NUMERIC(10, 2),
    currency VARCHAR(10) DEFAULT 'PKR',
    sku VARCHAR(100) UNIQUE,
    supplier_name VARCHAR(255),
    supplier_product_url TEXT,
    supplier_sku VARCHAR(100),
    material_details TEXT,
    washing_instructions TEXT,
    size_guide TEXT,
    available_colors JSONB DEFAULT '[]'::jsonb,
    available_sizes JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    weight_grams INTEGER DEFAULT 150,
    status VARCHAR(50) DEFAULT 'published',
    is_featured BOOLEAN DEFAULT false,
    is_best_seller BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT true,
    is_newborn_essential BOOLEAN DEFAULT true,
    gender_collection VARCHAR(50) DEFAULT 'unisex',
    stock_quantity INTEGER DEFAULT 50,
    low_stock_threshold INTEGER DEFAULT 10,
    supplier_stock_status VARCHAR(50) DEFAULT 'in_stock',
    supplier_last_checked TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Discounts and Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    value NUMERIC(10, 2) NOT NULL,
    min_cart_total NUMERIC(10, 2) DEFAULT 0,
    free_shipping BOOLEAN DEFAULT false,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    delivery_address JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    coupon_code VARCHAR(50),
    shipping_fee NUMERIC(10, 2) DEFAULT 0,
    tax_amount NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'PKR',
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cod', 'easypaisa', 'jazzcash')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'failed', 'refunded')),
    payment_reference VARCHAR(100),
    fulfillment_status VARCHAR(50) DEFAULT 'pending_confirmation' CHECK (fulfillment_status IN ('pending_confirmation', 'confirmed', 'processing', 'supplier_ordered', 'shipped', 'delivered', 'cancelled', 'refunded')),
    courier_name VARCHAR(100),
    tracking_number VARCHAR(100),
    supplier_order_ref VARCHAR(100),
    order_notes TEXT,
    audit_log JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Order Items (Historical Snapshot) Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    variant_color VARCHAR(100),
    variant_size VARCHAR(100),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    supplier_sku VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Announcement Bars Table
CREATE TABLE IF NOT EXISTS announcement_bars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    link VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    background_color VARCHAR(20) DEFAULT '#5A463C',
    text_color VARCHAR(20) DEFAULT '#FFFFFF',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Popup Campaigns Table
CREATE TABLE IF NOT EXISTS popup_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'welcome',
    headline TEXT NOT NULL,
    description TEXT NOT NULL,
    coupon_code VARCHAR(50),
    button_text VARCHAR(100) DEFAULT 'Shop Now',
    button_link VARCHAR(255) DEFAULT '/shop',
    image_url TEXT,
    background_color VARCHAR(50) DEFAULT '#FFF9F4',
    text_color VARCHAR(50) DEFAULT '#5A463C',
    button_style VARCHAR(50) DEFAULT 'solid_brown',
    layout VARCHAR(50) DEFAULT 'image_text',
    delay_seconds INTEGER DEFAULT 3,
    display_frequency VARCHAR(50) DEFAULT 'once_per_day',
    target_pages VARCHAR(50) DEFAULT 'all',
    device_target VARCHAR(50) DEFAULT 'all',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'published',
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Email Notification Queue & Delivery Logs
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    template_id VARCHAR(100) NOT NULL,
    order_number VARCHAR(50),
    status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
    error_message TEXT,
    payload JSONB,
    retry_count INTEGER DEFAULT 0,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Store Settings (Single Row Store Configuration)
CREATE TABLE IF NOT EXISTS store_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'current',
    settings JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) Configuration
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE popup_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_bars ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public can view published products" ON products FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can view active announcements" ON announcement_bars FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view published popups" ON popup_campaigns FOR SELECT USING (status = 'published');

-- Authenticated Admin Policies (Full access)
CREATE POLICY "Admin full access products" ON products FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access categories" ON categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access orders" ON orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access order_items" ON order_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access coupons" ON coupons FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access popups" ON popup_campaigns FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access announcements" ON announcement_bars FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access email_logs" ON email_logs FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access store_settings" ON store_settings FOR ALL TO authenticated USING (true);
