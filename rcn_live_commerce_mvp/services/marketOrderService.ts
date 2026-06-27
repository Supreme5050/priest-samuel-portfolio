import { syncMarketOrderToBackend } from "@/services/commerceLiveService";

export type MarketOrderStatus =
  | "paid"
  | "accepted"
  | "preparing"
  | "out_for_delivery"
  | "proof_submitted"
  | "disputed"
  | "completed"
  | "cancelled";

export type MarketPaymentStatus = "held" | "released" | "refunded";

export type AdminDecisionType =
  | "order_created"
  | "status_updated"
  | "delivery_confirmed"
  | "proof_submitted"
  | "dispute_reported"
  | "payout_released"
  | "customer_refunded";

export type AdminDecisionLog = {
  id: string;
  orderId: string;
  type: AdminDecisionType;
  title: string;
  note: string;
  createdAt: string;
};

export type MarketOrder = {
  id: string;
  vendorId: string;
  vendorName: string;
  productId: string;
  productName: string;
  customerName: string;
  quantity: number;
  amount: string;
  deliveryArea: string;
  deliveryNote: string;
  deliveryPin: string;
  status: MarketOrderStatus;
  paymentStatus: MarketPaymentStatus;
  createdAt: string;
  updatedAt: string;
  proofNote?: string;
  proofLocation?: string;
  disputeReason?: string;
  disputeNote?: string;
  adminNote?: string;
  payoutReleasedAt?: string;
  refundedAt?: string;
};

export type CreateMarketOrderInput = {
  orderId?: string;
  vendorId: string;
  vendorName: string;
  productId: string;
  productName: string;
  quantity: number;
  amount: string;
  customerName?: string;
  deliveryArea?: string;
  deliveryNote?: string;
  deliveryPin?: string;
};

type OrderListener = (orders: MarketOrder[]) => void;

type MarketOrderStore = {
  orders: MarketOrder[];
  logs: AdminDecisionLog[];
  listeners: Set<OrderListener>;
};

declare global {
  // eslint-disable-next-line no-var
  var __RCN_MARKET_ORDER_STORE__: MarketOrderStore | undefined;
}

function nowLabel() {
  return new Date().toLocaleString();
}

function generateOrderId() {
  return `RCN-${Date.now().toString().slice(-6)}`;
}

function generatePin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function generateLogId() {
  return `LOG-${Date.now()}-${Math.floor(Math.random() * 999)}`;
}

export function parseNairaAmount(value: string) {
  return Number(value.replace(/[^\d]/g, "")) || 0;
}

export function formatNaira(value: number) {
  return `₦${value.toLocaleString()}`;
}

const starterOrders: MarketOrder[] = [
  {
    id: "RCN-900122",
    vendorId: "vendor-crm-kitchen",
    vendorName: "CRM Kitchen",
    productId: "rice-stew",
    productName: "Rice and stew",
    customerName: "Sis. Amaka",
    quantity: 2,
    amount: "₦3,150",
    deliveryArea: "Haggai Estate Gate",
    deliveryNote: "Deliver close to the security post.",
    deliveryPin: "4821",
    status: "out_for_delivery",
    paymentStatus: "held",
    createdAt: "Today · 8:42 AM",
    updatedAt: "Today · 8:42 AM",
  },
  {
    id: "RCN-900123",
    vendorId: "vendor-crm-kitchen",
    vendorName: "CRM Kitchen",
    productId: "bottle-water",
    productName: "Bottle water",
    customerName: "Bro. Tobi",
    quantity: 5,
    amount: "₦1,575",
    deliveryArea: "ICT Plaza Area",
    deliveryNote: "Call when you get to the plaza.",
    deliveryPin: "7394",
    status: "proof_submitted",
    paymentStatus: "held",
    createdAt: "Today · 9:10 AM",
    updatedAt: "Today · 9:40 AM",
    proofNote:
      "Vendor says item was delivered at ICT Plaza but customer did not provide PIN.",
    proofLocation: "ICT Plaza Area",
  },
  {
    id: "RCN-900124",
    vendorId: "vendor-comfort-supermarket",
    vendorName: "Comfort Supermarket",
    productId: "bread",
    productName: "Bread",
    customerName: "Mummy Grace",
    quantity: 3,
    amount: "₦3,150",
    deliveryArea: "CRM / Comfort Palace Area",
    deliveryNote: "Deliver before evening service.",
    deliveryPin: "6158",
    status: "disputed",
    paymentStatus: "held",
    createdAt: "Today · 9:33 AM",
    updatedAt: "Today · 10:02 AM",
    disputeReason: "Incomplete quantity",
    disputeNote: "Customer says only 2 breads were delivered instead of 3.",
  },
];

const starterLogs: AdminDecisionLog[] = [
  {
    id: "LOG-900124",
    orderId: "RCN-900124",
    type: "dispute_reported",
    title: "Customer reported a problem",
    note: "Payment remains locked until admin review.",
    createdAt: "Today · 10:02 AM",
  },
  {
    id: "LOG-900123",
    orderId: "RCN-900123",
    type: "proof_submitted",
    title: "Vendor submitted delivery proof",
    note: "Admin should review proof before release.",
    createdAt: "Today · 9:40 AM",
  },
];

function getStore(): MarketOrderStore {
  if (!globalThis.__RCN_MARKET_ORDER_STORE__) {
    globalThis.__RCN_MARKET_ORDER_STORE__ = {
      orders: starterOrders,
      logs: starterLogs,
      listeners: new Set<OrderListener>(),
    };
  }

  return globalThis.__RCN_MARKET_ORDER_STORE__;
}

function cloneOrders() {
  return [...getStore().orders];
}

function notifyListeners() {
  const store = getStore();
  const orders = cloneOrders();

  store.listeners.forEach((listener) => {
    listener(orders);
  });
}

function addAdminLog(log: Omit<AdminDecisionLog, "id" | "createdAt">) {
  const store = getStore();

  store.logs = [
    {
      id: generateLogId(),
      createdAt: nowLabel(),
      ...log,
    },
    ...store.logs,
  ];
}

function updateOrder(
  orderId: string,
  updater: (order: MarketOrder) => MarketOrder
) {
  const store = getStore();
  let updatedOrder: MarketOrder | undefined;

  store.orders = store.orders.map((order) => {
    if (order.id !== orderId) return order;

    updatedOrder = updater(order);
    return updatedOrder;
  });

  notifyListeners();

  if (updatedOrder) {
    syncMarketOrderToBackend(updatedOrder);
  }

  return updatedOrder;
}

export function subscribeToMarketOrders(listener: OrderListener) {
  const store = getStore();

  store.listeners.add(listener);
  listener(cloneOrders());

  return () => {
    store.listeners.delete(listener);
  };
}

export function getMarketOrders() {
  return cloneOrders();
}

export function getAdminLogs() {
  return [...getStore().logs];
}

export function getMarketOrderById(orderId: string) {
  return getStore().orders.find((order) => order.id === orderId);
}

export function getOrdersForVendor(vendorId: string) {
  return getStore().orders.filter((order) => order.vendorId === vendorId);
}

export function createMarketOrder(input: CreateMarketOrderInput) {
  const store = getStore();
  const orderId = input.orderId || generateOrderId();

  const existingOrder = store.orders.find((order) => order.id === orderId);
  if (existingOrder) return existingOrder;

  const newOrder: MarketOrder = {
    id: orderId,
    vendorId: input.vendorId,
    vendorName: input.vendorName,
    productId: input.productId,
    productName: input.productName,
    customerName: input.customerName || "Guest Customer",
    quantity: input.quantity,
    amount: input.amount,
    deliveryArea: input.deliveryArea || "Redemption City",
    deliveryNote: input.deliveryNote || "",
    deliveryPin: input.deliveryPin || generatePin(),
    status: "paid",
    paymentStatus: "held",
    createdAt: nowLabel(),
    updatedAt: nowLabel(),
  };

  store.orders = [newOrder, ...store.orders];
  syncMarketOrderToBackend(newOrder);

  addAdminLog({
    orderId: newOrder.id,
    type: "order_created",
    title: "New protected order created",
    note: `${newOrder.amount} paid into app and held for ${newOrder.vendorName}.`,
  });

  notifyListeners();

  return newOrder;
}

export function getOrderStatusLabel(status: MarketOrderStatus) {
  if (status === "paid") return "Paid / New order";
  if (status === "accepted") return "Accepted";
  if (status === "preparing") return "Preparing";
  if (status === "out_for_delivery") return "Out for delivery";
  if (status === "proof_submitted") return "Proof submitted";
  if (status === "disputed") return "Disputed";
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Cancelled";

  return "Order";
}

export function getNextVendorActionLabel(status: MarketOrderStatus) {
  if (status === "paid") return "Accept Order";
  if (status === "accepted") return "Start Preparing";
  if (status === "preparing") return "Send Out";

  return "Waiting";
}

export function advanceVendorOrder(orderId: string) {
  const updated = updateOrder(orderId, (order) => {
    let nextStatus: MarketOrderStatus = order.status;

    if (order.status === "paid") nextStatus = "accepted";
    if (order.status === "accepted") nextStatus = "preparing";
    if (order.status === "preparing") nextStatus = "out_for_delivery";

    return {
      ...order,
      status: nextStatus,
      updatedAt: nowLabel(),
    };
  });

  if (updated) {
    addAdminLog({
      orderId,
      type: "status_updated",
      title: "Vendor updated order status",
      note: `Order moved to ${getOrderStatusLabel(updated.status)}.`,
    });
  }

  return updated;
}

export function confirmDeliveryPin(orderId: string, pin: string) {
  const order = getMarketOrderById(orderId);

  if (!order) {
    return {
      ok: false,
      message: "Order was not found.",
    };
  }

  if (pin.trim() !== order.deliveryPin) {
    return {
      ok: false,
      message:
        "The PIN is not correct. The customer should give the correct PIN only after receiving the item.",
    };
  }

  updateOrder(orderId, (currentOrder) => ({
    ...currentOrder,
    status: "completed",
    paymentStatus: "released",
    payoutReleasedAt: nowLabel(),
    updatedAt: nowLabel(),
  }));

  addAdminLog({
    orderId,
    type: "delivery_confirmed",
    title: "Delivery confirmed by PIN",
    note: "Correct delivery PIN entered. Vendor payout released.",
  });

  return {
    ok: true,
    message:
      "Correct PIN entered. Delivery is confirmed and vendor payout can be released.",
  };
}

export function customerConfirmReceived(orderId: string) {
  const updated = updateOrder(orderId, (order) => ({
    ...order,
    status: "completed",
    paymentStatus: "released",
    payoutReleasedAt: nowLabel(),
    updatedAt: nowLabel(),
  }));

  if (updated) {
    addAdminLog({
      orderId,
      type: "delivery_confirmed",
      title: "Customer confirmed received",
      note: "Customer tapped received. Vendor payout released.",
    });
  }

  return updated;
}

export function submitDeliveryProof(
  orderId: string,
  payload: {
    proofNote: string;
    proofLocation: string;
  }
) {
  const updated = updateOrder(orderId, (order) => ({
    ...order,
    status: "proof_submitted",
    proofNote: payload.proofNote,
    proofLocation: payload.proofLocation,
    updatedAt: nowLabel(),
  }));

  if (updated) {
    addAdminLog({
      orderId,
      type: "proof_submitted",
      title: "Vendor submitted delivery proof",
      note: payload.proofNote || "Vendor submitted proof for admin review.",
    });
  }

  return updated;
}

export function reportOrderProblem(
  orderId: string,
  payload: {
    disputeReason: string;
    disputeNote: string;
  }
) {
  const updated = updateOrder(orderId, (order) => ({
    ...order,
    status: "disputed",
    disputeReason: payload.disputeReason,
    disputeNote: payload.disputeNote,
    paymentStatus: "held",
    updatedAt: nowLabel(),
  }));

  if (updated) {
    addAdminLog({
      orderId,
      type: "dispute_reported",
      title: "Customer reported a problem",
      note: `${payload.disputeReason}: ${payload.disputeNote}`,
    });
  }

  return updated;
}

export function adminReleaseVendorPayout(orderId: string, adminNote?: string) {
  const order = getMarketOrderById(orderId);

  if (!order) {
    return {
      ok: false,
      message: "Order was not found.",
    };
  }

  if (order.paymentStatus === "released") {
    return {
      ok: false,
      message: "This payout has already been released.",
    };
  }

  if (order.paymentStatus === "refunded") {
    return {
      ok: false,
      message: "This order has already been refunded.",
    };
  }

  updateOrder(orderId, (currentOrder) => ({
    ...currentOrder,
    status: "completed",
    paymentStatus: "released",
    adminNote: adminNote || "Admin approved vendor payout.",
    payoutReleasedAt: nowLabel(),
    updatedAt: nowLabel(),
  }));

  addAdminLog({
    orderId,
    type: "payout_released",
    title: "Admin released vendor payout",
    note:
      adminNote ||
      `Admin reviewed the order and released ${order.amount} to ${order.vendorName}.`,
  });

  return {
    ok: true,
    message: "Vendor payout has been released.",
  };
}

export function adminRefundCustomer(orderId: string, adminNote?: string) {
  const order = getMarketOrderById(orderId);

  if (!order) {
    return {
      ok: false,
      message: "Order was not found.",
    };
  }

  if (order.paymentStatus === "refunded") {
    return {
      ok: false,
      message: "This customer has already been refunded.",
    };
  }

  if (order.paymentStatus === "released") {
    return {
      ok: false,
      message: "This payout has already been released to the vendor.",
    };
  }

  updateOrder(orderId, (currentOrder) => ({
    ...currentOrder,
    status: "cancelled",
    paymentStatus: "refunded",
    adminNote: adminNote || "Admin approved customer refund.",
    refundedAt: nowLabel(),
    updatedAt: nowLabel(),
  }));

  addAdminLog({
    orderId,
    type: "customer_refunded",
    title: "Admin refunded customer",
    note:
      adminNote ||
      `Admin reviewed the dispute and refunded ${order.amount} to the customer.`,
  });

  return {
    ok: true,
    message: "Customer refund has been approved.",
  };
}

export function getVendorWalletSummary(vendorId: string) {
  const vendorOrders = getOrdersForVendor(vendorId);

  const pendingEscrow = vendorOrders
    .filter((order) => order.paymentStatus === "held")
    .reduce((total, order) => total + parseNairaAmount(order.amount), 0);

  const releasedGross = vendorOrders
    .filter((order) => order.paymentStatus === "released")
    .reduce((total, order) => total + parseNairaAmount(order.amount), 0);

  const appCommission = Math.round(releasedGross * 0.05);
  const availablePayout = Math.max(0, releasedGross - appCommission);

  return {
    totalOrders: vendorOrders.length,
    pendingEscrow,
    releasedGross,
    appCommission,
    availablePayout,
  };
}

export function getAdminSummary() {
  const orders = getMarketOrders();

  const totalHeld = orders
    .filter((order) => order.paymentStatus === "held")
    .reduce((total, order) => total + parseNairaAmount(order.amount), 0);

  const totalReleased = orders
    .filter((order) => order.paymentStatus === "released")
    .reduce((total, order) => total + parseNairaAmount(order.amount), 0);

  const totalRefunded = orders
    .filter((order) => order.paymentStatus === "refunded")
    .reduce((total, order) => total + parseNairaAmount(order.amount), 0);

  const disputes = orders.filter((order) => order.status === "disputed").length;
  const proofReviews = orders.filter(
    (order) => order.status === "proof_submitted"
  ).length;

  return {
    totalOrders: orders.length,
    totalHeld,
    totalReleased,
    totalRefunded,
    disputes,
    proofReviews,
  };
}