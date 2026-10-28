export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  productCount?: number;
}

export interface ProductVariant {
  id: string;
  color: string;
  size: string;
  sku: string;
  stock: number;
  available: boolean;
  supplierVariantId?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: string; // slug e.g. "sleepsuits-and-rompers"
  categoryName: string;
  regularPrice: number;
  salePrice?: number;
  costPrice: number;
  currency: string; // "PKR"
  sku: string;
  supplierName: string; // "AliExpress Direct Newborn"
  supplierProductUrl: string;
  supplierSku: string;
  materialDetails: string;
  washingInstructions: string;
  sizeGuide: string;
  availableColors: string[];
  availableSizes: string[];
  images: string[];
  weightGrams: number;
  status: 'published' | 'draft' | 'archived';
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isNewbornEssential: boolean;
  genderCollection: 'baby-girl' | 'baby-boy' | 'unisex';
  stockQuantity: number;
  lowStockThreshold: number;
  supplierStockStatus: 'in_stock' | 'low' | 'out_of_stock';
  supplierLastChecked: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string; // unique item key: productId-color-size
  productId: string;
  name: string;
  slug: string;
  price: number;
  regularPrice: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
  maxStock: number;
  sku: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  value: number; // e.g. 10 for 10% or 500 for Rs. 500
  minCartTotal: number;
  freeShipping: boolean;
  usageLimit?: number;
  usageCount: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export interface CustomerAddress {
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode?: string;
  orderNotes?: string;
}

export type PaymentMethod = 'cod' | 'easypaisa' | 'jazzcash';
export type PaymentStatus = 'pending' | 'verified' | 'failed' | 'refunded';
export type FulfillmentStatus = 
  | 'pending_confirmation'
  | 'confirmed'
  | 'processing'
  | 'supplier_ordered'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItemSnapshot {
  productId: string;
  productName: string;
  variantColor: string;
  variantSize: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image: string;
  supplierSku?: string;
  supplierUrl?: string;
}

export interface OrderAuditEntry {
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  deliveryAddress: CustomerAddress;
  items: OrderItemSnapshot[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingFee: number;
  taxAmount: number;
  total: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string; // TRX ID for JazzCash or Easypaisa
  fulfillmentStatus: FulfillmentStatus;
  courierName?: string;
  trackingNumber?: string;
  supplierOrderRef?: string;
  orderNotes?: string;
  internalNotes?: string;
  auditLog: OrderAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CodSettings {
  enabled: boolean;
  fee: number;
  minOrder: number;
  maxOrder: number;
  instructions: string;
  confirmationRequired: boolean;
}

export interface ManualPaymentMethodSettings {
  enabled: boolean;
  accountTitle: string;
  accountNumber: string;
  bankOrBranch?: string;
  instructions: string;
  testMode: boolean;
  requiresTrxId: boolean;
}

export interface PaymentSettings {
  cod: CodSettings;
  easypaisa: ManualPaymentMethodSettings;
  jazzcash: ManualPaymentMethodSettings;
}

export interface AnnouncementMessage {
  id: string;
  text: string;
  link?: string;
  active: boolean;
}

export interface AnnouncementSettings {
  enabled: boolean;
  messages: AnnouncementMessage[];
  backgroundColor: string;
  textColor: string;
  rotationEnabled: boolean;
  rotationIntervalSeconds: number;
}

export type PopupType = 'welcome' | 'promotional' | 'coupon' | 'newsletter' | 'general';
export type PopupLayout = 'centered_modal' | 'image_text' | 'compact';
export type PopupDisplayFrequency = 'once_per_session' | 'once_per_day' | 'every_visit';

export interface PopupCampaign {
  id: string;
  name: string;
  type: PopupType;
  headline: string;
  description: string;
  couponCode?: string;
  buttonText: string;
  buttonLink: string;
  imageUrl?: string;
  backgroundColor: string;
  textColor: string;
  buttonStyle: 'solid_brown' | 'blush_pink' | 'sage_green' | 'white_outline';
  layout: PopupLayout;
  delaySeconds: number;
  displayFrequency: PopupDisplayFrequency;
  targetPages: 'all' | 'homepage' | 'products' | 'collections';
  deviceTarget: 'all' | 'desktop' | 'mobile';
  startDate?: string;
  endDate?: string;
  status: 'published' | 'draft' | 'paused' | 'archived';
  impressions: number;
  clicks: number;
  conversions: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  contactEmail: string;
  supportPhone: string;
  currency: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  defaultShippingFee: number;
  provinces: string[];
  heroHeadline: string;
  heroDescription: string;
  heroImage: string;
  heroButtonPrimary: string;
  heroButtonSecondary: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    whatsapp: string;
  };
  returnPolicyContent: string;
  shippingPolicyContent: string;
  aboutUsContent: string;
}

export interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  templateId: string;
  orderNumber?: string;
  status: 'sent' | 'failed' | 'queued';
  errorMessage?: string;
  payload?: any;
  retryCount: number;
  sentAt?: string;
  createdAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
  bodyHtml: string;
  variables: string[];
}

export interface SupplierProduct {
  id: string;
  productId: string;
  supplierName: string;
  supplierStoreUrl: string;
  supplierProductUrl: string;
  supplierSku: string;
  supplierCost: number;
  ourSellingPrice: number;
  marginPercent: number;
  shippingMethod: string;
  estimatedDeliveryDays: string;
  stockStatus: 'in_stock' | 'low' | 'out_of_stock';
  lastChecked: string;
}

export interface DashboardMetrics {
  totalOrders: number;
  ordersToday: number;
  grossSales: number;
  discountsGranted: number;
  refundTotals: number;
  netSales: number;
  pendingCodPayments: number;
  paymentsAwaitingVerification: number;
  ordersAwaitingFulfillment: number;
  shippedOrders: number;
  deliveredOrders: number;
  activeProducts: number;
  outOfStockProducts: number;
  lowStockWarnings: number;
}
