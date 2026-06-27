Redemption City Navigator - Market Hub backend-ready file

Replace this file in your project:
app/(tabs)/market.tsx

What changed:
- The marketplace UI structure is preserved.
- The screen now tries to load vendors and products from services/backendDataService.ts.
- If Supabase is empty, offline, or not configured, it automatically falls back to the existing hardcoded ecommerce data.
- Cart, checkout, vendor store modal, product modal, seller portal, and delivery tracking remain in the same structure.

Restart command:
set "REACT_NATIVE_PACKAGER_HOSTNAME=192.168.43.184" && npx expo start -c --lan --port 8081
