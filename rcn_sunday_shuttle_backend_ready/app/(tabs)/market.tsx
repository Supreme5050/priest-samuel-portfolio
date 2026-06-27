import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getVendors as fetchBackendVendors,
  getVendorProducts as fetchBackendProducts,
  type BackendProduct,
  type BackendVendor,
} from "@/services/backendDataService";

type Vendor = {
  id: string;
  name: string;
  category: string;
  area: string;
  rating: string;
  orders: string;
  open: boolean;
  verified: boolean;
  response: string;
  description: string;
  latitude: number;
  longitude: number;
  image: string;
};

type Product = {
  id: string;
  vendorId: string;
  name: string;
  category: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  stock: string;
  delivery: string;
  icon: keyof typeof Ionicons.glyphMap;
  image: string;
};

type CartEntry = {
  product: Product;
  quantity: number;
};

type SellerMode = "signup" | "signin";

const COLORS = {
  bg: "#F4F3EF",
  card: "#FFFFFF",
  text: "#1F2933",
  muted: "#6B7280",
  faint: "#EEF0F3",
  border: "#E4E7EC",
  primary: "#063F2C",
  gold: "#D79A2B",
  goldDark: "#A87517",
  green: "#079455",
  blue: "#1570EF",
  red: "#D92D20",
  dark: "#111827",
};

const BANNER_IMAGE =
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80";

const FALLBACK_VENDORS: Vendor[] = [
  {
    id: "grace-fashion",
    name: "Grace Fashion Hub",
    category: "Fashion & Tailoring",
    area: "Shopping Complex",
    rating: "4.8",
    orders: "240+ orders",
    open: true,
    verified: true,
    response: "Replies in 3 mins",
    description:
      "Church wears, ready-made outfits, tailoring, alterations and fashion accessories inside Redemption City.",
    latitude: 6.8144,
    longitude: 3.4624,
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "royal-wears",
    name: "Royal Wears",
    category: "Fashion & Tailoring",
    area: "Market Road",
    rating: "4.6",
    orders: "160+ orders",
    open: true,
    verified: true,
    response: "Replies in 6 mins",
    description:
      "Corporate wears, shoes, bags, church outfits and clothing accessories.",
    latitude: 6.8138,
    longitude: 3.4612,
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "crm-supermarket",
    name: "CRM Supermarket",
    category: "Groceries & Provisions",
    area: "Comfort Street",
    rating: "4.7",
    orders: "520+ orders",
    open: true,
    verified: true,
    response: "Replies in 5 mins",
    description:
      "Daily provisions, household items, toiletries, snacks, drinks and family grocery packs.",
    latitude: 6.8069,
    longitude: 3.4487,
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "comfort-mart",
    name: "Comfort Mart",
    category: "Groceries & Provisions",
    area: "Comfort Street",
    rating: "4.6",
    orders: "310+ orders",
    open: true,
    verified: true,
    response: "Replies in 6 mins",
    description:
      "Provision store for household groceries, drinks, snacks, beverages and basic daily needs.",
    latitude: 6.8073,
    longitude: 3.4494,
    image:
      "https://images.unsplash.com/photo-1601599963565-b7b50a850f29?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "mimis-restaurant",
    name: "Mimi's Restaurant",
    category: "Food & Drinks",
    area: "Winner's Road",
    rating: "4.6",
    orders: "310+ orders",
    open: true,
    verified: true,
    response: "Replies in 4 mins",
    description:
      "Fresh meals, rice dishes, snacks, drinks and fast food delivery around camp.",
    latitude: 6.8059,
    longitude: 3.4511,
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "zion-food-court",
    name: "Zion Food Court",
    category: "Food & Drinks",
    area: "Holiness Road",
    rating: "4.7",
    orders: "420+ orders",
    open: true,
    verified: true,
    response: "Replies in 5 mins",
    description:
      "Rice, swallow, soups, snacks, drinks and breakfast meals for residents and visitors.",
    latitude: 6.8124,
    longitude: 3.4587,
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "camp-print",
    name: "Camp Digital Prints",
    category: "Printing & Design",
    area: "ICT Plaza",
    rating: "4.9",
    orders: "180+ orders",
    open: true,
    verified: true,
    response: "Replies in 2 mins",
    description:
      "Flyers, banners, posters, ID cards, photocopy, document printing and design service.",
    latitude: 6.8136,
    longitude: 3.4618,
    image:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "resort-laundry",
    name: "Resort Laundry Service",
    category: "Laundry & Cleaning",
    area: "Redemption Resort",
    rating: "4.5",
    orders: "95+ orders",
    open: true,
    verified: false,
    response: "Replies in 8 mins",
    description:
      "Laundry pickup, ironing, express wash, dry cleaning and same-day delivery service.",
    latitude: 6.8026,
    longitude: 3.4479,
    image:
      "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=900&q=80",
  },
];

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "native-wear",
    vendorId: "grace-fashion",
    name: "Ready-made Native Wear",
    category: "Fashion",
    price: "₦18,500",
    oldPrice: "₦22,000",
    discount: "-16%",
    stock: "Available",
    delivery: "25–35 mins",
    icon: "shirt-outline",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "ladies-dress",
    vendorId: "grace-fashion",
    name: "Ladies Church Dress",
    category: "Fashion",
    price: "₦22,000",
    oldPrice: "₦26,500",
    discount: "-17%",
    stock: "5 left",
    delivery: "25–35 mins",
    icon: "sparkles-outline",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "men-shoes",
    vendorId: "royal-wears",
    name: "Men’s Corporate Shoes",
    category: "Fashion",
    price: "₦31,500",
    oldPrice: "₦38,000",
    discount: "-17%",
    stock: "Available",
    delivery: "30–45 mins",
    icon: "walk-outline",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "head-tie",
    vendorId: "royal-wears",
    name: "Women Head Tie / Gele",
    category: "Fashion",
    price: "₦7,500",
    oldPrice: "₦9,000",
    discount: "-17%",
    stock: "Available",
    delivery: "20–30 mins",
    icon: "ribbon-outline",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "grocery-pack",
    vendorId: "crm-supermarket",
    name: "Family Grocery Pack",
    category: "Groceries",
    price: "₦14,800",
    oldPrice: "₦17,000",
    discount: "-13%",
    stock: "Available",
    delivery: "30–45 mins",
    icon: "basket-outline",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "toiletries",
    vendorId: "crm-supermarket",
    name: "Toiletries Bundle",
    category: "Groceries",
    price: "₦8,700",
    oldPrice: "₦10,500",
    discount: "-17%",
    stock: "Available",
    delivery: "30–45 mins",
    icon: "bag-handle-outline",
    image:
      "https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "water-pack",
    vendorId: "comfort-mart",
    name: "Bottled Water Pack",
    category: "Groceries",
    price: "₦2,400",
    oldPrice: "₦2,900",
    discount: "-17%",
    stock: "Available",
    delivery: "20–30 mins",
    icon: "water-outline",
    image:
      "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "snack-box",
    vendorId: "comfort-mart",
    name: "Snack Box Bundle",
    category: "Groceries",
    price: "₦5,500",
    oldPrice: "₦6,800",
    discount: "-19%",
    stock: "Available",
    delivery: "20–30 mins",
    icon: "fast-food-outline",
    image:
      "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "jollof-chicken",
    vendorId: "mimis-restaurant",
    name: "Jollof Rice & Chicken",
    category: "Food",
    price: "₦3,500",
    oldPrice: "₦4,200",
    discount: "-17%",
    stock: "Hot meal",
    delivery: "20–30 mins",
    icon: "restaurant-outline",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "fried-rice",
    vendorId: "mimis-restaurant",
    name: "Fried Rice Combo",
    category: "Food",
    price: "₦4,000",
    oldPrice: "₦4,800",
    discount: "-17%",
    stock: "Hot meal",
    delivery: "20–30 mins",
    icon: "nutrition-outline",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "flyer-print",
    vendorId: "camp-print",
    name: "Flyer Printing",
    category: "Printing",
    price: "₦12,000",
    oldPrice: "₦15,000",
    discount: "-20%",
    stock: "Fast print",
    delivery: "1–2 hours",
    icon: "print-outline",
    image:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "laundry-express",
    vendorId: "resort-laundry",
    name: "Express Laundry Pack",
    category: "Laundry",
    price: "₦6,000",
    oldPrice: "₦7,500",
    discount: "-20%",
    stock: "Pickup available",
    delivery: "Same day",
    icon: "water-outline",
    image:
      "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=900&q=80",
  },
];

const CATEGORIES = ["All", "Fashion", "Groceries", "Food", "Printing", "Laundry"];

let ACTIVE_VENDORS: Vendor[] = FALLBACK_VENDORS;
let ACTIVE_PRODUCTS: Product[] = FALLBACK_PRODUCTS;

function backendVendorToMarketVendor(vendor: BackendVendor): Vendor {
  return {
    id: vendor.id,
    name: vendor.name,
    category: vendor.category_label || vendor.category || "General Vendor",
    area: vendor.area || vendor.address || "Redemption City",
    rating: String(vendor.rating || "4.7"),
    orders: "New vendor",
    open: vendor.is_open !== false,
    verified: true,
    response: "Replies soon",
    description:
      vendor.address ||
      `${vendor.name} is available on Redemption Market for products and services inside Redemption City.`,
    latitude: Number(vendor.latitude) || 6.8129,
    longitude: Number(vendor.longitude) || 3.4596,
    image: vendor.image_url || BANNER_IMAGE,
  };
}

function backendProductToMarketProduct(
  product: BackendProduct,
  vendor: Vendor
): Product {
  const priceNumber = Number(product.price || 0);
  const price =
    Number.isFinite(priceNumber) && priceNumber > 0
      ? `₦${priceNumber.toLocaleString("en-NG")}`
      : "Request price";

  return {
    id: product.id,
    vendorId: vendor.id,
    name: product.name,
    category: getBackendProductCategory(vendor.category),
    price,
    stock: product.in_stock === false ? "Out of stock" : "Available",
    delivery: "30–45 mins",
    icon: getMarketIcon(vendor.category),
    image: product.image_url || vendor.image,
  };
}

function getBackendProductCategory(category: string) {
  const value = category.toLowerCase();

  if (value.includes("fashion") || value.includes("tailor")) return "Fashion";
  if (value.includes("grocery") || value.includes("provision")) return "Groceries";
  if (value.includes("food") || value.includes("drink") || value.includes("restaurant")) return "Food";
  if (value.includes("print") || value.includes("design")) return "Printing";
  if (value.includes("laundry") || value.includes("clean")) return "Laundry";

  return "All";
}

function getMarketIcon(category: string): keyof typeof Ionicons.glyphMap {
  const value = category.toLowerCase();

  if (value.includes("fashion") || value.includes("tailor")) return "shirt-outline";
  if (value.includes("grocery") || value.includes("provision")) return "basket-outline";
  if (value.includes("food") || value.includes("drink") || value.includes("restaurant")) return "restaurant-outline";
  if (value.includes("print") || value.includes("design")) return "print-outline";
  if (value.includes("laundry") || value.includes("clean")) return "water-outline";

  return "bag-handle-outline";
}

export default function MarketScreen() {
  const [marketVendors, setMarketVendors] = useState<Vendor[]>(FALLBACK_VENDORS);
  const [marketProducts, setMarketProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [chatVendor, setChatVendor] = useState<Vendor | null>(null);
  const [checkoutEntries, setCheckoutEntries] = useState<CartEntry[] | null>(null);
  const [paymentEntries, setPaymentEntries] = useState<CartEntry[] | null>(null);
  const [receiptEntries, setReceiptEntries] = useState<CartEntry[] | null>(null);
  const [trackingEntries, setTrackingEntries] = useState<CartEntry[] | null>(null);
  const [activePaidOrder, setActivePaidOrder] = useState<CartEntry[] | null>(null);
  const [noDeliveryOpen, setNoDeliveryOpen] = useState(false);
  const [sellerOpen, setSellerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartEntry[]>([]);

  useEffect(() => {
    loadBackendMarket();
  }, []);

  async function loadBackendMarket() {
    try {
      const vendorResult = await fetchBackendVendors();

      if (!vendorResult.data || vendorResult.data.length === 0) {
        ACTIVE_VENDORS = FALLBACK_VENDORS;
        ACTIVE_PRODUCTS = FALLBACK_PRODUCTS;
        setMarketVendors(FALLBACK_VENDORS);
        setMarketProducts(FALLBACK_PRODUCTS);
        return;
      }

      const nextVendors = vendorResult.data.map(backendVendorToMarketVendor);

      const productGroups = await Promise.all(
        nextVendors.map(async (vendor) => {
          const backendProducts = await fetchBackendProducts(vendor.id);

          return backendProducts.map((product: BackendProduct) =>
            backendProductToMarketProduct(product, vendor)
          );
        })
      );

      const nextProducts = productGroups.flat();

      if (nextProducts.length === 0) {
        ACTIVE_VENDORS = FALLBACK_VENDORS;
        ACTIVE_PRODUCTS = FALLBACK_PRODUCTS;
        setMarketVendors(FALLBACK_VENDORS);
        setMarketProducts(FALLBACK_PRODUCTS);
        return;
      }

      ACTIVE_VENDORS = nextVendors;
      ACTIVE_PRODUCTS = nextProducts;
      setMarketVendors(nextVendors);
      setMarketProducts(nextProducts);
    } catch {
      ACTIVE_VENDORS = FALLBACK_VENDORS;
      ACTIVE_PRODUCTS = FALLBACK_PRODUCTS;
      setMarketVendors(FALLBACK_VENDORS);
      setMarketProducts(FALLBACK_PRODUCTS);
    }
  }

  const cartCount = cart.reduce((total, entry) => total + entry.quantity, 0);

  const filteredProducts = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return marketProducts.filter((product) => {
      const vendor = getVendor(product.vendorId);
      const categoryOk = activeCategory === "All" || product.category === activeCategory;

      const searchOk =
        !cleanQuery ||
        product.name.toLowerCase().includes(cleanQuery) ||
        product.category.toLowerCase().includes(cleanQuery) ||
        vendor.name.toLowerCase().includes(cleanQuery) ||
        vendor.area.toLowerCase().includes(cleanQuery);

      return categoryOk && searchOk;
    });
  }, [activeCategory, query, marketProducts]);

  const dealProducts = marketProducts.filter((product) => Boolean(product.discount)).slice(0, 8);
  const topDeals = dealProducts.length > 0 ? dealProducts : marketProducts.slice(0, 8);

  function locateVendor(vendor: Vendor) {
    router.push({
      pathname: "/map",
      params: {
        vendorId: vendor.id,
        name: vendor.name,
        lat: String(vendor.latitude),
        lng: String(vendor.longitude),
        locationName: vendor.area,
        address: vendor.area,
        category: vendor.category,
        type: "vendor",
      },
    } as any);
  }

  function openVendorDashboard() {
    setSellerOpen(false);
    router.push("/vendor-dashboard" as any);
  }

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find((entry) => entry.product.id === product.id);

      if (existing) {
        return current.map((entry) =>
          entry.product.id === product.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        );
      }

      return [...current, { product, quantity: 1 }];
    });

    setCartOpen(true);
  }

  function updateCartQuantity(productId: string, nextQuantity: number) {
    if (nextQuantity < 1) {
      setCart((current) => current.filter((entry) => entry.product.id !== productId));
      return;
    }

    setCart((current) =>
      current.map((entry) =>
        entry.product.id === productId ? { ...entry, quantity: nextQuantity } : entry
      )
    );
  }

  function openDeliveryTracking() {
    if (activePaidOrder && activePaidOrder.length > 0) {
      setTrackingEntries(activePaidOrder);
      return;
    }

    setNoDeliveryOpen(true);
  }

  function startCheckout(entries: CartEntry[]) {
    if (entries.length === 0) return;
    setCheckoutEntries(entries);
  }

  function proceedToPayment(entries: CartEntry[]) {
    setCheckoutEntries(null);
    setPaymentEntries(entries);
  }

  function backToCheckout(entries: CartEntry[]) {
    setPaymentEntries(null);
    setCheckoutEntries(entries);
  }

  function cancelPayment() {
    setPaymentEntries(null);
  }

  function confirmPayment(entries: CartEntry[]) {
    setCheckoutEntries(null);
    setPaymentEntries(null);
    setReceiptEntries(entries);
    setActivePaidOrder(entries);
    setCart([]);
  }

  function trackReceiptOrder(entries: CartEntry[]) {
    setReceiptEntries(null);
    setTrackingEntries(entries);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.card} />

      <View style={styles.topBar}>
        <Pressable style={styles.iconButton} onPress={() => setMenuOpen(true)}>
          <Ionicons name="menu" size={25} color={COLORS.dark} />
        </Pressable>

        <View style={styles.logoWrap}>
          <View style={styles.logoBadge}>
            <Ionicons name="storefront" size={12} color="#FFFFFF" />
          </View>
          <Text style={styles.logoText}>REDEMPTION MARKET</Text>
        </View>

        <View style={styles.topActions}>
          <Pressable style={styles.sellerButton} onPress={() => setSellerOpen(true)}>
            <Ionicons name="person-add-outline" size={18} color={COLORS.dark} />
          </Pressable>

          <Pressable style={styles.cartTopButton} onPress={() => setCartOpen(true)}>
            <Ionicons name="cart-outline" size={25} color={COLORS.dark} />
            {cartCount > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={22} color={COLORS.dark} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search products, vendors or areas"
            placeholderTextColor="#7A7F87"
            style={styles.searchInput}
          />
        </View>

        <VendorBanner onPress={() => setSellerOpen(true)} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((category) => (
            <Pressable
              key={category}
              onPress={() => setActiveCategory(category)}
              style={[
                styles.categoryChip,
                activeCategory === category && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <CommerceSection
          title="Featured Deals"
          action="See All"
          products={topDeals}
          onProductPress={setSelectedProduct}
        />

        <StoreRailSection
          title="Verified Stores"
          action="Open Store"
          vendors={marketVendors}
          onOpen={setSelectedVendor}
          onChat={setChatVendor}
          onLocate={locateVendor}
        />

        <StoreRailSection
          title="Fashion Stores"
          action="See All"
          vendors={marketVendors.filter((vendor) => vendor.category.includes("Fashion"))}
          onOpen={setSelectedVendor}
          onChat={setChatVendor}
          onLocate={locateVendor}
        />

        <StoreRailSection
          title="Groceries & Provisions"
          action="See All"
          vendors={marketVendors.filter((vendor) => vendor.category.includes("Groceries"))}
          onOpen={setSelectedVendor}
          onChat={setChatVendor}
          onLocate={locateVendor}
        />

        <StoreRailSection
          title="Food & Drinks"
          action="See All"
          vendors={marketVendors.filter((vendor) => vendor.category.includes("Food"))}
          onOpen={setSelectedVendor}
          onChat={setChatVendor}
          onLocate={locateVendor}
        />

        <StoreRailSection
          title="Printing & Design"
          action="See All"
          vendors={marketVendors.filter((vendor) => vendor.category.includes("Printing"))}
          onOpen={setSelectedVendor}
          onChat={setChatVendor}
          onLocate={locateVendor}
        />

        <StoreRailSection
          title="Laundry Services"
          action="See All"
          vendors={marketVendors.filter((vendor) => vendor.category.includes("Laundry"))}
          onOpen={setSelectedVendor}
          onChat={setChatVendor}
          onLocate={locateVendor}
        />

        <SectionHeader title="All Products" action={`${filteredProducts.length} items`} />

        <View style={styles.grid}>
          {filteredProducts.map((product) => (
            <ProductTile
              key={product.id}
              product={product}
              compact={false}
              onPress={() => setSelectedProduct(product)}
            />
          ))}
        </View>

        <Pressable style={styles.deliveryPreview} onPress={openDeliveryTracking}>
          <View style={styles.deliveryLeft}>
            <Ionicons name="cube-outline" size={25} color={COLORS.gold} />
          </View>
          <View style={styles.deliveryMid}>
            <Text style={styles.deliveryTitle}>Combined delivery tracking</Text>
            <Text style={styles.deliveryText}>
              Tracking starts after payment confirmation. All items are delivered together.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={21} color={COLORS.muted} />
        </Pressable>
      </ScrollView>

      <MenuModal
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSeller={() => {
          setMenuOpen(false);
          setSellerOpen(true);
        }}
        onCart={() => {
          setMenuOpen(false);
          setCartOpen(true);
        }}
        onTracking={() => {
          setMenuOpen(false);
          openDeliveryTracking();
        }}
      />

      <CartModal
        visible={cartOpen}
        cart={cart}
        onClose={() => setCartOpen(false)}
        onQuantityChange={updateCartQuantity}
        onCheckout={(entries) => {
          setCartOpen(false);
          startCheckout(entries);
        }}
      />

      <CheckoutSummaryModal
        entries={checkoutEntries}
        onClose={() => setCheckoutEntries(null)}
        onProceed={proceedToPayment}
      />

      <PaymentPageModal
        entries={paymentEntries}
        onClose={() => setPaymentEntries(null)}
        onBack={backToCheckout}
        onCancel={cancelPayment}
        onConfirm={confirmPayment}
      />

      <ReceiptModal
        entries={receiptEntries}
        onClose={() => setReceiptEntries(null)}
        onTrack={trackReceiptOrder}
      />

      <VendorStoreModal
        vendor={selectedVendor}
        onClose={() => setSelectedVendor(null)}
        onChat={(vendor) => setChatVendor(vendor)}
        onLocate={locateVendor}
        onProduct={(product) => setSelectedProduct(product)}
      />

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(product) => {
          setSelectedProduct(null);
          addToCart(product);
        }}
        onChat={(vendor) => setChatVendor(vendor)}
        onStore={(vendor) => setSelectedVendor(vendor)}
        onLocate={locateVendor}
        onOrder={(product) => {
          setSelectedProduct(null);
          startCheckout([{ product, quantity: 1 }]);
        }}
      />

      <ChatModal vendor={chatVendor} onClose={() => setChatVendor(null)} />

      <TrackingModal entries={trackingEntries} onClose={() => setTrackingEntries(null)} />

      <NoDeliveryModal
        visible={noDeliveryOpen}
        onClose={() => setNoDeliveryOpen(false)}
        onCart={() => {
          setNoDeliveryOpen(false);
          setCartOpen(true);
        }}
      />

      <SellerAccessModal
        visible={sellerOpen}
        onClose={() => setSellerOpen(false)}
        onOpenDashboard={openVendorDashboard}
      />
    </SafeAreaView>
  );
}

function getVendor(vendorId: string) {
  return (
    ACTIVE_VENDORS.find((vendor) => vendor.id === vendorId) ||
    ACTIVE_VENDORS[0] ||
    FALLBACK_VENDORS[0]
  );
}

function getVendorProducts(vendorId: string) {
  return ACTIVE_PRODUCTS.filter((product) => product.vendorId === vendorId);
}

function parseNaira(value: string) {
  const numeric = Number(value.replace(/[^\d]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function getCheckoutTotals(entries: CartEntry[]) {
  const subtotal = entries.reduce(
    (total, entry) => total + parseNaira(entry.product.price) * entry.quantity,
    0
  );

  const itemCount = entries.reduce((total, entry) => total + entry.quantity, 0);
  const serviceFee = entries.length > 0 ? 500 : 0;
  const total = subtotal + serviceFee;

  return { subtotal, serviceFee, total, itemCount };
}

function getOrderReference() {
  return "RC-2041";
}

function getPaymentReference() {
  return "PAY-RC-2041";
}

function getReceiptDate() {
  return new Date().toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function VendorBanner({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.bannerWrap} onPress={onPress}>
      <ImageBackground
        source={{ uri: BANNER_IMAGE }}
        style={styles.bannerImage}
        imageStyle={styles.bannerImageRadius}
      >
        <View style={styles.bannerOverlay} />

        <View style={styles.bannerContent}>
          <Text style={styles.bannerKicker}>VENDOR REGISTRATION</Text>
          <Text style={styles.bannerTitle}>Bring your shop online</Text>
          <Text style={styles.bannerText}>
            Register your business, upload your products and manage orders from a vendor dashboard.
          </Text>

          <View style={styles.bannerButton}>
            <Text style={styles.bannerButtonText}>START SELLING</Text>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

function SectionHeader({ title, action }: { title: string; action: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
      <Text style={styles.sectionHeaderAction}>{action}</Text>
    </View>
  );
}

function SheetHandle({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.sheetHandleButton} onPress={onPress}>
      <View style={styles.sheetHandle} />
    </Pressable>
  );
}

function ProductPhoto({ product, large }: { product: Product; large?: boolean }) {
  return (
    <ImageBackground
      source={{ uri: product.image }}
      style={[styles.productPhoto, large && styles.productPhotoLarge]}
      imageStyle={styles.productPhotoRadius}
    >
      <View style={styles.productPhotoShade} />

      <View style={styles.photoTopRow}>
        <View style={styles.photoCategoryPill}>
          <Ionicons name={product.icon} size={11} color={COLORS.primary} />
          <Text style={styles.photoCategoryText}>{product.category}</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

function StorePhoto({ vendor }: { vendor: Vendor }) {
  return (
    <ImageBackground
      source={{ uri: vendor.image }}
      style={styles.storePhoto}
      imageStyle={styles.storePhotoRadius}
    >
      <View style={styles.storePhotoShade} />

      <View style={styles.storePhotoBottom}>
        <Text style={styles.storePhotoTitle} numberOfLines={1}>
          {vendor.category}
        </Text>
        <Text style={styles.storePhotoSub} numberOfLines={1}>
          {vendor.area}
        </Text>
      </View>
    </ImageBackground>
  );
}

function VendorThumb({ vendor }: { vendor: Vendor }) {
  return (
    <ImageBackground
      source={{ uri: vendor.image }}
      style={styles.vendorThumb}
      imageStyle={styles.vendorThumbRadius}
    >
      <View style={styles.vendorThumbShade}>
        <Ionicons name="storefront" size={18} color="#FFFFFF" />
      </View>
    </ImageBackground>
  );
}

function CommerceSection({
  title,
  action,
  products,
  onProductPress,
}: {
  title: string;
  action: string;
  products: Product[];
  onProductPress: (product: Product) => void;
}) {
  return (
    <View style={styles.sectionBlock}>
      <SectionHeader title={title} action={action} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productRail}
      >
        {products.map((product) => (
          <ProductTile
            key={product.id}
            product={product}
            compact
            onPress={() => onProductPress(product)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function StoreRailSection({
  title,
  action,
  vendors,
  onOpen,
  onChat,
  onLocate,
}: {
  title: string;
  action: string;
  vendors: Vendor[];
  onOpen: (vendor: Vendor) => void;
  onChat: (vendor: Vendor) => void;
  onLocate: (vendor: Vendor) => void;
}) {
  return (
    <View style={styles.sectionBlock}>
      <SectionHeader title={title} action={action} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storeRow}
      >
        {vendors.map((vendor) => (
          <StoreCard
            key={vendor.id}
            vendor={vendor}
            productCount={getVendorProducts(vendor.id).length}
            onPress={() => onOpen(vendor)}
            onChat={() => onChat(vendor)}
            onLocate={() => onLocate(vendor)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function ProductTile({
  product,
  compact,
  onPress,
}: {
  product: Product;
  compact: boolean;
  onPress: () => void;
}) {
  const vendor = getVendor(product.vendorId);

  return (
    <Pressable
      style={[styles.productTile, compact ? styles.compactTile : styles.gridTile]}
      onPress={onPress}
    >
      <View style={styles.productImageBox}>
        {product.discount ? (
          <View style={styles.discountTag}>
            <Text style={styles.discountText}>{product.discount}</Text>
          </View>
        ) : null}

        <ProductPhoto product={product} />
      </View>

      <Text style={styles.productName} numberOfLines={2}>
        {product.name}
      </Text>

      <Text style={styles.vendorMiniName} numberOfLines={1}>
        {vendor.name}
      </Text>

      <Text style={styles.productPrice}>{product.price}</Text>

      {product.oldPrice ? <Text style={styles.oldPrice}>{product.oldPrice}</Text> : null}

      <Text style={styles.productDelivery} numberOfLines={1}>
        {product.delivery} delivery
      </Text>
    </Pressable>
  );
}

function StoreCard({
  vendor,
  productCount,
  onPress,
  onChat,
  onLocate,
}: {
  vendor: Vendor;
  productCount: number;
  onPress: () => void;
  onChat: () => void;
  onLocate: () => void;
}) {
  return (
    <View style={styles.storeCard}>
      <Pressable onPress={onPress}>
        <StorePhoto vendor={vendor} />

        <View style={styles.storeStatusRow}>
          {vendor.verified ? (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.green} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          ) : (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          )}
        </View>

        <Text style={styles.storeName} numberOfLines={1}>
          {vendor.name}
        </Text>
        <Text style={styles.storeCategory} numberOfLines={1}>
          {vendor.category}
        </Text>

        <View style={styles.storeMetaRow}>
          <Ionicons name="star" size={13} color={COLORS.gold} />
          <Text style={styles.storeMetaText}>{vendor.rating}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.storeMetaText}>{productCount} products</Text>
        </View>

        <Text style={styles.storeArea} numberOfLines={1}>
          {vendor.area}
        </Text>
      </Pressable>

      <View style={styles.storeButtonRow}>
        <Pressable style={styles.openStoreButton} onPress={onPress}>
          <Text style={styles.openStoreText}>Open Store</Text>
        </Pressable>

        <Pressable style={styles.locateSmallButton} onPress={onLocate}>
          <Ionicons name="navigate-outline" size={16} color={COLORS.primary} />
        </Pressable>

        <Pressable style={styles.chatSmallButton} onPress={onChat}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={COLORS.primary} />
        </Pressable>
      </View>
    </View>
  );
}

function OrderItemsList({
  entries,
  compact,
}: {
  entries: CartEntry[];
  compact?: boolean;
}) {
  return (
    <View style={styles.orderItemsBox}>
      {entries.map((entry) => {
        const vendor = getVendor(entry.product.vendorId);

        return (
          <View key={entry.product.id} style={styles.orderItemRow}>
            <View style={compact ? styles.orderItemImageSmall : styles.orderItemImage}>
              <ImageBackground
                source={{ uri: entry.product.image }}
                style={styles.cartItemImage}
                imageStyle={styles.cartItemImageRadius}
              />
            </View>

            <View style={styles.orderItemText}>
              <Text style={styles.orderItemName} numberOfLines={2}>
                {entry.product.name}
              </Text>
              <Text style={styles.orderItemVendor} numberOfLines={1}>
                {vendor.name} · Qty {entry.quantity}
              </Text>
            </View>

            <Text style={styles.orderItemPrice}>
              {formatNaira(parseNaira(entry.product.price) * entry.quantity)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function StatusPill({
  type,
  text,
}: {
  type: "awaiting" | "confirmed" | "paid";
  text: string;
}) {
  return (
    <View
      style={[
        styles.statusPill,
        type === "awaiting" && styles.statusPillAwaiting,
        type === "confirmed" && styles.statusPillConfirmed,
        type === "paid" && styles.statusPillPaid,
      ]}
    >
      <Text
        style={[
          styles.statusPillText,
          type === "awaiting" && styles.statusPillTextAwaiting,
          type === "confirmed" && styles.statusPillTextConfirmed,
          type === "paid" && styles.statusPillTextPaid,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

function MenuModal({
  visible,
  onClose,
  onSeller,
  onCart,
  onTracking,
}: {
  visible: boolean;
  onClose: () => void;
  onSeller: () => void;
  onCart: () => void;
  onTracking: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.drawerOverlay}>
        <View style={styles.drawer}>
          <View style={styles.drawerHeader}>
            <View style={styles.drawerLogo}>
              <Ionicons name="storefront" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.drawerTitle}>Redemption Market</Text>
              <Text style={styles.drawerSub}>Marketplace menu</Text>
            </View>
          </View>

          <DrawerItem icon="home-outline" title="Marketplace Home" text="Browse products and stores" onPress={onClose} />
          <DrawerItem icon="cart-outline" title="My Cart" text="View selected items" onPress={onCart} />
          <DrawerItem icon="card-outline" title="Checkout & Payment" text="Pay once through app protection" onPress={onCart} />
          <DrawerItem icon="cube-outline" title="Combined Delivery" text="Receive all paid items together" onPress={onTracking} />
          <DrawerItem icon="business-outline" title="Vendor Portal" text="Register, sign in and manage store" onPress={onSeller} />
          <DrawerItem icon="shield-checkmark-outline" title="Protected Orders" text="Buyer and seller protection" onPress={onClose} />
          <DrawerItem icon="help-circle-outline" title="Help & Support" text="Contact market support" onPress={onClose} />

          <Pressable style={styles.drawerCloseButton} onPress={onClose}>
            <Text style={styles.drawerCloseText}>Close Menu</Text>
          </Pressable>
        </View>

        <Pressable style={styles.drawerBackdrop} onPress={onClose} />
      </View>
    </Modal>
  );
}

function DrawerItem({
  icon,
  title,
  text,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.drawerItem} onPress={onPress}>
      <View style={styles.drawerItemIcon}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>
      <View style={styles.drawerItemText}>
        <Text style={styles.drawerItemTitle}>{title}</Text>
        <Text style={styles.drawerItemSub}>{text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
    </Pressable>
  );
}

function CartModal({
  visible,
  cart,
  onClose,
  onQuantityChange,
  onCheckout,
}: {
  visible: boolean;
  cart: CartEntry[];
  onClose: () => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  onCheckout: (entries: CartEntry[]) => void;
}) {
  const { subtotal, serviceFee, total } = getCheckoutTotals(cart);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.cartSheet}>
          <SheetHandle onPress={onClose} />

          <View style={styles.cartHeader}>
            <View>
              <Text style={styles.cartSmall}>Shopping cart</Text>
              <Text style={styles.cartTitle}>My Cart</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.dark} />
            </Pressable>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <Ionicons name="cart-outline" size={50} color={COLORS.muted} />
              <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
              <Text style={styles.emptyCartText}>
                Open a product and tap “Add to cart” to start a protected order.
              </Text>
            </View>
          ) : (
            <>
              <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
                {cart.map((entry) => {
                  const vendor = getVendor(entry.product.vendorId);

                  return (
                    <View key={entry.product.id} style={styles.cartItem}>
                      <View style={styles.cartImageBox}>
                        <ImageBackground
                          source={{ uri: entry.product.image }}
                          style={styles.cartItemImage}
                          imageStyle={styles.cartItemImageRadius}
                        />
                      </View>

                      <View style={styles.cartItemMain}>
                        <Text style={styles.cartItemName} numberOfLines={2}>
                          {entry.product.name}
                        </Text>
                        <Text style={styles.cartItemVendor} numberOfLines={1}>
                          {vendor.name}
                        </Text>
                        <Text style={styles.cartItemPrice}>{entry.product.price}</Text>
                      </View>

                      <View style={styles.quantityBox}>
                        <Pressable
                          style={styles.qtyButton}
                          onPress={() =>
                            onQuantityChange(entry.product.id, entry.quantity - 1)
                          }
                        >
                          <Ionicons name="remove" size={15} color={COLORS.dark} />
                        </Pressable>

                        <Text style={styles.qtyText}>{entry.quantity}</Text>

                        <Pressable
                          style={styles.qtyButton}
                          onPress={() =>
                            onQuantityChange(entry.product.id, entry.quantity + 1)
                          }
                        >
                          <Ionicons name="add" size={15} color={COLORS.dark} />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              <View style={styles.summaryBox}>
                <SummaryRow label="Subtotal" value={formatNaira(subtotal)} />
                <SummaryRow label="Combined delivery estimate" value={formatNaira(serviceFee)} />
                <View style={styles.summaryDivider} />
                <SummaryRow label="Total" value={formatNaira(total)} bold />
              </View>

              <View style={styles.cartProtectionBox}>
                <Ionicons name="shield-checkmark-outline" size={19} color={COLORS.primary} />
                <Text style={styles.cartProtectionText}>
                  You pay once. All items in this order will be prepared and delivered together.
                </Text>
              </View>

              <Pressable style={styles.outlineButton} onPress={onClose}>
                <Ionicons name="storefront-outline" size={20} color={COLORS.primary} />
                <Text style={styles.outlineButtonText}>Return to Shopping</Text>
              </Pressable>

              <Pressable style={styles.buyButton} onPress={() => onCheckout(cart)}>
                <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                <Text style={styles.buyButtonText}>Checkout</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && styles.summaryBold]}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.summaryBold]}>{value}</Text>
    </View>
  );
}

function CheckoutSummaryModal({
  entries,
  onClose,
  onProceed,
}: {
  entries: CartEntry[] | null;
  onClose: () => void;
  onProceed: (entries: CartEntry[]) => void;
}) {
  if (!entries) return null;

  const { subtotal, serviceFee, total, itemCount } = getCheckoutTotals(entries);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.checkoutSheet}>
          <SheetHandle onPress={onClose} />

          <View style={styles.cartHeader}>
            <View>
              <Text style={styles.cartSmall}>Order checkout</Text>
              <Text style={styles.cartTitle}>Order Summary</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.dark} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.checkoutInfoCard}>
              <View style={styles.checkoutInfoIcon}>
                <Ionicons name="bag-check-outline" size={23} color={COLORS.primary} />
              </View>
              <View style={styles.checkoutInfoText}>
                <Text style={styles.checkoutInfoTitle}>
                  {itemCount} {itemCount === 1 ? "item" : "items"} in this order
                </Text>
                <Text style={styles.checkoutInfoSub}>
                  Pay once. Vendors prepare items separately, then one rider delivers the complete package.
                </Text>
              </View>
            </View>

            <Text style={styles.paymentSectionTitle}>Items</Text>
            <OrderItemsList entries={entries} />

            <Text style={styles.paymentSectionTitle}>Delivery plan</Text>
            <View style={styles.checkoutDeliveryCard}>
              <View style={styles.deliveryIconBox}>
                <Ionicons name="cube-outline" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.checkoutDeliveryText}>
                <Text style={styles.checkoutDeliveryTitle}>Combined delivery</Text>
                <Text style={styles.checkoutDeliverySub}>
                  Delivery starts only after all items are ready for pickup, so the customer receives the complete order together.
                </Text>
              </View>
            </View>

            <View style={styles.summaryBox}>
              <SummaryRow label="Subtotal" value={formatNaira(subtotal)} />
              <SummaryRow label="Combined delivery estimate" value={formatNaira(serviceFee)} />
              <View style={styles.summaryDivider} />
              <SummaryRow label="Total to pay" value={formatNaira(total)} bold />
            </View>

            <Pressable style={styles.buyButton} onPress={() => onProceed(entries)}>
              <Ionicons name="card-outline" size={20} color="#FFFFFF" />
              <Text style={styles.buyButtonText}>Proceed to Payment</Text>
            </Pressable>

            <Pressable style={styles.outlineButton} onPress={onClose}>
              <Ionicons name="arrow-back-outline" size={20} color={COLORS.primary} />
              <Text style={styles.outlineButtonText}>Back to Market</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function PaymentPageModal({
  entries,
  onClose,
  onBack,
  onCancel,
  onConfirm,
}: {
  entries: CartEntry[] | null;
  onClose: () => void;
  onBack: (entries: CartEntry[]) => void;
  onCancel: () => void;
  onConfirm: (entries: CartEntry[]) => void;
}) {
  if (!entries) return null;

  const { subtotal, serviceFee, total, itemCount } = getCheckoutTotals(entries);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.paymentSheet}>
          <SheetHandle onPress={onClose} />

          <View style={styles.cartHeader}>
            <View>
              <Text style={styles.cartSmall}>Secure app payment</Text>
              <Text style={styles.cartTitle}>Payment Page</Text>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.dark} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.paymentAmountCard}>
              <Text style={styles.paymentAmountLabel}>Amount to pay</Text>
              <Text style={styles.paymentAmount}>{formatNaira(total)}</Text>
              <Text style={styles.paymentAmountSub}>
                {itemCount} {itemCount === 1 ? "item" : "items"} · Ref {getPaymentReference()}
              </Text>
            </View>

            <View style={styles.statusCard}>
              <View>
                <Text style={styles.statusTitle}>Payment status</Text>
                <Text style={styles.statusSub}>Waiting for customer payment confirmation</Text>
              </View>
              <StatusPill type="awaiting" text="Awaiting Payment" />
            </View>

            <Text style={styles.paymentSectionTitle}>Payment method</Text>

            <View style={styles.paymentMethodCard}>
              <View style={styles.paymentMethodIcon}>
                <Ionicons name="card-outline" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.paymentMethodText}>
                <Text style={styles.paymentMethodTitle}>Card / Transfer / USSD</Text>
                <Text style={styles.paymentMethodSub}>
                  Real payment gateway will connect here during backend integration.
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={22} color={COLORS.green} />
            </View>

            <Text style={styles.paymentSectionTitle}>Order Summary</Text>
            <OrderItemsList entries={entries} compact />

            <View style={styles.summaryBox}>
              <SummaryRow label="Subtotal" value={formatNaira(subtotal)} />
              <SummaryRow label="Combined delivery estimate" value={formatNaira(serviceFee)} />
              <View style={styles.summaryDivider} />
              <SummaryRow label="Total" value={formatNaira(total)} bold />
            </View>

            <View style={styles.appWalletBox}>
              <View style={styles.walletTopRow}>
                <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.green} />
                <Text style={styles.walletTitle}>App payment protection</Text>
              </View>

              <Text style={styles.walletText}>
                Customer pays once into the app. The order moves to combined delivery only after payment is confirmed.
              </Text>

              <ReceiptRow label="Payment reference" value={getPaymentReference()} />
              <ReceiptRow label="Order reference" value={getOrderReference()} />
            </View>

            <View style={styles.paymentNote}>
              <Ionicons name="information-circle-outline" size={19} color={COLORS.goldDark} />
              <Text style={styles.paymentNoteText}>
                Demo mode: tap “Confirm Payment” to simulate successful payment. Backend will later connect this to a real payment provider.
              </Text>
            </View>

            <Pressable style={styles.buyButton} onPress={() => onConfirm(entries)}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.buyButtonText}>Confirm Payment</Text>
            </Pressable>

            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Ionicons name="close-circle-outline" size={20} color={COLORS.red} />
              <Text style={styles.cancelButtonText}>Cancel Payment</Text>
            </Pressable>

            <Pressable style={styles.outlineButton} onPress={() => onBack(entries)}>
              <Ionicons name="arrow-back-outline" size={20} color={COLORS.primary} />
              <Text style={styles.outlineButtonText}>Back to Checkout</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ReceiptModal({
  entries,
  onClose,
  onTrack,
}: {
  entries: CartEntry[] | null;
  onClose: () => void;
  onTrack: (entries: CartEntry[]) => void;
}) {
  if (!entries) return null;

  const { subtotal, serviceFee, total, itemCount } = getCheckoutTotals(entries);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.receiptSheet}>
          <SheetHandle onPress={onClose} />

          <View style={styles.cartHeader}>
            <View>
              <Text style={styles.cartSmall}>Payment receipt</Text>
              <Text style={styles.cartTitle}>Payment Confirmed</Text>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.dark} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.receiptHero}>
              <Ionicons name="checkmark-circle" size={48} color={COLORS.green} />
              <Text style={styles.receiptHeroTitle}>Your payment is confirmed</Text>
              <Text style={styles.receiptHeroText}>
                {itemCount} {itemCount === 1 ? "item" : "items"} paid successfully. Vendors can now prepare the order.
              </Text>
            </View>

            <View style={styles.statusCard}>
              <View>
                <Text style={styles.statusTitle}>Payment status</Text>
                <Text style={styles.statusSub}>Payment has been verified for demo</Text>
              </View>
              <StatusPill type="confirmed" text="Payment Confirmed" />
            </View>

            <View style={styles.statusCard}>
              <View>
                <Text style={styles.statusTitle}>Order status</Text>
                <Text style={styles.statusSub}>Paid order is now waiting for vendor preparation</Text>
              </View>
              <StatusPill type="paid" text="Paid" />
            </View>

            <Text style={styles.paymentSectionTitle}>Receipt details</Text>

            <View style={styles.appWalletBox}>
              <ReceiptRow label="Payment reference" value={getPaymentReference()} />
              <ReceiptRow label="Order reference" value={getOrderReference()} />
              <ReceiptRow label="Date" value={getReceiptDate()} />
              <ReceiptRow label="Items" value={`${itemCount}`} />
            </View>

            <Text style={styles.paymentSectionTitle}>Items paid for</Text>
            <OrderItemsList entries={entries} compact />

            <View style={styles.summaryBox}>
              <SummaryRow label="Product amount" value={formatNaira(subtotal)} />
              <SummaryRow label="Combined delivery estimate" value={formatNaira(serviceFee)} />
              <View style={styles.summaryDivider} />
              <SummaryRow label="Total paid" value={formatNaira(total)} bold />
            </View>

            <View style={styles.paymentNote}>
              <Ionicons name="cube-outline" size={19} color={COLORS.goldDark} />
              <Text style={styles.paymentNoteText}>
                Next status: Vendors prepare items, then rider/admin collects everything into one complete package for delivery.
              </Text>
            </View>

            <Pressable style={styles.buyButton} onPress={() => onTrack(entries)}>
              <Ionicons name="cube-outline" size={20} color="#FFFFFF" />
              <Text style={styles.buyButtonText}>Track Combined Delivery</Text>
            </Pressable>

            <Pressable style={styles.outlineButton} onPress={onClose}>
              <Ionicons name="storefront-outline" size={20} color={COLORS.primary} />
              <Text style={styles.outlineButtonText}>Return to Market</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.walletInfoRow}>
      <Text style={styles.walletInfoLabel}>{label}</Text>
      <Text style={styles.walletInfoValue}>{value}</Text>
    </View>
  );
}

function VendorStoreModal({
  vendor,
  onClose,
  onChat,
  onLocate,
  onProduct,
}: {
  vendor: Vendor | null;
  onClose: () => void;
  onChat: (vendor: Vendor) => void;
  onLocate: (vendor: Vendor) => void;
  onProduct: (product: Product) => void;
}) {
  const [storeQuery, setStoreQuery] = useState("");

  if (!vendor) return null;

  const products = getVendorProducts(vendor.id).filter((product) => {
    const cleanQuery = storeQuery.trim().toLowerCase();
    if (!cleanQuery) return true;

    return (
      product.name.toLowerCase().includes(cleanQuery) ||
      product.category.toLowerCase().includes(cleanQuery)
    );
  });

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.storeSheet}>
          <SheetHandle onPress={onClose} />

          <View style={styles.storeHeader}>
            <VendorThumb vendor={vendor} />

            <View style={styles.storeHeaderText}>
              <View style={styles.storeNameLine}>
                <Text style={styles.storeSheetName} numberOfLines={1}>
                  {vendor.name}
                </Text>
                {vendor.verified ? (
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.green} />
                ) : null}
              </View>

              <Text style={styles.storeSheetCategory}>{vendor.category}</Text>
              <Text style={styles.storeSheetMeta}>
                {vendor.area} · {vendor.rating} ★ · {vendor.orders}
              </Text>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.dark} />
            </Pressable>
          </View>

          <ImageBackground
            source={{ uri: vendor.image }}
            style={styles.storeHero}
            imageStyle={styles.storeHeroRadius}
          >
            <View style={styles.storeHeroShade} />
            <View style={styles.storeHeroTextBox}>
              <Text style={styles.storeHeroTitle} numberOfLines={1}>
                {vendor.name}
              </Text>
              <Text style={styles.storeHeroSub} numberOfLines={1}>
                {vendor.category} · {vendor.area}
              </Text>
            </View>
          </ImageBackground>

          <Text style={styles.storeDescription}>{vendor.description}</Text>

          <View style={styles.storeActions}>
            <Pressable style={styles.storePrimaryButton} onPress={() => onChat(vendor)}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFFFFF" />
              <Text style={styles.storePrimaryText}>Chat Vendor</Text>
            </Pressable>

            <Pressable style={styles.storeSecondaryButton} onPress={() => onLocate(vendor)}>
              <Ionicons name="navigate-outline" size={18} color={COLORS.primary} />
              <Text style={styles.storeSecondaryText}>Locate</Text>
            </Pressable>
          </View>

          <View style={styles.storeSearch}>
            <Ionicons name="search" size={18} color={COLORS.muted} />
            <TextInput
              value={storeQuery}
              onChangeText={setStoreQuery}
              placeholder="Search everything this vendor sells"
              placeholderTextColor="#8B9099"
              style={styles.storeSearchInput}
            />
          </View>

          <SectionHeader title="Full Store Catalogue" action={`${products.length} items`} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {products.map((product) => (
                <ProductTile
                  key={product.id}
                  product={product}
                  compact={false}
                  onPress={() => onProduct(product)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ProductModal({
  product,
  onClose,
  onAddToCart,
  onChat,
  onStore,
  onLocate,
  onOrder,
}: {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onChat: (vendor: Vendor) => void;
  onStore: (vendor: Vendor) => void;
  onLocate: (vendor: Vendor) => void;
  onOrder: (product: Product) => void;
}) {
  if (!product) return null;

  const vendor = getVendor(product.vendorId);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.productSheet}>
          <SheetHandle onPress={onClose} />

          <View style={styles.productModalTop}>
            <View style={styles.productModalImage}>
              {product.discount ? (
                <View style={styles.discountTag}>
                  <Text style={styles.discountText}>{product.discount}</Text>
                </View>
              ) : null}
              <ProductPhoto product={product} large />
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.dark} />
            </Pressable>
          </View>

          <Text style={styles.productModalName}>{product.name}</Text>
          <Text style={styles.productModalPrice}>{product.price}</Text>
          {product.oldPrice ? (
            <Text style={styles.productModalOldPrice}>{product.oldPrice}</Text>
          ) : null}

          <Pressable style={styles.vendorLine} onPress={() => onStore(vendor)}>
            <VendorThumb vendor={vendor} />

            <View style={styles.vendorLineText}>
              <Text style={styles.vendorLineName}>{vendor.name}</Text>
              <Text style={styles.vendorLineSub}>
                {vendor.area} · {vendor.rating} ★ · Open full store
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </Pressable>

          <View style={styles.infoPanel}>
            <InfoRow icon="cube-outline" label="Stock" value={product.stock} />
            <InfoRow icon="car-outline" label="Delivery ETA" value={product.delivery} />
            <InfoRow icon="shield-checkmark-outline" label="Protection" value="Pay once, receive complete order" />
          </View>

          <Pressable style={styles.buyButton} onPress={() => onOrder(product)}>
            <Ionicons name="card-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buyButtonText}>Proceed to Checkout</Text>
          </Pressable>

          <Pressable style={styles.cartActionButton} onPress={() => onAddToCart(product)}>
            <Ionicons name="cart-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cartActionText}>Add to Cart</Text>
          </Pressable>

          <Pressable style={styles.outlineButton} onPress={() => onLocate(vendor)}>
            <Ionicons name="navigate-outline" size={20} color={COLORS.primary} />
            <Text style={styles.outlineButtonText}>Locate Vendor Store</Text>
          </Pressable>

          <Pressable style={styles.outlineButton} onPress={() => onChat(vendor)}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.primary} />
            <Text style={styles.outlineButtonText}>Chat Vendor</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={19} color={COLORS.primary} />
      <View style={styles.infoRowText}>
        <Text style={styles.infoRowLabel}>{label}</Text>
        <Text style={styles.infoRowValue}>{value}</Text>
      </View>
    </View>
  );
}

function ChatModal({ vendor, onClose }: { vendor: Vendor | null; onClose: () => void }) {
  const [message, setMessage] = useState("");

  if (!vendor) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.chatSheet}>
          <SheetHandle onPress={onClose} />

          <View style={styles.chatHeader}>
            <VendorThumb vendor={vendor} />

            <View style={styles.chatHeaderText}>
              <Text style={styles.chatTitle}>{vendor.name}</Text>
              <Text style={styles.chatSub}>{vendor.response}</Text>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.dark} />
            </Pressable>
          </View>

          <View style={styles.chatWarning}>
            <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.green} />
            <Text style={styles.chatWarningText}>
              Keep payment inside Redemption Market for buyer and seller protection.
            </Text>
          </View>

          <ScrollView style={styles.chatBody} showsVerticalScrollIndicator={false}>
            <Message left text="Hello, welcome. What product do you want to order?" />
            <Message text="Please is delivery available inside camp?" />
            <Message left text="Yes. Place the order in the app. Payment is held safely and delivery happens as a complete package." />
          </ScrollView>

          <View style={styles.chatInputRow}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type message..."
              placeholderTextColor="#8B9099"
              style={styles.chatInput}
            />
            <Pressable style={styles.sendButton} onPress={() => setMessage("")}>
              <Ionicons name="send" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Message({ text, left }: { text: string; left?: boolean }) {
  return (
    <View style={[styles.message, left ? styles.leftMessage : styles.rightMessage]}>
      <Text style={[styles.messageText, !left && styles.rightMessageText]}>{text}</Text>
      <Text style={[styles.messageTime, !left && styles.rightMessageTime]}>Now</Text>
    </View>
  );
}

function TrackingModal({
  entries,
  onClose,
}: {
  entries: CartEntry[] | null;
  onClose: () => void;
}) {
  if (!entries || entries.length === 0) return null;

  const { itemCount } = getCheckoutTotals(entries);
  const firstEntry = entries[0];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.productSheet}>
          <SheetHandle onPress={onClose} />

          <View style={styles.trackingHeader}>
            <View>
              <Text style={styles.trackingCode}>ORDER {getOrderReference()}</Text>
              <Text style={styles.trackingTitle}>Combined Delivery</Text>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.dark} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.trackingScroll}
          >
            <View style={styles.trackingCard}>
              <View style={styles.trackingIconBox}>
                <ImageBackground
                  source={{ uri: firstEntry.product.image }}
                  style={styles.cartItemImage}
                  imageStyle={styles.cartItemImageRadius}
                />
              </View>

              <View style={styles.trackingTextWrap}>
                <Text style={styles.trackingProductName}>
                  {itemCount} {itemCount === 1 ? "item" : "items"} complete order
                </Text>
                <Text style={styles.trackingProductMeta}>
                  Payment confirmed · All items will be delivered together
                </Text>
              </View>
            </View>

            <Text style={styles.paymentSectionTitle}>Items in this order</Text>
            <OrderItemsList entries={entries} compact />

            <View style={styles.statusCard}>
              <View>
                <Text style={styles.statusTitle}>Order status</Text>
                <Text style={styles.statusSub}>Paid order is now in fulfillment</Text>
              </View>
              <StatusPill type="paid" text="Paid" />
            </View>

            <View style={styles.timeline}>
              <TimelineStep done title="Paid" text="Payment has been confirmed." />
              <TimelineStep active title="Vendors preparing" text="Vendors are preparing the paid items." />
              <TimelineStep title="Package completion" text="All items will be collected together." />
              <TimelineStep title="Out for delivery" text="Complete package goes to customer." />
              <TimelineStep title="Delivered" text="Customer confirms complete order." />
            </View>

            <Pressable style={styles.buyButton}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.buyButtonText}>Confirm Complete Order Received</Text>
            </Pressable>

            <Pressable style={styles.outlineButton}>
              <Ionicons name="alert-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.outlineButtonText}>Report Missing Item / Issue</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function TimelineStep({
  title,
  text,
  done,
  active,
}: {
  title: string;
  text: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <View style={styles.timelineStep}>
      <View style={styles.timelineLeft}>
        <View
          style={[
            styles.timelineDot,
            done && styles.timelineDotDone,
            active && styles.timelineDotActive,
          ]}
        >
          {done ? <Ionicons name="checkmark" size={13} color="#FFFFFF" /> : null}
        </View>
        <View style={[styles.timelineLine, (done || active) && styles.timelineLineActive]} />
      </View>

      <View style={styles.timelineContent}>
        <Text style={[styles.timelineTitle, (done || active) && styles.timelineTitleActive]}>
          {title}
        </Text>
        <Text style={styles.timelineText}>{text}</Text>
      </View>
    </View>
  );
}

function NoDeliveryModal({
  visible,
  onClose,
  onCart,
}: {
  visible: boolean;
  onClose: () => void;
  onCart: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.productSheet}>
          <SheetHandle onPress={onClose} />

          <View style={styles.cartHeader}>
            <View>
              <Text style={styles.cartSmall}>Combined delivery</Text>
              <Text style={styles.cartTitle}>No active order yet</Text>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.dark} />
            </Pressable>
          </View>

          <View style={styles.emptyCart}>
            <Ionicons name="lock-closed-outline" size={50} color={COLORS.primary} />
            <Text style={styles.emptyCartTitle}>Payment must be confirmed first</Text>
            <Text style={styles.emptyCartText}>
              Combined delivery tracking will only appear after the customer completes payment.
            </Text>
          </View>

          <Pressable style={styles.buyButton} onPress={onCart}>
            <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buyButtonText}>Go to Cart</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function SellerAccessModal({
  visible,
  onClose,
  onOpenDashboard,
}: {
  visible: boolean;
  onClose: () => void;
  onOpenDashboard: () => void;
}) {
  const [mode, setMode] = useState<SellerMode>("signup");
  const [submitted, setSubmitted] = useState(false);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sellerSheet}>
          <SheetHandle onPress={onClose} />

          <View style={styles.sellerHeader}>
            <View style={styles.sellerHeaderText}>
              <View style={styles.sellerKickerRow}>
                <Ionicons name="storefront-outline" size={16} color={COLORS.gold} />
                <Text style={styles.sellerSmall}>Vendor Portal</Text>
              </View>
              <Text style={styles.sellerTitle}>Sell on Redemption Market</Text>
              <Text style={styles.sellerIntro}>
                Create your business profile, manage orders and sell safely inside Redemption City.
              </Text>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.dark} />
            </Pressable>
          </View>

          <View style={styles.sellerTabs}>
            <Pressable
              style={[styles.sellerTab, mode === "signup" && styles.sellerTabActive]}
              onPress={() => {
                setMode("signup");
                setSubmitted(false);
              }}
            >
              <Ionicons
                name="business-outline"
                size={18}
                color={mode === "signup" ? "#FFFFFF" : COLORS.dark}
              />
              <Text style={[styles.sellerTabText, mode === "signup" && styles.sellerTabTextActive]}>
                Register Business
              </Text>
            </Pressable>

            <Pressable
              style={[styles.sellerTab, mode === "signin" && styles.sellerTabActive]}
              onPress={() => {
                setMode("signin");
                setSubmitted(false);
              }}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={mode === "signin" ? "#FFFFFF" : COLORS.dark}
              />
              <Text style={[styles.sellerTabText, mode === "signin" && styles.sellerTabTextActive]}>
                Sign In
              </Text>
            </Pressable>
          </View>

          {submitted ? (
            <View style={styles.successBox}>
              <View style={styles.successIconShell}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark" size={34} color="#FFFFFF" />
                </View>
              </View>

              <Text style={styles.successTitle}>
                {mode === "signup" ? "Business registration saved" : "Vendor signed in"}
              </Text>

              <Text style={styles.successText}>
                This vendor-only workspace is hidden from normal customers. Backend login will make it fully secure later.
              </Text>

              <View style={styles.successDivider} />

              <View style={styles.vendorAccessNotice}>
                <View style={styles.vendorAccessIcon}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} />
                </View>

                <View style={styles.vendorAccessTextBox}>
                  <Text style={styles.vendorAccessTitle}>Private vendor workspace</Text>
                  <Text style={styles.vendorAccessText}>
                    Only approved vendors should use this dashboard to manage products, orders and wallet activity.
                  </Text>
                </View>
              </View>

              <Pressable style={[styles.buyButton, styles.fullWidthButton]} onPress={onOpenDashboard}>
                <Ionicons name="grid-outline" size={20} color="#FFFFFF" />
                <Text style={styles.buyButtonText}>Open Vendor Dashboard</Text>
              </Pressable>

              <View style={styles.secureRow}>
                <Ionicons name="shield-checkmark-outline" size={15} color={COLORS.goldDark} />
                <Text style={styles.secureText}>Secure • Private • Vendor Only</Text>
              </View>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {mode === "signup" ? (
                <>
                  <SellerInput label="Business name" placeholder="e.g. Grace Fashion Hub" />
                  <SellerInput label="Business category" placeholder="Fashion, food, groceries..." />
                  <SellerInput label="Business location" placeholder="e.g. Shopping Complex" />
                  <SellerInput label="Owner phone number" placeholder="+234..." />
                  <SellerInput label="Email address" placeholder="vendor@email.com" />
                  <SellerInput label="Password" placeholder="Create password" secure />
                </>
              ) : (
                <>
                  <SellerInput label="Email or phone" placeholder="vendor@email.com" />
                  <SellerInput label="Password" placeholder="Enter password" secure />
                </>
              )}

              <View style={styles.vendorBenefits}>
                <Text style={styles.vendorBenefitsTitle}>Vendor features included</Text>
                <Text style={styles.vendorBenefit}>• Store dashboard and verification status</Text>
                <Text style={styles.vendorBenefit}>• Product add/edit/availability controls</Text>
                <Text style={styles.vendorBenefit}>• Vendor order preparation workflow</Text>
                <Text style={styles.vendorBenefit}>• Ready-for-pickup delivery update</Text>
                <Text style={styles.vendorBenefit}>• Wallet, commission and earnings preview</Text>
              </View>

              <Pressable style={styles.buyButton} onPress={() => setSubmitted(true)}>
                <Ionicons
                  name={mode === "signup" ? "storefront-outline" : "log-in-outline"}
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.buyButtonText}>
                  {mode === "signup" ? "Create Seller Account" : "Sign In to Vendor Account"}
                </Text>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function SellerInput({
  label,
  placeholder,
  secure,
  value,
  onChangeText,
}: {
  label: string;
  placeholder: string;
  secure?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
}) {
  return (
    <View style={styles.sellerInputBlock}>
      <Text style={styles.sellerInputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8B9099"
        secureTextEntry={secure}
        style={styles.sellerInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.card },
  topBar: {
    height: 58,
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  logoWrap: { flexDirection: "row", alignItems: "center" },
  logoBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.gold,
    marginRight: 7,
  },
  logoText: { color: COLORS.dark, fontSize: 17, fontWeight: "900", letterSpacing: 1 },
  topActions: { flexDirection: "row", alignItems: "center" },
  sellerButton: { width: 38, height: 42, alignItems: "center", justifyContent: "center" },
  cartTopButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  cartBadge: {
    position: "absolute",
    right: 3,
    top: 5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingBottom: 34 },
  searchWrap: {
    margin: 10,
    height: 55,
    borderRadius: 17,
    backgroundColor: COLORS.faint,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: { flex: 1, marginLeft: 10, color: COLORS.text, fontSize: 15, fontWeight: "700" },
  bannerWrap: {
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: COLORS.primary,
  },
  bannerImage: { height: 158, justifyContent: "center" },
  bannerImageRadius: { borderRadius: 18 },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 47, 32, 0.62)",
  },
  bannerContent: { paddingHorizontal: 18, maxWidth: "82%" },
  bannerKicker: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
  },
  bannerTitle: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "900",
  },
  bannerText: {
    marginTop: 7,
    color: "#E7F3EE",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  bannerButton: {
    marginTop: 14,
    alignSelf: "flex-start",
    height: 38,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  categoryRow: { paddingHorizontal: 10, paddingBottom: 10 },
  categoryChip: {
    height: 38,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryChipText: { color: COLORS.text, fontSize: 12, fontWeight: "900" },
  categoryChipTextActive: { color: "#FFFFFF" },
  sectionBlock: { marginBottom: 12 },
  sectionHeader: {
    height: 40,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 2,
    borderTopColor: COLORS.gold,
  },
  sectionHeaderText: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  sectionHeaderAction: { color: "#F7E4B8", fontSize: 12, fontWeight: "900" },
  productRail: { paddingHorizontal: 8, paddingTop: 9, paddingBottom: 5 },
  productTile: { backgroundColor: COLORS.card, overflow: "hidden" },
  compactTile: { width: 154, minHeight: 242, marginRight: 8 },
  gridTile: { width: "32%", minHeight: 238, marginBottom: 8 },
  productImageBox: {
    height: 124,
    backgroundColor: "#D9DCE1",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  productPhoto: { width: "100%", height: "100%", justifyContent: "space-between" },
  productPhotoLarge: { borderRadius: 6 },
  productPhotoRadius: { resizeMode: "cover" },
  productPhotoShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17,24,39,0.08)",
  },
  photoTopRow: { flexDirection: "row", justifyContent: "flex-start", padding: 8 },
  photoCategoryPill: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 7,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  photoCategoryText: {
    marginLeft: 3,
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
  },
  discountTag: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFF7E7",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 2,
    zIndex: 10,
  },
  discountText: { color: COLORS.goldDark, fontSize: 11, fontWeight: "900" },
  productName: {
    marginTop: 8,
    paddingHorizontal: 8,
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  vendorMiniName: {
    marginTop: 3,
    paddingHorizontal: 8,
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
  },
  productPrice: {
    marginTop: 7,
    paddingHorizontal: 8,
    color: COLORS.dark,
    fontSize: 16,
    fontWeight: "900",
  },
  oldPrice: {
    marginTop: 2,
    paddingHorizontal: 8,
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
    textDecorationLine: "line-through",
  },
  productDelivery: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingBottom: 9,
    color: COLORS.blue,
    fontSize: 10,
    fontWeight: "900",
  },
  storeRow: { paddingHorizontal: 10, paddingVertical: 10 },
  storeCard: {
    width: 235,
    borderRadius: 5,
    backgroundColor: COLORS.card,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  storePhoto: {
    height: 98,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10,
    justifyContent: "flex-end",
  },
  storePhotoRadius: { borderRadius: 8, resizeMode: "cover" },
  storePhotoShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6,63,44,0.35)",
  },
  storePhotoBottom: { padding: 9 },
  storePhotoTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  storePhotoSub: { marginTop: 2, color: "#E7F3EE", fontSize: 10, fontWeight: "800" },
  storeStatusRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    minHeight: 24,
  },
  verifiedBadge: {
    borderRadius: 999,
    backgroundColor: "#ECFDF3",
    paddingHorizontal: 7,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedText: { marginLeft: 3, color: COLORS.green, fontSize: 10, fontWeight: "900" },
  pendingBadge: {
    borderRadius: 999,
    backgroundColor: "#FFF7E7",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pendingText: { color: COLORS.goldDark, fontSize: 10, fontWeight: "900" },
  storeName: { marginTop: 8, color: COLORS.dark, fontSize: 15, fontWeight: "900" },
  storeCategory: { marginTop: 3, color: COLORS.muted, fontSize: 12, fontWeight: "700" },
  storeMetaRow: { marginTop: 8, flexDirection: "row", alignItems: "center" },
  storeMetaText: { marginLeft: 4, color: COLORS.dark, fontSize: 11, fontWeight: "800" },
  dot: { marginHorizontal: 6, color: COLORS.muted, fontWeight: "900" },
  storeArea: { marginTop: 7, color: COLORS.muted, fontSize: 11, fontWeight: "700" },
  storeButtonRow: { marginTop: 11, flexDirection: "row" },
  openStoreButton: {
    flex: 1,
    height: 37,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  openStoreText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  locateSmallButton: {
    marginLeft: 7,
    width: 40,
    height: 37,
    borderRadius: 4,
    backgroundColor: "#FFF7E7",
    alignItems: "center",
    justifyContent: "center",
  },
  chatSmallButton: {
    marginLeft: 7,
    width: 40,
    height: 37,
    borderRadius: 4,
    backgroundColor: "#E7F3EE",
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    paddingHorizontal: 8,
    paddingTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  deliveryPreview: {
    margin: 10,
    borderRadius: 6,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryLeft: {
    width: 46,
    height: 46,
    borderRadius: 6,
    backgroundColor: "#FFF7E7",
    alignItems: "center",
    justifyContent: "center",
  },
  deliveryMid: { flex: 1, marginLeft: 12 },
  deliveryTitle: { color: COLORS.dark, fontSize: 14, fontWeight: "900" },
  deliveryText: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.45)",
    flexDirection: "row",
  },
  drawer: {
    width: "82%",
    maxWidth: 330,
    backgroundColor: COLORS.card,
    paddingTop: 42,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  drawerBackdrop: { flex: 1 },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 8,
  },
  drawerLogo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  drawerTitle: { color: COLORS.dark, fontSize: 18, fontWeight: "900" },
  drawerSub: { marginTop: 2, color: COLORS.muted, fontSize: 12, fontWeight: "700" },
  drawerItem: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  drawerItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E7F3EE",
    alignItems: "center",
    justifyContent: "center",
  },
  drawerItemText: { flex: 1, marginLeft: 11 },
  drawerItemTitle: { color: COLORS.dark, fontSize: 14, fontWeight: "900" },
  drawerItemSub: { marginTop: 2, color: COLORS.muted, fontSize: 11, fontWeight: "700" },
  drawerCloseButton: {
    marginTop: 18,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  drawerCloseText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.45)",
    justifyContent: "flex-end",
  },
  sheetHandleButton: {
    alignSelf: "center",
    width: 110,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  sheetHandle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D0D5DD",
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  vendorThumb: {
    width: 50,
    height: 50,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: COLORS.primary,
  },
  vendorThumbRadius: { borderRadius: 10, resizeMode: "cover" },
  vendorThumbShade: {
    flex: 1,
    backgroundColor: "rgba(6,63,44,0.30)",
    alignItems: "center",
    justifyContent: "center",
  },
  cartSheet: {
    height: "86%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.bg,
    padding: 14,
    paddingBottom: Platform.OS === "ios" ? 34 : 18,
  },
  checkoutSheet: {
    height: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.bg,
    padding: 14,
    paddingBottom: Platform.OS === "ios" ? 34 : 18,
  },
  paymentSheet: {
    height: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.bg,
    padding: 14,
    paddingBottom: Platform.OS === "ios" ? 34 : 18,
  },
  receiptSheet: {
    height: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.bg,
    padding: 14,
    paddingBottom: Platform.OS === "ios" ? 34 : 18,
  },
  cartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cartSmall: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cartTitle: { marginTop: 3, color: COLORS.dark, fontSize: 24, fontWeight: "900" },
  emptyCart: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 },
  emptyCartTitle: { marginTop: 12, color: COLORS.dark, fontSize: 18, fontWeight: "900" },
  emptyCartText: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    textAlign: "center",
  },
  cartList: { marginTop: 14 },
  cartItem: {
    borderRadius: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 11,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
  },
  cartImageBox: {
    width: 58,
    height: 58,
    borderRadius: 7,
    backgroundColor: "#D9DCE1",
    overflow: "hidden",
  },
  cartItemImage: { width: "100%", height: "100%" },
  cartItemImageRadius: { borderRadius: 7, resizeMode: "cover" },
  cartItemMain: { flex: 1, marginLeft: 10 },
  cartItemName: { color: COLORS.dark, fontSize: 13, lineHeight: 17, fontWeight: "900" },
  cartItemVendor: { marginTop: 3, color: COLORS.muted, fontSize: 11, fontWeight: "700" },
  cartItemPrice: { marginTop: 5, color: COLORS.dark, fontSize: 14, fontWeight: "900" },
  quantityBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  qtyButton: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  qtyText: { minWidth: 24, textAlign: "center", color: COLORS.dark, fontSize: 13, fontWeight: "900" },
  summaryBox: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  summaryLabel: { color: COLORS.muted, fontSize: 13, fontWeight: "800" },
  summaryValue: { color: COLORS.dark, fontSize: 13, fontWeight: "900" },
  summaryBold: { color: COLORS.dark, fontSize: 16, fontWeight: "900" },
  summaryDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 6 },
  cartProtectionBox: {
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: "#E7F3EE",
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  cartProtectionText: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  checkoutInfoCard: {
    marginTop: 14,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  checkoutInfoIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#E7F3EE",
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutInfoText: { flex: 1, marginLeft: 10 },
  checkoutInfoTitle: { color: COLORS.dark, fontSize: 14, fontWeight: "900" },
  checkoutInfoSub: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  checkoutDeliveryCard: {
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#FFF7E7",
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutDeliveryText: { flex: 1, marginLeft: 10 },
  checkoutDeliveryTitle: { color: COLORS.dark, fontSize: 13, fontWeight: "900" },
  checkoutDeliverySub: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  orderItemsBox: {
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  orderItemRow: {
    minHeight: 72,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  orderItemImage: {
    width: 54,
    height: 54,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#D9DCE1",
  },
  orderItemImageSmall: {
    width: 46,
    height: 46,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#D9DCE1",
  },
  orderItemText: { flex: 1, marginLeft: 10 },
  orderItemName: { color: COLORS.dark, fontSize: 13, lineHeight: 17, fontWeight: "900" },
  orderItemVendor: { marginTop: 3, color: COLORS.muted, fontSize: 11, fontWeight: "700" },
  orderItemPrice: { color: COLORS.dark, fontSize: 12, fontWeight: "900", marginLeft: 8 },
  paymentAmountCard: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    padding: 16,
  },
  paymentAmountLabel: { color: "#D7EFE4", fontSize: 12, fontWeight: "800" },
  paymentAmount: { marginTop: 5, color: "#FFFFFF", fontSize: 31, fontWeight: "900" },
  paymentAmountSub: {
    marginTop: 5,
    color: "#D7EFE4",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  paymentSectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: COLORS.dark,
    fontSize: 15,
    fontWeight: "900",
  },
  paymentMethodCard: {
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#E7F3EE",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentMethodText: { flex: 1, marginLeft: 10 },
  paymentMethodTitle: { color: COLORS.dark, fontSize: 14, fontWeight: "900" },
  paymentMethodSub: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  appWalletBox: {
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
  },
  walletTopRow: { flexDirection: "row", alignItems: "center" },
  walletTitle: { marginLeft: 8, color: COLORS.dark, fontSize: 14, fontWeight: "900" },
  walletText: {
    marginTop: 8,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  walletInfoRow: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 9,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  walletInfoLabel: { color: COLORS.muted, fontSize: 12, fontWeight: "800" },
  walletInfoValue: { color: COLORS.dark, fontSize: 12, fontWeight: "900" },
  statusCard: {
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusTitle: { color: COLORS.dark, fontSize: 13, fontWeight: "900" },
  statusSub: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    maxWidth: 205,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  statusPillAwaiting: { backgroundColor: "#FFF7E7" },
  statusPillConfirmed: { backgroundColor: "#ECFDF3" },
  statusPillPaid: { backgroundColor: "#E7F3EE" },
  statusPillText: { fontSize: 10, fontWeight: "900" },
  statusPillTextAwaiting: { color: COLORS.goldDark },
  statusPillTextConfirmed: { color: COLORS.green },
  statusPillTextPaid: { color: COLORS.primary },
  paymentNote: {
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: "#FFF7E7",
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  paymentNoteText: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.goldDark,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "800",
  },
  cancelButton: {
    marginTop: 9,
    height: 50,
    borderRadius: 6,
    backgroundColor: "#FEF3F2",
    borderWidth: 1,
    borderColor: "#FECDCA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    marginLeft: 8,
    color: COLORS.red,
    fontSize: 14,
    fontWeight: "900",
  },
  receiptHero: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: "#ECFDF3",
    borderWidth: 1,
    borderColor: "#ABEFC6",
    padding: 16,
    alignItems: "center",
  },
  receiptHeroTitle: {
    marginTop: 7,
    color: COLORS.green,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  receiptHeroText: {
    marginTop: 5,
    color: COLORS.green,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  storeSheet: {
    height: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.bg,
    padding: 14,
    paddingBottom: Platform.OS === "ios" ? 34 : 18,
  },
  storeHeader: { flexDirection: "row", alignItems: "center" },
  storeHeaderText: { flex: 1, marginLeft: 12 },
  storeNameLine: { flexDirection: "row", alignItems: "center" },
  storeSheetName: { flex: 1, color: COLORS.dark, fontSize: 19, fontWeight: "900", marginRight: 5 },
  storeSheetCategory: { marginTop: 3, color: COLORS.muted, fontSize: 12, fontWeight: "800" },
  storeSheetMeta: { marginTop: 3, color: COLORS.text, fontSize: 11, fontWeight: "800" },
  storeHero: {
    marginTop: 13,
    height: 132,
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  storeHeroRadius: { borderRadius: 10, resizeMode: "cover" },
  storeHeroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6,63,44,0.38)",
  },
  storeHeroTextBox: { padding: 12 },
  storeHeroTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  storeHeroSub: { marginTop: 3, color: "#E7F3EE", fontSize: 12, fontWeight: "800" },
  storeDescription: { marginTop: 13, color: COLORS.text, fontSize: 12, lineHeight: 18, fontWeight: "700" },
  storeActions: { marginTop: 13, flexDirection: "row" },
  storePrimaryButton: {
    flex: 1,
    height: 46,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  storePrimaryText: { marginLeft: 7, color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  storeSecondaryButton: {
    marginLeft: 8,
    width: 105,
    height: 46,
    borderRadius: 6,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  storeSecondaryText: { marginLeft: 5, color: COLORS.primary, fontSize: 13, fontWeight: "900" },
  storeSearch: {
    marginTop: 14,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  storeSearchInput: { flex: 1, marginLeft: 8, color: COLORS.text, fontSize: 13, fontWeight: "700" },
  productSheet: {
    maxHeight: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.bg,
    padding: 14,
    paddingBottom: Platform.OS === "ios" ? 34 : 18,
  },
  productModalTop: { flexDirection: "row", alignItems: "flex-start" },
  productModalImage: {
    flex: 1,
    height: 190,
    borderRadius: 6,
    backgroundColor: "#D9DCE1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  productModalName: { marginTop: 13, color: COLORS.dark, fontSize: 20, lineHeight: 25, fontWeight: "900" },
  productModalPrice: { marginTop: 7, color: COLORS.dark, fontSize: 25, fontWeight: "900" },
  productModalOldPrice: {
    marginTop: 2,
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "line-through",
  },
  vendorLine: {
    marginTop: 14,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  vendorLineText: { flex: 1, marginLeft: 10 },
  vendorLineName: { color: COLORS.dark, fontSize: 14, fontWeight: "900" },
  vendorLineSub: { marginTop: 2, color: COLORS.muted, fontSize: 11, fontWeight: "700" },
  infoPanel: {
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  infoRowText: { marginLeft: 10 },
  infoRowLabel: { color: COLORS.muted, fontSize: 11, fontWeight: "800" },
  infoRowValue: { marginTop: 2, color: COLORS.dark, fontSize: 13, fontWeight: "900" },
  buyButton: {
    marginTop: 14,
    height: 52,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidthButton: {
    alignSelf: "stretch",
  },
  buyButtonText: { marginLeft: 8, color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  cartActionButton: {
    marginTop: 9,
    height: 50,
    borderRadius: 6,
    backgroundColor: "#E7F3EE",
    borderWidth: 1,
    borderColor: "#C7E2D6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cartActionText: { marginLeft: 8, color: COLORS.primary, fontSize: 14, fontWeight: "900" },
  outlineButton: {
    marginTop: 9,
    height: 50,
    borderRadius: 6,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: { marginLeft: 8, color: COLORS.primary, fontSize: 14, fontWeight: "900" },
  chatSheet: {
    height: "82%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.bg,
    padding: 14,
    paddingBottom: Platform.OS === "ios" ? 34 : 18,
  },
  chatHeader: { flexDirection: "row", alignItems: "center" },
  chatHeaderText: { flex: 1, marginLeft: 10 },
  chatTitle: { color: COLORS.dark, fontSize: 16, fontWeight: "900" },
  chatSub: { marginTop: 2, color: COLORS.green, fontSize: 11, fontWeight: "800" },
  chatWarning: {
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: "#ECFDF3",
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  chatWarningText: { flex: 1, marginLeft: 7, color: COLORS.green, fontSize: 11, lineHeight: 16, fontWeight: "800" },
  chatBody: { flex: 1, marginTop: 13 },
  message: { maxWidth: "84%", borderRadius: 12, padding: 11, marginBottom: 10 },
  leftMessage: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 3,
  },
  rightMessage: { alignSelf: "flex-end", backgroundColor: COLORS.primary, borderBottomRightRadius: 3 },
  messageText: { color: COLORS.dark, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  rightMessageText: { color: "#FFFFFF" },
  messageTime: { marginTop: 4, color: COLORS.muted, fontSize: 10, fontWeight: "800" },
  rightMessageTime: { color: "#D7EFE4" },
  chatInputRow: { marginTop: 9, flexDirection: "row", alignItems: "center" },
  chatInput: {
    flex: 1,
    height: 50,
    borderRadius: 7,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  sendButton: {
    marginLeft: 8,
    width: 50,
    height: 50,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  trackingHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  trackingCode: { color: COLORS.gold, fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  trackingTitle: { marginTop: 3, color: COLORS.dark, fontSize: 23, fontWeight: "900" },
  trackingScroll: { paddingBottom: 20 },
  trackingCard: {
    marginTop: 14,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  trackingIconBox: {
    width: 50,
    height: 50,
    borderRadius: 7,
    backgroundColor: "#FFF7E7",
    overflow: "hidden",
  },
  trackingTextWrap: { flex: 1, marginLeft: 10 },
  trackingProductName: { color: COLORS.dark, fontSize: 14, fontWeight: "900" },
  trackingProductMeta: { marginTop: 3, color: COLORS.muted, fontSize: 11, fontWeight: "700" },
  timeline: { marginTop: 15 },
  timelineStep: { flexDirection: "row", minHeight: 54 },
  timelineLeft: { width: 30, alignItems: "center" },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#D0D5DD",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDotDone: { backgroundColor: COLORS.green },
  timelineDotActive: { backgroundColor: COLORS.gold },
  timelineLine: { flex: 1, width: 3, backgroundColor: "#D0D5DD", marginTop: 4 },
  timelineLineActive: { backgroundColor: COLORS.green },
  timelineContent: { flex: 1, paddingLeft: 7, paddingBottom: 11 },
  timelineTitle: { color: COLORS.muted, fontSize: 13, fontWeight: "900" },
  timelineTitleActive: { color: COLORS.dark },
  timelineText: { marginTop: 3, color: COLORS.muted, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  sellerSheet: {
    height: "90%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: COLORS.bg,
    padding: 18,
    paddingBottom: Platform.OS === "ios" ? 34 : 18,
  },
  sellerHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  sellerHeaderText: {
    flex: 1,
    paddingRight: 12,
  },
  sellerKickerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sellerSmall: {
    marginLeft: 6,
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  sellerTitle: {
    marginTop: 11,
    color: COLORS.primary,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "900",
  },
  sellerIntro: {
    marginTop: 7,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  sellerTabs: {
    marginTop: 18,
    height: 54,
    borderRadius: 11,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
    flexDirection: "row",
  },
  sellerTab: {
    flex: 1,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  sellerTabActive: { backgroundColor: COLORS.primary },
  sellerTabText: { marginLeft: 8, color: COLORS.dark, fontSize: 12, fontWeight: "900" },
  sellerTabTextActive: { color: "#FFFFFF" },
  sellerInputBlock: { marginTop: 13 },
  sellerInputLabel: { marginBottom: 6, color: COLORS.dark, fontSize: 12, fontWeight: "900" },
  sellerInput: {
    height: 50,
    borderRadius: 7,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  vendorBenefits: {
    marginTop: 15,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
  },
  vendorBenefitsTitle: { color: COLORS.dark, fontSize: 14, fontWeight: "900", marginBottom: 8 },
  vendorBenefit: { color: COLORS.muted, fontSize: 12, lineHeight: 20, fontWeight: "700" },
  successBox: {
    marginTop: 22,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  successIconShell: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#E7F3EE",
    alignItems: "center",
    justifyContent: "center",
  },
  successIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    marginTop: 14,
    color: COLORS.primary,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "900",
    textAlign: "center",
  },
  successText: {
    marginTop: 8,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  successDivider: {
    marginTop: 18,
    marginBottom: 14,
    height: 1,
    alignSelf: "stretch",
    backgroundColor: COLORS.border,
  },
  vendorAccessNotice: {
    alignSelf: "stretch",
    borderRadius: 13,
    backgroundColor: "#F7FBF8",
    borderWidth: 1,
    borderColor: "#DDEFE6",
    padding: 13,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  vendorAccessIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E7F3EE",
    alignItems: "center",
    justifyContent: "center",
  },
  vendorAccessTextBox: {
    flex: 1,
    marginLeft: 10,
  },
  vendorAccessTitle: {
    color: COLORS.dark,
    fontSize: 13,
    fontWeight: "900",
  },
  vendorAccessText: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "700",
  },
  secureRow: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secureText: {
    marginLeft: 6,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "800",
  },
});