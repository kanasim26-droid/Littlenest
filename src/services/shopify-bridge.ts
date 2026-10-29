import { api } from './api';
import type { Product } from '../types';

/**
 * Optional Shopify Storefront API bridge.
 * Shopify's Storefront access token is designed for storefront/browser use.
 * Do not put Admin API access tokens or client secrets in VITE_ variables.
 */
const shopDomain = (import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '').trim().replace(/^https?:\\/\\//, '').replace(/\\/$/, '');
const storefrontToken = (import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '').trim();
const enabled = Boolean(shopDomain && storefrontToken);

type ShopifyMoney = { amount: string; currencyCode: string };
type ShopifyVariant = {
  id: string;
  title: string;
  sku?: string | null;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  price: ShopifyMoney;
  compareAtPrice?: ShopifyMoney | null;
  selectedOptions: Array<{ name: string; value: string }>;
};
type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType?: string;
  tags: string[];
  featuredImage?: { url: string; altText?: string | null } | null;
  images: { nodes: Array<{ url: string; altText?: string | null }> };
  variants: { nodes: ShopifyVariant[] };
};
type ShopifyConnection<T> = { nodes: T[]; pageInfo?: { hasNextPage: boolean; endCursor?: string | null } };

const variantCache = new Map<string, ShopifyVariant[]>();
const productCache = new Map<string, Product>();

const endpoint = shopDomain ? `https://${shopDomain}/api/2026-07/graphql.json` : '';

async function storefrontQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  if (!enabled) throw new Error('Shopify Storefront API is not configured.');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new Error(`Shopify Storefront API request failed (${response.status}).`);
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(payload.errors.map((error: { message: string }) => error.message).join('; '));
  return payload.data as T;
}

const PRODUCT_FIELDS = `
  id handle title description productType tags
  featuredImage { url altText }
  images(first: 10) { nodes { url altText } }
  variants(first: 100) {
    nodes {
      id title sku availableForSale quantityAvailable
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
      selectedOptions { name value }
    }
  }
`;

async function fetchShopifyProducts(): Promise<ShopifyProduct[]> {
  const data = await storefrontQuery<{ products: ShopifyConnection<ShopifyProduct> }>(
    `query LittleNestProducts { products(first: 100, sortKey: TITLE) { nodes { ${PRODUCT_FIELDS} } } }`
  );
  const products = data.products.nodes;
  products.forEach((p) => {
    variantCache.set(p.id, p.variants.nodes);
    const mapped = mapProduct(p);
    productCache.set(p.handle, mapped);
    productCache.set(p.id, mapped);
  });
  return products;
}

function optionValue(variant: ShopifyVariant, kind: 'color' | 'size'): string {
  const option = variant.selectedOptions.find((item) => {
    const name = item.name.toLowerCase();
    return kind === 'color'
      ? /colou?r|shade|pattern/.test(name)
      : /size|age|months|age group/.test(name);
  });
  if (option) return option.value;
  if (variant.selectedOptions.length === 1 && variant.selectedOptions[0].name.toLowerCase() === 'title') return 'Standard';
  return kind === 'color' ? (variant.selectedOptions[0]?.value || 'Standard') : (variant.selectedOptions[1]?.value || 'Standard');
}

function mapProduct(p: ShopifyProduct): Product {
  const variants = p.variants.nodes;
  const purchasable = variants.filter((v) => v.availableForSale);
  const prices = purchasable.length ? purchasable.map((v) => Number(v.price.amount)) : variants.map((v) => Number(v.price.amount));
  const comparePrices = variants.map((v) => v.compareAtPrice ? Number(v.compareAtPrice.amount) : 0);
  const price = prices.length ? Math.min(...prices) : 0;
  const compareAt = comparePrices.length ? Math.max(...comparePrices) : 0;
  const images = p.images.nodes.map((image) => image.url).filter(Boolean);
  if (!images.length && p.featuredImage?.url) images.push(p.featuredImage.url);
  const colors = [...new Set(variants.map((v) => optionValue(v, 'color')))];
  const sizes = [...new Set(variants.map((v) => optionValue(v, 'size')))];
  const stockQuantity = purchasable.reduce((sum, v) => sum + (typeof v.quantityAvailable === 'number' ? v.quantityAvailable : 1), 0);
  const type = (p.productType || p.tags[0] || 'Baby Essentials').toLowerCase();
  const category = type.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'baby-essentials';
  return {
    id: p.id,
    name: p.title,
    slug: p.handle,
    shortDescription: p.description.slice(0, 180),
    fullDescription: p.description,
    category,
    categoryName: p.productType || 'Baby Essentials',
    regularPrice: compareAt > price ? compareAt : price,
    ...(compareAt > price ? { salePrice: price } : {}),
    costPrice: 0,
    currency: variants[0]?.price.currencyCode || 'PKR',
    sku: variants.find((v) => v.sku)?.sku || p.handle,
    supplierName: 'Shopify',
    supplierProductUrl: '',
    supplierSku: '',
    materialDetails: '',
    washingInstructions: '',
    sizeGuide: '',
    availableColors: colors.length ? colors : ['Standard'],
    availableSizes: sizes.length ? sizes : ['Standard'],
    images,
    weightGrams: 0,
    status: 'published',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isNewbornEssential: false,
    genderCollection: 'unisex',
    stockQuantity: Math.max(0, stockQuantity),
    lowStockThreshold: 3,
    supplierStockStatus: purchasable.length ? 'in_stock' : 'out_of_stock',
    supplierLastChecked: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shopifyVariants: variants.map((v) => ({
      id: v.id,
      color: optionValue(v, 'color'),
      size: optionValue(v, 'size'),
      availableForSale: v.availableForSale,
      price: Number(v.price.amount),
    })),
  } as Product;
}

async function getShopifyCatalog(): Promise<Product[]> {
  const raw = await fetchShopifyProducts();
  return raw.map(mapProduct).filter((p) => p.status === 'published');
}

async function createShopifyCheckout(items: Array<{ productId: string; color: string; size: string; quantity: number }>, email?: string, phone?: string): Promise<string> {
  const productIds = [...new Set(items.map((item) => item.productId))];
  const missing = productIds.filter((id) => !variantCache.has(id));
  if (missing.length) {
    const data = await storefrontQuery<{ nodes: Array<(ShopifyProduct & { __typename: string }) | null> }>(
      `query LittleNestVariants($ids: [ID!]!) { nodes(ids: $ids) { __typename ... on Product { ${PRODUCT_FIELDS} } } }`,
      { ids: missing }
    );
    data.nodes.forEach((node) => {
      if (node && node.__typename === 'Product') variantCache.set(node.id, node.variants.nodes);
    });
  }

  const lines = items.map((item) => {
    const variants = variantCache.get(item.productId) || [];
    const variant = variants.find((v) =>
      v.availableForSale && optionValue(v, 'color') === item.color && optionValue(v, 'size') === item.size
    ) || variants.find((v) => v.availableForSale && v.selectedOptions.length === 1);
    if (!variant) throw new Error(`The selected option for "${item.productId}" is unavailable. Please return to the product page and choose another option.`);
    return { merchandiseId: variant.id, quantity: Math.max(1, item.quantity) };
  });

  const data = await storefrontQuery<{ cartCreate: { cart: { checkoutUrl: string } | null; userErrors: Array<{ message: string }> } }>(
    `mutation LittleNestCreateCart($input: CartInput!) {
      cartCreate(input: $input) {
        cart { checkoutUrl }
        userErrors { message }
      }
    }`,
    {
      input: {
        lines,
        buyerIdentity: {
          countryCode: 'PK',
          ...(email ? { email } : {}),
          ...(phone ? { phone } : {}),
        },
      },
    }
  );
  const result = data.cartCreate;
  if (result.userErrors.length) throw new Error(result.userErrors.map((error) => error.message).join('; '));
  if (!result.cart?.checkoutUrl) throw new Error('Shopify did not return a checkout URL. Check the Storefront API configuration.');
  return result.cart.checkoutUrl;
}

if (enabled) {
  const localGetProducts = api.getProducts.bind(api);
  const localGetProduct = api.getProduct.bind(api);
  const localCreateOrder = api.createOrder.bind(api);

  api.getProducts = async (params) => {
    try {
      let products = await getShopifyCatalog();
      if (params?.search) {
        const term = params.search.toLowerCase();
        products = products.filter((p) => `${p.name} ${p.shortDescription} ${p.sku}`.toLowerCase().includes(term));
      }
      if (params?.category) products = products.filter((p) => p.category === params.category || p.categoryName.toLowerCase() === params.category?.toLowerCase());
      if (params?.sort === 'price-low') products.sort((a, b) => (a.salePrice || a.regularPrice) - (b.salePrice || b.regularPrice));
      if (params?.sort === 'price-high') products.sort((a, b) => (b.salePrice || b.regularPrice) - (a.salePrice || a.regularPrice));
      return products;
    } catch (error) {
      console.error('Shopify catalog unavailable; using LittleNest's existing catalog.', error);
      return localGetProducts(params);
    }
  };

  api.getProduct = async (identifier) => {
    try {
      const products = await getShopifyCatalog();
      const found = products.find((p) => p.slug === identifier || p.id === identifier);
      if (!found) throw new Error('This product is not available in Shopify.');
      return found;
    } catch (error) {
      console.error('Shopify product lookup failed.', error);
      return localGetProduct(identifier);
    }
  };

  api.createOrder = async (payload) => {
    const items = payload.items as Array<{ productId: string; color: string; size: string; quantity: number }>;
    if (items.length && items.every((item) => item.productId.startsWith('gid://shopify/Product/'))) {
      const checkoutUrl = await createShopifyCheckout(
        items,
        payload.customerAddress?.email,
        payload.customerAddress?.phone
      );
      window.location.assign(checkoutUrl);
      // Keep the existing checkout screen in its loading state until navigation occurs.
      return new Promise<Awaited<ReturnType<typeof localCreateOrder>>>(() => undefined);
    }
    return localCreateOrder(payload);
  };
}
