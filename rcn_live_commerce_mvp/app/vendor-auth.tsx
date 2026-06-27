import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  createVendorAccountLive,
  signInVendorLive,
} from "@/services/commerceLiveService";

const COLORS = {
  brand: "#1B4332",
  brandDark: "#0B2F22",
  brandSoft: "#EAF4EE",
  background: "#FAFAF7",
  card: "#FFFFFF",
  text: "#14281D",
  muted: "#667085",
  border: "#E7E5DE",
  accent: "#F59E0B",
  success: "#027A48",
};

type AuthMode = "signup" | "signin";

export default function VendorAuthScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<AuthMode>(params.mode === "signin" ? "signin" : "signup");
  const [loading, setLoading] = useState(false);

  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [category, setCategory] = useState("Food & Essentials");
  const [area, setArea] = useState("Redemption City");
  const [address, setAddress] = useState("");

  async function submit() {
    if (!phone.trim()) {
      Alert.alert("Phone required", "Enter your phone number to continue.");
      return;
    }

    try {
      setLoading(true);

      if (mode === "signin") {
        const result = await signInVendorLive({
          phone: phone.trim(),
          storeName: storeName.trim() || undefined,
        });

        Alert.alert("Seller sign in", result.message, [
          { text: "Continue", onPress: () => router.replace("/vendor-dashboard" as any) },
        ]);
        return;
      }

      if (!ownerName.trim() || !storeName.trim() || !category.trim() || !area.trim()) {
        Alert.alert("Missing details", "Enter owner name, store name, category and area.");
        return;
      }

      const result = await createVendorAccountLive({
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        storeName: storeName.trim(),
        category: category.trim(),
        area: area.trim(),
        address: address.trim() || area.trim(),
      });

      Alert.alert("Seller account saved", result.message, [
        { text: "Open dashboard", onPress: () => router.replace("/vendor-dashboard" as any) },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={23} color={COLORS.text} />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>SELLER ACCESS</Text>
            <Text style={styles.title}>{mode === "signup" ? "Create seller account" : "Seller sign in"}</Text>
            <Text style={styles.subtitle}>Register or continue to manage products, orders and payout flow.</Text>
          </View>
        </View>

        <View style={styles.switchRow}>
          <Pressable
            style={[styles.switchButton, mode === "signup" && styles.switchButtonActive]}
            onPress={() => setMode("signup")}
          >
            <Text style={[styles.switchText, mode === "signup" && styles.switchTextActive]}>Sign up</Text>
          </Pressable>
          <Pressable
            style={[styles.switchButton, mode === "signin" && styles.switchButtonActive]}
            onPress={() => setMode("signin")}
          >
            <Text style={[styles.switchText, mode === "signin" && styles.switchTextActive]}>Sign in</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          {mode === "signup" ? (
            <>
              <FormField label="Owner name" icon="person-outline" value={ownerName} onChangeText={setOwnerName} placeholder="Example: Priest Samuel" />
              <FormField label="Store name" icon="storefront-outline" value={storeName} onChangeText={setStoreName} placeholder="Example: Grace Foods" />
              <FormField label="Store category" icon="grid-outline" value={category} onChangeText={setCategory} placeholder="Food, Grocery, Fashion, Printing..." />
              <FormField label="Store area" icon="location-outline" value={area} onChangeText={setArea} placeholder="Example: Macedonia Road" />
              <FormField label="Address / landmark" icon="map-outline" value={address} onChangeText={setAddress} placeholder="Example: beside CRM Supermarket" />
            </>
          ) : (
            <FormField label="Store name optional" icon="storefront-outline" value={storeName} onChangeText={setStoreName} placeholder="Your store name" />
          )}

          <FormField label="Phone number" icon="call-outline" value={phone} onChangeText={setPhone} placeholder="08012345678" keyboardType="phone-pad" />

          <Pressable style={styles.primaryButton} onPress={submit} disabled={loading}>
            <Ionicons name={mode === "signup" ? "person-add" : "log-in-outline"} size={20} color={COLORS.card} />
            <Text style={styles.primaryButtonText}>{loading ? "Saving..." : mode === "signup" ? "Create seller account" : "Sign in"}</Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.brand} />
          <Text style={styles.infoText}>This MVP stores seller access in Supabase when available and falls back to local device storage if network fails.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FormField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad";
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <Ionicons name={icon} size={18} color={COLORS.muted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.muted}
          keyboardType={keyboardType || "default"}
          style={styles.input}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 18, paddingTop: Platform.OS === "android" ? 18 : 58, paddingBottom: 40 },
  header: { flexDirection: "row", gap: 12, alignItems: "center" },
  backButton: { width: 44, height: 44, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  eyebrow: { color: COLORS.brand, fontSize: 12, fontWeight: "900", letterSpacing: 0.6 },
  title: { color: COLORS.text, fontSize: 26, fontWeight: "900", marginTop: 2 },
  subtitle: { color: COLORS.muted, fontSize: 13, lineHeight: 19, fontWeight: "700", marginTop: 4 },
  switchRow: { flexDirection: "row", gap: 10, marginTop: 20 },
  switchButton: { flex: 1, height: 48, borderRadius: 16, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  switchButtonActive: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  switchText: { color: COLORS.text, fontSize: 14, fontWeight: "900" },
  switchTextActive: { color: COLORS.card },
  card: { marginTop: 16, borderRadius: 24, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, padding: 16 },
  fieldBlock: { marginBottom: 13 },
  fieldLabel: { color: COLORS.text, fontSize: 13, fontWeight: "900", marginBottom: 7 },
  inputRow: { height: 52, borderRadius: 16, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 10 },
  input: { flex: 1, color: COLORS.text, fontSize: 14, fontWeight: "800" },
  primaryButton: { marginTop: 6, height: 54, borderRadius: 17, backgroundColor: COLORS.brand, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryButtonText: { color: COLORS.card, fontSize: 14, fontWeight: "900" },
  infoCard: { marginTop: 16, borderRadius: 20, backgroundColor: COLORS.brandSoft, padding: 14, flexDirection: "row", gap: 10 },
  infoText: { flex: 1, color: COLORS.brand, fontSize: 12, lineHeight: 18, fontWeight: "800" },
});
