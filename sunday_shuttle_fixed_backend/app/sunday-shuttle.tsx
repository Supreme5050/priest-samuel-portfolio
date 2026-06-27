import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
  getNextShuttleWindowText,
  isSundayShuttleWindowActive,
  shuttleDropOffPoints,
  shuttlePickupPoints,
  shuttleRouteDirections,
  type ShuttleDropOffPoint,
  type ShuttleListing,
  type ShuttleMatch,
  type ShuttlePickupPoint,
  type ShuttleRequest,
  type ShuttleRouteDirection,
} from "@/data/sundayShuttle";
import {
  createDriverListing,
  createTrekkerRequest,
  findNearestPickupPoint,
  formatDistance,
  formatShuttleTime,
  getAllActiveListings,
  matchListingsToRequest,
  requestLiftFromListing,
} from "@/services/sundayShuttleService";

type ScreenMode = "main" | "matches" | "driver-live" | "waiting";
type ShuttleRole = "offer" | "need";

const COLORS = {
  primary: "#073F2A",
  primaryDark: "#052E1F",
  primarySoft: "#EAF5EF",
  white: "#FFFFFF",
  background: "#F8F6EF",
  text: "#17231D",
  textMuted: "#667085",
  border: "#E6E1D8",
  gold: "#D8A63F",
  goldDark: "#B88413",
  goldSoft: "#FFF6DD",
  success: "#15803D",
};

const serifFont = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

function minutesFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

function getShortRouteName(name: string) {
  return name
    .replace("Toward ", "")
    .replace(" Axis", "")
    .replace("Lagos-Ibadan ", "")
    .replace(" / ", " / ");
}

function getDropOffForRoute(route: ShuttleRouteDirection): ShuttleDropOffPoint {
  return (
    shuttleDropOffPoints.find((point) => point.corridor === route.corridor) ||
    shuttleDropOffPoints[0]
  );
}

export default function SundayShuttleScreen() {
  const [mode, setMode] = useState<ScreenMode>("main");
  const [role, setRole] = useState<ShuttleRole>("offer");

  const [activeListings, setActiveListings] = useState<ShuttleListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [currentPickupPoint, setCurrentPickupPoint] =
    useState<ShuttlePickupPoint>(shuttlePickupPoints[0]);

  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverSeats, setDriverSeats] = useState(3);
  const [driverPickupPoint, setDriverPickupPoint] =
    useState<ShuttlePickupPoint>(shuttlePickupPoints[0]);
  const [driverRoute, setDriverRoute] = useState<ShuttleRouteDirection>(
    shuttleRouteDirections[0]
  );
  const [driverDeparture, setDriverDeparture] = useState("15");

  const [trekkerName, setTrekkerName] = useState("");
  const [trekkerPhone, setTrekkerPhone] = useState("");
  const [trekkerPickupPoint, setTrekkerPickupPoint] =
    useState<ShuttlePickupPoint>(shuttlePickupPoints[0]);
  const [trekkerRoute, setTrekkerRoute] = useState<ShuttleRouteDirection>(
    shuttleRouteDirections[0]
  );
  const [trekkerNeedTime, setTrekkerNeedTime] = useState("15");

  const [createdListing, setCreatedListing] = useState<ShuttleListing | null>(
    null
  );
  const [createdRequest, setCreatedRequest] = useState<ShuttleRequest | null>(
    null
  );
  const [matches, setMatches] = useState<ShuttleMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<ShuttleMatch | null>(null);

  const activeNow = isSundayShuttleWindowActive();

  const driverDropOff = useMemo(() => {
    return getDropOffForRoute(driverRoute);
  }, [driverRoute]);

  const trekkerDropOff = useMemo(() => {
    return getDropOffForRoute(trekkerRoute);
  }, [trekkerRoute]);

  const shuttleStats = useMemo(() => {
    const drivers = activeListings.length;
    const seats = activeListings.reduce(
      (total, listing) => total + listing.availableSeats,
      0
    );

    return { drivers, seats };
  }, [activeListings]);

  useEffect(() => {
    loadListings();
    detectNearestPickup(false);
  }, []);

  async function loadListings() {
    setLoadingListings(true);

    const listings = await getAllActiveListings();

    setActiveListings(listings);
    setLoadingListings(false);
  }

  async function detectNearestPickup(showAlert = true) {
    try {
      setDetectingLocation(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setDetectingLocation(false);

        if (showAlert) {
          Alert.alert(
            "Location Needed",
            "Please allow location access so Sunday Shuttle can recommend the closest safe pickup point."
          );
        }

        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const nearest = findNearestPickupPoint({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      setCurrentPickupPoint(nearest);
      setDriverPickupPoint(nearest);
      setTrekkerPickupPoint(nearest);
      setDetectingLocation(false);
    } catch {
      setDetectingLocation(false);

      if (showAlert) {
        Alert.alert(
          "Location Unavailable",
          "We could not detect your location. Please choose a safe pickup point manually."
        );
      }
    }
  }

  async function submitDriverOffer() {
    if (!driverName.trim()) {
      Alert.alert("Name Needed", "Please enter your first name.");
      return;
    }

    if (!driverPhone.trim()) {
      Alert.alert("Phone Needed", "Please enter a phone number so riders can contact you safely.");
      return;
    }

    const listing = await createDriverListing({
      driverName,
      phone: driverPhone,
      pickupPointId: driverPickupPoint.id,
      routeDirectionId: driverRoute.id,
      dropOffPointId: driverDropOff.id,
      departureTime: minutesFromNow(Number(driverDeparture)),
      totalSeats: driverSeats,
      preference: "any",
    });

    setCreatedListing(listing);
    await loadListings();
    Alert.alert("Offer Saved", "Your seat offer has been saved for Sunday Shuttle.");
    setMode("driver-live");
  }

  async function submitTrekkerRequest() {
    if (!trekkerName.trim()) {
      Alert.alert("Name Needed", "Please enter your first name.");
      return;
    }

    if (!trekkerPhone.trim()) {
      Alert.alert("Phone Needed", "Please enter a phone number so the shuttle team can contact you.");
      return;
    }

    const request = await createTrekkerRequest({
      trekkerName,
      phone: trekkerPhone,
      pickupPointId: trekkerPickupPoint.id,
      routeDirectionId: trekkerRoute.id,
      dropOffPointId: trekkerDropOff.id,
      neededBy: minutesFromNow(Number(trekkerNeedTime)),
    });

    const listings = await getAllActiveListings();
    const foundMatches = matchListingsToRequest(listings, request);

    setCreatedRequest(request);
    setMatches(foundMatches);
    Alert.alert("Request Saved", "Your ride request has been saved.");
    setMode("matches");
  }

  async function requestLift(match: ShuttleMatch) {
    if (!createdRequest) return;

    const updatedRequest = await requestLiftFromListing(
      createdRequest,
      match.listing
    );

    setCreatedRequest(updatedRequest);
    setSelectedMatch(match);
    await loadListings();
    setMode("waiting");
  }

  function handleBack() {
    if (mode === "matches") {
      setMode("main");
      setRole("need");
      return;
    }

    if (mode !== "main") {
      setMode("main");
      return;
    }

    router.back();
  }

  function renderMainScreen() {
    return (
      <>
        <HeroSection
          activeNow={activeNow}
          loading={loadingListings}
          drivers={shuttleStats.drivers}
          seats={shuttleStats.seats}
        />

        <BenefitStrip />

        <RoleSwitch role={role} onChange={setRole} />

        {role === "offer" ? renderOfferForm() : renderNeedRideForm()}

        <CommunityCard />
      </>
    );
  }

  function renderOfferForm() {
    return (
      <View style={styles.formPanel}>
        <FormHeader
          icon="car"
          title="Offer Seats"
          subtitle="Quickly register your free seats for people going along your route."
        />

        <FieldBlock icon="person" label="First name">
          <TextInput
            value={driverName}
            onChangeText={setDriverName}
            placeholder="Example: Bro. Samuel"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
          />
        </FieldBlock>

        <FieldBlock icon="call" label="Phone number">
          <TextInput
            value={driverPhone}
            onChangeText={setDriverPhone}
            placeholder="Example: 08012345678"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </FieldBlock>

        <FieldBlock icon="people" label="Free seats">
          <SeatStepper value={driverSeats} onChange={setDriverSeats} />
        </FieldBlock>

        <FieldBlock icon="location" label="Where can people meet you?">
          <DetectLocationCard
            point={currentPickupPoint}
            loading={detectingLocation}
            onPress={() => detectNearestPickup(true)}
          />

          <PickupChips
            selected={driverPickupPoint}
            onSelect={setDriverPickupPoint}
          />
        </FieldBlock>

        <FieldBlock icon="navigate" label="Where are you passing?">
          <RouteChips selected={driverRoute} onSelect={setDriverRoute} />

          <AutoDropOffNote point={driverDropOff} />
        </FieldBlock>

        <FieldBlock icon="time" label="When are you leaving?">
          <TimeChips value={driverDeparture} onChange={setDriverDeparture} />
        </FieldBlock>

        <SafetyNotice />

        <Pressable style={styles.primarySubmitButton} onPress={submitDriverOffer}>
          <View style={styles.submitIcon}>
            <Ionicons name="car" size={22} color={COLORS.primary} />
          </View>

          <Text style={styles.primarySubmitText}>Start Offering</Text>

          <Ionicons name="arrow-forward" size={22} color={COLORS.white} />
        </Pressable>
      </View>
    );
  }

  function renderNeedRideForm() {
    return (
      <View style={styles.formPanel}>
        <FormHeader
          icon="walk"
          title="Need a Ride"
          subtitle="Tell us where you are and the direction you are going."
        />

        <FieldBlock icon="person" label="First name">
          <TextInput
            value={trekkerName}
            onChangeText={setTrekkerName}
            placeholder="Example: Sis. Amaka"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
          />
        </FieldBlock>

        <FieldBlock icon="call" label="Phone number">
          <TextInput
            value={trekkerPhone}
            onChangeText={setTrekkerPhone}
            placeholder="Example: 08012345678"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </FieldBlock>

        <FieldBlock icon="location" label="Where can a driver meet you?">
          <DetectLocationCard
            point={currentPickupPoint}
            loading={detectingLocation}
            onPress={() => detectNearestPickup(true)}
          />

          <PickupChips
            selected={trekkerPickupPoint}
            onSelect={setTrekkerPickupPoint}
          />
        </FieldBlock>

        <FieldBlock icon="navigate" label="Where are you going toward?">
          <RouteChips selected={trekkerRoute} onSelect={setTrekkerRoute} />

          <AutoDropOffNote point={trekkerDropOff} />
        </FieldBlock>

        <FieldBlock icon="time" label="When will you be ready?">
          <TimeChips value={trekkerNeedTime} onChange={setTrekkerNeedTime} />
        </FieldBlock>

        <SafetyNotice />

        <Pressable style={styles.primarySubmitButton} onPress={submitTrekkerRequest}>
          <View style={styles.submitIcon}>
            <Ionicons name="search" size={22} color={COLORS.primary} />
          </View>

          <Text style={styles.primarySubmitText}>Find Ride</Text>

          <Ionicons name="arrow-forward" size={22} color={COLORS.white} />
        </Pressable>
      </View>
    );
  }

  function renderMatchesScreen() {
    return (
      <>
        <ResultHero
          icon="git-network"
          title={`${matches.length} match${matches.length === 1 ? "" : "es"} found`}
          text={`Showing drivers going toward ${
            createdRequest?.routeDirectionName || "your route"
          }.`}
        />

        {matches.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="car" size={34} color={COLORS.primary} />
            </View>

            <Text style={styles.emptyTitle}>No matching ride yet</Text>
            <Text style={styles.emptyText}>
              No active driver currently matches your pickup point, route
              direction, and readiness time.
            </Text>
          </View>
        ) : (
          <View style={styles.matchesWrap}>
            {matches.map((match, index) => (
              <View key={match.listing.id} style={styles.matchCard}>
                <View style={styles.matchTop}>
                  <View style={styles.matchAvatar}>
                    <Ionicons name="person" size={22} color={COLORS.white} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.matchRank}>Best match #{index + 1}</Text>
                    <Text style={styles.matchName}>{match.listing.driverName}</Text>
                    <Text style={styles.matchLocation}>
                      {match.listing.routeDirectionName}
                    </Text>
                  </View>

                  <View style={styles.matchSeatBadge}>
                    <Text style={styles.matchSeatText}>
                      {match.listing.availableSeats} seats
                    </Text>
                  </View>
                </View>

                <View style={styles.matchInfoGrid}>
                  <InfoPill icon="walk" text={`${match.walkingMinutes} min walk`} />
                  <InfoPill
                    icon="time"
                    text={`Leaves ${formatShuttleTime(match.listing.departureTime)}`}
                  />
                  <InfoPill icon="navigate" text={formatDistance(match.distanceMeters)} />
                </View>

                <View style={styles.autoDropOffBox}>
                  <Ionicons name="flag" size={15} color={COLORS.primary} />
                  <Text style={styles.autoDropOffText}>
                    Can drop near {match.listing.dropOffPointName}
                  </Text>
                </View>

                <Pressable
                  style={styles.requestButton}
                  onPress={() => requestLift(match)}
                >
                  <Text style={styles.requestButtonText}>Request Lift</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </>
    );
  }

  function renderDriverLiveScreen() {
    return (
      <>
        <ResultHero
          icon="radio"
          title="You Are Live"
          text="Your free seats are now visible to people going along your route."
        />

        {createdListing && (
          <View style={styles.summaryCard}>
            <SummaryRow label="Driver" value={createdListing.driverName} />
            <SummaryRow
              label="Pickup"
              value={`${createdListing.pickupLocationName} · ${createdListing.pickupLocationCode}`}
            />
            <SummaryRow label="Route" value={createdListing.routeDirectionName} />
            <SummaryRow
              label="Safe Drop-off"
              value={`${createdListing.dropOffPointName} · ${createdListing.dropOffPointCode}`}
            />
            <SummaryRow
              label="Leaving"
              value={formatShuttleTime(createdListing.departureTime)}
            />
            <SummaryRow
              label="Seats"
              value={`${createdListing.availableSeats}/${createdListing.totalSeats} available`}
            />
          </View>
        )}

        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons name="notifications" size={34} color={COLORS.primary} />
          </View>

          <Text style={styles.emptyTitle}>Waiting for requests</Text>
          <Text style={styles.emptyText}>
            People around your pickup point and route will appear here when the
            live backend is connected.
          </Text>
        </View>
      </>
    );
  }

  function renderWaitingScreen() {
    return (
      <>
        <ResultHero
          icon="checkmark"
          title="Request Sent"
          text="Your request has been sent to the selected driver."
        />

        {selectedMatch && (
          <View style={styles.summaryCard}>
            <SummaryRow label="Driver" value={selectedMatch.listing.driverName} />
            <SummaryRow
              label="Pickup point"
              value={`${selectedMatch.listing.pickupLocationName} · ${selectedMatch.listing.pickupLocationCode}`}
            />
            <SummaryRow label="Route" value={selectedMatch.listing.routeDirectionName} />
            <SummaryRow
              label="Safe drop-off"
              value={`${selectedMatch.listing.dropOffPointName} · ${selectedMatch.listing.dropOffPointCode}`}
            />
            <SummaryRow
              label="Walking time"
              value={`${selectedMatch.walkingMinutes} minutes to pickup`}
            />
            <SummaryRow
              label="Driver leaving"
              value={formatShuttleTime(selectedMatch.listing.departureTime)}
            />
          </View>
        )}

        <View style={styles.trackerCard}>
          <TrackerStep done label="Request Sent" />
          <TrackerStep done label="Route Matched" />
          <TrackerStep active label="Waiting for Driver Confirmation" />
          <TrackerStep label="Driver Arrived" />
          <TrackerStep label="Picked Up" />
        </View>
      </>
    );
  }

  function renderScreen() {
    if (mode === "matches") return renderMatchesScreen();
    if (mode === "driver-live") return renderDriverLiveScreen();
    if (mode === "waiting") return renderWaitingScreen();

    return renderMainScreen();
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <TopHeader onBack={handleBack} onRefresh={loadListings} />
        {renderScreen()}
      </ScrollView>
    </View>
  );
}

function TopHeader({
  onBack,
  onRefresh,
}: {
  onBack: () => void;
  onRefresh: () => void;
}) {
  return (
    <View style={styles.topHeader}>
      <Pressable style={styles.headerRoundButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
      </Pressable>

      <View style={styles.brandWrap}>
        <View style={styles.logoMark}>
          <Ionicons name="navigate" size={21} color={COLORS.primary} />
        </View>

        <Text style={styles.brandText}>Redemption City Navigator</Text>
      </View>

      <Pressable style={styles.headerRoundButton} onPress={onRefresh}>
        <Ionicons name="refresh" size={20} color={COLORS.primary} />
      </Pressable>
    </View>
  );
}

function HeroSection({
  activeNow,
  loading,
  drivers,
  seats,
}: {
  activeNow: boolean;
  loading: boolean;
  drivers: number;
  seats: number;
}) {
  return (
    <View style={styles.hero}>
      <View style={styles.mapArt}>
        <View style={styles.mapRoadOne} />
        <View style={styles.mapRoadTwo} />
        <View style={styles.mapRoadThree} />

        <View style={[styles.mapPin, styles.mapPinStart]}>
          <Ionicons name="location" size={18} color={COLORS.success} />
        </View>

        <View style={[styles.mapPin, styles.mapPinEnd]}>
          <Ionicons name="flag" size={18} color={COLORS.goldDark} />
        </View>

        <View style={styles.routeDots}>
          <View style={styles.routeDot} />
          <View style={styles.routeDot} />
          <View style={styles.routeDot} />
          <View style={styles.routeDotGold} />
        </View>
      </View>

      <Text style={styles.heroTitle}>Sunday Shuttle</Text>

      <Text style={styles.heroSubtitle}>
        Quick free-seat matching for people going along the same route.
      </Text>

      <View style={styles.heroStatusCard}>
        <View style={styles.heroStatusDot} />
        <Text style={styles.heroStatusText}>
          {activeNow ? "Active now" : `Opens ${getNextShuttleWindowText()}`}
        </Text>
      </View>

      <View style={styles.statsCard}>
        <Ionicons name="radio" size={16} color={COLORS.primary} />
        <Text style={styles.statsText}>
          {loading
            ? "Loading shuttle activity..."
            : `${drivers} drivers active · ${seats} seats available`}
        </Text>
      </View>
    </View>
  );
}

function BenefitStrip() {
  return (
    <View style={styles.benefitStrip}>
      <BenefitItem icon="shield-checkmark" title="Safe pickup" text="Public only" />
      <View style={styles.benefitDivider} />
      <BenefitItem icon="navigate" title="Route match" text="Same direction" />
      <View style={styles.benefitDivider} />
      <BenefitItem icon="flag" title="Safe drop-off" text="No private details" />
    </View>
  );
}

function BenefitItem({
  icon,
  title,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.benefitItem}>
      <View style={styles.benefitIcon}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
      </View>

      <Text style={styles.benefitTitle}>{title}</Text>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

function RoleSwitch({
  role,
  onChange,
}: {
  role: ShuttleRole;
  onChange: (role: ShuttleRole) => void;
}) {
  return (
    <View style={styles.roleSwitch}>
      <Pressable
        style={[styles.roleButton, role === "offer" && styles.roleButtonActive]}
        onPress={() => onChange("offer")}
      >
        <Ionicons
          name="car"
          size={24}
          color={role === "offer" ? COLORS.white : COLORS.primary}
        />

        <View>
          <Text
            style={[styles.roleTitle, role === "offer" && styles.roleTitleActive]}
          >
            Offer Seats
          </Text>
          <Text style={[styles.roleText, role === "offer" && styles.roleTextActive]}>
            I am passing a route
          </Text>
        </View>
      </Pressable>

      <Pressable
        style={[styles.roleButton, role === "need" && styles.roleButtonActive]}
        onPress={() => onChange("need")}
      >
        <Ionicons
          name="walk"
          size={24}
          color={role === "need" ? COLORS.white : COLORS.primary}
        />

        <View>
          <Text style={[styles.roleTitle, role === "need" && styles.roleTitleActive]}>
            Need Ride
          </Text>
          <Text style={[styles.roleText, role === "need" && styles.roleTextActive]}>
            I need a lift
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

function FormHeader({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.formHeader}>
      <View style={styles.formHeaderIcon}>
        <Ionicons name={icon} size={25} color={COLORS.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.formTitle}>{title}</Text>
        <Text style={styles.formSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function FieldBlock({
  icon,
  label,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldBlock}>
      <View style={styles.fieldLabelRow}>
        <Ionicons name={icon} size={21} color={COLORS.primary} />
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>

      {children}
    </View>
  );
}

function DetectLocationCard({
  point,
  loading,
  onPress,
}: {
  point: ShuttlePickupPoint;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.detectCard} onPress={onPress}>
      <View style={styles.detectIcon}>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons name="locate" size={18} color={COLORS.primary} />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.detectTitle}>Nearest recommended</Text>
        <Text style={styles.detectText}>{point.name}</Text>
      </View>

      <Text style={styles.detectAction}>Detect</Text>
    </Pressable>
  );
}

function PickupChips({
  selected,
  onSelect,
}: {
  selected: ShuttlePickupPoint;
  onSelect: (point: ShuttlePickupPoint) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalChips}
    >
      {shuttlePickupPoints.map((point) => {
        const active = selected.id === point.id;

        return (
          <Pressable
            key={point.id}
            style={[styles.compactChip, active && styles.compactChipActive]}
            onPress={() => onSelect(point)}
          >
            <Ionicons
              name={active ? "checkmark-circle" : "location-outline"}
              size={15}
              color={active ? COLORS.white : COLORS.primary}
            />
            <Text
              style={[
                styles.compactChipText,
                active && styles.compactChipTextActive,
              ]}
              numberOfLines={1}
            >
              {point.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function RouteChips({
  selected,
  onSelect,
}: {
  selected: ShuttleRouteDirection;
  onSelect: (route: ShuttleRouteDirection) => void;
}) {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalChips}
      >
        {shuttleRouteDirections.map((route) => {
          const active = selected.id === route.id;

          return (
            <Pressable
              key={route.id}
              style={[styles.routeChip, active && styles.routeChipActive]}
              onPress={() => onSelect(route)}
            >
              <Text
                style={[
                  styles.routeChipText,
                  active && styles.routeChipTextActive,
                ]}
                numberOfLines={2}
              >
                {getShortRouteName(route.name)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.routeHint}>{selected.description}</Text>
    </View>
  );
}

function TimeChips({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const options = [
    { label: "Now", value: "0" },
    { label: "5 mins", value: "5" },
    { label: "15 mins", value: "15" },
    { label: "30 mins", value: "30" },
  ];

  return (
    <View style={styles.timeRow}>
      {options.map((option) => {
        const active = value === option.value;

        return (
          <Pressable
            key={option.value}
            style={[styles.timeChip, active && styles.timeChipActive]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[styles.timeChipText, active && styles.timeChipTextActive]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SeatStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.seatStepper}>
      <Pressable
        style={styles.seatButton}
        onPress={() => onChange(Math.max(1, value - 1))}
      >
        <Ionicons name="remove" size={20} color={COLORS.primary} />
      </Pressable>

      <View style={styles.seatCenter}>
        <Text style={styles.seatValue}>{value}</Text>
        <Text style={styles.seatSmall}>free seats</Text>
      </View>

      <Pressable
        style={styles.seatButton}
        onPress={() => onChange(Math.min(6, value + 1))}
      >
        <Ionicons name="add" size={20} color={COLORS.primary} />
      </Pressable>
    </View>
  );
}

function AutoDropOffNote({ point }: { point: ShuttleDropOffPoint }) {
  return (
    <View style={styles.autoDropOffBox}>
      <Ionicons name="flag" size={15} color={COLORS.primary} />
      <Text style={styles.autoDropOffText}>
        Safe drop-off will be around {point.name}
      </Text>
    </View>
  );
}

function SafetyNotice() {
  return (
    <View style={styles.safetyNotice}>
      <View style={styles.safetyIcon}>
        <Ionicons name="shield-checkmark" size={25} color={COLORS.white} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.safetyTitle}>Safety First</Text>
        <Text style={styles.safetyText}>
          Use public pickup points only. No private room, house, or hidden pickup.
        </Text>
      </View>
    </View>
  );
}

function CommunityCard() {
  return (
    <View style={styles.communityCard}>
      <View style={styles.communityIcon}>
        <Ionicons name="heart" size={26} color={COLORS.white} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.communityTitle}>Simple community support</Text>
        <Text style={styles.communityText}>
          You are not changing your journey. You are only helping someone along
          your normal route.
        </Text>
      </View>
    </View>
  );
}

function ResultHero({
  icon,
  title,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.resultHero}>
      <View style={styles.resultIcon}>
        <Ionicons name={icon} size={32} color={COLORS.gold} />
      </View>

      <Text style={styles.resultTitle}>{title}</Text>
      <Text style={styles.resultText}>{text}</Text>
    </View>
  );
}

function InfoPill({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.infoPill}>
      <Ionicons name={icon} size={14} color={COLORS.primary} />
      <Text style={styles.infoPillText}>{text}</Text>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function TrackerStep({
  label,
  done,
  active,
}: {
  label: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <View style={styles.trackerStep}>
      <View
        style={[
          styles.trackerDot,
          done && styles.trackerDotDone,
          active && styles.trackerDotActive,
        ]}
      >
        {done && <Ionicons name="checkmark" size={13} color={COLORS.white} />}
      </View>

      <Text
        style={[
          styles.trackerText,
          active && styles.trackerTextActive,
          done && styles.trackerTextDone,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 36 : 56,
    paddingBottom: 42,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 26,
    gap: 12,
  },
  headerRoundButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  brandWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: "rgba(7,63,42,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "900",
    fontFamily: serifFont,
  },
  hero: {
    minHeight: 310,
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  mapArt: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "55%",
    height: 180,
    borderRadius: 26,
    backgroundColor: "rgba(7,63,42,0.04)",
    overflow: "hidden",
  },
  mapRoadOne: {
    position: "absolute",
    top: 35,
    left: 10,
    right: -40,
    height: 1,
    backgroundColor: "rgba(7,63,42,0.10)",
    transform: [{ rotate: "-10deg" }],
  },
  mapRoadTwo: {
    position: "absolute",
    top: 85,
    left: -20,
    right: -10,
    height: 1,
    backgroundColor: "rgba(7,63,42,0.09)",
    transform: [{ rotate: "18deg" }],
  },
  mapRoadThree: {
    position: "absolute",
    top: 130,
    left: 10,
    right: -20,
    height: 1,
    backgroundColor: "rgba(7,63,42,0.08)",
    transform: [{ rotate: "-22deg" }],
  },
  mapPin: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  mapPinStart: {
    top: 28,
    left: 34,
  },
  mapPinEnd: {
    right: 24,
    bottom: 30,
  },
  routeDots: {
    position: "absolute",
    top: 78,
    left: 76,
    right: 62,
    flexDirection: "row",
    justifyContent: "space-between",
    transform: [{ rotate: "16deg" }],
  },
  routeDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },
  routeDotGold: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: COLORS.gold,
  },
  heroTitle: {
    color: COLORS.primary,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
    fontFamily: serifFont,
    letterSpacing: 1.2,
    maxWidth: "70%",
  },
  heroSubtitle: {
    marginTop: 14,
    color: COLORS.textMuted,
    fontSize: 17,
    lineHeight: 27,
    fontWeight: "600",
    maxWidth: "72%",
  },
  heroStatusCard: {
    marginTop: 18,
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroStatusDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: COLORS.gold,
  },
  heroStatusText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  statsCard: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  statsText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  benefitStrip: {
    marginTop: 2,
    marginBottom: 18,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
  },
  benefitItem: {
    flex: 1,
    alignItems: "center",
    gap: 7,
  },
  benefitIcon: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitTitle: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
  },
  benefitText: {
    color: COLORS.textMuted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  benefitDivider: {
    width: 1,
    height: 48,
    backgroundColor: COLORS.border,
    marginHorizontal: 7,
  },
  roleSwitch: {
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 5,
    flexDirection: "row",
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    minHeight: 68,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  roleTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
    fontFamily: serifFont,
  },
  roleTitleActive: {
    color: COLORS.white,
  },
  roleText: {
    marginTop: 2,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  roleTextActive: {
    color: "rgba(255,255,255,0.76)",
  },
  formPanel: {
    borderRadius: 26,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    elevation: 4,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  formHeaderIcon: {
    width: 50,
    height: 50,
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  formTitle: {
    color: COLORS.primary,
    fontSize: 25,
    fontWeight: "900",
    fontFamily: serifFont,
  },
  formSubtitle: {
    marginTop: 3,
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
  },
  fieldBlock: {
    marginTop: 18,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 9,
  },
  fieldLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },
  input: {
    minHeight: 54,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FCFBF8",
    paddingHorizontal: 15,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  seatStepper: {
    borderRadius: 16,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: "rgba(7,63,42,0.12)",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  seatButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  seatCenter: {
    alignItems: "center",
  },
  seatValue: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: "900",
    fontFamily: serifFont,
  },
  seatSmall: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  detectCard: {
    borderRadius: 17,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: "rgba(7,63,42,0.12)",
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detectIcon: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  detectTitle: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  detectText: {
    marginTop: 3,
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  detectAction: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  horizontalChips: {
    gap: 8,
    paddingTop: 10,
    paddingRight: 10,
  },
  compactChip: {
    maxWidth: 190,
    height: 42,
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: "rgba(7,63,42,0.12)",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  compactChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  compactChipText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
    maxWidth: 140,
  },
  compactChipTextActive: {
    color: COLORS.white,
  },
  routeChip: {
    width: 132,
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: "rgba(7,63,42,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
  },
  routeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  routeChipText: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  routeChipTextActive: {
    color: COLORS.white,
  },
  routeHint: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  timeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeChip: {
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: "rgba(7,63,42,0.12)",
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  timeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeChipText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  timeChipTextActive: {
    color: COLORS.white,
  },
  autoDropOffBox: {
    marginTop: 10,
    borderRadius: 15,
    backgroundColor: COLORS.goldSoft,
    borderWidth: 1,
    borderColor: "rgba(216,166,63,0.28)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  autoDropOffText: {
    flex: 1,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 17,
  },
  safetyNotice: {
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: "rgba(7,63,42,0.14)",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  safetyIcon: {
    width: 50,
    height: 50,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  safetyTitle: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "900",
  },
  safetyText: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  primarySubmitButton: {
    marginTop: 18,
    height: 64,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 7,
  },
  submitIcon: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  primarySubmitText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
    fontFamily: serifFont,
  },
  communityCard: {
    marginTop: 18,
    borderRadius: 20,
    backgroundColor: COLORS.goldSoft,
    borderWidth: 1,
    borderColor: "rgba(216,166,63,0.35)",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  communityIcon: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: COLORS.goldDark,
    alignItems: "center",
    justifyContent: "center",
  },
  communityTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },
  communityText: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  resultHero: {
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
  },
  resultIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  resultTitle: {
    marginTop: 16,
    color: COLORS.white,
    fontSize: 27,
    fontWeight: "900",
    fontFamily: serifFont,
    textAlign: "center",
  },
  resultText: {
    marginTop: 8,
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyCard: {
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: "center",
  },
  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: 14,
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "900",
    fontFamily: serifFont,
    textAlign: "center",
  },
  emptyText: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  matchesWrap: {
    gap: 14,
  },
  matchCard: {
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  matchTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  matchAvatar: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  matchRank: {
    color: COLORS.goldDark,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  matchName: {
    marginTop: 3,
    color: COLORS.primary,
    fontSize: 19,
    fontWeight: "900",
    fontFamily: serifFont,
  },
  matchLocation: {
    marginTop: 3,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  matchSeatBadge: {
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  matchSeatText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
  },
  matchInfoGrid: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  infoPill: {
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  infoPillText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
  },
  requestButton: {
    marginTop: 15,
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  requestButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  summaryCard: {
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  summaryValue: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  trackerCard: {
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
    gap: 14,
  },
  trackerStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  trackerDot: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  trackerDotDone: {
    backgroundColor: COLORS.success,
  },
  trackerDotActive: {
    backgroundColor: COLORS.gold,
  },
  trackerText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "800",
  },
  trackerTextDone: {
    color: COLORS.success,
  },
  trackerTextActive: {
    color: COLORS.primary,
    fontWeight: "900",
  },
});