import { 
  Product, 
  Category, 
  Coupon, 
  Order, 
  PaymentSettings, 
  AnnouncementSettings, 
  PopupCampaign, 
  StoreSettings, 
  SupplierProduct, 
  EmailLog, 
  EmailTemplate, 
  DashboardMetrics 
} from '../types';
import publicCatalog from '../data/catalog.json';

// Static catalog fallback for deployments where the Express API is not hosted.
const catalog = publicCatalog as unknown as { products: Product[]; categories: Category[] };

const getLocalProducts = (params?: { category?: string; collection?: string; search?: string; sort?: string }): Product[] => {
  let products = [...(catalog.products || [])].filter((product) => product.status === 'published');
  if (params?.category) products = products.filter((product) => product.category === params.category);
  if (params?.collection === 'new-arrivals') products = products.filter((product) => product.isNewArrival);
  else if (params?.collection === 'best-sellers') products = products.filter((product) => product.isBestSeller);
  else if (params?.collection === 'essentials') products = products.filter((product) => product.isNewbornEssential);
  else if (params?.collection === 'baby-girl') products = products.filter((product) => product.genderCollection === 'baby-girl' || product.genderCollection === 'unisex');
  else if (params?.collection === 'baby-boy') products = products.filter((product) => product.genderCollection === 'baby-boy' || product.genderCollection === 'unisex');
  else if (params?.collection === 'unisex') products = products.filter((product) => product.genderCollection === 'unisex');
  else if (params?.collection === 'gift-sets') products = products.filter((product) => product.category === 'newborn-gift-sets');
  if (params?.search) {
    const term = params.search.toLowerCase();
    products = products.filter((product) => product.name.toLowerCase().includes(term) || product.shortDescription.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term));
  }
  if (params?.sort === 'price-low') products.sort((a, b) => (a.salePrice || a.regularPrice) - (b.salePrice || b.regularPrice));
  else if (params?.sort === 'price-high') products.sort((a, b) => (b.salePrice || b.regularPrice) - (a.salePrice || a.regularPrice));
  else products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return products;
};

const ADMIN_TOKEN_KEY = 'ln_admin_token';

// The production API can be temporarily unavailable while the database is being repaired.
// Abort product requests quickly so the bundled catalogue appears immediately instead of waiting for Vercel's 30s timeout.
const PRODUCT_REQUEST_TIMEOUT_MS = 4000;

export const getAdminToken = (): string | null => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminToken = (token: string) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const clearAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

const getHeaders = (isAdmin = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (isAdmin) {
    const token = getAdminToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const api = {
  // Auth
  loginAdmin: async (password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    setAdminToken(data.token);
    return data;
  },

  verifyAdmin: async () => {
    const token = getAdminToken();
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: getHeaders(true),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Upload a product image to permanent Supabase Storage through the authenticated API.
  uploadProductImage: async (dataUrl: string, contentType: string, fileName: string) => {
    const res = await fetch('/api/uploads/product-image', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ dataUrl, contentType, fileName }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to upload product image');
    return data as { url: string; path: string };
  },

  // Products
  getProducts: async (params?: { category?: string; collection?: string; search?: string; sort?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.collection) query.append('collection', params.collection);
    if (params?.search) query.append('search', params.search);
    if (params?.sort) query.append('sort', params.sort);

    try {
      const res = await fetch(`/api/products?${query.toString()}`, { signal: AbortSignal.timeout(PRODUCT_REQUEST_TIMEOUT_MS) });
      if (!res.ok) throw new Error('Products API unavailable');
      return await res.json() as Product[];
    } catch (error) {
      console.warn('Products API unavailable; loading the bundled catalog instead.', error);
      return getLocalProducts(params);
    }
  },

  getAdminProducts: async () => {
    const res = await fetch('/api/products/admin', { headers: getHeaders(true) });
    if (!res.ok) throw new Error('Failed to load admin products');
    return res.json() as Promise<Product[]>;
  },

  getProduct: async (identifier: string) => {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(identifier)}`, { signal: AbortSignal.timeout(PRODUCT_REQUEST_TIMEOUT_MS) });
      if (!res.ok) throw new Error('Product API unavailable');
      return await res.json() as Product;
    } catch (error) {
      const product = (catalog.products || []).find((item) => item.id === identifier || item.slug === identifier);
      if (!product) throw new Error('Product not found');
      console.warn('Product API unavailable; loading the bundled product instead.', error);
      return product;
    }
  },

  createProduct: async (productData: Partial<Product>) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json() as Promise<Product>;
  },

  updateProduct: async (id: string, productData: Partial<Product>) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json() as Promise<Product>;
  },

  archiveProduct: async (id: string) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!res.ok) throw new Error('Failed to archive product');
    return res.json();
  },

  duplicateProduct: async (id: string) => {
    const res = await fetch(`/api/products/${id}/duplicate`, {
      method: 'POST',
      headers: getHeaders(true),
    });
    if (!res.ok) throw new Error('Failed to duplicate product');
    return res.json() as Promise<Product>;
  },

  // Categories
  getCategories: async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Categories API unavailable');
      return await res.json() as Category[];
    } catch (error) {
      console.warn('Categories API unavailable; loading bundled categories instead.', error);
      return catalog.categories || [];
    }
  },

  createCategory: async (categoryData: Partial<Category>) => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(categoryData),
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json() as Promise<Category>;
  },

  // Inventory
  getInventory: async () => {
    const res = await fetch('/api/inventory', { headers: getHeaders(true) });
    if (!res.ok) throw new Error('Failed to load inventory');
    return res.json();
  },

  adjustInventory: async (data: { productId: string; stockQuantity?: number; lowStockThreshold?: number; supplierStockStatus?: string }) => {
    const res = await fetch('/api/inventory/adjust', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to adjust inventory');
    return res.json();
  },

  // Discounts
  getDiscounts: async () => {
    const res = await fetch('/api/discounts');
    if (!res.ok) throw new Error('Failed to load discounts');
    return res.json() as Promise<Coupon[]>;
  },

  validateCoupon: async (code: string, cartSubtotal: number) => {
    const res = await fetch('/api/discounts/validate', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code, cartSubtotal }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid coupon');
    return data;
  },

  createCoupon: async (couponData: Partial<Coupon>) => {
    const res = await fetch('/api/discounts', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(couponData),
    });
    if (!res.ok) throw new Error('Failed to create coupon');
    return res.json() as Promise<Coupon>;
  },

  updateCoupon: async (id: string, couponData: Partial<Coupon>) => {
    const res = await fetch(`/api/discounts/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(couponData),
    });
    if (!res.ok) throw new Error('Failed to update coupon');
    return res.json() as Promise<Coupon>;
  },

  deleteCoupon: async (id: string) => {
    const res = await fetch(`/api/discounts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!res.ok) throw new Error('Failed to delete coupon');
    return res.json();
  },

  // Orders
  createOrder: async (payload: {
    customerAddress: any;
    items: any[];
    couponCode?: string;
    paymentMethod: string;
    paymentReference?: string;
  }) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to place order');
    return data as Order;
  },

  getOrders: async (params?: { status?: string; paymentMethod?: string; paymentStatus?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.paymentMethod) query.append('paymentMethod', params.paymentMethod);
    if (params?.paymentStatus) query.append('paymentStatus', params.paymentStatus);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`/api/orders?${query.toString()}`, { headers: getHeaders(true) });
    if (!res.ok) throw new Error('Failed to load orders');
    return res.json() as Promise<Order[]>;
  },

  getOrder: async (orderNumber: string) => {
    const res = await fetch(`/api/orders/${orderNumber}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json() as Promise<Order>;
  },

  updateOrderStatus: async (id: string, statusData: any) => {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(statusData),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json() as Promise<Order>;
  },

  // Payment Settings
  getPaymentSettings: async () => {
    const res = await fetch('/api/payment-settings');
    if (!res.ok) throw new Error('Failed to load payment settings');
    return res.json() as Promise<PaymentSettings>;
  },

  getAdminPaymentSettings: async () => {
    const res = await fetch('/api/payment-settings/admin', { headers: getHeaders(true) });
    if (!res.ok) throw new Error('Failed to load admin payment settings');
    return res.json() as Promise<PaymentSettings>;
  },

  updatePaymentSettings: async (settings: Partial<PaymentSettings>) => {
    const res = await fetch('/api/payment-settings', {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update payment settings');
    return res.json() as Promise<PaymentSettings>;
  },

  // Announcements
  getAnnouncements: async () => {
    const res = await fetch('/api/announcements');
    if (!res.ok) throw new Error('Failed to load announcements');
    return res.json() as Promise<AnnouncementSettings>;
  },

  updateAnnouncements: async (settings: Partial<AnnouncementSettings>) => {
    const res = await fetch('/api/announcements', {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update announcements');
    return res.json() as Promise<AnnouncementSettings>;
  },

  // Popups
  getActivePopup: async () => {
    const res = await fetch('/api/popups/active');
    if (!res.ok) return null;
    return res.json() as Promise<PopupCampaign | null>;
  },

  getAllPopups: async () => {
    const res = await fetch('/api/popups', { headers: getHeaders(true) });
    if (!res.ok) throw new Error('Failed to load popups');
    return res.json() as Promise<PopupCampaign[]>;
  },

  createPopup: async (data: Partial<PopupCampaign>) => {
    const res = await fetch('/api/popups', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create popup');
    return res.json() as Promise<PopupCampaign>;
  },

  updatePopup: async (id: string, data: Partial<PopupCampaign>) => {
    const res = await fetch(`/api/popups/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update popup');
    return res.json() as Promise<PopupCampaign>;
  },

  deletePopup: async (id: string) => {
    const res = await fetch(`/api/popups/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!res.ok) throw new Error('Failed to delete popup');
    return res.json();
  },

  recordPopupEvent: async (id: string, eventType: 'impression' | 'click' | 'conversion') => {
    try {
      await fetch(`/api/popups/${id}/event`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ eventType }),
      });
    } catch {
      // silent fail for telemetry
    }
  },

  // Store Settings
  getStoreSettings: async () => {
    const res = await fetch('/api/store-settings');
    if (!res.ok) throw new Error('Failed to load store settings');
    return res.json() as Promise<StoreSettings>;
  },

  updateStoreSettings: async (settings: Partial<StoreSettings>) => {
    const res = await fetch('/api/store-settings', {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update store settings');
    return res.json() as Promise<StoreSettings>;
  },

  // Suppliers
  getSuppliers: async () => {
    const res = await fetch('/api/suppliers', { headers: getHeaders(true) });
    if (!res.ok) throw new Error('Failed to load suppliers');
    return res.json() as Promise<SupplierProduct[]>;
  },

  updateSupplier: async (id: string, data: Partial<SupplierProduct>) => {
    const res = await fetch(`/api/suppliers/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update supplier');
    return res.json() as Promise<SupplierProduct>;
  },

  // Emails
  getEmailTemplates: async () => {
    const res = await fetch('/api/emails/templates', { headers: getHeaders(true) });
    if (!res.ok) throw new Error('Failed to load email templates');
    return res.json() as Promise<EmailTemplate[]>;
  },

  getEmailLogs: async () => {
    const res = await fetch('/api/emails/logs', { headers: getHeaders(true) });
    if (!res.ok) throw new Error('Failed to load email logs');
    return res.json() as Promise<EmailLog[]>;
  },

  retryEmail: async (id: string) => {
    const res = await fetch(`/api/emails/retry/${id}`, {
      method: 'POST',
      headers: getHeaders(true),
    });
    if (!res.ok) throw new Error('Failed to retry email delivery');
    return res.json();
  },

  sendTestEmail: async (recipient: string, templateId: string) => {
    const res = await fetch('/api/emails/test', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ recipient, templateId }),
    });
    if (!res.ok) throw new Error('Failed to send test email');
    return res.json();
  },

  // Dashboard Metrics
  getDashboardMetrics: async () => {
    const res = await fetch('/api/overview', { headers: getHeaders(true) });
    if (!res.ok) throw new Error('Failed to load dashboard metrics');
    return res.json() as Promise<DashboardMetrics & { recentOrders: Order[] }>;
  },
};
