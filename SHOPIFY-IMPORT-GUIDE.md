# LittleNest Shopify theme import

This branch contains a Shopify Online Store 2.0 theme. It does not change the existing `main` branch or the current Vercel website.

## Connect the theme from GitHub

1. Sign in to your Shopify admin.
2. Open **Online Store → Themes**.
3. In the theme library, choose **Add theme → Connect from GitHub**.
4. Install/authorize the Shopify GitHub app if prompted.
5. Choose repository **`kanasim26-droid/Littlenest`** and branch **`shopify-theme`**.
6. Add it as an unpublished theme first. Click **Customize** to preview it and choose your logo, navigation menus, hero image, featured collection, and category collections.
7. Do not publish it until you have tested product pages, cart, checkout, shipping and payment settings.

Official guide: https://shopify.dev/docs/storefronts/themes/tools/github

## Import the existing product catalogue

The file `shopify-products-import.csv` is a separate Shopify product import file. It contains the six products in the current catalogue, their product images, prices, and size/color options.

1. Before importing, set your Shopify store currency to **PKR** if you want the listed prices to remain in Pakistani rupees.
2. In Shopify admin, open **Products → Import**.
3. Select `shopify-products-import.csv` from this branch. Open the file in GitHub, click **Raw**, then save it as a CSV file if needed.
4. Review the import preview before confirming.
5. After import, check each product's variants and images.

Official guide: https://help.shopify.com/en/manual/products/import-export/import-products

### Important migration notes

- Shopify's product, order, customer, discount, inventory, and admin data are separate from a theme. This theme does not copy the old site's orders, customers, or admin accounts.
- The existing catalogue has one stock count per product, not per size/color variant. The CSV intentionally leaves variant inventory quantities untracked rather than inventing a stock split. Set stock quantities for each Shopify variant before launch.
- The CSV prices use the current catalogue's sale price and compare-at price. Confirm your Shopify currency before importing.
- The theme provides standard Shopify product forms, collections, search, cart, pages, and newsletter sign-up. Shopify checkout, shipping zones, taxes, cash on delivery, and any Easypaisa/JazzCash provider must be configured and tested in Shopify admin separately; the theme does not activate payment providers.
- The hero has a fallback image from the existing public GitHub repository. Replace it in the theme editor with your preferred image after connecting.
- Do not store Shopify API secrets or payment credentials in theme files.

## Theme contents

- `layout/theme.liquid`
- `sections/` — announcement bar, header, hero, featured collection, category tiles, product, collection, cart, search, page and 404 sections
- `snippets/` — product cards and price display
- `templates/` — JSON Online Store 2.0 templates
- `assets/` — responsive styling and small cart quantity controls
- `config/` and `locales/` — theme settings and English locale
