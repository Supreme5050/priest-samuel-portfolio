import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    MARKET_COLORS as COLORS,
    getCategoryColor,
    getCategoryIcon,
} from "@/data/marketAssets";
import {
    vendors,
    type ProductSection,
    type Vendor,
    type VendorProduct,
} from "@/data/vendors";
import { createVendorProductLive } from "@/services/commerceLiveService";

const serifFont = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

function getDefaultMarketSection(vendor: Vendor): ProductSection {
  if (vendor.category === "fresh_food") return "fresh_food";
  if (vendor.category === "foodstuff") return "foodstuff";
  if (vendor.category === "ready_food") return "ready_meals";
  if (vendor.category === "groceries") return "groceries";
  if (vendor.category === "fashion") return "fashion";
  if (vendor.category === "electronics") return "electronics";
  if (vendor.category === "pharmacy") return "health";
  return "home_services";
}

export default function VendorProductsScreen() {
  const params = useLocalSearchParams();
  const vendorId =
    typeof params.vendorId === "string" ? params.vendorId : vendors[0].id;

  const vendor = vendors.find((item) => item.id === vendorId) || vendors[0];

  const [products, setProducts] = useState<VendorProduct[]>(vendor.products);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const activeCount = products.filter((product) => product.available).length;

  async function addProduct() {
    const cleanName = name.trim();
    const cleanPrice = price.trim();

    if (!cleanName || !cleanPrice) {
      Alert.alert("Missing details", "Enter product name and price.");
      return;
    }

    const newProduct: VendorProduct = {
      id: `custom-${Date.now()}`,
      name: cleanName,
      price: cleanPrice.startsWith("₦") ? cleanPrice : `₦${cleanPrice}`,
      available: true,
      marketSection: getDefaultMarketSection(vendor),
    };

    setProducts((current) => [newProduct, ...current]);

    const result = await createVendorProductLive({
      id: newProduct.id,
      vendorId: vendor.id,
      name: newProduct.name,
      price: newProduct.price,
      category: vendor.category,
      inStock: newProduct.available,
    });

    Alert.alert("Product saved", result.message);

    setName("");
    setPrice("");
    setShowForm(false);
  }

  function toggleProduct(productId: string) {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? { ...product, available: !product.available }
          : product
      )
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>STORE PRODUCTS</Text>
            <Text style={styles.title}>Products</Text>
            <Text style={styles.subtitle}>{vendor.name}</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <StatBox label="All products" value={String(products.length)} icon="cube" />
          <StatBox label="Active" value={String(activeCount)} icon="checkmark-circle" />
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => setShowForm((value) => !value)}
        >
          <Ionicons name="add-circle" size={21} color={COLORS.white} />
          <Text style={styles.addButtonText}>Add Product</Text>
        </Pressable>

        {showForm ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>New product</Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Product name"
              placeholderTextColor={COLORS.textMuted}
              style={styles.input}
            />

            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="Price, example: ₦1,500"
              placeholderTextColor={COLORS.textMuted}
              style={styles.input}
              keyboardType="numeric"
            />

            <Pressable style={styles.saveButton} onPress={addProduct}>
              <Text style={styles.saveButtonText}>Save Product</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.productList}>
          {products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View
                style={[
                  styles.productIcon,
                  { backgroundColor: `${getCategoryColor(vendor.category)}18` },
                ]}
              >
                <Ionicons
                  name={
                    getCategoryIcon(
                      vendor.category
                    ) as keyof typeof Ionicons.glyphMap
                  }
                  size={24}
                  color={getCategoryColor(vendor.category)}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productMeta}>
                  {product.marketSection.replace("_", " ")}
                </Text>
                <Text style={styles.productPrice}>{product.price}</Text>
              </View>

              <Pressable
                style={[
                  styles.statusPill,
                  product.available ? styles.activePill : styles.inactivePill,
                ]}
                onPress={() => toggleProduct(product.id)}
              >
                <Text
                  style={[
                    styles.statusText,
                    product.available ? styles.activeText : styles.inactiveText,
                  ]}
                >
                  {product.available ? "Active" : "Off"}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function StatBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon} size={22} color={COLORS.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 34 : 56,
    paddingBottom: 120,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 13 },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  title: {
    marginTop: 3,
    color: COLORS.primaryDark,
    fontSize: 30,
    fontWeight: "900",
    fontFamily: serifFont,
  },
  subtitle: {
    marginTop: 2,
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  summaryGrid: {
    marginTop: 22,
    flexDirection: "row",
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  statValue: {
    marginTop: 10,
    color: COLORS.primaryDark,
    fontSize: 25,
    fontWeight: "900",
    fontFamily: serifFont,
  },
  statLabel: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "900",
  },
  addButton: {
    marginTop: 16,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "900",
  },
  formCard: {
    marginTop: 14,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12,
  },
  formTitle: {
    color: COLORS.primaryDark,
    fontSize: 18,
    fontWeight: "900",
    fontFamily: serifFont,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  saveButton: {
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: "900",
  },
  productList: {
    marginTop: 16,
    gap: 12,
  },
  productCard: {
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  productIcon: {
    width: 56,
    height: 56,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  productName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },
  productMeta: {
    marginTop: 3,
    color: COLORS.textMuted,
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "800",
  },
  productPrice: {
    marginTop: 5,
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  activePill: {
    backgroundColor: COLORS.primarySoft,
  },
  inactivePill: {
    backgroundColor: "#FEF2F2",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "900",
  },
  activeText: {
    color: COLORS.success,
  },
  inactiveText: {
    color: COLORS.red,
  },
});