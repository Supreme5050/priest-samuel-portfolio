import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
  accentSoft: "#FFF5E6",
  successSoft: "#F0FDF4",
  success: "#027A48",
};

const serifFont = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

export default function VendorCenterScreen() {
  function openSellerDashboard() {
    router.push("/vendor-dashboard" as any);
  }

  function openSellerSignup() {
    router.push({ pathname: "/vendor-auth", params: { mode: "signup" } } as any);
  }

  function openSellerSignin() {
    router.push({ pathname: "/vendor-auth", params: { mode: "signin" } } as any);
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable style={styles.headerIconButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={COLORS.text} />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={styles.headerEyebrow}>SELLER CENTER</Text>
            <Text style={styles.headerTitle}>Manage your store</Text>
          </View>

          <View style={styles.headerIconButton}>
            <Ionicons name="notifications-outline" size={21} color={COLORS.text} />
            <View style={styles.headerNotificationDot} />
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="storefront" size={26} color="#FFFFFF" />
            </View>

            <View style={styles.heroBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
              <Text style={styles.heroBadgeText}>Protected sales</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Sell to customers in Redemption City</Text>

          <Text style={styles.heroText}>
            Receive orders, manage products, confirm deliveries and track payouts
            from one professional seller workspace.
          </Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>Protected</Text>
              <Text style={styles.heroStatLabel}>Orders</Text>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>Verified</Text>
              <Text style={styles.heroStatLabel}>Payout</Text>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>9+</Text>
              <Text style={styles.heroStatLabel}>Stores</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={styles.primaryCta}
          onPress={openSellerSignup}
        >
          <View style={styles.primaryCtaIcon}>
            <Ionicons name="person-add" size={22} color={COLORS.brand} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.primaryCtaTitle}>Create seller account</Text>
            <Text style={styles.primaryCtaText}>
              Register your business and start selling.
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color={COLORS.brand} />
        </Pressable>

        <Pressable style={styles.secondaryCta} onPress={openSellerSignin}>
          <View style={styles.secondaryCtaIcon}>
            <Ionicons name="log-in-outline" size={22} color={COLORS.brand} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.secondaryCtaTitle}>Seller sign in</Text>
            <Text style={styles.secondaryCtaText}>
              Continue to your existing store workspace.
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
        </Pressable>

        <View style={styles.infoBanner}>
          <View style={styles.infoBannerIcon}>
            <Ionicons name="shield-checkmark" size={22} color={COLORS.brand} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.infoBannerTitle}>Protected marketplace model</Text>
            <Text style={styles.infoBannerText}>
              Customers pay into the app first. Vendors receive payout after
              confirmed delivery, delivery PIN or approved delivery proof.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why sell here?</Text>
          <Text style={styles.sectionSubtitle}>
            A cleaner and more trusted selling experience for camp vendors.
          </Text>

          <FeatureCard
            icon="bag-check-outline"
            title="Protected orders"
            text="Every order follows the pay → deliver → confirm → payout flow."
          />

          <FeatureCard
            icon="navigate-outline"
            title="Location visibility"
            text="Buyers can find your store and navigate to your location inside camp."
          />

          <FeatureCard
            icon="wallet-outline"
            title="Clear payout history"
            text="Track available balance, settled payouts and pending releases."
          />
        </View>

        <View style={styles.footerPanel}>
          <Text style={styles.footerPanelTitle}>Seller access is protected</Text>
          <Text style={styles.footerPanelText}>
            In production, only verified vendors will access their own dashboard
            after login. Platform admin tools will not be inside this app.
          </Text>

          <Pressable style={styles.footerButton} onPress={openSellerDashboard}>
            <Text style={styles.footerButtonText}>Continue to seller dashboard</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIconWrap}>
        <Ionicons name={icon} size={20} color={COLORS.brand} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingTop: Platform.OS === "android" ? 20 : 54,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    paddingBottom: 14,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerNotificationDot: {
    position: "absolute",
    top: 11,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  headerEyebrow: {
    color: COLORS.brand,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  headerTitle: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
  },
  heroCard: {
    borderRadius: 28,
    backgroundColor: COLORS.brand,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBadge: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  heroTitle: {
    marginTop: 18,
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
    fontFamily: serifFont,
  },
  heroText: {
    marginTop: 10,
    color: "rgba(255,255,255,0.76)",
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "600",
  },
  heroStatsRow: {
    marginTop: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 14,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  heroStatItem: {
    flex: 1,
    alignItems: "center",
  },
  heroStatValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  heroStatLabel: {
    marginTop: 4,
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    fontWeight: "600",
  },
  heroDivider: {
    width: 1,
    height: 34,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  primaryCta: {
    marginTop: 18,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  primaryCtaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryCtaTitle: {
    color: COLORS.brand,
    fontSize: 16,
    fontWeight: "900",
  },
  primaryCtaText: {
    marginTop: 4,
    color: "rgba(27,67,50,0.86)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  secondaryCta: {
    marginTop: 14,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  secondaryCtaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryCtaTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryCtaText: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  infoBanner: {
    marginTop: 16,
    borderRadius: 22,
    backgroundColor: COLORS.successSoft,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  infoBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  infoBannerTitle: {
    color: COLORS.brand,
    fontSize: 15,
    fontWeight: "800",
  },
  infoBannerText: {
    marginTop: 5,
    color: "#4B6358",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  section: {
    marginTop: 26,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },
  sectionSubtitle: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  featureCard: {
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: COLORS.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },
  featureText: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  footerPanel: {
    marginTop: 26,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
  },
  footerPanelTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },
  footerPanelText: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
  footerButton: {
    marginTop: 16,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  footerButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});