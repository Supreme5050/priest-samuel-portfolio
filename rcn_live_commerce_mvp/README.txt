Redemption City Navigator - Live Commerce MVP Package

Replace these files in your project:
app/vendor-center.tsx
app/vendor-products.tsx
app/vendor-chat.tsx
app/vendor-dashboard.tsx
app/vendor-auth.tsx
app/rider-delivery.tsx
services/commerceLiveService.ts
services/marketOrderService.ts

Also run this SQL in Supabase SQL Editor:
rcn_live_commerce_patch.sql

What this package adds:
1. Seller signup/signin screen.
2. Seller Center buttons now open real signup/signin flow.
3. Vendor product add now saves locally and tries Supabase vendor_products.
4. Customer/vendor chat now saves messages locally and tries Supabase chat tables.
5. Market protected orders now sync to market_orders and delivery_jobs.
6. Delivery person screen can register rider, view jobs, accept jobs, and open map preview for vendor/customer destination.
7. All features keep working locally if Supabase/network fails.

Restart command:
set "REACT_NATIVE_PACKAGER_HOSTNAME=192.168.43.184" && npx expo start -c --lan --port 8081
