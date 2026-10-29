# LittleNest Shopify integration setup

This branch adds an optional Shopify Storefront API bridge to the existing React/Vercel storefront. It keeps the existing LittleNest UI and local API fallback. When the two Shopify environment variables are configured, product listings/details come from Shopify and the existing checkout flow creates a Shopify cart and redirects to Shopify checkout.

## Required settings (only these two)

Add these in **Vercel → Project → Settings → Environment Variables** for the Vercel project that hosts the existing LittleNest React site:

1. `VITE_SHOPIFY_STORE_DOMAIN` — the store's exact `*.myshopify.com` domain, without `https://` (example format: `your-store.myshopify.com`).
2. `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` — a **public Storefront API access token** created for the storefront/headless channel.

Then redeploy the Vercel project. Vite variables are embedded at build time, so adding them without redeploying will not activate the integration.

## Create/get the Storefront API token

In Shopify admin, open **Settings → Apps and sales channels** and use Shopify's supported Headless/storefront channel or custom-app workflow to create a Storefront API token. Enable the product listing/read access needed to query products and variants. Copy the **Storefront public access token**, not an Admin API access token, Admin API secret, client secret, or password.

The Storefront public token is intended to be used by a storefront. Do not place private Admin API credentials in any `VITE_*` variable.

## Before publishing

- Confirm the imported products are published to the Online Store / storefront channel and have real prices, product media, and available variants in Shopify.
- Set Shopify store currency to PKR if supported for the store, and verify the actual prices in Shopify; this integration displays the amounts Shopify returns and does not perform currency conversion.
- Confirm the Shopify plan/checkout is active and shipping zones, payment methods, policies, notifications, and Pakistan delivery settings are configured.
- Add both environment variables to the correct Vercel project and redeploy its preview first. Test product list, product options, add-to-cart, checkout redirection, and a test order before using production.
- The integration reads the first 100 products and up to 100 variants per product. Product categories in the existing design may need Shopify product types/tags aligned with the site's collection/category names.
- When Shopify variables are absent or the Storefront API is unavailable, the bridge falls back to the existing LittleNest catalog/API.
- Shopify owns final checkout totals, shipping, taxes, payment collection, order creation, and customer notifications. The existing custom order/admin database is not synchronized with Shopify orders by this bridge.

## Branch

The integration has been merged into `main` and deployed to the existing Vercel project. It remains opt-in until both environment variables are configured. It does not publish the separate Shopify theme branch.
