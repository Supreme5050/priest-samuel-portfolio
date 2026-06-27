import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  acceptDeliveryJobLive,
  getDeliveryJobsLive,
  registerDeliveryPersonLive,
  type DeliveryJob,
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
  danger: "#B42318",
};

type VehicleType = "walk" | "bike" | "car" | "van";

export default function RiderDeliveryScreen() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentArea, setCurrentArea] = useState("Redemption City");
  const [vehicleType, setVehicleType] = useState<VehicleType>("bike");
  const [registered, setRegistered] = useState(false);
  const [jobs, setJobs] = useState<DeliveryJob[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    const nextJobs = await getDeliveryJobsLive();
    setJobs(nextJobs);
  }

  async function refreshJobs() {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  }

  async function registerRider() {
    if (!fullName.trim() || !phone.trim() || !currentArea.trim()) {
      Alert.alert("Missing details", "Enter name, phone number and current area.");
      return;
    }

    const result = await registerDeliveryPersonLive({
      fullName: fullName.trim(),
      phone: phone.trim(),
      currentArea: currentArea.trim(),
      vehicleType,
    });

    setRegistered(true);
    Alert.alert("Delivery profile ready", result.message);
  }

  async function acceptJob(job: DeliveryJob) {
    if (!registered) {
      Alert.alert("Register first", "Create your delivery profile before accepting jobs.");
      return;
    }

    const result = await acceptDeliveryJobLive({
      jobId: job.id,
      riderName: fullName.trim(),
      riderPhone: phone.trim(),
    });

    Alert.alert("Delivery job", result.message);
    await loadJobs();
  }

  function openVendorLocation(job: DeliveryJob) {
    router.push({
      pathname: "/map",
      params: {
        name: job.vendor_name,
        locationName: job.pickup_area,
        category: "Vendor pickup",
      },
    } as any);
  }

  function openCustomerLocation(job: DeliveryJob) {
    router.push({
      pathname: "/map",
      params: {
        name: job.customer_name,
        locationName: job.dropoff_area,
        category: "Customer delivery point",
      },
    } as any);
  }

  const availableJobs = useMemo(
    () => jobs.filter((job) => job.status !== "completed"),
    [jobs]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={23} color={COLORS.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>DELIVERY PERSON</Text>
            <Text style={styles.title}>Rider workspace</Text>
            <Text style={styles.subtitle}>Register, accept jobs, locate vendors and deliver to customers.</Text>
          </View>
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.cardTitle}>{registered ? "Profile active" : "Create delivery profile"}</Text>
          <Text style={styles.cardText}>This MVP saves your rider profile and delivery job activity to Supabase when available.</Text>

          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={18} color={COLORS.muted} />
            <TextInput value={fullName} onChangeText={setFullName} placeholder="Full name" placeholderTextColor={COLORS.muted} style={styles.input} />
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="call-outline" size={18} color={COLORS.muted} />
            <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Phone number" placeholderTextColor={COLORS.muted} style={styles.input} />
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="location-outline" size={18} color={COLORS.muted} />
            <TextInput value={currentArea} onChangeText={setCurrentArea} placeholder="Current area" placeholderTextColor={COLORS.muted} style={styles.input} />
          </View>

          <View style={styles.vehicleRow}>
            {(["walk", "bike", "car", "van"] as VehicleType[]).map((item) => (
              <Pressable key={item} style={[styles.vehicleChip, vehicleType === item && styles.vehicleChipActive]} onPress={() => setVehicleType(item)}>
                <Text style={[styles.vehicleText, vehicleType === item && styles.vehicleTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.primaryButton} onPress={registerRider}>
            <Ionicons name="bicycle-outline" size={20} color={COLORS.card} />
            <Text style={styles.primaryButtonText}>{registered ? "Update profile" : "Register delivery person"}</Text>
          </Pressable>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Available jobs</Text>
          <Text style={styles.sectionCount}>{availableJobs.length} jobs</Text>
        </View>

        <FlatList
          data={availableJobs}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshJobs} />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <View style={styles.jobTopRow}>
                <View style={styles.jobIcon}>
                  <Ionicons name="cube-outline" size={22} color={COLORS.brand} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle}>{item.order_id}</Text>
                  <Text style={styles.jobText}>{item.vendor_name} → {item.customer_name}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.routeBox}>
                <Text style={styles.routeLabel}>Pickup</Text>
                <Text style={styles.routeText}>{item.pickup_area}</Text>
                <Text style={styles.routeLabel}>Drop off</Text>
                <Text style={styles.routeText}>{item.dropoff_area}</Text>
              </View>

              <View style={styles.actionRow}>
                <Pressable style={styles.secondaryButton} onPress={() => openVendorLocation(item)}>
                  <Ionicons name="storefront-outline" size={17} color={COLORS.text} />
                  <Text style={styles.secondaryButtonText}>Vendor</Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={() => openCustomerLocation(item)}>
                  <Ionicons name="location-outline" size={17} color={COLORS.text} />
                  <Text style={styles.secondaryButtonText}>Customer</Text>
                </Pressable>
                <Pressable style={styles.acceptButton} onPress={() => acceptJob(item)}>
                  <Text style={styles.acceptButtonText}>Accept</Text>
                  <Ionicons name="arrow-forward" size={17} color={COLORS.card} />
                </Pressable>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  screen: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 18, paddingTop: Platform.OS === "android" ? 10 : 0 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  backButton: { width: 44, height: 44, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  eyebrow: { color: COLORS.brand, fontSize: 12, fontWeight: "900", letterSpacing: 0.6 },
  title: { color: COLORS.text, fontSize: 27, fontWeight: "900", marginTop: 2 },
  subtitle: { color: COLORS.muted, fontSize: 12, lineHeight: 18, fontWeight: "700", marginTop: 3 },
  profileCard: { borderRadius: 24, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, padding: 15, marginBottom: 15 },
  cardTitle: { color: COLORS.text, fontSize: 18, fontWeight: "900" },
  cardText: { color: COLORS.muted, fontSize: 12, lineHeight: 18, fontWeight: "700", marginTop: 4, marginBottom: 12 },
  inputRow: { height: 48, borderRadius: 16, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 12, marginBottom: 9 },
  input: { flex: 1, color: COLORS.text, fontSize: 13, fontWeight: "800" },
  vehicleRow: { flexDirection: "row", gap: 7, marginBottom: 10 },
  vehicleChip: { flex: 1, height: 36, borderRadius: 999, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  vehicleChipActive: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  vehicleText: { color: COLORS.text, fontSize: 12, fontWeight: "900", textTransform: "capitalize" },
  vehicleTextActive: { color: COLORS.card },
  primaryButton: { height: 50, borderRadius: 16, backgroundColor: COLORS.brand, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryButtonText: { color: COLORS.card, fontSize: 13, fontWeight: "900" },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: "900" },
  sectionCount: { color: COLORS.muted, fontSize: 12, fontWeight: "800" },
  listContent: { paddingBottom: 100 },
  jobCard: { borderRadius: 22, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 12 },
  jobTopRow: { flexDirection: "row", gap: 11, alignItems: "center" },
  jobIcon: { width: 46, height: 46, borderRadius: 18, backgroundColor: COLORS.brandSoft, alignItems: "center", justifyContent: "center" },
  jobTitle: { color: COLORS.text, fontSize: 16, fontWeight: "900" },
  jobText: { color: COLORS.muted, fontSize: 12, fontWeight: "700", marginTop: 3 },
  statusBadge: { borderRadius: 999, backgroundColor: COLORS.brandSoft, paddingHorizontal: 9, paddingVertical: 5 },
  statusText: { color: COLORS.brand, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  routeBox: { marginTop: 12, borderRadius: 16, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, padding: 12 },
  routeLabel: { color: COLORS.brand, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  routeText: { color: COLORS.text, fontSize: 13, fontWeight: "800", marginTop: 2, marginBottom: 8 },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  secondaryButton: { height: 42, borderRadius: 15, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  secondaryButtonText: { color: COLORS.text, fontSize: 12, fontWeight: "900" },
  acceptButton: { flex: 1, height: 42, borderRadius: 15, backgroundColor: COLORS.brand, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  acceptButtonText: { color: COLORS.card, fontSize: 12, fontWeight: "900" },
});
