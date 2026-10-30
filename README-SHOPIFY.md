# LittleNest Shopify theme

This branch contains a Shopify Online Store 2.0 theme starter adapted to the LittleNest newborn clothing storefront.

## What's included
- Editable announcement bar, header/navigation, homepage hero, category tiles, featured collection, and footer
- Shopify-native product pages with variant selection, quantity controls, add-to-cart, and dynamic product media
- Collection browsing, sorting, pagination, search, cart quantity updates, and Shopify checkout handoff
- Responsive styling using the LittleNest ivory, blush, cream, sage, and warm-brown palette
- Shopify theme settings for logo and brand colors

## Before launch
1. Create or open your Shopify store and go to Products. Add your real products, prices, inventory, variants, and product photos. The old React app's admin/database is not automatically imported into Shopify.
2. Create Shopify collections such as Sleepsuits & Rompers, Blankets & Swaddles, Socks, Hats & Mittens, and Newborn Gift Sets.
3. In Online Store → Themes → Customize, select the relevant collections and upload your logo/hero image. Set the navigation menus.
4. Create or review Contact, Shipping, Returns/Refund, Privacy, and Terms pages/policies.
5. Configure shipping zones for Pakistan and enable the payment methods available to your Shopify account. Cash on Delivery availability depends on your Shopify setup and region; EasyPaisa/JazzCash may require a supported payment provider or manual payment instructions.
6. Preview all templates on mobile and desktop, place a test order, and verify taxes, shipping, notifications, and checkout before publishing.

## Import this branch
Option A — Connect GitHub in Shopify: In Shopify admin, open Online Store → Themes, choose the option to add/connect a theme from GitHub (wording may vary), authorize Shopify's GitHub app, select kanasim26-droid/Littlenest and the shopify-theme branch. Keep it unpublished while testing.

Option B — Upload a ZIP: Open the repository's shopify-theme branch on GitHub and use Code → Download ZIP. Upload that ZIP under Online Store → Themes → Add theme → Upload zip file. Do not upload the full repository's main branch.

## Important limitations
This is a theme conversion, not a migration of live store data or backend services. Shopify manages products, inventory, customer accounts, checkout, orders, and transactional emails after setup. The React admin panel and its database do not run inside a Shopify theme. Theme images selected in the Shopify editor and product media uploaded to Shopify are preferred over remote fallback images.
