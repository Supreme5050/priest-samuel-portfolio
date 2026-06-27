import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createVendorProductLive, getActiveVendorSession } from "@/services/commerceLiveService";

type VendorTab = "Dashboard" | "Orders" | "Products" | "Wallet" | "Profile";

type VendorOrderStatus =
  | "New Order"
  | "Accepted"
  | "Preparing"
  | "Ready for pickup"
  | "Collected"
  | "Out for delivery"
  | "Delivered";

type VendorOrder = {
  id: string;
  orderRef: string;
  paymentRef: string;
  customer: string;
  product: string;
  quantity: number;
  amount: string;
  time: string;
  status: VendorOrderStatus;
  paymentStatus: "Money held by app" | "Released";
};

type VendorProduct = {
  id: string;
  name: string;
  sku: string;
  price: string;
  sold: number;
  stock: string;
  image: string;
  available: boolean;
};

const COLORS = {
  bg: "#F7F8F6",
  card: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  primary: "#063F2C",
  primaryLight: "#E8F5EF",
  gold: "#D79A2B",
  green: "#079455",
  blue: "#2563EB",
  red: "#D92D20",
  orange: "#F59E0B",
  softOrange: "#FFF7E7",
  softGreen: "#ECFDF3",
  softBlue: "#EFF6FF",
  softRed: "#FEF3F2",
};

const PRODUCT_IMAGES = {
  native:
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
  dress:
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
  shoes:
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
  gele:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
};

const INITIAL_PRODUCTS: VendorProduct[] = [
  {
    id: "vp-1",
    name: "Ready-made Native Wear",
    sku: "GF-NW-001",
    price: "₦18,500",
    sold: 128,
    stock: "In stock",
    image: PRODUCT_IMAGES.native,
    available: true,
  },
  {
    id: "vp-2",
    name: "Ladies Church Dress",
    sku: "GF-LD-002",
    price: "₦22,000",
    sold: 96,
    stock: "Low stock (5)",
    image: PRODUCT_IMAGES.dress,
    available: true,
  },
  {
    id: "vp-3",
    name: "Men’s Corporate Shoes",
    sku: "GF-MS-003",
    price: "₦31,500",
    sold: 74,
    stock: "In stock",
    image: PRODUCT_IMAGES.shoes,
    available: true,
  },
  {
    id: "vp-4",
    name: "Women Head Tie / Gele",
    sku: "GF-GE-004",
    price: "₦7,500",
    sold: 41,
    stock: "Unavailable",
    image: PRODUCT_IMAGES.gele,
    available: false,
  },
];

const INITIAL_ORDERS: VendorOrder[] = [
  {
    id: "vo-1",
    orderRef: "#RC2041",
    paymentRef: "PAY-RC-2041",
    customer: "Customer A",
    product: "Ready-made Native Wear",
    quantity: 1,
    amount: "₦18,500",
    time: "Today, 8:32 AM",
    status: "New Order",
    paymentStatus: "Money held by app",
  },
  {
    id: "vo-2",
    orderRef: "#RC2042",
    paymentRef: "PAY-RC-2042",
    customer: "Customer B",
    product: "Ladies Church Dress",
    quantity: 1,
    amount: "₦22,000",
    time: "Today, 7:15 AM",
    status: "Preparing",
    paymentStatus: "Money held by app",
  },
  {
    id: "vo-3",
    orderRef: "#RC2043",
    paymentRef: "PAY-RC-2043",
    customer: "Customer C",
    product: "Women Head Tie / Gele",
    quantity: 2,
    amount: "₦15,000",
    time: "Yesterday, 9:45 PM",
    status: "Ready for pickup",
    paymentStatus: "Money held by app",
  },
  {
    id: "vo-4",
    orderRef: "#RC2044",
    paymentRef: "PAY-RC-2044",
    customer: "Customer D",
    product: "Men’s Corporate Shoes",
    quantity: 1,
    amount: "₦31,500",
    time: "Yesterday, 6:20 PM",
    status: "Delivered",
    paymentStatus: "Released",
  },
];

export default function VendorDashboardScreen() {
  const [activeTab, setActiveTab] = useState<VendorTab>("Dashboard");
  const [storeOpen, setStoreOpen] = useState(true);
  const [products, setProducts] = useState<VendorProduct[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<VendorOrder[]>(INITIAL_ORDERS);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [activeVendorId, setActiveVendorId] = useState("vendor-demo-store");

  useEffect(() => {
    getActiveVendorSession().then((session) => {
      if (session?.vendorId) setActiveVendorId(session.vendorId);
    });
  }, []);

  const dashboardStats = useMemo(() => {
    const pendingOrders = orders.filter((order) => order.status !== "Delivered").length;
    const completedOrders = orders.filter((order) => order.status === "Delivered").length;

    return {
      totalSales: "₦24,560",
      orders: `${orders.length}`,
      products: `${products.length}`,
      wallet: "₦55,500",
      pendingOrders,
      completedOrders,
    };
  }, [orders, products]);

  function nextVendorStatus(status: VendorOrderStatus): VendorOrderStatus {
    if (status === "New Order") return "Accepted";
    if (status === "Accepted") return "Preparing";
    if (status === "Preparing") return "Ready for pickup";
    return status;
  }

  function canVendorUpdate(status: VendorOrderStatus) {
    return status === "New Order" || status === "Accepted" || status === "Preparing";
  }

  function getOrderActionLabel(status: VendorOrderStatus) {
    if (status === "New Order") return "Accept Order";
    if (status === "Accepted") return "Mark Preparing";
    if (status === "Preparing") return "Ready for Pickup";
    if (status === "Ready for pickup") return "Waiting for rider/admin";
    return "Handled by delivery/admin";
  }

  function updateOrderStatus(orderId: string) {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: nextVendorStatus(order.status),
            }
          : order
      )
    );
  }

  function toggleProduct(productId: string) {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,
              available: !product.available,
              stock: product.available ? "Unavailable" : "In stock",
            }
          : product
      )
    );
  }

  async function addProduct() {
    const cleanName = newProductName.trim();
    const cleanPrice = newProductPrice.trim();

    if (!cleanName || !cleanPrice) return;

    const newProduct: VendorProduct = {
      id: `vp-${Date.now()}`,
      name: cleanName,
      sku: `GF-${Date.now().toString().slice(-4)}`,
      price: cleanPrice,
      sold: 0,
      stock: "In stock",
      image: PRODUCT_IMAGES.native,
      available: true,
    };

    setProducts((current) => [newProduct, ...current]);

    const result = await createVendorProductLive({
      id: newProduct.id,
      vendorId: activeVendorId,
      name: newProduct.name,
      price: newProduct.price,
      category: "General",
      inStock: newProduct.available,
    });

    Alert.alert("Product saved", result.message);

    setNewProductName("");
    setNewProductPrice("");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.page}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Header storeOpen={storeOpen} />

          {activeTab === "Dashboard" ? (
            <DashboardTab
              stats={dashboardStats}
              orders={orders}
              products={products}
              onGoOrders={() => setActiveTab("Orders")}
              onGoProducts={() => setActiveTab("Products")}
              onGoWallet={() => setActiveTab("Wallet")}
            />
          ) : null}

          {activeTab === "Orders" ? (
            <OrdersTab
              orders={orders}
              canVendorUpdate={canVendorUpdate}
              getOrderActionLabel={getOrderActionLabel}
              onUpdate={updateOrderStatus}
            />
          ) : null}

          {activeTab === "Products" ? (
            <ProductsTab
              products={products}
              newProductName={newProductName}
              newProductPrice={newProductPrice}
              onProductNameChange={setNewProductName}
              onProductPriceChange={setNewProductPrice}
              onAddProduct={addProduct}
              onToggleProduct={toggleProduct}
            />
          ) : null}

          {activeTab === "Wallet" ? <WalletTab /> : null}

          {activeTab === "Profile" ? (
            <ProfileTab storeOpen={storeOpen} onToggleStore={() => setStoreOpen((value) => !value)} />
          ) : null}
        </ScrollView>

        <VendorBottomNav activeTab={activeTab} onChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

function Header({ storeOpen }: { storeOpen: boolean }) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={COLORS.text} />
      </Pressable>

      <View style={styles.vendorAvatar}>
        <Text style={styles.vendorAvatarText}>GF</Text>
      </View>

      <View style={styles.headerText}>
        <Text style={styles.greeting}>Good morning, Grace 👋</Text>

        <View style={styles.vendorMetaRow}>
          <Text style={styles.vendorMeta}>Grace Fashion Hub Vendor</Text>
          <Ionicons name="checkmark-circle" size={14} color={COLORS.green} />
          <Text style={styles.vendorDot}>•</Text>
          <Text style={[styles.vendorStatus, storeOpen ? styles.vendorStatusOpen : styles.vendorStatusClosed]}>
            {storeOpen ? "Open" : "Closed"}
          </Text>
        </View>
      </View>

      <View style={styles.notificationWrap}>
        <Ionicons name="notifications-outline" size={23} color={COLORS.text} />
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationBadgeText}>3</Text>
        </View>
      </View>
    </View>
  );
}

function DashboardTab({
  stats,
  orders,
  products,
  onGoOrders,
  onGoProducts,
  onGoWallet,
}: {
  stats: {
    totalSales: string;
    orders: string;
    products: string;
    wallet: string;
    pendingOrders: number;
    completedOrders: number;
  };
  orders: VendorOrder[];
  products: VendorProduct[];
  onGoOrders: () => void;
  onGoProducts: () => void;
  onGoWallet: () => void;
}) {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsRow}
      >
        <MetricCard
          icon="cash-outline"
          title="Total Sales"
          value={stats.totalSales}
          trend="18.7% vs last 7 days"
        />
        <MetricCard
          icon="bag-handle-outline"
          title="Orders"
          value={stats.orders}
          trend="12.5% vs last 7 days"
        />
        <MetricCard
          icon="cube-outline"
          title="Products"
          value={stats.products}
          trend="5.3% vs last 7 days"
        />
        <MetricCard
          icon="wallet-outline"
          title="Wallet Balance"
          value={stats.wallet}
          trend="View Wallet"
          onPress={onGoWallet}
        />
      </ScrollView>

      <RevenueOverview />

      <SectionCard
        title="Recent Orders"
        action="View all"
        onAction={onGoOrders}
      >
        {orders.slice(0, 4).map((order) => (
          <RecentOrderRow key={order.id} order={order} />
        ))}
      </SectionCard>

      <SectionCard
        title="Top Products"
        action="View all"
        onAction={onGoProducts}
      >
        {products.slice(0, 3).map((product) => (
          <TopProductRow key={product.id} product={product} />
        ))}
      </SectionCard>

      <EarningsCard onWallet={onGoWallet} />

      <Text style={styles.quickTitle}>Quick Actions</Text>

      <View style={styles.quickGrid}>
        <QuickAction icon="add" title="Add Product" onPress={onGoProducts} />
        <QuickAction icon="calendar-outline" title="View Orders" onPress={onGoOrders} />
        <QuickAction icon="pricetag-outline" title="Promotions" />
        <QuickAction icon="bar-chart-outline" title="Analytics" />
      </View>
    </View>
  );
}

function MetricCard({
  icon,
  title,
  value,
  trend,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  trend: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.metricCard} onPress={onPress}>
      <View style={styles.metricIcon}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
      </View>

      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>

      <View style={styles.metricTrendRow}>
        <Ionicons name="trending-up-outline" size={12} color={COLORS.green} />
        <Text style={styles.metricTrend}>{trend}</Text>
      </View>
    </Pressable>
  );
}

function RevenueOverview() {
  const chartValues = [18, 25, 36, 49, 63, 75, 92];
  const chartLabels = ["May 10", "May 11", "May 12", "May 13", "May 14", "May 15", "May 16"];

  return (
    <View style={styles.revenueCard}>
      <View style={styles.revenueTop}>
        <View>
          <Text style={styles.cardTitle}>Revenue Overview</Text>
          <View style={styles.revenueAmountRow}>
            <Text style={styles.revenueAmount}>₦24,560</Text>
            <Text style={styles.revenueGrowth}>↑ 18.7%</Text>
          </View>
          <Text style={styles.revenueSub}>vs May 10 – May 16</Text>
        </View>

        <View style={styles.rangePill}>
          <Text style={styles.rangePillText}>Last 7 Days</Text>
          <Ionicons name="chevron-down" size={14} color={COLORS.muted} />
        </View>
      </View>

      <View style={styles.chartArea}>
        <View style={styles.chartGridLine} />
        <View style={[styles.chartGridLine, { top: 42 }]} />
        <View style={[styles.chartGridLine, { top: 84 }]} />

        <View style={styles.chartBars}>
          {chartValues.map((value, index) => (
            <View key={chartLabels[index]} style={styles.chartColumn}>
              <View style={styles.chartColumnInner}>
                <View style={[styles.chartBar, { height: value }]} />
                <View style={[styles.chartDot, { bottom: value - 4 }]} />
              </View>
              <Text style={styles.chartLabel}>{chartLabels[index].replace("May ", "")}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function SectionCard({
  title,
  action,
  onAction,
  children,
}: {
  title: string;
  action: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionCardTop}>
        <Text style={styles.cardTitle}>{title}</Text>

        <Pressable style={styles.viewAllButton} onPress={onAction}>
          <Text style={styles.viewAllText}>{action}</Text>
          <Ionicons name="chevron-forward" size={15} color={COLORS.primary} />
        </Pressable>
      </View>

      {children}
    </View>
  );
}

function RecentOrderRow({ order }: { order: VendorOrder }) {
  return (
    <View style={styles.orderRow}>
      <View style={styles.orderIconBox}>
        <Ionicons name="bag-handle-outline" size={18} color={COLORS.green} />
      </View>

      <View style={styles.orderRefBox}>
        <Text style={styles.orderRef}>{order.orderRef}</Text>
        <Text style={styles.orderTime}>{order.time}</Text>
      </View>

      <View style={styles.customerCircle}>
        <Text style={styles.customerInitial}>{order.customer.replace("Customer ", "")}</Text>
      </View>

      <Text style={styles.customerName} numberOfLines={1}>
        {order.customer}
      </Text>

      <StatusBadge status={order.status} />

      <Text style={styles.orderAmount}>{order.amount}</Text>

      <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
    </View>
  );
}

function TopProductRow({ product }: { product: VendorProduct }) {
  return (
    <View style={styles.productRow}>
      <ImageBackground
        source={{ uri: product.image }}
        style={styles.productThumb}
        imageStyle={styles.productThumbImage}
      />

      <View style={styles.productRowMain}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.productSku}>SKU: {product.sku}</Text>
      </View>

      <View style={styles.productSoldBox}>
        <Text style={styles.productSold}>{product.sold} sold</Text>
        <Text
          style={[
            styles.productStock,
            product.stock.includes("Low") && styles.productStockLow,
            !product.available && styles.productStockOff,
          ]}
        >
          {product.stock}
        </Text>
      </View>

      <Text style={styles.productValue}>{product.price}</Text>
      <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
    </View>
  );
}

function EarningsCard({ onWallet }: { onWallet: () => void }) {
  return (
    <View style={styles.earningsCard}>
      <View style={styles.earningsIcon}>
        <Ionicons name="wallet-outline" size={30} color={COLORS.primary} />
      </View>

      <View style={styles.earningsText}>
        <Text style={styles.earningsLabel}>Earnings This Month</Text>
        <Text style={styles.earningsAmount}>₦55,500</Text>
        <Text style={styles.earningsSub}>Payout is released after delivery confirmation</Text>
      </View>

      <View style={styles.earningsActions}>
        <Pressable style={styles.withdrawButton} onPress={onWallet}>
          <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
        </Pressable>

        <Pressable style={styles.historyButton} onPress={onWallet}>
          <Text style={styles.historyButtonText}>View Payout History</Text>
          <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

function QuickAction({
  icon,
  title,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickIcon}>
        <Ionicons name={icon} size={27} color="#FFFFFF" />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </Pressable>
  );
}

function OrdersTab({
  orders,
  canVendorUpdate,
  getOrderActionLabel,
  onUpdate,
}: {
  orders: VendorOrder[];
  canVendorUpdate: (status: VendorOrderStatus) => boolean;
  getOrderActionLabel: (status: VendorOrderStatus) => string;
  onUpdate: (orderId: string) => void;
}) {
  return (
    <View>
      <VendorNotice
        icon="shield-checkmark-outline"
        title="Protected order rule"
        text="Vendor can only update New Order → Accepted → Preparing → Ready for pickup. Rider/admin handles collected, out for delivery and delivered."
      />

      {orders.map((order) => {
        const canUpdate = canVendorUpdate(order.status);

        return (
          <View key={order.id} style={styles.orderManagementCard}>
            <View style={styles.orderManagementTop}>
              <View>
                <Text style={styles.orderManageRef}>{order.orderRef}</Text>
                <Text style={styles.orderManageCustomer}>{order.customer}</Text>
              </View>

              <StatusBadge status={order.status} />
            </View>

            <Text style={styles.orderManageProduct}>
              {order.product} · Qty {order.quantity}
            </Text>

            <View style={styles.orderInfoBox}>
              <InfoLine label="Amount" value={order.amount} />
              <InfoLine label="Payment ref" value={order.paymentRef} />
              <InfoLine label="Payment" value={order.paymentStatus} />
            </View>

            <Pressable
              style={[styles.primaryButton, !canUpdate && styles.disabledButton]}
              onPress={canUpdate ? () => onUpdate(order.id) : undefined}
            >
              <Ionicons
                name={canUpdate ? "arrow-forward-circle-outline" : "lock-closed-outline"}
                size={19}
                color="#FFFFFF"
              />
              <Text style={styles.primaryButtonText}>
                {getOrderActionLabel(order.status)}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

function ProductsTab({
  products,
  newProductName,
  newProductPrice,
  onProductNameChange,
  onProductPriceChange,
  onAddProduct,
  onToggleProduct,
}: {
  products: VendorProduct[];
  newProductName: string;
  newProductPrice: string;
  onProductNameChange: (value: string) => void;
  onProductPriceChange: (value: string) => void;
  onAddProduct: () => void;
  onToggleProduct: (productId: string) => void;
}) {
  return (
    <View>
      <View style={styles.addProductCard}>
        <Text style={styles.cardTitle}>Add Product</Text>

        <TextInput
          value={newProductName}
          onChangeText={onProductNameChange}
          placeholder="Product name"
          placeholderTextColor={COLORS.muted}
          style={styles.vendorInput}
        />

        <TextInput
          value={newProductPrice}
          onChangeText={onProductPriceChange}
          placeholder="Product price e.g. ₦15,000"
          placeholderTextColor={COLORS.muted}
          style={styles.vendorInput}
        />

        <Pressable style={styles.primaryButton} onPress={onAddProduct}>
          <Ionicons name="add-circle-outline" size={19} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Add Product</Text>
        </Pressable>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionCardTop}>
          <Text style={styles.cardTitle}>Product Management</Text>
          <Text style={styles.viewAllText}>{products.length} items</Text>
        </View>

        {products.map((product) => (
          <View key={product.id} style={styles.productManageRow}>
            <ImageBackground
              source={{ uri: product.image }}
              style={styles.productThumb}
              imageStyle={styles.productThumbImage}
            />

            <View style={styles.productRowMain}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.productSku}>{product.price} · {product.stock}</Text>
            </View>

            <View style={styles.productManageActions}>
              <Pressable style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.availabilityButton,
                  !product.available && styles.availabilityButtonOff,
                ]}
                onPress={() => onToggleProduct(product.id)}
              >
                <Text
                  style={[
                    styles.availabilityText,
                    !product.available && styles.availabilityTextOff,
                  ]}
                >
                  {product.available ? "Available" : "Off"}
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function WalletTab() {
  return (
    <View>
      <View style={styles.walletHero}>
        <View>
          <Text style={styles.walletHeroLabel}>Wallet Balance</Text>
          <Text style={styles.walletHeroAmount}>₦55,500</Text>
          <Text style={styles.walletHeroSub}>Money held by app until delivery confirmation</Text>
        </View>

        <View style={styles.walletHeroIcon}>
          <Ionicons name="wallet-outline" size={32} color={COLORS.primary} />
        </View>
      </View>

      <View style={styles.walletGrid}>
        <WalletMini title="Held by App" value="₦55,500" icon="lock-closed-outline" />
        <WalletMini title="Released" value="₦128,000" icon="cash-outline" />
        <WalletMini title="Commission" value="₦6,400" icon="remove-circle-outline" />
        <WalletMini title="Next Payout" value="After delivery" icon="time-outline" />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.cardTitle}>Wallet Rules</Text>
        <InfoLine label="Customer payment" value="Paid into app first" />
        <InfoLine label="Vendor balance" value="Pending until delivery" />
        <InfoLine label="Release trigger" value="Customer confirms received" />
        <InfoLine label="Commission" value="Deducted before payout" />
      </View>

      <VendorNotice
        icon="business-outline"
        title="Bank withdrawal setup"
        text="Bank details, KYC, commission calculation and real withdrawals will connect when backend/payment integration starts."
      />
    </View>
  );
}

function WalletMini({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.walletMini}>
      <View style={styles.walletMiniIcon}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>
      <Text style={styles.walletMiniValue}>{value}</Text>
      <Text style={styles.walletMiniTitle}>{title}</Text>
    </View>
  );
}

function ProfileTab({
  storeOpen,
  onToggleStore,
}: {
  storeOpen: boolean;
  onToggleStore: () => void;
}) {
  return (
    <View>
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>GF</Text>
        </View>

        <Text style={styles.profileName}>Grace Fashion Hub</Text>
        <Text style={styles.profileSub}>Fashion & Tailoring · Shopping Complex</Text>

        <View style={styles.profileBadgeRow}>
          <StatusBadge status="Ready for pickup" labelOverride="Verified Vendor" />
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.cardTitle}>Store Profile</Text>
        <InfoLine label="Store name" value="Grace Fashion Hub" />
        <InfoLine label="Category" value="Fashion & Tailoring" />
        <InfoLine label="Location" value="Shopping Complex" />
        <InfoLine label="Verification" value="Verified" />
        <InfoLine label="Response time" value="Replies in 3 mins" />
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.profileSwitchRow}>
          <View>
            <Text style={styles.cardTitle}>Store Availability</Text>
            <Text style={styles.profileSwitchText}>
              Customers can order only when your store is open.
            </Text>
          </View>

          <Pressable
            style={[styles.storeToggle, !storeOpen && styles.storeToggleClosed]}
            onPress={onToggleStore}
          >
            <Text style={[styles.storeToggleText, !storeOpen && styles.storeToggleTextClosed]}>
              {storeOpen ? "Open" : "Closed"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.cardTitle}>Bank Details Preview</Text>
        <InfoLine label="Bank setup" value="Not connected yet" />
        <InfoLine label="Withdrawal" value="Backend later" />
        <InfoLine label="KYC/verification" value="Required before payout" />
      </View>
    </View>
  );
}

function VendorNotice({
  icon,
  title,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.noticeCard}>
      <View style={styles.noticeIcon}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>

      <View style={styles.noticeTextBox}>
        <Text style={styles.noticeTitle}>{title}</Text>
        <Text style={styles.noticeText}>{text}</Text>
      </View>
    </View>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function StatusBadge({
  status,
  labelOverride,
}: {
  status: VendorOrderStatus;
  labelOverride?: string;
}) {
  const isNew = status === "New Order";
  const isPreparing = status === "Preparing" || status === "Accepted";
  const isReady = status === "Ready for pickup";
  const isDelivered = status === "Delivered";

  return (
    <View
      style={[
        styles.statusBadge,
        isNew && styles.statusBadgePending,
        isPreparing && styles.statusBadgeBlue,
        isReady && styles.statusBadgeGreen,
        isDelivered && styles.statusBadgeGreen,
      ]}
    >
      <Text
        style={[
          styles.statusBadgeText,
          isNew && styles.statusTextPending,
          isPreparing && styles.statusTextBlue,
          isReady && styles.statusTextGreen,
          isDelivered && styles.statusTextGreen,
        ]}
      >
        {labelOverride || status}
      </Text>
    </View>
  );
}

function VendorBottomNav({
  activeTab,
  onChange,
}: {
  activeTab: VendorTab;
  onChange: (tab: VendorTab) => void;
}) {
  const items: Array<{ tab: VendorTab; icon: keyof typeof Ionicons.glyphMap; label: string }> = [
    { tab: "Dashboard", icon: "grid-outline", label: "Dashboard" },
    { tab: "Orders", icon: "receipt-outline", label: "Orders" },
    { tab: "Products", icon: "cube-outline", label: "Products" },
    { tab: "Wallet", icon: "wallet-outline", label: "Wallet" },
    { tab: "Profile", icon: "person-outline", label: "Profile" },
  ];

  return (
    <View style={styles.bottomNav}>
      {items.map((item) => {
        const active = activeTab === item.tab;

        return (
          <Pressable
            key={item.tab}
            style={styles.bottomNavItem}
            onPress={() => onChange(item.tab)}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={active ? COLORS.primary : COLORS.muted}
            />
            <Text style={[styles.bottomNavText, active && styles.bottomNavTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  page: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 110,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  vendorAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  vendorAvatarText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
  },
  vendorMetaRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  vendorMeta: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
    marginRight: 5,
  },
  vendorDot: {
    marginHorizontal: 5,
    color: COLORS.muted,
    fontWeight: "900",
  },
  vendorStatus: {
    fontSize: 12,
    fontWeight: "900",
  },
  vendorStatusOpen: {
    color: COLORS.green,
  },
  vendorStatusClosed: {
    color: COLORS.red,
  },
  notificationWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
  statsRow: {
    paddingBottom: 12,
  },
  metricCard: {
    width: 148,
    minHeight: 145,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    padding: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  metricTitle: {
    marginTop: 13,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  metricValue: {
    marginTop: 5,
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
  },
  metricTrendRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  metricTrend: {
    marginLeft: 4,
    color: COLORS.green,
    fontSize: 11,
    fontWeight: "800",
  },
  revenueCard: {
    borderRadius: 20,
    backgroundColor: COLORS.card,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  revenueTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },
  revenueAmountRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  revenueAmount: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "900",
  },
  revenueGrowth: {
    marginLeft: 10,
    color: COLORS.green,
    fontSize: 13,
    fontWeight: "900",
  },
  revenueSub: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  rangePill: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },
  rangePillText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "800",
    marginRight: 5,
  },
  chartArea: {
    height: 155,
    marginTop: 18,
  },
  chartGridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 1,
    backgroundColor: COLORS.border,
  },
  chartBars: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  chartColumn: {
    width: "13%",
    alignItems: "center",
  },
  chartColumnInner: {
    height: 112,
    width: 22,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  chartBar: {
    width: 7,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  chartDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.card,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  chartLabel: {
    marginTop: 7,
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
  },
  sectionCard: {
    borderRadius: 20,
    backgroundColor: COLORS.card,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  sectionCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
    marginRight: 3,
  },
  orderRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#FCFCFD",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  orderIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  orderRefBox: {
    width: 88,
    marginLeft: 10,
  },
  orderRef: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
  },
  orderTime: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
  },
  customerCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.softBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },
  customerInitial: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: "900",
  },
  customerName: {
    flex: 1,
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },
  orderAmount: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
    marginHorizontal: 8,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: COLORS.primaryLight,
  },
  statusBadgePending: {
    backgroundColor: COLORS.softOrange,
  },
  statusBadgeBlue: {
    backgroundColor: COLORS.softBlue,
  },
  statusBadgeGreen: {
    backgroundColor: COLORS.softGreen,
  },
  statusBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
  },
  statusTextPending: {
    color: COLORS.orange,
  },
  statusTextBlue: {
    color: COLORS.blue,
  },
  statusTextGreen: {
    color: COLORS.green,
  },
  productRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
  },
  productThumb: {
    width: 54,
    height: 54,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.border,
  },
  productThumbImage: {
    borderRadius: 12,
    resizeMode: "cover",
  },
  productRowMain: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "900",
  },
  productSku: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  productSoldBox: {
    width: 92,
  },
  productSold: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
  },
  productStock: {
    marginTop: 3,
    color: COLORS.green,
    fontSize: 11,
    fontWeight: "800",
  },
  productStockLow: {
    color: COLORS.orange,
  },
  productStockOff: {
    color: COLORS.red,
  },
  productValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "900",
    marginHorizontal: 8,
  },
  earningsCard: {
    minHeight: 125,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  earningsIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.78)",
    alignItems: "center",
    justifyContent: "center",
  },
  earningsText: {
    flex: 1,
    marginLeft: 14,
  },
  earningsLabel: {
    color: "#E6F4EF",
    fontSize: 12,
    fontWeight: "800",
  },
  earningsAmount: {
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
  },
  earningsSub: {
    marginTop: 3,
    color: "#D4ECE2",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  earningsActions: {
    width: 118,
    alignItems: "stretch",
  },
  withdrawButton: {
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },
  withdrawButtonText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
  },
  historyButton: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  historyButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  quickTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 10,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickAction: {
    width: "48%",
    height: 105,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quickActionText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },
  noticeCard: {
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  noticeIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  noticeTextBox: {
    flex: 1,
    marginLeft: 12,
  },
  noticeTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  noticeText: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  orderManagementCard: {
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 14,
  },
  orderManagementTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderManageRef: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  orderManageCustomer: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },
  orderManageProduct: {
    marginTop: 12,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },
  orderInfoBox: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  infoLine: {
    minHeight: 33,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
    maxWidth: "55%",
    textAlign: "right",
  },
  primaryButton: {
    marginTop: 14,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#98A2B3",
  },
  primaryButtonText: {
    marginLeft: 8,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  addProductCard: {
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 16,
  },
  vendorInput: {
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    marginTop: 12,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  productManageRow: {
    minHeight: 78,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  productManageActions: {
    alignItems: "flex-end",
  },
  editButton: {
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  editButtonText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: "900",
  },
  availabilityButton: {
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.softGreen,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  availabilityButtonOff: {
    backgroundColor: COLORS.softRed,
  },
  availabilityText: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: "900",
  },
  availabilityTextOff: {
    color: COLORS.red,
  },
  walletHero: {
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  walletHeroLabel: {
    color: "#D4ECE2",
    fontSize: 12,
    fontWeight: "800",
  },
  walletHeroAmount: {
    marginTop: 5,
    color: "#FFFFFF",
    fontSize: 33,
    fontWeight: "900",
  },
  walletHeroSub: {
    marginTop: 5,
    color: "#D4ECE2",
    fontSize: 12,
    fontWeight: "700",
  },
  walletHeroIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  walletGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  walletMini: {
    width: "48.5%",
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
  },
  walletMiniIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  walletMiniValue: {
    marginTop: 10,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },
  walletMiniTitle: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "800",
  },
  profileCard: {
    borderRadius: 24,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  profileAvatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  profileName: {
    marginTop: 14,
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
  },
  profileSub: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  profileBadgeRow: {
    marginTop: 12,
  },
  profileSwitchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileSwitchText: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
    maxWidth: 210,
  },
  storeToggle: {
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  storeToggleClosed: {
    backgroundColor: COLORS.softRed,
    borderWidth: 1,
    borderColor: "#FECDCA",
  },
  storeToggleText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  storeToggleTextClosed: {
    color: COLORS.red,
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 78,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  bottomNavText: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
  },
  bottomNavTextActive: {
    color: COLORS.primary,
  },
});