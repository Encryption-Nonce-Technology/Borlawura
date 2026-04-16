import { useLocalSearchParams, router } from "expo-router";
import { MapPin, Phone, Star, Clock, Check } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors, { Brand } from "@/constants/colors";
import { trpc } from "@/lib/trpc";

type PickupStatus = "searching" | "assigned" | "on_way" | "arrived" | "collected";

const statusConfig: Record<
  PickupStatus,
  { label: string; color: string; description: string }
> = {
  searching: { label: "Searching", color: "#F59E0B", description: "Finding nearby collectors..." },
  assigned: { label: "Assigned", color: "#3B82F6", description: "Collector accepted your request" },
  on_way: { label: "On the way", color: "#8B5CF6", description: "Collector is coming" },
  arrived: { label: "Arrived", color: "#10B981", description: "Collector has arrived" },
  collected: { label: "Collected", color: "#10B981", description: "Pickup completed" },
};

export default function TrackingScreen() {
  const params = useLocalSearchParams();
  const pickupId = params.pickupId as string;
  const [pollingInterval, setPollingInterval] = useState<number>(2000);

  const pickupQuery = trpc.pickups.getById.useQuery(
    { id: pickupId },
    { refetchInterval: pollingInterval },
  );

  const pickup = pickupQuery.data;

  const collectorQuery = trpc.pickups.getCollectorById.useQuery(
    { id: pickup?.collectorId || "" },
    { enabled: !!pickup?.collectorId },
  );

  const collector = collectorQuery.data;
  const paymentMutation = trpc.pickups.payForPickup.useMutation();
  const ratingMutation = trpc.ratings.leaveReview.useMutation();

  useEffect(() => {
    if (pickup?.status === "collected") {
      setPollingInterval(0);
      setTimeout(() => {
        router.push("/(user)/home" as any);
      }, 3000);
    }
  }, [pickup?.status]);

  if (!pickup) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading pickup details...</Text>
      </View>
    );
  }

  const status = statusConfig[pickup.status as PickupStatus];
  const showCollectorInfo = pickup.status !== "searching" && collector;

  const region = {
    latitude: pickup.location.latitude,
    longitude: pickup.location.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} provider={PROVIDER_DEFAULT} initialRegion={region}>
        <Marker
          coordinate={{
            latitude: pickup.location.latitude,
            longitude: pickup.location.longitude,
          }}
          title="Pickup Location"
        >
          <View style={styles.pickupMarker}>
            <MapPin size={24} color="#10B981" fill="#10B981" />
          </View>
        </Marker>

        {pickup.collectorLocation && (
          <>
            <Marker
              coordinate={{
                latitude: pickup.collectorLocation.latitude,
                longitude: pickup.collectorLocation.longitude,
              }}
              title="Collector"
            >
              <View style={styles.collectorMarker}>
                <Text style={styles.collectorMarkerText}>🚛</Text>
              </View>
            </Marker>

            <Polyline
              coordinates={[
                {
                  latitude: pickup.collectorLocation.latitude,
                  longitude: pickup.collectorLocation.longitude,
                },
                {
                  latitude: pickup.location.latitude,
                  longitude: pickup.location.longitude,
                },
              ]}
              strokeColor={Colors.light.primary}
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          </>
        )}
      </MapView>

      <SafeAreaView style={styles.overlay} edges={["top", "bottom"]}>
        <View style={styles.statusBar}>
          <View style={[styles.statusIndicator, { backgroundColor: status.color }]} />
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>{status.label}</Text>
            <Text style={styles.statusDescription}>{status.description}</Text>
          </View>
          {pickup.eta && (
            <View style={styles.etaContainer}>
              <Clock size={16} color="#6B7280" />
              <Text style={styles.etaText}>{pickup.eta} min</Text>
            </View>
          )}
        </View>

        {showCollectorInfo && collector && (
          <View style={styles.collectorCard}>
            <Image source={{ uri: collector.photo }} style={styles.collectorPhoto} />
            <View style={styles.collectorInfo}>
              <Text style={styles.collectorName}>{collector.name}</Text>
              <View style={styles.collectorDetails}>
                <View style={styles.ratingContainer}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.ratingText}>{collector.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.vehicleText}>{collector.vehicleType}</Text>
              </View>
              <Text style={styles.licenseText}>License: {collector.licenseNumber}</Text>
            </View>
            <TouchableOpacity style={styles.phoneButton}>
              <Phone size={20} color="#10B981" />
            </TouchableOpacity>
          </View>
        )}

        {pickup.status === "collected" && (
          <View style={styles.completedCard}>
            <View style={styles.completedIcon}>
              <Check size={32} color="#fff" />
            </View>
            <Text style={styles.completedTitle}>Pickup Completed!</Text>
            <Text style={styles.completedText}>
              Thank you for using {Brand.appName}. Your waste has been collected successfully.
            </Text>
            {pickup.paymentStatus !== "paid" && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  paymentMutation.mutate({
                    pickupId: pickup.id,
                    method: (pickup.paymentMethod as any) || "mtn_momo",
                  })
                }
              >
                <Text style={styles.actionButtonText}>
                  {paymentMutation.isPending ? "Processing..." : "Pay for Pickup"}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#2563EB", marginTop: 10 }]}
              onPress={() =>
                ratingMutation.mutate({
                  pickupId: pickup.id,
                  fromUserId: "u1",
                  toUserId: pickup.collectorId || "u2",
                  rating: 5,
                  comment: "Great service",
                })
              }
            >
              <Text style={styles.actionButtonText}>
                {ratingMutation.isPending ? "Saving..." : "Rate Collector (5★)"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  map: {
    flex: 1,
  },
  pickupMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  collectorMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  collectorMarkerText: {
    fontSize: 28,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    pointerEvents: "box-none",
  },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 2,
  },
  statusDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  etaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  etaText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  collectorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  collectorPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E5E7EB",
  },
  collectorInfo: {
    flex: 1,
    marginLeft: 16,
  },
  collectorName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  collectorDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  separator: {
    marginHorizontal: 8,
    color: "#D1D5DB",
  },
  vehicleText: {
    fontSize: 14,
    color: "#6B7280",
  },
  licenseText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  phoneButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  completedCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  completedIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  completedText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 14,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "700" as const,
  },
});
