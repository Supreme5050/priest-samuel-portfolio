import AsyncStorage from "@react-native-async-storage/async-storage";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type LiveResult<T = unknown> = {
  ok: boolean;
  source: "supabase" | "local";
  message: string;
  data?: T;
};

export type VendorAccountInput = {
  ownerName: string;
  phone: string;
  storeName: string;
  category: string;
  area: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};

export type VendorSession = VendorAccountInput & {
  id: string;
  vendorId: string;
  status: "pending" | "approved";
  createdAt: string;
};

export type VendorProductInput = {
  id?: string;
  vendorId: string;
  name: string;
  price: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  inStock?: boolean;
};

export type ChatMessageInput = {
  threadId?: string;
  vendorId: string;
  vendorName?: string;
  customerName?: string;
  productId?: string;
  productName?: string;
  senderRole: "customer" | "vendor";
  message: string;
};

export type DeliveryPersonInput = {
  fullName: string;
  phone: string;
  currentArea: string;
  vehicleType: "walk" | "bike" | "car" | "van";
};

export type DeliveryJob = {
  id: string;
  order_id: string;
  vendor_name: string;
  customer_name: string;
  pickup_area: string;
  dropoff_area: string;
  status: string;
  rider_name?: string;
  rider_phone?: string;
  delivery_pin?: string;
  created_at?: string;
};

const STORAGE_KEYS = {
  vendorSession: "rcn.vendor.session",
  vendorProducts: "rcn.vendor.products",
  chatMessages: "rcn.chat.messages",
  deliveryPerson: "rcn.delivery.person",
  deliveryJobs: "rcn.delivery.jobs",
};

function createTextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function numberFromPrice(value: string) {
  return Number(value.replace(/[^0-9.]/g, "")) || 0;
}

function getSafeVendorId(storeName: string) {
  const slug = storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return `vendor-${slug || Date.now()}`;
}

async function readJsonArray<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJsonArray<T>(key: string, value: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getActiveVendorSession() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.vendorSession);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as VendorSession;
  } catch {
    return null;
  }
}

export async function createVendorAccountLive(
  input: VendorAccountInput
): Promise<LiveResult<VendorSession>> {
  const vendorId = getSafeVendorId(input.storeName);
  const session: VendorSession = {
    ...input,
    id: createTextId("store"),
    vendorId,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(STORAGE_KEYS.vendorSession, JSON.stringify(session));

  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: true,
      source: "local",
      data: session,
      message: "Vendor account saved locally. Supabase is not configured.",
    };
  }

  try {
    const { error: storeError } = await supabase.from("vendor_stores").insert({
      vendor_id: session.vendorId,
      owner_name: input.ownerName,
      phone: input.phone,
      store_name: input.storeName,
      category: input.category,
      area: input.area,
      address: input.address || input.area,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      status: "pending",
    });

    if (storeError) throw storeError;

    await supabase.from("vendors").upsert(
      {
        id: session.vendorId,
        name: input.storeName,
        category: input.category,
        category_label: input.category,
        area: input.area,
        address: input.address || input.area,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        phone: input.phone,
        whatsapp: input.phone,
        rating: 4.5,
        is_open: true,
      },
      { onConflict: "id" }
    );

    return {
      ok: true,
      source: "supabase",
      data: session,
      message: "Vendor account submitted to Supabase.",
    };
  } catch (error) {
    console.warn("Vendor account Supabase sync failed", error);
    return {
      ok: true,
      source: "local",
      data: session,
      message: "Vendor account saved locally. Backend sync failed but app can continue.",
    };
  }
}

export async function signInVendorLive(input: {
  phone: string;
  storeName?: string;
}): Promise<LiveResult<VendorSession>> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("vendor_stores")
        .select("*")
        .eq("phone", input.phone)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const session: VendorSession = {
          id: String(data.id),
          vendorId: String(data.vendor_id || data.id),
          ownerName: String(data.owner_name || "Vendor"),
          phone: String(data.phone || input.phone),
          storeName: String(data.store_name || input.storeName || "Vendor Store"),
          category: String(data.category || "General"),
          area: String(data.area || "Redemption City"),
          address: data.address ? String(data.address) : undefined,
          latitude: data.latitude ? Number(data.latitude) : undefined,
          longitude: data.longitude ? Number(data.longitude) : undefined,
          status: String(data.status || "pending") as "pending" | "approved",
          createdAt: String(data.created_at || new Date().toISOString()),
        };

        await AsyncStorage.setItem(STORAGE_KEYS.vendorSession, JSON.stringify(session));

        return {
          ok: true,
          source: "supabase",
          data: session,
          message: "Vendor signed in from Supabase.",
        };
      }
    } catch (error) {
      console.warn("Vendor sign in Supabase lookup failed", error);
    }
  }

  const localSession = await getActiveVendorSession();

  if (localSession) {
    return {
      ok: true,
      source: "local",
      data: localSession,
      message: "Vendor signed in from local device storage.",
    };
  }

  const demoSession: VendorSession = {
    id: createTextId("store"),
    vendorId: getSafeVendorId(input.storeName || "Demo Vendor"),
    ownerName: "Demo Vendor",
    phone: input.phone,
    storeName: input.storeName || "Demo Vendor Store",
    category: "General",
    area: "Redemption City",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(STORAGE_KEYS.vendorSession, JSON.stringify(demoSession));

  return {
    ok: true,
    source: "local",
    data: demoSession,
    message: "Demo vendor session created locally.",
  };
}

export async function createVendorProductLive(
  input: VendorProductInput
): Promise<LiveResult> {
  const productId = input.id || createTextId("product");
  const localProduct = {
    ...input,
    id: productId,
    createdAt: new Date().toISOString(),
  };

  const currentProducts = await readJsonArray<typeof localProduct>(
    STORAGE_KEYS.vendorProducts
  );
  await writeJsonArray(STORAGE_KEYS.vendorProducts, [localProduct, ...currentProducts]);

  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: true,
      source: "local",
      message: "Product saved locally. Supabase is not configured.",
    };
  }

  try {
    const { error } = await supabase.from("vendor_products").insert({
      id: productId,
      vendor_id: input.vendorId,
      name: input.name,
      description: input.description || input.category || "Vendor product",
      price: numberFromPrice(input.price),
      unit: "item",
      image_url: input.imageUrl || null,
      in_stock: input.inStock !== false,
    });

    if (error) throw error;

    return {
      ok: true,
      source: "supabase",
      message: "Product uploaded to Supabase.",
    };
  } catch (error) {
    console.warn("Vendor product Supabase sync failed", error);
    return {
      ok: true,
      source: "local",
      message: "Product saved locally. Backend sync failed but app can continue.",
    };
  }
}

export async function sendChatMessageLive(
  input: ChatMessageInput
): Promise<LiveResult> {
  const threadId =
    input.threadId ||
    `thread-${input.vendorId}-${input.productId || "general"}`.replace(/[^a-zA-Z0-9-_]/g, "-");

  const messageRow = {
    id: createTextId("msg"),
    thread_id: threadId,
    vendor_id: input.vendorId,
    vendor_name: input.vendorName || "Vendor",
    customer_name: input.customerName || "Guest Customer",
    product_id: input.productId || null,
    product_name: input.productName || null,
    sender_role: input.senderRole,
    message: input.message,
    created_at: new Date().toISOString(),
  };

  const currentMessages = await readJsonArray<typeof messageRow>(
    STORAGE_KEYS.chatMessages
  );
  await writeJsonArray(STORAGE_KEYS.chatMessages, [messageRow, ...currentMessages]);

  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: true,
      source: "local",
      message: "Message saved locally.",
    };
  }

  try {
    await supabase.from("chat_threads").upsert(
      {
        id: threadId,
        vendor_id: input.vendorId,
        vendor_name: input.vendorName || "Vendor",
        customer_name: input.customerName || "Guest Customer",
        product_id: input.productId || null,
        product_name: input.productName || null,
        last_message: input.message,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    const { error } = await supabase.from("chat_messages").insert(messageRow);
    if (error) throw error;

    return {
      ok: true,
      source: "supabase",
      message: "Message saved to Supabase.",
    };
  } catch (error) {
    console.warn("Chat Supabase sync failed", error);
    return {
      ok: true,
      source: "local",
      message: "Message saved locally. Backend sync failed but chat can continue.",
    };
  }
}

export async function registerDeliveryPersonLive(
  input: DeliveryPersonInput
): Promise<LiveResult> {
  const riderId = createTextId("rider");
  const profile = {
    id: riderId,
    full_name: input.fullName,
    phone: input.phone,
    current_area: input.currentArea,
    vehicle_type: input.vehicleType,
    status: "available",
    created_at: new Date().toISOString(),
  };

  await AsyncStorage.setItem(STORAGE_KEYS.deliveryPerson, JSON.stringify(profile));

  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: true,
      source: "local",
      message: "Delivery profile saved locally.",
      data: profile,
    };
  }

  try {
    const { error } = await supabase.from("delivery_people").insert(profile);
    if (error) throw error;

    return {
      ok: true,
      source: "supabase",
      message: "Delivery profile saved to Supabase.",
      data: profile,
    };
  } catch (error) {
    console.warn("Delivery profile Supabase sync failed", error);
    return {
      ok: true,
      source: "local",
      message: "Delivery profile saved locally. Backend sync failed.",
      data: profile,
    };
  }
}

export async function getDeliveryJobsLive(): Promise<DeliveryJob[]> {
  const fallbackJobs: DeliveryJob[] = [
    {
      id: "job-demo-1",
      order_id: "RCN-900122",
      vendor_name: "CRM Kitchen",
      customer_name: "Sis. Amaka",
      pickup_area: "CRM Kitchen / Macedonia Road",
      dropoff_area: "Haggai Estate Gate",
      status: "available",
      delivery_pin: "4821",
      created_at: new Date().toISOString(),
    },
    {
      id: "job-demo-2",
      order_id: "RCN-900125",
      vendor_name: "Comfort Supermarket",
      customer_name: "Bro. Tobi",
      pickup_area: "Comfort Palace / CRM Supermarket",
      dropoff_area: "ICT Plaza Area",
      status: "available",
      delivery_pin: "7394",
      created_at: new Date().toISOString(),
    },
  ];

  if (!isSupabaseConfigured || !supabase) return fallbackJobs;

  try {
    const { data, error } = await supabase
      .from("delivery_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error || !data || data.length === 0) return fallbackJobs;

    return data as DeliveryJob[];
  } catch (error) {
    console.warn("Delivery jobs Supabase load failed", error);
    return fallbackJobs;
  }
}

export async function acceptDeliveryJobLive(input: {
  jobId: string;
  riderName: string;
  riderPhone: string;
}): Promise<LiveResult> {
  const currentJobs = await readJsonArray<DeliveryJob>(STORAGE_KEYS.deliveryJobs);
  await writeJsonArray(STORAGE_KEYS.deliveryJobs, [
    {
      id: input.jobId,
      order_id: input.jobId,
      vendor_name: "Assigned vendor",
      customer_name: "Assigned customer",
      pickup_area: "Vendor location",
      dropoff_area: "Customer destination",
      status: "accepted",
      rider_name: input.riderName,
      rider_phone: input.riderPhone,
      created_at: new Date().toISOString(),
    },
    ...currentJobs,
  ]);

  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: true,
      source: "local",
      message: "Delivery job accepted locally.",
    };
  }

  try {
    const { error } = await supabase
      .from("delivery_jobs")
      .update({
        status: "accepted",
        rider_name: input.riderName,
        rider_phone: input.riderPhone,
        accepted_at: new Date().toISOString(),
      })
      .eq("id", input.jobId);

    if (error) throw error;

    return {
      ok: true,
      source: "supabase",
      message: "Delivery job accepted in Supabase.",
    };
  } catch (error) {
    console.warn("Accept delivery job Supabase sync failed", error);
    return {
      ok: true,
      source: "local",
      message: "Delivery job accepted locally. Backend sync failed.",
    };
  }
}

export async function syncMarketOrderToBackend(order: any): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from("market_orders").upsert(
      {
        id: order.id,
        vendor_id: order.vendorId,
        vendor_name: order.vendorName,
        product_id: order.productId,
        product_name: order.productName,
        customer_name: order.customerName,
        quantity: order.quantity,
        amount: order.amount,
        delivery_area: order.deliveryArea,
        delivery_note: order.deliveryNote,
        delivery_pin: order.deliveryPin,
        status: order.status,
        payment_status: order.paymentStatus,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    await supabase.from("delivery_jobs").upsert(
      {
        id: `delivery-${order.id}`,
        order_id: order.id,
        vendor_id: order.vendorId,
        vendor_name: order.vendorName,
        customer_name: order.customerName,
        pickup_area: order.vendorName,
        dropoff_area: order.deliveryArea,
        delivery_pin: order.deliveryPin,
        status: order.status === "out_for_delivery" ? "available" : "pending",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  } catch (error) {
    console.warn("Market order Supabase sync failed", error);
  }
}
