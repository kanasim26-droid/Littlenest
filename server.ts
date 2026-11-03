import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data', 'database.json');
const PORT = process.env.PORT || 3000;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'littlenest_admin_secret_token_2026';
let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'nest2026';

// Persistent JSON store. Prefer the project's direct PostgreSQL connection so
// the app can create/seed its own store_settings table even when PostgREST's
// schema cache has not refreshed. Keep Supabase REST as a fallback.
import { Pool } from 'pg';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const POSTGRES_URL = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
// Some managed connection strings include sslmode=require, which pg parses into
// its own strict certificate-verification config and overrides the explicit
// ssl.rejectUnauthorized setting. Remove only sslmode so the Pool's SSL config
// below can handle managed/self-signed certificate chains.
const POSTGRES_CONNECTION_STRING = POSTGRES_URL
  ? POSTGRES_URL.replace(/([?&])sslmode=[^&]*/i, '$1').replace(/[?&]$/, '')
  : undefined;
const postgresPool = POSTGRES_CONNECTION_STRING
  ? new Pool({ connectionString: POSTGRES_CONNECTION_STRING, ssl: { rejectUnauthorized: false }, max: 2, connectionTimeoutMillis: 8000 })
  : null;
let postgresTableReady: Promise<void> | null = null;

async function ensurePostgresTable() {
  if (!postgresPool) throw new Error('PostgreSQL connection is not configured.');
  if (!postgresTableReady) {
    postgresTableReady = postgresPool.query(`
      CREATE TABLE IF NOT EXISTS public.store_settings (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'current',
        settings JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `).then(() => undefined).catch((error) => {
      postgresTableReady = null;
      throw error;
    });
  }
  await postgresTableReady;
}

async function supabaseRequest(pathname: string, init: RequestInit = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.');
  }
  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${pathname}`, {
    signal: AbortSignal.timeout(8000),
    ...init,
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${detail}`);
  }
  return response;
}

async function saveDatabase(data: any) {
  if (postgresPool) {
    await ensurePostgresTable();
    await postgresPool.query(
      'INSERT INTO public.store_settings (id, settings, updated_at) VALUES ($1, $2::jsonb, now()) ON CONFLICT (id) DO UPDATE SET settings = EXCLUDED.settings, updated_at = now()',
      ['current', JSON.stringify(data)]
    );
    return;
  }
  await supabaseRequest('store_settings?on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      id: 'current',
      settings: data,
      updated_at: new Date().toISOString()
    })
  });
}

async function getDatabase() {
  if (postgresPool) {
    await ensurePostgresTable();
    const result = await postgresPool.query('SELECT settings FROM public.store_settings WHERE id = $1 LIMIT 1', ['current']);
    if (result.rows.length && result.rows[0]?.settings) return result.rows[0].settings;
    if (!fs.existsSync(DATA_FILE)) {
      throw new Error('PostgreSQL store_settings has no initial data and data/database.json was not found.');
    }
    const seed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    await saveDatabase(seed);
    return seed;
  }

  const response = await supabaseRequest('store_settings?id=eq.current&select=settings&limit=1');
  const rows = await response.json() as Array<{ settings: any }>;
  if (rows.length && rows[0]?.settings) return rows[0].settings;

  // First-run migration: seed the Supabase JSON document from the repository's
  // current catalogue/settings once, without depending on serverless disk writes.
  if (!fs.existsSync(DATA_FILE)) {
    throw new Error('Supabase store_settings has no initial data and data/database.json was not found.');
  }
  const seed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  await saveDatabase(seed);
  return seed;
}

export const app = express();
app.use(express.json({ limit: '6mb' }));

// Express 4 does not automatically forward rejected async route handlers.
// Wrap route callbacks so database/API errors return JSON immediately instead of
// leaving requests open until Vercel kills them after 30 seconds.
const wrapAsyncRoute = (handler: any) => {
  if (typeof handler !== 'function' || handler.length === 4) return handler;
  return (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(handler(req, res, next)).catch(next);
};
for (const method of ['get', 'post', 'put', 'patch', 'delete'] as const) {
  const originalMethod = (app as any)[method].bind(app);
  (app as any)[method] = (...args: any[]) => {
    // app.get('setting') is an Express settings getter, not a route.
    if (method === 'get' && args.length === 1 && typeof args[0] === 'string') {
      return originalMethod(...args);
    }
    return originalMethod(...args.map((arg: any, index: number) =>
      index > 0 ? wrapAsyncRoute(arg) : arg
    ));
  };
}


// --- RESEND TRANSACTIONAL EMAILS ---
// This runs only on the server. Never expose RESEND_API_KEY to browser code.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'LittleNest <onboarding@resend.dev>';
const RESEND_REPLY_TO = process.env.RESEND_REPLY_TO;

function escapeEmailHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char] as string));
}

async function sendResendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}) {
  if (!RESEND_API_KEY) throw new Error('Resend is not configured. Add RESEND_API_KEY to Vercel environment variables.');
  if (!input.to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.to)) {
    throw new Error('A valid recipient email address is required.');
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': input.idempotencyKey
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(RESEND_REPLY_TO ? { reply_to: RESEND_REPLY_TO } : {})
    }),
    signal: AbortSignal.timeout(15000)
  });
  const payload = await response.json().catch(() => ({})) as any;
  if (!response.ok) {
    throw new Error(payload?.message || payload?.name || `Resend returned HTTP ${response.status}`);
  }
  return payload as { id?: string };
}

function buildOrderEmail(order: any, kind: 'customer' | 'admin') {
  const isCustomer = kind === 'customer';
  const orderNumber = escapeEmailHtml(order.orderNumber);
  const name = escapeEmailHtml(order.customerName || 'Customer');
  const rows = (order.items || []).map((item: any) =>
    `<tr><td style="padding:10px;border-bottom:1px solid #eee">${escapeEmailHtml(item.productName)}<br><small>${escapeEmailHtml(item.variantColor)} / ${escapeEmailHtml(item.variantSize)}</small></td><td style="padding:10px;border-bottom:1px solid #eee;text-align:center">${Number(item.quantity) || 0}</td><td style="padding:10px;border-bottom:1px solid #eee;text-align:right">Rs. ${(Number(item.totalPrice) || 0).toLocaleString('en-PK')}</td></tr>`
  ).join('');
  const address = order.deliveryAddress || {};
  const addressText = [address.streetAddress, address.area, address.city, address.province, address.postalCode].filter(Boolean).join(', ');
  const subject = isCustomer
    ? `LittleNest order confirmed — ${order.orderNumber}`
    : `New LittleNest order — ${order.orderNumber}`;
  const heading = isCustomer ? 'Thank you for your order!' : 'A new order has been placed';
  const intro = isCustomer
    ? 'We have received your order and our team will prepare it for delivery.'
    : `A new order was placed by ${name}.`;
  const text = [
    heading, intro, `Order: ${order.orderNumber}`, `Customer: ${order.customerName}`,
    `Items: ${(order.items || []).map((item: any) => `${item.productName} x ${item.quantity} — Rs. ${item.totalPrice}`).join('; ')}`,
    `Subtotal: Rs. ${order.subtotal}`, `Discount: Rs. ${order.discountAmount || 0}`,
    `Shipping: Rs. ${order.shippingFee || 0}`, `Total: Rs. ${order.total}`,
    `Payment: ${order.paymentMethod}`, `Delivery address: ${addressText}`, `Phone: ${order.phone || ''}`
  ].join('\n');
  const html = `<!doctype html><html><body style="margin:0;background:#faf7f5;font-family:Arial,sans-serif;color:#342b2b"><div style="max-width:620px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden"><div style="padding:28px;background:#f8e9e9;text-align:center"><div style="font-size:25px;font-weight:bold;letter-spacing:1px">LittleNest</div><h1 style="font-size:22px;margin:16px 0 6px">${heading}</h1><p style="margin:0">${intro}</p></div><div style="padding:24px"><p>Order number: <strong>${orderNumber}</strong></p><p>Hello ${name},</p><table style="width:100%;border-collapse:collapse"><thead><tr><th align="left" style="padding:10px;border-bottom:2px solid #ddd">Product</th><th style="padding:10px;border-bottom:2px solid #ddd">Qty</th><th align="right" style="padding:10px;border-bottom:2px solid #ddd">Amount</th></tr></thead><tbody>${rows}</tbody></table><table style="width:100%;margin-top:16px"><tr><td>Subtotal</td><td align="right">Rs. ${(Number(order.subtotal) || 0).toLocaleString('en-PK')}</td></tr><tr><td>Discount</td><td align="right">Rs. ${(Number(order.discountAmount) || 0).toLocaleString('en-PK')}</td></tr><tr><td>Shipping</td><td align="right">Rs. ${(Number(order.shippingFee) || 0).toLocaleString('en-PK')}</td></tr><tr><td style="padding-top:12px;font-weight:bold">Total</td><td align="right" style="padding-top:12px;font-weight:bold">Rs. ${(Number(order.total) || 0).toLocaleString('en-PK')}</td></tr></table><h3>Delivery details</h3><p>${escapeEmailHtml(addressText)}<br>Phone: ${escapeEmailHtml(order.phone)}</p><p>Payment method: ${escapeEmailHtml(order.paymentMethod)}</p><p style="color:#777;font-size:12px;margin-top:28px">Thank you for choosing LittleNest.</p></div></div></body></html>`;
  return { subject, html, text };
}

async function deliverOrderEmail(order: any, recipient: string, kind: 'customer' | 'admin', log: any, attempt = 0) {
  try {
    const message = buildOrderEmail(order, kind);
    const result = await sendResendEmail({
      to: recipient,
      ...message,
      idempotencyKey: `littlenest/${order.id}/${kind}/v${attempt + 1}`
    });
    log.status = 'sent';
    log.provider = 'resend';
    log.providerMessageId = result.id || null;
    log.sentAt = new Date().toISOString();
    log.errorMessage = null;
  } catch (error: any) {
    log.status = 'failed';
    log.provider = 'resend';
    log.errorMessage = String(error?.message || 'Email delivery failed').slice(0, 500);
    log.failedAt = new Date().toISOString();
    console.error(`LittleNest ${kind} email failed for ${order.orderNumber}:`, log.errorMessage);
  }
}

async function configureApp() {

  // Simple token-based admin auth middleware
  function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
    }
    const token = authHeader.substring(7);
    if (token !== ADMIN_SECRET_KEY && !token.startsWith('admin_session_')) {
      return res.status(403).json({ error: 'Forbidden: Invalid admin token' });
    }
    next();
  }

  // --- AUTH ENDPOINTS ---
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      const sessionToken = `admin_session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      return res.json({
        token: sessionToken,
        user: { name: 'Store Owner', role: 'administrator', email: 'owner@littlenest.pk' }
      });
    }
    return res.status(401).json({ error: 'Invalid admin password' });
  });

  app.post('/api/auth/verify', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && (authHeader.includes('admin_session_') || authHeader.includes(ADMIN_SECRET_KEY))) {
      return res.json({ valid: true, user: { name: 'Store Owner', role: 'administrator' } });
    }
    return res.status(401).json({ valid: false });
  });

  app.post('/api/auth/change-password', requireAdmin, async (req: Request, res: Response) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    ADMIN_PASSWORD = newPassword;
    return res.json({ success: true, message: 'Admin password updated successfully' });
  });

  // --- PRODUCT IMAGE UPLOAD (Supabase Storage) ---
  app.post('/api/uploads/product-image', requireAdmin, async (req: Request, res: Response) => {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return res.status(503).json({ error: 'Image storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to Vercel environment variables.' });
    }
    const { dataUrl, contentType, fileName } = req.body || {};
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
      return res.status(400).json({ error: 'Choose an image file to upload.' });
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(contentType)) {
      return res.status(400).json({ error: 'Only JPG, PNG, and WebP images are supported.' });
    }
    const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match || match[1] !== contentType) {
      return res.status(400).json({ error: 'The selected image could not be read. Please try another file.' });
    }
    const imageBuffer = Buffer.from(match[2], 'base64');
    if (imageBuffer.length > 4 * 1024 * 1024) {
      return res.status(413).json({ error: 'Image is too large after processing. Please choose a smaller image (maximum 4 MB).' });
    }
    const bucket = 'littlenest-product-images';
    const storageHeaders = {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: 'Bearer ' + SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json'
    };
    const baseUrl = SUPABASE_URL.replace(/\/$/, '');
    const bucketResponse = await fetch(baseUrl + '/storage/v1/bucket', {
      method: 'GET', headers: storageHeaders, signal: AbortSignal.timeout(10000)
    });
    if (!bucketResponse.ok) {
      return res.status(502).json({ error: 'Could not check image storage. Verify the Supabase service role key.' });
    }
    const buckets = await bucketResponse.json() as Array<{ name: string }>;
    if (!buckets.some((item) => item.name === bucket)) {
      const createResponse = await fetch(baseUrl + '/storage/v1/bucket', {
        method: 'POST', headers: storageHeaders,
        body: JSON.stringify({ name: bucket, public: true, fileSizeLimit: 4194304, allowedMimeTypes: allowedTypes }),
        signal: AbortSignal.timeout(10000)
      });
      if (!createResponse.ok && createResponse.status !== 409) {
        const detail = await createResponse.text();
        console.error('Could not create product image bucket:', detail);
        return res.status(502).json({ error: 'Could not create image storage in Supabase. Check your Supabase project permissions.' });
      }
    }
    const safeName = (typeof fileName === 'string' ? fileName : 'product-image')
      .replace(/[^a-zA-Z0-9._-]/g, '-').slice(-80) || 'product-image';
    const stem = safeName.replace(/\.[^.]+$/, '');
    const objectPath = Date.now() + '-' + Math.random().toString(36).slice(2, 9) + '-' + stem + '.webp';
    const uploadResponse = await fetch(baseUrl + '/storage/v1/object/' + bucket + '/' + objectPath, {
      method: 'POST',
      headers: { ...storageHeaders, 'Content-Type': contentType, 'x-upsert': 'false' },
      body: imageBuffer, signal: AbortSignal.timeout(20000)
    });
    if (!uploadResponse.ok) {
      const detail = await uploadResponse.text();
      console.error('Product image upload failed:', detail);
      return res.status(502).json({ error: 'Image upload failed. Check that Supabase Storage is enabled and the service role key has permission.' });
    }
    const url = baseUrl + '/storage/v1/object/public/' + bucket + '/' + objectPath;
    return res.status(201).json({ url, path: objectPath });
  });
  // --- PRODUCTS ENDPOINTS ---
  app.get('/api/products', async (req: Request, res: Response) => {
    const db = await getDatabase();
    let products = [...(db.products || [])];
    const { category, collection, search, status, sort } = req.query;

    if (status) {
      products = products.filter(p => p.status === status);
    } else {
      // default: only published for public
      products = products.filter(p => p.status === 'published');
    }

    if (category) {
      products = products.filter(p => p.category === category);
    }

    if (collection) {
      if (collection === 'new-arrivals') products = products.filter(p => p.isNewArrival);
      else if (collection === 'best-sellers') products = products.filter(p => p.isBestSeller);
      else if (collection === 'essentials') products = products.filter(p => p.isNewbornEssential);
      else if (collection === 'baby-girl') products = products.filter(p => p.genderCollection === 'baby-girl' || p.genderCollection === 'unisex');
      else if (collection === 'baby-boy') products = products.filter(p => p.genderCollection === 'baby-boy' || p.genderCollection === 'unisex');
      else if (collection === 'unisex') products = products.filter(p => p.genderCollection === 'unisex');
      else if (collection === 'gift-sets') products = products.filter(p => p.category === 'newborn-gift-sets');
    }

    if (search) {
      const q = String(search).toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.shortDescription.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    if (sort === 'price-low') {
      products.sort((a, b) => (a.salePrice || a.regularPrice) - (b.salePrice || b.regularPrice));
    } else if (sort === 'price-high') {
      products.sort((a, b) => (b.salePrice || b.regularPrice) - (a.salePrice || a.regularPrice));
    } else if (sort === 'newest') {
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json(products);
  });

  app.get('/api/products/admin', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    res.json(db.products || []);
  });

  app.get('/api/products/:identifier', async (req: Request, res: Response) => {
    const db = await getDatabase();
    const { identifier } = req.params;
    const product = db.products.find((p: any) => p.id === identifier || p.slug === identifier);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });

  app.post('/api/products', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const newProduct = {
      id: `prod-${Date.now()}`,
      slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      currency: 'PKR',
      status: 'published',
      stockQuantity: 20,
      lowStockThreshold: 5,
      supplierStockStatus: 'in_stock',
      supplierLastChecked: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...req.body
    };

    db.products.unshift(newProduct);
    await saveDatabase(db);
    res.status(201).json(newProduct);
  });

  app.put('/api/products/:id', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const { id } = req.params;
    const index = db.products.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.products[index] = {
      ...db.products[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    await saveDatabase(db);
    res.json(db.products[index]);
  });

  app.delete('/api/products/:id', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const { id } = req.params;
    const index = db.products.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Safe archiving instead of destructive hard delete
    db.products[index].status = 'archived';
    db.products[index].updatedAt = new Date().toISOString();
    await saveDatabase(db);
    res.json({ message: 'Product archived successfully', product: db.products[index] });
  });

  app.post('/api/products/:id/duplicate', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const { id } = req.params;
    const product = db.products.find((p: any) => p.id === id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const duplicated = {
      ...product,
      id: `prod-${Date.now()}`,
      name: `${product.name} (Copy)`,
      slug: `${product.slug}-copy-${Date.now().toString().slice(-4)}`,
      sku: `${product.sku}-COPY`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.products.unshift(duplicated);
    await saveDatabase(db);
    res.status(201).json(duplicated);
  });

  // --- CATEGORIES ENDPOINTS ---
  app.get('/api/categories', async (req: Request, res: Response) => {
    const db = await getDatabase();
    res.json(db.categories || []);
  });

  app.post('/api/categories', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const newCategory = {
      id: `cat-${Date.now()}`,
      slug: req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      productCount: 0,
      ...req.body
    };
    db.categories.push(newCategory);
    await saveDatabase(db);
    res.status(201).json(newCategory);
  });

  // --- INVENTORY ENDPOINTS ---
  app.get('/api/inventory', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const items = (db.products || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.categoryName || p.category,
      stockQuantity: p.stockQuantity,
      lowStockThreshold: p.lowStockThreshold,
      supplierStockStatus: p.supplierStockStatus,
      supplierName: p.supplierName,
      supplierLastChecked: p.supplierLastChecked,
      status: p.status
    }));
    res.json(items);
  });

  app.post('/api/inventory/adjust', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const { productId, stockQuantity, lowStockThreshold, supplierStockStatus } = req.body;
    const product = db.products.find((p: any) => p.id === productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (typeof stockQuantity === 'number') product.stockQuantity = stockQuantity;
    if (typeof lowStockThreshold === 'number') product.lowStockThreshold = lowStockThreshold;
    if (supplierStockStatus) product.supplierStockStatus = supplierStockStatus;
    product.updatedAt = new Date().toISOString();

    await saveDatabase(db);
    res.json({ success: true, product });
  });

  // --- DISCOUNTS & COUPONS ENDPOINTS ---
  app.get('/api/discounts', async (req: Request, res: Response) => {
    const db = await getDatabase();
    res.json(db.coupons || []);
  });

  app.post('/api/discounts', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const newCoupon = {
      id: `coup-${Date.now()}`,
      code: req.body.code.trim().toUpperCase(),
      usageCount: 0,
      isActive: true,
      ...req.body
    };
    db.coupons.push(newCoupon);
    await saveDatabase(db);
    res.status(201).json(newCoupon);
  });

  app.put('/api/discounts/:id', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const { id } = req.params;
    const index = db.coupons.findIndex((c: any) => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Coupon not found' });

    db.coupons[index] = { ...db.coupons[index], ...req.body };
    await saveDatabase(db);
    res.json(db.coupons[index]);
  });

  app.delete('/api/discounts/:id', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const { id } = req.params;
    db.coupons = db.coupons.filter((c: any) => c.id !== id);
    await saveDatabase(db);
    res.json({ success: true });
  });

  // Validate coupon on the server
  app.post('/api/discounts/validate', async (req: Request, res: Response) => {
    const db = await getDatabase();
    const { code, cartSubtotal } = req.body;
    if (!code) return res.status(400).json({ valid: false, error: 'Coupon code required' });

    const coupon = db.coupons.find(
      (c: any) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
    );

    if (!coupon) {
      return res.status(404).json({ valid: false, error: 'Invalid or expired coupon code' });
    }

    if (coupon.minCartTotal && cartSubtotal < coupon.minCartTotal) {
      return res.status(400).json({
        valid: false,
        error: `Minimum order of Rs. ${coupon.minCartTotal.toLocaleString()} required for this coupon`
      });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ valid: false, error: 'This coupon usage limit has been reached' });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((cartSubtotal * coupon.value) / 100);
    } else if (coupon.discountType === 'fixed') {
      discountAmount = Math.min(coupon.value, cartSubtotal);
    }

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        value: coupon.value,
        freeShipping: coupon.freeShipping,
        discountAmount
      }
    });
  });

  // --- ORDERS ENDPOINTS ---
  app.get('/api/orders', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    let orders = [...(db.orders || [])];
    const { status, paymentMethod, paymentStatus, search } = req.query;

    if (status) orders = orders.filter(o => o.fulfillmentStatus === status);
    if (paymentMethod) orders = orders.filter(o => o.paymentMethod === paymentMethod);
    if (paymentStatus) orders = orders.filter(o => o.paymentStatus === paymentStatus);
    if (search) {
      const q = String(search).toLowerCase();
      orders = orders.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)
      );
    }

    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(orders);
  });

  app.get('/api/orders/:orderNumber', async (req: Request, res: Response) => {
    const db = await getDatabase();
    const { orderNumber } = req.params;
    const order = db.orders.find((o: any) => o.orderNumber === orderNumber || o.id === orderNumber);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  // Server-side order creation with strict price recalculation & atomic stock deduction
  app.post('/api/orders', async (req: Request, res: Response) => {
    const db = await getDatabase();
    const { customerAddress, items, couponCode, paymentMethod, paymentReference } = req.body;

    if (!customerAddress || !customerAddress.fullName || !customerAddress.phone || !customerAddress.streetAddress || !customerAddress.city) {
      return res.status(400).json({ error: 'Incomplete delivery address provided' });
    }

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Cart contains no items' });
    }

    // Verify payment method eligibility
    const paySettings = db.paymentSettings || {};
    if (paymentMethod === 'cod' && !paySettings.cod?.enabled) {
      return res.status(400).json({ error: 'Cash on delivery is currently disabled' });
    }
    if (paymentMethod === 'easypaisa' && !paySettings.easypaisa?.enabled) {
      return res.status(400).json({ error: 'Easypaisa payment is currently disabled' });
    }
    if (paymentMethod === 'jazzcash' && !paySettings.jazzcash?.enabled) {
      return res.status(400).json({ error: 'JazzCash payment is currently disabled' });
    }

    // Recalculate prices directly from server DB (never trust frontend price)
    let calculatedSubtotal = 0;
    const verifiedItems: any[] = [];

    for (const item of items) {
      const product = db.products.find((p: any) => p.id === item.productId);
      if (!product || product.status !== 'published') {
        return res.status(400).json({ error: `Product "${item.name || item.productId}" is no longer available` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${product.name}". Only ${product.stockQuantity} left.`
        });
      }

      const verifiedUnitPrice = product.salePrice || product.regularPrice;
      const verifiedTotalPrice = verifiedUnitPrice * item.quantity;
      calculatedSubtotal += verifiedTotalPrice;

      // Deduct stock atomically
      product.stockQuantity -= item.quantity;

      verifiedItems.push({
        productId: product.id,
        productName: product.name,
        variantColor: item.color || product.availableColors[0] || 'Standard',
        variantSize: item.size || product.availableSizes[0] || 'Newborn',
        quantity: item.quantity,
        unitPrice: verifiedUnitPrice,
        totalPrice: verifiedTotalPrice,
        image: item.image || product.images[0],
        supplierSku: product.supplierSku,
        supplierUrl: product.supplierProductUrl
      });
    }

    // Server-side discount calculation
    let calculatedDiscount = 0;
    let freeShippingFromCoupon = false;

    if (couponCode) {
      const coupon = db.coupons.find(
        (c: any) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.isActive
      );
      if (coupon && (!coupon.minCartTotal || calculatedSubtotal >= coupon.minCartTotal)) {
        if (coupon.discountType === 'percentage') {
          calculatedDiscount = Math.round((calculatedSubtotal * coupon.value) / 100);
        } else if (coupon.discountType === 'fixed') {
          calculatedDiscount = Math.min(coupon.value, calculatedSubtotal);
        }
        if (coupon.freeShipping) {
          freeShippingFromCoupon = true;
        }
        coupon.usageCount = (coupon.usageCount || 0) + 1;
      }
    }

    // Shipping fee calculation based on store settings
    const storeSettings = db.storeSettings || {};
    const freeShippingThreshold = storeSettings.freeShippingThreshold || 3500;
    const defaultShippingFee = storeSettings.defaultShippingFee || 250;

    let shippingFee = defaultShippingFee;
    if (freeShippingFromCoupon || calculatedSubtotal >= freeShippingThreshold) {
      shippingFee = 0;
    }

    // COD fee if configured
    let codFee = 0;
    if (paymentMethod === 'cod' && paySettings.cod?.fee) {
      codFee = paySettings.cod.fee;
      shippingFee += codFee;
    }

    const grandTotal = Math.max(0, calculatedSubtotal - calculatedDiscount + shippingFee);

    const orderNumber = `LN-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: customerAddress.fullName,
      email: customerAddress.email,
      phone: customerAddress.phone,
      deliveryAddress: customerAddress,
      items: verifiedItems,
      subtotal: calculatedSubtotal,
      discountAmount: calculatedDiscount,
      couponCode: couponCode || null,
      shippingFee,
      taxAmount: 0,
      total: grandTotal,
      currency: 'PKR',
      paymentMethod,
      paymentStatus: 'pending',
      paymentReference: paymentReference || null,
      fulfillmentStatus: 'pending_confirmation',
      courierName: null,
      trackingNumber: null,
      supplierOrderRef: null,
      orderNotes: customerAddress.orderNotes || '',
      internalNotes: '',
      auditLog: [
        {
          timestamp: now,
          actor: 'Customer Checkout',
          action: 'Order Placed',
          details: `Order placed via ${paymentMethod.toUpperCase()}. Total: Rs. ${grandTotal.toLocaleString()}`
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    db.orders.unshift(newOrder);

    // Save the order and its queued email records first. Email failures must never
    // roll back a valid customer order or deduct stock a second time.
    db.emailLogs = db.emailLogs || [];
    const customerEmailLog = {
      id: `em-${Date.now()}-customer`,
      recipient: customerAddress.email || '',
      subject: `Order Confirmed: ${orderNumber} — LittleNest`,
      templateId: 'order_confirmation_customer',
      orderNumber,
      status: 'queued',
      retryCount: 0,
      createdAt: now
    };
    const adminRecipient = process.env.ADMIN_EMAIL || storeSettings.contactEmail || '';
    const adminEmailLog = adminRecipient ? {
      id: `em-${Date.now()}-admin`,
      recipient: adminRecipient,
      subject: `New LittleNest Order: ${orderNumber} (Rs. ${grandTotal.toLocaleString()})`,
      templateId: 'new_order_admin',
      orderNumber,
      status: 'queued',
      retryCount: 0,
      createdAt: now
    } : null;
    db.emailLogs.unshift(customerEmailLog);
    if (adminEmailLog) db.emailLogs.unshift(adminEmailLog);

    await saveDatabase(db);

    // Send after persistence. Persist actual provider outcomes in the email log.
    await deliverOrderEmail(newOrder, customerEmailLog.recipient, 'customer', customerEmailLog);
    if (!customerEmailLog.recipient) {
      customerEmailLog.status = 'failed';
      customerEmailLog.errorMessage = 'Customer email address was not provided at checkout.';
    }
    if (adminEmailLog) {
      await deliverOrderEmail(newOrder, adminEmailLog.recipient, 'admin', adminEmailLog);
    }
    await saveDatabase(db);
    res.status(201).json({ ...newOrder, emailStatus: customerEmailLog.status });
  });

  app.put('/api/orders/:id/status', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const { id } = req.params;
    const {
      paymentStatus,
      fulfillmentStatus,
      courierName,
      trackingNumber,
      supplierOrderRef,
      internalNotes,
      actorName
    } = req.body;

    const order = db.orders.find((o: any) => o.id === id || o.orderNumber === id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const now = new Date().toISOString();
    const actor = actorName || 'Admin (Store Owner)';

    if (paymentStatus && paymentStatus !== order.paymentStatus) {
      order.auditLog.push({
        timestamp: now,
        actor,
        action: 'Payment Status Changed',
        details: `From ${order.paymentStatus} to ${paymentStatus}`
      });
      order.paymentStatus = paymentStatus;
    }

    if (fulfillmentStatus && fulfillmentStatus !== order.fulfillmentStatus) {
      order.auditLog.push({
        timestamp: now,
        actor,
        action: 'Fulfillment Status Changed',
        details: `From ${order.fulfillmentStatus} to ${fulfillmentStatus}`
      });
      order.fulfillmentStatus = fulfillmentStatus;

      // If marked shipped and tracking is attached, queue email
      if (fulfillmentStatus === 'shipped') {
        db.emailLogs.unshift({
          id: `em-${Date.now()}`,
          recipient: order.email,
          subject: `Your Little Nest parcel has shipped! (Tracking: ${trackingNumber || order.trackingNumber || 'Available'})`,
          templateId: 'shipping_confirmation',
          orderNumber: order.orderNumber,
          status: 'sent',
          sentAt: now,
          retryCount: 0,
          createdAt: now
        });
      }
    }

    if (courierName) order.courierName = courierName;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (supplierOrderRef) order.supplierOrderRef = supplierOrderRef;
    if (typeof internalNotes === 'string') order.internalNotes = internalNotes;

    order.updatedAt = now;
    await saveDatabase(db);
    res.json(order);
  });

  // Export orders to CSV
  app.get('/api/orders/export/csv', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const orders = db.orders || [];

    const headers = [
      'Order Number',
      'Date',
      'Customer',
      'Phone',
      'City',
      'Subtotal',
      'Discount',
      'Total',
      'Payment Method',
      'Payment Status',
      'Fulfillment Status',
      'Courier',
      'Tracking Number',
      'Supplier Ref'
    ];

    const rows = orders.map((o: any) => [
      `"${o.orderNumber}"`,
      `"${o.createdAt.slice(0, 10)}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.phone}"`,
      `"${(o.deliveryAddress?.city || '').replace(/"/g, '""')}"`,
      o.subtotal,
      o.discountAmount,
      o.total,
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus}"`,
      `"${o.fulfillmentStatus}"`,
      `"${o.courierName || ''}"`,
      `"${o.trackingNumber || ''}"`,
      `"${o.supplierOrderRef || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="little_nest_orders.csv"');
    res.send(csvContent);
  });

  // --- PAYMENT SETTINGS ENDPOINTS ---
  app.get('/api/payment-settings', async (req: Request, res: Response) => {
    const db = await getDatabase();
    // Return safe public payment settings without secret keys
    const ps = db.paymentSettings || {};
    res.json({
      cod: {
        enabled: ps.cod?.enabled ?? true,
        fee: ps.cod?.fee ?? 0,
        minOrder: ps.cod?.minOrder ?? 500,
        maxOrder: ps.cod?.maxOrder ?? 35000,
        instructions: ps.cod?.instructions ?? ''
      },
      easypaisa: {
        enabled: ps.easypaisa?.enabled ?? true,
        accountTitle: ps.easypaisa?.accountTitle ?? '',
        accountNumber: ps.easypaisa?.accountNumber ?? '',
        instructions: ps.easypaisa?.instructions ?? ''
      },
      jazzcash: {
        enabled: ps.jazzcash?.enabled ?? true,
        accountTitle: ps.jazzcash?.accountTitle ?? '',
        accountNumber: ps.jazzcash?.accountNumber ?? '',
        instructions: ps.jazzcash?.instructions ?? ''
      }
    });
  });

  app.get('/api/payment-settings/admin', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    res.json(db.paymentSettings || {});
  });

  app.put('/api/payment-settings', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    db.paymentSettings = {
      ...db.paymentSettings,
      ...req.body
    };
    await saveDatabase(db);
    res.json(db.paymentSettings);
  });

  // --- ANNOUNCEMENT BAR ENDPOINTS ---
  app.get('/api/announcements', async (req: Request, res: Response) => {
    const db = await getDatabase();
    res.json(db.announcementSettings || { enabled: false, messages: [] });
  });

  app.put('/api/announcements', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    db.announcementSettings = {
      ...db.announcementSettings,
      ...req.body
    };
    await saveDatabase(db);
    res.json(db.announcementSettings);
  });

  // --- POPUP CAMPAIGNS ENDPOINTS ---
  app.get('/api/popups/active', async (req: Request, res: Response) => {
    const db = await getDatabase();
    const campaigns = db.popupCampaigns || [];
    // Find active published campaign
    const active = campaigns.find((c: any) => c.status === 'published');
    res.json(active || null);
  });

  app.get('/api/popups', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    res.json(db.popupCampaigns || []);
  });

  app.post('/api/popups', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const newPopup = {
      id: `pop-${Date.now()}`,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...req.body
    };
    db.popupCampaigns.push(newPopup);
    await saveDatabase(db);
    res.status(201).json(newPopup);
  });

  app.put('/api/popups/:id', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const { id } = req.params;
    const index = db.popupCampaigns.findIndex((p: any) => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Popup not found' });

    db.popupCampaigns[index] = {
      ...db.popupCampaigns[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    await saveDatabase(db);
    res.json(db.popupCampaigns[index]);
  });

  app.delete('/api/popups/:id', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const { id } = req.params;
    db.popupCampaigns = db.popupCampaigns.filter((p: any) => p.id !== id);
    await saveDatabase(db);
    res.json({ success: true });
  });

  app.post('/api/popups/:id/event', async (req: Request, res: Response) => {
    const db = await getDatabase();
    const { id } = req.params;
    const { eventType } = req.body; // 'impression' | 'click' | 'conversion'
    const popup = db.popupCampaigns.find((p: any) => p.id === id);
    if (popup) {
      if (eventType === 'impression') popup.impressions = (popup.impressions || 0) + 1;
      else if (eventType === 'click') popup.clicks = (popup.clicks || 0) + 1;
      else if (eventType === 'conversion') popup.conversions = (popup.conversions || 0) + 1;
      await saveDatabase(db);
    }
    res.json({ success: true });
  });

  // --- STORE SETTINGS ENDPOINTS ---
  app.get('/api/store-settings', async (req: Request, res: Response) => {
    const db = await getDatabase();
    res.json(db.storeSettings || {});
  });

  app.put('/api/store-settings', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    db.storeSettings = {
      ...db.storeSettings,
      ...req.body
    };
    await saveDatabase(db);
    res.json(db.storeSettings);
  });

  // --- SUPPLIERS & DROPSHIPPING ENDPOINTS ---
  app.get('/api/suppliers', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    res.json(db.suppliers || []);
  });

  app.post('/api/suppliers', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const newSupplier = {
      id: `sup-${Date.now()}`,
      lastChecked: new Date().toISOString(),
      ...req.body
    };
    db.suppliers.push(newSupplier);
    await saveDatabase(db);
    res.status(201).json(newSupplier);
  });

  app.put('/api/suppliers/:id', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const { id } = req.params;
    const index = db.suppliers.findIndex((s: any) => s.id === id);
    if (index === -1) return res.status(404).json({ error: 'Supplier link not found' });

    db.suppliers[index] = {
      ...db.suppliers[index],
      ...req.body,
      lastChecked: new Date().toISOString()
    };
    await saveDatabase(db);
    res.json(db.suppliers[index]);
  });

  // --- EMAIL MANAGEMENT ENDPOINTS ---
  app.get('/api/emails/templates', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    res.json(db.emailTemplates || []);
  });

  app.put('/api/emails/templates/:id', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const { id } = req.params;
    const index = db.emailTemplates.findIndex((t: any) => t.id === id);
    if (index === -1) return res.status(404).json({ error: 'Template not found' });

    db.emailTemplates[index] = { ...db.emailTemplates[index], ...req.body };
    await saveDatabase(db);
    res.json(db.emailTemplates[index]);
  });

  app.get('/api/emails/logs', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    res.json(db.emailLogs || []);
  });

  app.post('/api/emails/retry/:id', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const { id } = req.params;
    const log = (db.emailLogs || []).find((l: any) => l.id === id);
    if (!log) return res.status(404).json({ error: 'Email log not found' });
    if (log.status === 'sent') return res.status(409).json({ error: 'This email is already marked as sent.' });

    const order = (db.orders || []).find((o: any) => o.orderNumber === log.orderNumber);
    if (!order) return res.status(404).json({ error: 'The order for this email log could not be found.' });
    const kind = log.templateId === 'new_order_admin' ? 'admin' : 'customer';
    log.retryCount = (log.retryCount || 0) + 1;
    log.status = 'queued';
    log.errorMessage = null;
    await saveDatabase(db);

    await deliverOrderEmail(order, log.recipient, kind, log, log.retryCount);
    await saveDatabase(db);
    return res.json({ success: log.status === 'sent', log });
  });

  app.post('/api/emails/test', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const recipient = String(req.body?.recipient || process.env.ADMIN_EMAIL || '').trim();
    const now = new Date().toISOString();
    const testLog: any = {
      id: `em-test-${Date.now()}`,
      recipient,
      subject: '[LittleNest] Resend connection test',
      templateId: req.body?.templateId || 'resend_test',
      status: 'queued',
      retryCount: 0,
      createdAt: now
    };
    db.emailLogs = db.emailLogs || [];
    db.emailLogs.unshift(testLog);
    await saveDatabase(db);
    try {
      const result = await sendResendEmail({
        to: recipient,
        subject: testLog.subject,
        html: '<div style="font-family:Arial,sans-serif"><h2>LittleNest email test</h2><p>Your Resend connection is working.</p></div>',
        text: 'LittleNest email test. Your Resend connection is working.',
        idempotencyKey: `littlenest/test/${testLog.id}`
      });
      testLog.status = 'sent';
      testLog.provider = 'resend';
      testLog.providerMessageId = result.id || null;
      testLog.sentAt = new Date().toISOString();
      testLog.errorMessage = null;
      await saveDatabase(db);
      return res.json({ success: true, message: `Test email submitted to Resend for ${recipient}`, log: testLog });
    } catch (error: any) {
      testLog.status = 'failed';
      testLog.provider = 'resend';
      testLog.errorMessage = String(error?.message || 'Email delivery failed').slice(0, 500);
      testLog.failedAt = new Date().toISOString();
      await saveDatabase(db);
      return res.status(502).json({ success: false, message: 'Resend could not send the test email.', error: testLog.errorMessage, log: testLog });
    }
  });

  // --- DASHBOARD OVERVIEW METRICS ---
  app.get('/api/overview', requireAdmin, async (req: Request, res: Response) => {
    const db = await getDatabase();
    const orders = db.orders || [];
    const products = db.products || [];

    const todayStr = new Date().toISOString().slice(0, 10);

    let grossSales = 0;
    let discountsGranted = 0;
    let refundTotals = 0;
    let ordersToday = 0;
    let pendingCodPayments = 0;
    let paymentsAwaitingVerification = 0;
    let ordersAwaitingFulfillment = 0;
    let shippedOrders = 0;
    let deliveredOrders = 0;

    for (const o of orders) {
      grossSales += o.subtotal || 0;
      discountsGranted += o.discountAmount || 0;
      if (o.paymentStatus === 'refunded') {
        refundTotals += o.total || 0;
      }
      if (o.createdAt.slice(0, 10) === todayStr) {
        ordersToday++;
      }
      if (o.paymentMethod === 'cod' && o.paymentStatus === 'pending') {
        pendingCodPayments += o.total || 0;
      }
      if ((o.paymentMethod === 'easypaisa' || o.paymentMethod === 'jazzcash') && o.paymentStatus === 'pending') {
        paymentsAwaitingVerification++;
      }
      if (o.fulfillmentStatus === 'pending_confirmation' || o.fulfillmentStatus === 'confirmed' || o.fulfillmentStatus === 'processing') {
        ordersAwaitingFulfillment++;
      }
      if (o.fulfillmentStatus === 'shipped') {
        shippedOrders++;
      }
      if (o.fulfillmentStatus === 'delivered') {
        deliveredOrders++;
      }
    }

    const netSales = grossSales - discountsGranted - refundTotals;

    let activeProducts = 0;
    let outOfStockProducts = 0;
    let lowStockWarnings = 0;

    for (const p of products) {
      if (p.status === 'published') activeProducts++;
      if (p.stockQuantity <= 0) outOfStockProducts++;
      else if (p.stockQuantity <= (p.lowStockThreshold || 5)) lowStockWarnings++;
    }

    res.json({
      totalOrders: orders.length,
      ordersToday,
      grossSales,
      discountsGranted,
      refundTotals,
      netSales,
      pendingCodPayments,
      paymentsAwaitingVerification,
      ordersAwaitingFulfillment,
      shippedOrders,
      deliveredOrders,
      activeProducts,
      outOfStockProducts,
      lowStockWarnings,
      recentOrders: orders.slice(0, 5)
    });
  });

  // --- SUPABASE SQL SCHEMA DOWNLOAD ---
  app.get('/api/database/export-sql', requireAdmin, async (req: Request, res: Response) => {
    const migrationFile = path.join(__dirname, 'supabase', 'migrations', '20261028_init_ecommerce.sql');
    if (fs.existsSync(migrationFile)) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="supabase_little_nest_schema.sql"');
      return res.sendFile(migrationFile);
    }
    return res.status(404).send('-- Migration file not found');
  });

  // Setup Vite dev server or production static serving
  if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  // Keep this after the routes so rejected async handlers reach it.
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('LittleNest API request failed:', err?.message || err);