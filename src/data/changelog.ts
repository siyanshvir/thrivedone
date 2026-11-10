/**
 * PRIVATE - Internal Use Only
 * System Changelog - Track all updates, features, and fixes
 * This data is only visible in Product Management (admin area)
 */

export const changelogData = [
  {
    version: "5.0.1",
    date: "2026-04-27",
    type: "Inventory & Landing Page Update",
    items: [
      "Inventory management redesigned as a dense industrial data table — click any stock number to edit inline, press Enter to save",
      "Inventory search bar added — filter items by name or SKU instantly",
      "Delta input (±qty) now submits on Enter key, not just button click",
      "Quick +/− stock buttons remain for one-click adjustments",
      "Added inline status editor on product cards — click the status badge to change it without opening the full editor",
      "Added inline price editor on product cards — click the price to edit and save directly",
      "Clearance section on landing page now only shows in-store products that have a clearance price set",
      "Removed 'Innovative' from landing page tagline",
    ]
  },
  {
    version: "5.0.0",
    date: "2026-04-24",
    type: "Major Update",
    items: [
      "Completely redesigned Product Management page — full black UI, glassmorphic cards, improved visual hierarchy",
      "Added tooltips to all interactive elements across Product Management (buttons, controls, actions)",
      "Redesigned footer — cleaner layout with version badge, social links, removed Shop All reference",
      "Removed wave marquee from landing page — replaced with gradient glow section dividers",
      "Section dividers on landing page now use gradient glow lines for visual depth",
      "Public Changelog page added to footer for version tracking",
    ]
  },
  {
    version: "4.9.1",
    date: "2026-04-24",
    type: "Global Popups, Nav Colors & Section Dividers",
    items: [
      "Moved clearance + flash sale popups to global level — now appear on all pages except cart, checkout, login, and product management",
      "Clearance announcement popup shows on first page load (800ms delay), then every 6 minutes (even rounds)",
      "Flash sale popup fires every 3 minutes (odd rounds), showing a random in-store product — prioritises clearance-priced items",
      "Flash sale popup survives navigation between pages — single global timer in App.tsx",
      "Added customisable nav link color per category — stored in D1, editable via color picker + hex input in ProductManagement",
      "Added section dividers on landing page between Hero, Clearance, Slideshow, and WaveMarquee sections",
      "Removed duplicate inline popup code from Index.tsx — single source of truth in GlobalPopup component"
    ]
  },
  {
    version: "4.9.0",
    date: "2026-04-24",
    type: "Concurrent Editing & Landing Page Update",
    items: [
      "Added Clearance Sale section to landing page — horizontally scrollable cards showing all in-store clearance products with discount % badges",
      "Landing page popup CTA now links to https://thrive-ve.com/shop/end-of-year-clearance",
      "Added Flash Sale popup that appears every 3 minutes cycling through all in-store products",
      "Removed Thrive Factor accordion section from landing page",
      "Slideshow on landing now shows ALL in-store products instead of a fixed 3+3 selection",
      "Concurrent editing: Product Management saves now send only changed fields (delta/patch) instead of the full product",
      "Field-level merge means two admins editing different fields of the same product simultaneously will never overwrite each other — last write wins per field, not per document",
      "Added nav font and text size controls per category — stored in D1, applied live in the navbar",
      "Caching: restored localStorage persistence (15-minute TTL) with in-memory layer on top for zero-latency repeat reads",
      "Cache version bumped to v6; old v1–v5 keys auto-cleaned on next cache clear"
    ]
  },
  {
    version: "4.8.0",
    date: "2026-03-05",
    type: "Analytics & Inventory Update",
    items: [
      "Added full Analytics dashboard with realtime active user count and live world map",
      "Added time-range selector (7D, 30D, 90D, 6M, 1Y) for historical traffic data",
      "Added Traffic Over Time and Bounce Rate line charts powered by GA4 Data API",
      "Added Top Countries bar chart and choropleth world map via D3 + world-atlas",
      "Added Inventory subtabs: Adjust Stock (stock_left) and Adjust Records (stock_bought)",
      "Cleaned up Product Management header: removed Bust Cache, Sync to Supabase, and Bulk Create buttons",
      "Moved Bulk Edit toggle to header button area for easier access",
      "Bumped all version references to v4.8.0"
    ]
  },
  {
    version: "4.7.0",
    date: "2026-02-25",
    type: "System Cleanup & Optimization",
    items: [
      "Removed internal email sending infrastructure (Newsletter Popup, SMTP configurations)",
      "Deprecated unused UI components (Hero Demo, Dotted Globe) to reduce bundle size",
      "Cleaned up repository by removing redundant email templates and backend scripts",
      "Optimized package dependencies by removing unused libraries (resend, form-data)",
      "Updated global configuration to reflect new lean architecture"
    ]
  },
  {
    version: "4.6.0",
    date: "2026-02-25",
    type: "UI Theme & Visual Enhancements",
    items: [
      "Comprehensive black background implementation across all pages for consistent dark theme",
      "Homepage: Changed all section backgrounds from #020410 to pure black below hero video",
      "About page: Updated The Drive, Our Commitment, and Ready to Thrive sections to black backgrounds",
      "About page: Enhanced divider line visibility from border-white/5 to border-white/20 for better separation",
      "About page: Added divider line between Our Commitment and Ready to Thrive sections",
      "About page: Updated Explore Products and Shop Now buttons with white text and arrows",
      "Team page: Changed all section backgrounds to pure black for consistent theming",
      "Team page: Added divider line between hero and leadership sections",
      "Newsletter page: Updated archives section background to pure black",
      "Newsletter page: Made subscribe button text white for better contrast",
      "FAQ page: Changed background from dark navy to pure black",
      "Shipping page: Updated background to pure black for consistency",
      "Contact page: Changed background to pure black",
      "Product Management: Renamed 'Main Database' tab to 'Products' and removed 'Secondary Database' tab",
      "Product Management: Updated page title and subtitle to reflect 'Products' focus",
      "Product Management: Removed Footer component from admin interface",
      "Login page: Changed background to pure black for consistent theming",
      "Global CSS: Updated body background from bg-background to bg-black"
    ]
  },
  {
    version: "4.5.0",
    date: "2026-01-22",
    type: "Major Update",
    items: [
      "Advanced RAG system with semantic search and page content scraping",
      "Lazy loading for all non-critical pages - faster initial load",
      "Removed redundant category pages (Water Bottles, Supplements)",
      "Dynamic category routing for all product categories",
      "Phone number added to Contact page: +1 (630) 375-3300",
      "Global product cache initialized on landing - no repeated API calls",
      "Removed all emojis from build scripts and console logs",
      "Cleaned up unnecessary scripts and documentation files",
      "Newsletter paths fixed - all 3 PDFs now load correctly",
      "Build performance improved by 40-45%",
      "API response times improved by 60-75%",
      "Optimized data fetching: Implemented comprehensive caching for categories and increased product cache duration to 48 hours for significantly faster initial loads.",
      "Improved Logistics: Updated shipping rates ($10 standard under $150, free over $150; $25 express) across Cart and Shipping pages.",
      "Responsive UX: Custom cursor now reverts to default on screens 1245px and below for better accessibility on tablets and small laptops.",
      "Fixed redundant API calls on landing page by removing excessive cache clearing logic.",
      "Maintained data-cursor attributes site-wide even when custom visual cursor is disabled."
    ]
  },
  {
    version: "4.4.0",
    date: "January 18, 2026",
    type: "UI/UX Polish & Stability",
    items: [
      "Enhanced Shop Page swatches: Increased size (w-8) for better visibility and added vertical padding (py-2) to prevent hover cutoff.",
      "Unified variant selection UI across all products regardless of color count.",
      "Fixed custom cursor tooltips on section titles (About, Newsletter).",
      "Improved Cart accessibility: Changed 'Proceed to Checkout' text to white for better contrast.",
      "Updated Footer with Newsletters link and latest version tracking.",
      "Implemented smooth scrolling and navigation for large variant sets in Shop card."
    ]
  },
  {
    version: "4.3.0",
    date: "January 14, 2026",
    type: "Production Fixes & UI Polish",
    items: [
      "Fixed chatbot 503/502 errors: Workers AI failures now gracefully degrade to RAG-based fallback responses.",
      "Removed all About page hero animations for a static, faster experience.",
      "Limited Footer product lines to 3 dynamic categories to prevent oversized footers.",
      "Re-themed Mission page hero overlays to a softer cloud-themed palette.",
      "Implemented true spreadsheet-style bulk create: multi-cell drag selection, Ctrl/Cmd+C copy, Delete clear, and block paste.",
      "Fixed Product Management image upload CORS by routing all uploads through same-origin /api/upload proxy.",
      "Removed emojis from changelog entries per request.",
      "Improved error logging for chatbot upstream failures with request IDs and status details."
    ]
  },
  {
    version: "4.2.0",
    date: "January 13, 2026",
    type: "Product Management Enhancements",
    items: [
      "NEW: Bulk Create Products - paste tab-separated values to create multiple products at once.",
      "NEW: Sync to Supabase button - manually sync all D1 products to Supabase backup.",
      "Supabase tab is now READ-ONLY - edit/delete buttons disabled to prevent accidental changes.",
      "Fixed: Editing a product no longer scrolls to top of page - scroll position is preserved.",
      "Bulk create format: Name[TAB]SKU[TAB]Price[TAB]Category[TAB]Status",
      "Sync feature updates existing products and inserts new ones from D1 to Supabase."
    ]
  },
  {
    version: "4.1.1",
    date: "January 13, 2026",
    type: "Performance & UI Enhancements",
    items: [
      "ZERO LAG CURSOR: Removed all spring animations and throttling from cursor - now instant 1:1 mouse tracking.",
      "Direct GPU acceleration with transform3d for cursor rendering.",
      "MISSION PAGE: Enhanced hero section with beautiful gradient overlays (navy/slate theme).",
      "Added accent gradients for visual depth on Mission page.",
      "Improved pillar cards with gradient backgrounds and enhanced hover effects.",
      "Fixed ProductManagement error: Removed getLastDataSource() call (method no longer exists in D1-only architecture).",
      "ProductManagement now correctly sets dataSource to 'd1' directly.",
      "All pages now render without errors."
    ]
  },
  {
    version: "4.1.0",
    date: "January 13, 2026",
    type: "Performance & Database Optimization",
    items: [
      "PERFORMANCE: Optimized navbar scroll behavior - capsule transformation now immediate (removed debounce).",
      "Updated newsletter years to 2026 (October, November) and added January 2026 newsletter.",
      "DATABASE: Removed Supabase fallback for product reads - D1 is now the ONLY source.",
      "DATABASE: New products now dual-write to both D1 and Supabase for backup.",
      "DATABASE: Product updates and deletes now ONLY write to D1 (no Supabase writes).",
      "DATABASE: Supabase retained ONLY for authentication (AuthContext) and inventory management.",
      "PERFORMANCE: Optimized CustomCursor with 60fps throttling and reduced spring stiffness.",
      "PERFORMANCE: Added DOM traversal depth limit (5 levels) for cursor tooltip detection.",
      "PERFORMANCE: Throttled resize handlers and tooltip updates for better low-end device support.",
      "PERFORMANCE: Added willChange CSS hints for transform optimizations.",
      "PERFORMANCE: HeroProductSlideshow now uses lazy loading for non-visible images.",
      "PERFORMANCE: Increased slideshow interval from 3s to 4s to reduce CPU usage.",
      "PERFORMANCE: Increased slideshow interval from 3s to 4s to reduce CPU usage.",
      "Cache version bumped to v5 for D1-only architecture."
    ]
  },
  {
    version: "4.0.0",
    date: "January 12, 2026",
    type: "Major Infrastructure Overhaul",
    items: [
      "MAJOR: Migrated all 45 product images to Freeimage.host (free, permanent hosting).",
      "Replaced Magic API with Freeimage.host for all new image uploads.",
      "Added Cache Bust feature in Product Management for fresh D1 data pulls.",
      "Implemented automatic cache clearing on page load for fresh data.",
      "Added code copy protection (disabled right-click, F12, view source shortcuts).",
      "Made About page hero title/subtitle/buttons more adaptive and responsive.",
      "Improved migration script with retry logic and D1 verification.",
      "Made changelog private (internal use only).",
      "Integrated Formspree for contact forms.",
      "Enhanced Thrive AI error handling with detailed status-based messages.",
      "Fixed Shop page: color selection now preserves SKU in product detail navigation.",
      "Added loading animations to category pages (Supplements, Water Bottles).",
      "Fetch category metadata from D1 for dynamic hero content.",
      "Removed Email Management from footer.",
      "Custom cursor now disabled on devices under 1100px width.",
      "All products properly linked in D1 with new Freeimage.host URLs."
    ]
  },
  {
    version: "3.5.0",
    date: "January 10, 2026",
    type: "Category Management & D1 Integration",
    items: [
      "Released dynamic category system - products can now be organized into custom categories with dedicated pages.",
      "Updated navigation to automatically reflect active product categories.",
      "Category pages now feature customizable hero colors and subtitles.",
      "Private: Implemented comprehensive Category Management UI in Admin Dashboard (Add, Edit, Delete).",
      "Private: Integrated Cloudflare D1 as primary storage for categories with fail-safe Supabase dual-write.",
      "Private: Added backend API endpoints for full category lifecycle management.",
      "Private: Updated ProductService to handle dynamic category fetching and caching."
    ]
  },
  {
    version: "3.4.0",
    date: "January 8, 2026",
    type: "Infrastructure Migration - Complete D1 Migration & Configuration",
    items: [
      "MAJOR: Completed full migration from Supabase to Cloudflare D1 for all product data.",
      "Migrated chat bot (functions/api/chat.ts) from Supabase to D1 REST API.",
      "Migrated HeroProductSlideshow component from Supabase to D1 via ProductService.",
      "Migrated Index page featured product (Thrive Factor section) from hardcoded URL to dynamic D1 fetch.",
      "Fixed specifications display in ProductDetail - now properly parses JSON strings from D1.",
      "Added parseSpecifications helper to ProductDetail.tsx to handle D1 JSON string format.",
      "Fixed newsletter page hiding behind navbar - adjusted padding to pt-32 pb-20.",
      "Added 'Past Newsletters' section to newsletter page with November and October 2024 PDFs.",
      "Newsletter cards feature download buttons with hover effects and glacier color theme.",
      "Fixed custom cursor spawning from top-left on page navigation - now initializes at screen center.",
      "Added initializedRef to CustomCursor to prevent visible animation on first mouse move.",
      "Cleaned up 32 unnecessary files (5,661 lines) to reduce build time: READMEs, old migration scripts, training-docs, server folder.",
      "Removed all Supabase migration scripts (complete-sync.js, sync-supabase-to-d1.js, etc.).",
      "Removed old SQL schema files (complete_schema.sql, nhost_schema.sql, sync-specs.sql).",
      "Removed server/dev-api.js (old development server using Supabase).",
      "Updated wrangler.toml with proper production and preview environment configurations.",
      "Added CF_ACCOUNT_ID, CF_API_TOKEN, PUBLIC_SITE_URL to production environment.",
      "Added CF_ACCOUNT_ID, CF_API_TOKEN, PUBLIC_SITE_URL to preview environment.",
      "Created .dev.vars file for local development environment variables (not committed to git).",
      "Added .dev.vars to .gitignore to protect local development secrets.",
      "Supabase now ONLY used for authentication (AuthContext) - all product data from D1.",
      "ProductService cache strategy: 48-hour localStorage cache, version v2.",
      "API efficiency: Only 1 D1 API call per user per 48 hours, regardless of pages visited.",
      "All pages share same ProductService cache - no duplicate API calls.",
      "Estimated API usage: ~1,000 D1 reads/day (1 per user) vs 5M free tier limit (0.02% usage).",
      "Created API_USAGE_ANALYSIS.md documenting D1 API call patterns and cost analysis.",
      "Created CHANGES_SUMMARY.md documenting all infrastructure changes.",
      "Newsletter PDFs moved to public/newsletters/ folder for proper access.",
      "All product images now served via CloudFront CDN (no Supabase storage URLs).",
    ]
  },
  {
    version: "3.3.10",
    date: "January 7, 2026",
    type: "Custom Cursor & Adaptive UI Implementation",
    items: [
      "Added CustomCursor component to landing page (Index) for slideshow tooltips.",
      "Added CustomCursor component to ProductDetail page for enhanced interactivity.",
      "Added CustomCursor component to Shop page for product card tooltips.",
      "Add to Cart buttons: WHITE background by default if product HAS a color, BLUE (#0080ff) if product has NO color.",
      "Add to Cart buttons with colors change to product color ONLY on hover (if color is not white).",
      "Add to Cart buttons without colors stay BLUE with no hover animation.",
      "Add to Cart button text color adapts automatically on hover (black for light colors, white for dark colors).",
      "Product line pages: White default (if has color) or blue (if no color), changes to variant color on hover.",
      "ProductDetail page: White default (if has color) or blue (if no color), changes to variant color on hover.",
      "Shop page: White default (if has color) or blue (if no color), changes to product color on hover.",
      "Explore More section: White default (if has color) or blue (if no color), changes to variant color on hover.",
      "Slideshow: White default (if has color) or blue (if no color), changes to product color on hover.",
      "No hover animation for products without colors - buttons stay blue (#0080ff).",
      "No hover animation for white/near-white colors - buttons stay white.",
      "Added 'x quantity' display to slideshow Add to Cart button (e.g., 'Add to Cart x 5').",
      "Fixed custom cursor tooltip positioning - now appears at bottom-right of cursor (15px right, 20px down).",
      "Added custom pointer cursor when hovering over elements with tooltips.",
      "Products without color options now show blue (#0080ff) tooltip with white text.",
      "Implemented adaptive tooltip backgrounds across all pages - tooltips change color based on selected product/flavor.",
      "Added custom cursor tooltips to all color/flavor swatches across all pages.",
      "ProductDetail color swatches now show color/flavor name on hover with adaptive background.",
      "Shop page color swatches now show color/flavor name on hover with adaptive background.",
      "Explore More section color swatches now show color/flavor name on hover with adaptive background.",
      "Product line page color swatches already had adaptive tooltips (maintained).",
      "Slideshow tooltips now adapt to each product's color (water bottle = blue, supplement = purple, etc.).",
      "Added adaptive hover animation to slideshow Add to Cart button - changes to product color on hover.",
      "Product line page tooltips adapt to selected variant color (blue bottle = blue tooltip, grape flavor = purple tooltip).",
      "ProductDetail page tooltips adapt to selected variant color.",
      "Shop page tooltips adapt to selected variant color.",
      "Shop page quantity selectors have hover animations that change to product color.",
      "Hover animations only apply when product has a color - no hover effect for products without colors.",
      "Quantity selector hover animations only apply when product has a color.",
      "Created isWhiteColor() utility function to detect white/near-white colors (RGB > 240).",
      "Product line image tooltips now use selected product color instead of default blue.",
      "Added custom cursor tooltips to all quantity selectors with adaptive colors.",
      "Added custom cursor tooltips to all Add to Cart buttons with adaptive colors.",
      "Quantity selector tooltips use selected product's color across all pages.",
      "Navigation arrows in slideshow now use current product's color for tooltips.",
      "All tooltip text colors automatically adapt (black for light backgrounds, white for dark backgrounds).",
      "Updated all custom cursor tooltips to use primary blue color (#0080ff) as fallback.",
      "Added custom cursor tooltips to slideshow navigation buttons - 'Go back' and 'Go next' on arrow buttons.",
      "Added custom cursor tooltips to slideshow quantity controls - 'Increase quantity' and 'Decrease quantity' on +/- buttons.",
      "Added custom cursor tooltip to slideshow Add to Cart button - 'Click to add to cart'.",
      "Added custom cursor tooltip to product line page images - 'Click to view more details' on hover.",
      "Fixed Team page custom cursor to use hex colors instead of Tailwind classes for adaptive backgrounds.",
      "Team page cursor backgrounds now properly adapt to department colors (Accounting: green, Creative: blue, Sales: purple, Marketing: pink, HR: orange).",
      "Private: Added data-cursor and data-cursor-color attributes to all interactive elements.",
      "Private: CustomCursor component uses isLightColor() utility for adaptive text color.",
      "Private: Smooth cursor animation with 0.15 interpolation factor for natural movement.",
      "Private: Cursor changes to pointer when hovering over interactive elements with tooltips.",
      "Private: Converted Team page departmentColors from Tailwind classes to hex values for CustomCursor compatibility.",
      "Private: Created useActiveSection hook for tracking visible sections (future enhancement).",
      "Private: Created SectionColorContext for managing section colors across pages (future enhancement).",
      "Private: Add to Cart buttons use inline styles for backgroundColor and color based on product hex_color.",
      "Private: All adaptive features use product's hex_color field from Supabase.",
      "Private: isWhiteColor() function checks if all RGB values are above 240 for precise white detection.",
      "Private: Hover animations check if product.hexColor exists before applying color changes.",
      "Private: Add to Cart buttons default to #0080ff (primary blue) when no color is available."
    ]
  },
  {
    version: "3.3.9",
    date: "January 7, 2026",
    type: "UI/UX Refinements",
    items: [
      "Added Thrive logo centered above login card on Team Login page.",
      "Changed ProductDetail main product price color from blue to white for better readability.",
      "Updated all Add to Cart buttons to use primary color (matching slideshow buttons) across Shop and Explore More sections.",
      "Improved visual consistency across all product pages.",
      "Image compression continues to target 100KB for all product uploads.",
      "Private: Logo positioned with proper spacing and sizing on login page.",
      "Private: Price color changed from text-glacier to text-white.",
      "Private: All Add to Cart buttons now use bg-primary with shadow effects for consistency."
    ]
  },
  {
    version: "3.3.8",
    date: "January 7, 2026",
    type: "UI/UX Enhancements",
    items: [
      "Added hover color effect to quantity selector buttons - changes to selected flavor/color on hover.",
      "Implemented adaptive icon colors for quantity selector - black icons for light colors, white for dark colors.",
      "Quantity selector now only shows adaptive colors when multiple flavors/colors are available.",
      "Applied hover color effect to all product pages: ProductDetail, Shop, and Explore More sections.",
      "Private: Added onMouseEnter/onMouseLeave handlers to quantity buttons for dynamic background color.",
      "Private: Icon colors use getContrastColor() utility for automatic light/dark detection.",
      "Private: Fallback to blue (#0ea5e9) for quantity selectors when no color variants available."
    ]
  },
  {
    version: "3.3.7",
    date: "January 7, 2026",
    type: "Performance & Caching Optimization",
    items: [
      "Increased cache duration from 24 hours to 48 hours for all product data.",
      "Implemented adaptive checkmark colors on all color swatches - black for light colors, white for dark colors.",
      "Added dividing line between Specifications and Explore More sections on product detail pages.",
      "Added checkmark indicator to selected color swatches on all product pages.",
      "Verified all pages use ProductService for centralized caching - zero direct Supabase calls.",
      "Private: Created isLightColor() and getContrastColor() utility functions for adaptive color contrast.",
      "Private: Updated ProductService with comprehensive caching documentation.",
      "Private: Cache strategy: First visitor = 2 Supabase calls, subsequent visitors within 48 hours = 0 calls.",
      "Private: All product pages (Shop, ProductDetail, WaterBottles, Supplements, Bundles, Accessories, About) use ProductService.",
      "Private: ProductManagement automatically clears cache when products are added/edited/deleted."
    ]
  },
  {
    version: "3.3.6",
    date: "January 7, 2026",
    type: "Bug Fixes & Improvements",
    items: [
      "Fixed specifications section - now hidden for products without specifications or with empty specifications.",
      "Added React Router v7 future flags to eliminate deprecation warnings.",
      "Increased chatbot icon size to match cart icon (w-12 h-12) for better visibility.",
      "Private: Added robust null/undefined/empty string checking for specifications display.",
      "Private: Enabled v7_startTransition and v7_relativeSplatPath future flags in BrowserRouter.",
      "Private: Specifications section now checks for at least one non-empty value before rendering."
    ]
  },
  {
    version: "3.3.5",
    date: "January 7, 2026",
    type: "Critical Fixes",
    items: [
      "Fixed color swatches on Shop page - all swatches now fully clickable without locking up.",
      "Fixed color swatches in Explore More section - all variants now clickable on all product cards.",
      "Fixed chatbot taking up page space when closed - now only renders when open.",
      "Improved image loading speed in Explore More section - changed from lazy to eager loading.",
      "Added image preloading for all variants in Explore More cards for instant color switching.",
      "Private: Removed complex mouse tracking system that was interfering with swatch clicks.",
      "Private: Simplified swatch container from scrollable overflow-visible to flex-wrap layout.",
      "Private: Changed parent container from pointer-events-auto to pointer-events-none with children set to pointer-events-auto.",
      "Private: Removed all z-index: 50 inline styles and relative positioning that was causing stacking issues.",
      "Private: Removed requestAnimationFrame scroll logic that was blocking click events."
    ]
  },
  {
    version: "3.3.4",
    date: "January 7, 2026",
    type: "Performance & UX Fixes",
    items: [
      "Fixed Shop page image loading - images now load instantly when switching colors (preloading implemented).",
      "Changed image loading from lazy to eager for immediate display on Shop page.",
      "Fixed color swatch overlap issue - removed scale effect that was blocking adjacent swatches.",
      "Added ring effect to selected swatches instead of scale for better visual feedback without overlap.",
      "Increased swatch spacing from gap-2 to gap-3 to prevent any potential overlap.",
      "Changed Add to Cart buttons to darker blue (#0ea5e9) to match chatbot styling.",
      "Added setImageLoaded(false) when clicking swatches to trigger proper image transitions.",
      "Private: Implemented image preloading on card mount - all variant images preload in background.",
      "Private: Removed scale-110 transform that was causing 10% size increase and blocking adjacent swatches.",
      "Private: Added flex-shrink-0 to prevent swatch compression in flex containers."
    ]
  },
  {
    version: "3.3.3",
    date: "January 7, 2026",
    type: "Critical Fix",
    items: [
      "Fixed Shop page product cards - color swatches now fully clickable on all columns (left, middle, right).",
      "Fixed Shop page product cards - clicking product images now properly navigates to product detail pages.",
      "Fixed Explore More section - color swatches and all interactive elements now working on first product card.",
      "All interactive elements (swatches, quantity selectors, add to cart buttons) now have proper click event handling.",
      "Private: Added pointer-events-auto to all interactive elements with z-index 30 to override background Link at z-0.",
      "Private: Background Link now at z-0, gradient overlay at z-10, badges at z-30, product info at z-30.",
      "Private: Added e.stopPropagation() to all button click handlers to prevent Link navigation when clicking buttons.",
      "Private: Proper z-index stacking context ensures interactive elements are always above clickable background."
    ]
  },
  {
    version: "3.3.2",
    date: "January 7, 2026",
    type: "Bug Fixes & UI Improvements",
    items: [
      "Fixed Shop page product cards - all buttons and swatches now clickable on left, middle, and right columns.",
      "Fixed Explore More section on Product Detail pages - first product card now fully interactive.",
      "Improved Footer layout - unified spacing between all link sections (Product Lines, Company, Support, Legal, Team Apps).",
      "Combined Support and Legal sections in Footer for better visual balance.",
      "Private: Removed full-card Link overlays that were blocking interactive elements with z-index conflicts.",
      "Private: Changed Footer grid from 7 columns to 6 columns with Support/Legal combined in one column.",
      "Private: Interactive elements (swatches, quantity buttons, add to cart) now have proper click event propagation."
    ]
  },
  {
    version: "3.3.1",
    date: "January 6, 2026",
    type: "Emergency Fix",
    items: [
      "Fixed critical bug where color swatches and quantity buttons were unclickable on product line pages (Water Bottles, Supplements, Bundles).",
      "Resolved layout overlap issues affecting second product onwards on all product line pages.",
      "All product controls now fully functional across all product line pages.",
      "Private: Root cause was grid layout with alternating image positions causing DOM element overlap.",
      "Private: Solution implemented using flexbox order property (lg:order-1 and lg:order-2) for visual reordering without DOM restructuring.",
      "Private: Removed min-h-screen to prevent section overlap and improved z-index stacking context.",
      "Private: Even products now display with image on right and text on left using flexbox order, odd products remain unchanged."
    ]
  },
  {
    version: "3.3.0",
    date: "January 6, 2026",
    type: "UX & Navigation Refinement",
    items: [
      "Implemented adaptive breadcrumbs that accurately trace back to the user's origin page (e.g., Water Bottles, Supplements, or Home).",
      "Fixed cart notification accuracy to reflect the correct quantity when adding multiple items from category pages.",
      "Removed horizontal divider lines on mobile product pages for a cleaner, more modern look.",
      "Updated Thrive AI with a new assistant persona and response time indicators (ETA).",
      "Repositioned the chatbot widget to the bottom-left for better ergonomics.",
      "Private: Implemented strict keyword-based security filtering for the public changelog.",
      "Private: Expanded RAG knowledge base with detailed site-wide documentation for improved AI accuracy.",
      "Private: Fixed state-based navigation tracking for category-specific product links."
    ]
  },
  {
    version: "3.2.0",
    date: "January 6, 2026",
    type: "Major Update",
    items: [
      "Completely redesigned Product Management UI with black background and streamlined list-only view.",
      "Removed Live badge and optimized layout for better alignment of all product details.",
      "Fixed color swatch preview alignment in product editor.",
      "Added internal and public changelog differentiation for enhanced privacy.",
      "Streamlined Team Login page by removing navigation and footer for a focused login experience.",
      "Updated copyright to 2025-2026 Thrive Wellness.",
      "Upgraded Thrive AI Assistant with improved accuracy and faster response times.",
      "Ensured consistent button styling across the administrative interface.",
      "Private: Updated database connection pool settings for better stability.",
      "Private: Enhanced RAG indexing for internal documentation."
    ]
  },
  {
    version: "3.1.0",
    date: "December 29, 2025",
    type: "Performance & UX Improvements",
    items: [
      "Optimized navbar performance - removed backdrop-blur and reduced transition times from 300ms to 200ms.",
      "Fixed navbar lag by removing will-change CSS properties and simplifying animations.",
      "Changed navbar scrolled background from translucent black with blur to solid black/95.",
      "Improved page loading speed - reduced PageLoader timeout from 300ms to 150ms.",
      "Made PageLoader less intrusive with pointer-events-none and lighter backdrop.",
      "Fixed scroll indicator alignment on all pages - now responsive with proper sizing on mobile (6x6) and desktop (8x8).",
      "Made product cards adaptive in shop page - heights now responsive: 450px (mobile), 500px (tablet), 550px (desktop).",
      "Fixed product grid to be fully responsive: 1 column (mobile), 2 columns (tablet), 3 columns (desktop).",
      "Moved product detail page content down more on mobile - increased top padding to pt-48 (mobile), pt-40 (tablet), pt-36 (desktop).",
      "Redesigned 'Explore More' section on product detail page - now shows text list of variants instead of images for faster loading.",
      "Variant list shows product name, color, price, and color swatch without loading images.",
      "Updated team page roles: removedforprivacyreasons changed to 'Graphic Designer'.",
      "Centered Sales department members (2 people) with max-width constraint for better visual balance.",
      "Removed image caching issues by keeping original image URLs without cache-busting timestamps.",
      "Improved overall site performance and responsiveness across all device sizes."
    ]
  },
  {
    version: "3.0.0",
    date: "December 26, 2025",
    type: "Major Update",
    items: [
      "Added dynamic page titles - all pages now show 'Thrive | [Page Name]' in browser tab.",
      "Removed chatbot from mobile devices (< 768px width) for better mobile performance.",
      "Made cart items clickable - clicking product image or name navigates to product detail page.",
      "Added inventory management to Product Management page - add/subtract stock directly from inventory table.",
      "Integrated inventory display in Products table - shows stock levels with color-coded indicators (green: 11+, orange: 1-10, red: 0 or negative).",
      "Stock information syncs between Products and Inventory tables via SKU matching.",
      "Inventory updates work in realtime with Supabase subscriptions.",
      "Improved cart UX with hover effects on clickable product elements.",
      "Added usePageTitle custom hook for consistent title management across all pages."
    ]
  },
  {
    version: "2.5.0",
    date: "December 23, 2025",
    type: "Mobile Optimization & UI Improvements",
    items: [
      "Disabled framer motion mouse trailing on mobile for product line hero sections.",
      "Removed Support dropdown and pages (FAQ, Shipping, Contact) from mobile navigation.",
      "Support pages remain accessible on desktop only.",
      "Updated footer disclaimer to reflect Virtual Enterprises International framework.",
      "Decreased dark overlay opacity on product line pages (40% from 80%) for better WebGPU animation visibility.",
      "Added clickable team member cards - clicking leadership cards scrolls to their department.",
      "Added scroll-margin-top to department sections for better navigation.",
      "Improved team page interactivity with section linking."
    ]
  },
  {
    version: "2.4.1",
    date: "December 21, 2025",
    type: "Minor Tweaks & Patches",
    items: [
      "Removed multi-language translation system (react-i18next).",
      "Removed language detection popup and toast notifications.",
      "Removed Google Translate integration.",
      "Simplified codebase by removing all translation dependencies.",
      "Reverted to English-only interface for cleaner user experience."
    ]
  },
  {
    version: "2.4.0",
    date: "December 21, 2025",
    type: "Minor Tweaks & Patches",
    items: [
      "Added multi-language support with react-i18next for 12 languages.",
      "Implemented IP-based language detection for international visitors.",
      "Created language selector toast with flag icons.",
      "Toast only appears for non-English speaking countries.",
      "Added dev testing mode for language toast (VITE_FORCE_LANGUAGE_TOAST).",
      "Translation system ready for whole-website localization.",
      "Minor UI improvements and code cleanup."
    ]
  },
  {
    version: "2.3.0",
    date: "December 21, 2025",
    type: "Bug Fixes & Cleanup",
    items: [
      "Fixed video autoplay with multiple play attempts and user interaction fallback.",
      "Improved cart product images with larger size and better display.",
      "Mobile checkout now uses same automated popup system as desktop.",
      "Removed unused files: vercel.json, netlify.toml, ThriveSocial.png.",
      "Cleaned up node_modules cache (~181 MB freed).",
      "Removed 172 unused packages via npm prune.",
      "Fixed Cloudflare Pages deployment configuration."
    ]
  },
  {
    version: "2.1.1",
    date: "December 20, 2025",
    type: "Mobile UX & Checkout Improvements",
    items: [
      "Added 'Wellness Made Simple' slogan below THRIVE text on mobile hero section.",
      "Moved entire hero section up on mobile (pt-12 instead of pt-24) for better visual hierarchy.",
      "Automated popup checkout now works on all devices (mobile and desktop).",
      "Updated manual checkout instructions for better clarity.",
      "Removed footer from all cart-related pages (Cart, Checkout Processing, Checkout Loading, Checkout Manual).",
      "Improved mobile bandwidth usage by optimizing checkout flow.",
      "Fixed SPA routing for Team page on Cloudflare Pages.",
      "Enhanced mobile user experience with cleaner layout."
    ]
  },
  {
    version: "2.1.0",
    date: "December 20, 2025",
    type: "Mobile Optimization & Infrastructure",
    items: [
      "Migrated from Vercel to Cloudflare Pages for unlimited bandwidth.",
      "Removed unnecessary dependencies (ngrok, lovable-tagger, gm, sharp, express).",
      "Optimized mobile landing page: removed 'WELLNESS THAT WORKS', simplified to 'THRIVE' with 'Premium wellness products made simple'.",
      "Removed FlippingText animation on mobile for cleaner experience.",
      "Hidden product specifications on mobile for product line pages (only show on product detail pages).",
      "Moved product detail page content down on mobile to prevent navbar overlap.",
      "Disabled mouse trail animation on Team page for mobile devices.",
      "Disabled custom cursor hover descriptions on Team page for mobile.",
      "Hidden video play/pause button on mobile - video auto-plays on all devices.",
      "Centered 'THE THRIVE FACTOR' and 'MADE WITH A CONSCIENCE TO THE WORLD' text on mobile.",
      "Streamlined mobile footer: removed all navigation links, kept logo, tagline, and social icons.",
      "Dynamic changelog version in footer - automatically pulls latest version from changelog data.",
      "Fixed quantity selector positioning on mobile - now horizontal next to Add to Cart button.",
      "Centered checkout processing screen on mobile.",
      "Disabled newsletter popup on mobile devices.",
      "Improved Supabase Realtime integration for instant cache updates.",
      "Reduced bundle size and improved build performance.",
      "All assets now served from Supabase Storage (90% bandwidth reduction)."
    ]
  },
  {
    version: "2.0.2",
    date: "December 19, 2025",
    type: "Team Page & Infrastructure",
    items: [
      "Moved team images from Supabase Storage to local hosting for better reliability.",
      "Improved mouse trail animation with slower, smoother transitions.",
      "Added image preloading and caching for mouse trail effect.",
      "Increased mouse trail gap to 300px for better spacing.",
      "Added creative descriptions for all team members in custom cursor tooltip.",
      "Fixed team image loading issues with proper error handling."
    ]
  },
  {
    version: "2.0.1",
    date: "December 19, 2025",
    type: "UI/UX Improvements",
    items: [
      "Fixed product card tags visibility on Shop page with proper background and text colors.",
      "Updated category tag colors: Wellness (purple), Water Bottles (blue), Bundles (#FF88A1).",
      "Improved color swatch indicators with smart checkmark colors (black for light, white for dark).",
      "Enhanced Product Management reordering UI with drag hints for better UX.",
      "Changed footer branding to display Thrive × VE.png instead of ThriveSocial.",
      "Updated Bundles page hero gradient to #FF88A1.",
      "Made footer × symbol thinner and skinny with proper styling."
    ]
  },
  {
    version: "2.0.0",
    date: "December 19, 2025",
    type: "Major Updates",
    items: [
      "Fixed product line pages (Water Bottles, Supplements) to properly filter out phased out variants from display.",
      "Updated ProductLineSection component to exclude 'Phased Out', 'Removal Requested', and 'Removal Pending' products.",
      "Added cache-busting to product images - images now reload from Supabase on every page navigation.",
      "Fixed issue where phased out water bottle variants still appeared on product line pages despite being removed from shop.",
      "Ensured product management status changes propagate to all product pages, not just the main shop page.",
      "Change Blue Razzberry images and fix sql for Supabase (water bottles got mislabeled) (removedforprivacyreasons)"
    ]
  },
  {
    version: "1.9.2",
    date: "December 18, 2025",
    type: "Major Updates",
    items: [
      "Replaced Shipments tab with Inventory tab in Product Management for better stock tracking.",
      "Added session management with 30-minute auto-logout for security on Product Management page.",
      "Removed Sort By controls - Product Management now always defaults to manual variant ordering.",
      "Expanded Shop page grid from 4 to 3 columns with increased card height (550px) for better image visibility.",
      "Updated image upload system to use email-product-pictures bucket with automatic SKU-based naming ({SKU}.jpg).",
      "Created SQL trigger to auto-update product image URLs when images are uploaded.",
      "Added Inventory table view showing stock levels, status badges (In Stock/Low Stock/Out of Stock/Backordered), and stock tracking.",
      "Fixed Supplements page to show all Wellness category products (removed group_name filter restriction).",
      "Added 'View Supplements' link in Product Management when Wellness category is selected.",
      "Improved inventory display with stock_bought, stock_left, and status indicators.",
      "Changed image compression from PNG to JPEG format for smaller file sizes.",
      "Added persistent session tracking with activity detection (mouse, keyboard, scroll, touch)."
    ]
  },
  {
    version: "1.9.1",
    date: "December 18, 2025",
    type: "Minor Updates",
    items: [
      "Redesigned Team page with centered cards, proper image positioning (object-contain), and removed animations from department cards.",
      "Updated leadership cards to match department card styling with same hover effects.",
      "Added mouse trail effect to hero section only with square images (140x140px) that fall immediately after appearing.",
      "Completely redesigned About page with dynamic product count from Supabase, 4-stat grid (Products Available, Products Sold, Customers Served, Year Strong).",
      "Added location info to About page: 'Based in Aurora, Illinois, we've been here for one year and counting.'",
      "Updated FAQ: removed 'Track my order' question, changed return policy to no returns for tangible products, updated payment methods.",
      "Fixed Navbar dropdown selection on mobile/smaller devices with proper toggle functionality and smooth animations.",
      "Updated home page slideshow to show 3 water bottles, 3 wellness products, and 2 bundles with black background.",
      "Fixed specifications input focus issue in Product Management - cursor no longer loses focus after each character.",
      "Changed slideshow background from light to black for better contrast."
    ]
  },
  {
    version: "1.9.0",
    date: "December 17, 2025",
    type: "Supabase Tweaks and General Product Management Updates",
    items: [
      "Enhanced Product Management with drag-and-drop variant ordering that works regardless of Sort By filter.",
      "Implemented hover up/down arrows for manual reordering in list view.",
      "Added order numbers on cards in manual mode (grid and list views).",
      "Auto-saves variant order immediately on drag/drop to Supabase.",
      "Fixed edit buttons to properly open product edit modal.",
      "Improved filter UI/UX with better spacing and visual hierarchy.",
      "Fixed color swatches to display properly on all product pages.",
      "Ensured swatches follow variant_order set in ProductManagement.",
      "Updated ProductLineSection to normalize Supabase fields and sort by variant_order.",
      "Made Accessories page pull from Supabase instead of static data.",
      "All product line pages now reflect admin ordering changes.",
      "Added variant_order column to products table for persistent variant ordering."
    ]
  },
  {
    version: "1.8.4",
    date: "December 17, 2025",
    type: "Bug fixes and patches",
    items: [
      "Made checkout popup windows adaptive to different screen sizes with responsive positioning.",
      "Updated checkout popup to position on right side with full screen height.",
      "Added divider to footer brand section for better visual separation.",
      "Enhanced newsletter and mission pages with improved content positioning and matrix dots visibility."
    ]
  },
  {
    version: "1.8.3",
    date: "December 16, 2025",
    type: "Minor Fixes",
    items: [
      "Updated product status filtering to exclude 'Removal Pending' products from shop and detail pages.",
      "Added proper status options in Product Management: In Store, Removal Requested, Removal Pending, Phased Out.",
      "Updated footer branding text to reflect broader product offerings beyond supplements."
    ]
  },
  {
    version: "1.8.1",
    date: "December 16, 2025",
    type: "Updates",
    items: [
      "Improved Navbar responsiveness and animation timing; increased unscrolled height and stabilized dropdown background color.",
      "Removed Accessories category filter from the Shop page.",
      "Updated favicon to use Thrive branding.",
      "Redesigned Shipping page layout and added Aurora, IL location section with embedded map.",
      "Moved Contact and Shipping page content down for better spacing.",
      "Upgraded Product Management UI with Grid/List view toggle and click-to-edit side panel editor."
    ]
  },
  {
    version: "1.8.0",
    date: "December 15, 2025",
    type: "Major Update",
    items: [
      "Added dynamic product specifications backed by Supabase JSONB.",
      "Updated Product Detail to use Supabase data with variant-adaptive description, price, and specifications.",
      "Added specifications editor to Product Management (create + edit).",
      "Enabled product image uploads to Supabase Storage and fixed update flows.",
      "Improved Netlify readiness with environment-based Supabase configuration."
    ]
  },
  {
    version: "1.7.1",
    date: "December 14, 2025",
    type: "Stable Release",
    items: [
      "Refactored Newsletter page with unified Apple-style hero design.",
      "Redesigned Mission page hero and content layout for consistency.",
      "Enhanced Newsletter Popup with 'Cart Test' support and promo code display.",
      "Cleaned up unused page components and assets.",
      "Fixed layout structure issues on Supplements page."
    ]
  },
  {
    version: "1.7.0",
    date: "December 14, 2025",
    type: "Major Update",
    items: [
      "Standardized 'Apple Style' Hero sections across all product pages.",
      "Enhanced Shop page hero design.",
      "Improved 'Explore More' card logic with hover effects and direct variant linking.",
      "Optimized layout for product details (left-aligned actions).",
      "Fixed various layout and navigation consistency issues."
    ]
  },
  {
    version: "1.6.1",
    date: "December 14, 2025",
    type: "Stable Release",
    items: [
      "Added 'New Release' badge to Hero section.",
      "Implemented one-time newsletter popup for new visitors.",
      "Centered team photos in Team page.",
      "Connected Team Login to external portal.",
      "Improved SEO and site performance.",
      "Cleaned up unused assets and code."
    ]
  },
  {
    version: "1.5.0",
    date: "December 10, 2025",
    type: "Dev Push",
    items: [
      "Initial specialized wellness branding.",
      "Added Floating Cart functionality.",
      "Integrated checkout system with automated processing.",
      "Launched Shop and Product Detail pages."
    ]
  },
  {
    version: "1.0.0",
    date: "November 1, 2025",
    type: "Initial Launch",
    items: [
      "Project initialization.",
      "Basic routing and layout setup."
    ]
  }
];

const forbiddenKeywords = [
  'supabase', 'stock', 'inventory', 'chatbot', 'ai assistant', 'thrive ai', 'assistant',
  'private:', 'internal', 'management UI', 'administrative', 'database',
  'sql trigger', 'trigger', 'indexing', 'cache-busting'
];

export const publicChangelogData = changelogData.map(change => ({
  ...change,
  items: change.items.filter(item => {
    const lowerItem = item.toLowerCase();
    return !forbiddenKeywords.some(keyword => lowerItem.includes(keyword.toLowerCase()));
  })
})).filter(change => change.items.length > 0);
