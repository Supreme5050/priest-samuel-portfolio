import AsyncStorage from "@react-native-async-storage/async-storage";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";

import {
  demoShuttleListings,
  SHUTTLE_STORAGE_KEYS,
  shuttleDropOffPoints,
  shuttlePickupPoints,
  shuttleRouteDirections,
  type ShuttleCoordinate,
  type ShuttleListing,
  type ShuttleMatch,
  type ShuttlePickupPoint,
  type ShuttlePreference,
  type ShuttleRequest,
} from "@/data/sundayShuttle";

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function saveShuttleActivityToBackend(input: {
  passengerName: string;
  phone?: string;
  pickupPoint: string;
  destination: string;
  seats: number;
  note: string;
  status: string;
}) {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from("shuttle_requests").insert({
      passenger_name: input.passengerName,
      phone: input.phone?.trim() || null,
      pickup_point: input.pickupPoint,
      destination: input.destination,
      seats: input.seats,
      note: input.note,
      status: input.status,
    });
  } catch (error) {
    console.warn("Sunday Shuttle backend sync failed", error);
  }
}

export function getDistanceMeters(
  from: ShuttleCoordinate,
  to: ShuttleCoordinate
) {
  const R = 6371000;
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.latitude * Math.PI) / 180) *
      Math.cos((to.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function formatShuttleTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Now";

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.max(1, Math.round(meters))} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function getWalkingMinutes(distanceMeters: number) {
  const walkingSpeedMetersPerSecond = 1.2;
  return Math.max(
    1,
    Math.ceil(distanceMeters / walkingSpeedMetersPerSecond / 60)
  );
}

export function findNearestPickupPoint(
  coordinate: ShuttleCoordinate
): ShuttlePickupPoint {
  return shuttlePickupPoints
    .map((point) => ({
      point,
      distance: getDistanceMeters(coordinate, {
        latitude: point.latitude,
        longitude: point.longitude,
      }),
    }))
    .sort((a, b) => a.distance - b.distance)[0].point;
}

export async function getSavedListings(): Promise<ShuttleListing[]> {
  const raw = await AsyncStorage.getItem(SHUTTLE_STORAGE_KEYS.listings);

  if (!raw) return [];

  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) return [];

  return parsed;
}

export async function getSavedRequests(): Promise<ShuttleRequest[]> {
  const raw = await AsyncStorage.getItem(SHUTTLE_STORAGE_KEYS.requests);

  if (!raw) return [];

  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) return [];

  return parsed;
}

export async function getAllActiveListings() {
  const savedListings = await getSavedListings();

  const combined = [...savedListings, ...demoShuttleListings];

  return combined.filter((listing) => {
    const isActive = listing.status === "active";
    const hasSeats = listing.availableSeats > 0;
    const notExpired = new Date(listing.expiresAt).getTime() > Date.now();

    return isActive && hasSeats && notExpired;
  });
}

export async function createDriverListing(input: {
  driverName: string;
  phone?: string;
  pickupPointId: string;
  routeDirectionId: string;
  dropOffPointId: string;
  departureTime: string;
  totalSeats: number;
  preference: ShuttlePreference;
}) {
  const pickupPoint = shuttlePickupPoints.find(
    (point) => point.id === input.pickupPointId
  );

  const routeDirection = shuttleRouteDirections.find(
    (route) => route.id === input.routeDirectionId
  );

  const dropOffPoint = shuttleDropOffPoints.find(
    (point) => point.id === input.dropOffPointId
  );

  if (!pickupPoint) throw new Error("Pickup point not found");
  if (!routeDirection) throw new Error("Route direction not found");
  if (!dropOffPoint) throw new Error("Drop-off point not found");

  const listing: ShuttleListing = {
    id: createId("listing"),
    driverName: input.driverName.trim(),
    pickupPointId: pickupPoint.id,
    pickupLocationName: pickupPoint.name,
    pickupLocationCode: pickupPoint.code,
    pickupLatitude: pickupPoint.latitude,
    pickupLongitude: pickupPoint.longitude,
    routeDirectionId: routeDirection.id,
    routeDirectionName: routeDirection.name,
    routeCorridor: routeDirection.corridor,
    dropOffPointId: dropOffPoint.id,
    dropOffPointName: dropOffPoint.name,
    dropOffPointCode: dropOffPoint.code,
    dropOffLatitude: dropOffPoint.latitude,
    dropOffLongitude: dropOffPoint.longitude,
    departureTime: input.departureTime,
    totalSeats: input.totalSeats,
    availableSeats: input.totalSeats,
    preference: input.preference,
    status: "active",
    successfulRides: 0,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(
      new Date(input.departureTime).getTime() + 30 * 60 * 1000
    ).toISOString(),
  };

  const existing = await getSavedListings();
  const withoutOldActive = existing.filter((item) => item.status !== "active");

  await AsyncStorage.setItem(
    SHUTTLE_STORAGE_KEYS.listings,
    JSON.stringify([listing, ...withoutOldActive])
  );

  await saveShuttleActivityToBackend({
    passengerName: listing.driverName,
    phone: input.phone,
    pickupPoint: `${listing.pickupLocationName} (${listing.pickupLocationCode})`,
    destination: `${listing.dropOffPointName} (${listing.dropOffPointCode})`,
    seats: listing.availableSeats,
    status: "driver_offer",
    note: `Driver offer. Route: ${listing.routeDirectionName}. Departure: ${listing.departureTime}. Listing ID: ${listing.id}.`,
  });

  return listing;
}

export async function createTrekkerRequest(input: {
  trekkerName: string;
  phone?: string;
  pickupPointId: string;
  routeDirectionId: string;
  dropOffPointId: string;
  neededBy: string;
}) {
  const pickupPoint = shuttlePickupPoints.find(
    (point) => point.id === input.pickupPointId
  );

  const routeDirection = shuttleRouteDirections.find(
    (route) => route.id === input.routeDirectionId
  );

  const dropOffPoint = shuttleDropOffPoints.find(
    (point) => point.id === input.dropOffPointId
  );

  if (!pickupPoint) throw new Error("Pickup point not found");
  if (!routeDirection) throw new Error("Route direction not found");
  if (!dropOffPoint) throw new Error("Drop-off point not found");

  const request: ShuttleRequest = {
    id: createId("request"),
    trekkerName: input.trekkerName.trim(),
    pickupPointId: pickupPoint.id,
    pickupLocationName: pickupPoint.name,
    pickupLocationCode: pickupPoint.code,
    pickupLatitude: pickupPoint.latitude,
    pickupLongitude: pickupPoint.longitude,
    routeDirectionId: routeDirection.id,
    routeDirectionName: routeDirection.name,
    routeCorridor: routeDirection.corridor,
    dropOffPointId: dropOffPoint.id,
    dropOffPointName: dropOffPoint.name,
    dropOffPointCode: dropOffPoint.code,
    dropOffLatitude: dropOffPoint.latitude,
    dropOffLongitude: dropOffPoint.longitude,
    neededBy: input.neededBy,
    status: "waiting",
    createdAt: new Date().toISOString(),
  };

  const existing = await getSavedRequests();
  const withoutOldActive = existing.filter(
    (item) => item.status !== "waiting" && item.status !== "matched"
  );

  await AsyncStorage.setItem(
    SHUTTLE_STORAGE_KEYS.requests,
    JSON.stringify([request, ...withoutOldActive])
  );

  await saveShuttleActivityToBackend({
    passengerName: request.trekkerName,
    phone: input.phone,
    pickupPoint: `${request.pickupLocationName} (${request.pickupLocationCode})`,
    destination: `${request.dropOffPointName} (${request.dropOffPointCode})`,
    seats: 1,
    status: "waiting",
    note: `Ride request. Route: ${request.routeDirectionName}. Needed by: ${request.neededBy}. Request ID: ${request.id}.`,
  });

  return request;
}

export function matchListingsToRequest(
  listings: ShuttleListing[],
  request: ShuttleRequest
): ShuttleMatch[] {
  const requestTime = new Date(request.neededBy).getTime();

  return listings
    .map((listing) => {
      const sameCorridor = listing.routeCorridor === request.routeCorridor;
      const sameDropOff = listing.dropOffPointId === request.dropOffPointId;

      const dropOffDistance = getDistanceMeters(
        {
          latitude: request.dropOffLatitude,
          longitude: request.dropOffLongitude,
        },
        {
          latitude: listing.dropOffLatitude,
          longitude: listing.dropOffLongitude,
        }
      );

      const nearbyDropOff = dropOffDistance <= 800;

      const timeDifferenceMinutes = Math.abs(
        (new Date(listing.departureTime).getTime() - requestTime) / 60000
      );

      const pickupDistanceMeters = getDistanceMeters(
        {
          latitude: request.pickupLatitude,
          longitude: request.pickupLongitude,
        },
        {
          latitude: listing.pickupLatitude,
          longitude: listing.pickupLongitude,
        }
      );

      const walkingMinutes = getWalkingMinutes(pickupDistanceMeters);

      const valid =
        listing.status === "active" &&
        listing.availableSeats >= 1 &&
        timeDifferenceMinutes <= 35 &&
        pickupDistanceMeters <= 1800 &&
        (sameCorridor || sameDropOff || nearbyDropOff);

      const score =
        pickupDistanceMeters * 0.52 +
        timeDifferenceMinutes * 32 +
        dropOffDistance * 0.22 -
        listing.availableSeats * 45 -
        listing.successfulRides * 25;

      return {
        listing,
        distanceMeters: pickupDistanceMeters,
        walkingMinutes,
        timeDifferenceMinutes,
        score,
        valid,
      };
    })
    .filter((item) => item.valid)
    .sort((a, b) => a.score - b.score)
    .map(({ valid, ...item }) => item);
}

export async function requestLiftFromListing(
  request: ShuttleRequest,
  listing: ShuttleListing
) {
  const savedRequests = await getSavedRequests();

  const updatedRequests = savedRequests.map((item) => {
    if (item.id !== request.id) return item;

    return {
      ...item,
      status: "matched" as const,
      matchedListingId: listing.id,
    };
  });

  await AsyncStorage.setItem(
    SHUTTLE_STORAGE_KEYS.requests,
    JSON.stringify(updatedRequests)
  );

  const savedListings = await getSavedListings();

  const updatedListings = savedListings.map((item) => {
    if (item.id !== listing.id) return item;

    const nextSeats = Math.max(0, item.availableSeats - 1);

    return {
      ...item,
      availableSeats: nextSeats,
      status: nextSeats === 0 ? ("full" as const) : item.status,
      successfulRides: item.successfulRides + 1,
    };
  });

  await AsyncStorage.setItem(
    SHUTTLE_STORAGE_KEYS.listings,
    JSON.stringify(updatedListings)
  );

  return {
    ...request,
    status: "matched" as const,
    matchedListingId: listing.id,
  };
}