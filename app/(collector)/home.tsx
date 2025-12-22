import { router } from "expo-router";
import { Power, PowerOff, Wallet, Image as ImageIcon, MapPin } from "lucide-react-native";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { trpc } from "@/lib/trpc";

export default function CollectorHomeScreen() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const requestsQuery = trpc.pickups.getActiveRequests.useQuery(undefined, {
    refetchInterval: isOnline ? 3000 : 0,
  });

  const handleToggleOnline = () => {
    console.log("Toggling online status:", !isOnline);
    setIsOnline(!isOnline);
  };

  const handleRequestPress = (requestId: string) => {
    console.log("Opening request:", requestId);
    router.push({
      pathname: "/(collector)/request-details" as any,
      params: { requestId },
    });
  };

  const activeRequests = requestsQuery.data || [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>🌿 Borlawura</Text>
          <Text style={styles.subtitle}>Collector</Text>
        </View>
        <TouchableOpacity
          style={styles.walletButton}
          onPress={() => router.push("/(collector)/wallet" as any)}
          testID="wallet-button"
        >
          <Wallet size={24} color="#10B981" />
        </TouchableOpacity>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusInfo}>
          <View style={[styles.statusDot, isOnline ? styles.statusOnline : styles.statusOffline]} />
          <View>
            <Text style={styles.statusLabel}>{isOnline ? "You're Online" : "You're Offline"}</Text>
            <Text style={styles.statusDescription}>
              {isOnline ? "Ready to accept requests" : "Turn on to receive requests"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          testID="toggle-online-button"
          style={[styles.toggleButton, isOnline ? styles.toggleButtonOn : styles.toggleButtonOff]}
          onPress={handleToggleOnline}
          activeOpacity={0.8}
        >
          {isOnline ? <Power size={24} color="#fff" /> : <PowerOff size={24} color="#6B7280" />}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          {isOnline ? "Available Requests" : "Go online to see requests"}
        </Text>

        {isOnline ? (
          <ScrollView
            style={styles.requestsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={requestsQuery.isRefetching}
                onRefresh={() => requestsQuery.refetch()}
                tintColor="#10B981"
              />
            }
          >
            {activeRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>No requests nearby</Text>
                <Text style={styles.emptyText}>
                  New pickup requests will appear here when available
                </Text>
              </View>
            ) : (
              activeRequests.map((request) => (
                <TouchableOpacity
                  key={request.id}
                  testID={`request-${request.id}`}
                  style={styles.requestCard}
                  onPress={() => handleRequestPress(request.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.requestPhotos}>
                    {request.photos.slice(0, 3).map((photo, index) => (
                      <Image key={index} source={{ uri: photo }} style={styles.requestPhoto} />
                    ))}
                    {request.photos.length === 0 && (
                      <View style={[styles.requestPhoto, styles.requestPhotoPlaceholder]}>
                        <ImageIcon size={24} color="#9CA3AF" />
                      </View>
                    )}
                  </View>

                  <View style={styles.requestInfo}>
                    <View style={styles.requestHeader}>
                      <View style={styles.trashTypeContainer}>
                        <Text style={styles.trashTypeEmoji}>
                          {request.trashType === "plastic"
                            ? "♻️"
                            : request.trashType === "organic"
                              ? "🌱"
                              : request.trashType === "ewaste"
                                ? "⚡"
                                : "🗑️"}
                        </Text>
                        <Text style={styles.trashTypeText}>
                          {request.trashType.charAt(0).toUpperCase() + request.trashType.slice(1)}
                        </Text>
                      </View>
                      <Text style={styles.priceText}>₵{request.price}</Text>
                    </View>

                    <View style={styles.requestLocation}>
                      <MapPin size={16} color="#6B7280" />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {request.address}
                      </Text>
                    </View>

                    <View style={styles.requestFooter}>
                      <Text style={styles.quantityText}>{request.quantity} quantity</Text>
                      <View style={styles.viewButton}>
                        <Text style={styles.viewButtonText}>View Details</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        ) : (
          <View style={styles.offlineState}>
            <Text style={styles.offlineIcon}>💤</Text>
            <Text style={styles.offlineText}>You are currently offline</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  logo: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  walletButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  statusCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOnline: {
    backgroundColor: "#10B981",
  },
  statusOffline: {
    backgroundColor: "#9CA3AF",
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 2,
  },
  statusDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  toggleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButtonOn: {
    backgroundColor: "#10B981",
  },
  toggleButtonOff: {
    backgroundColor: "#E5E7EB",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 16,
  },
  requestsList: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  requestPhotos: {
    flexDirection: "row",
    height: 120,
    backgroundColor: "#F3F4F6",
  },
  requestPhoto: {
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  requestPhotoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  requestInfo: {
    padding: 16,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  trashTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  trashTypeEmoji: {
    fontSize: 24,
  },
  trashTypeText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  priceText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#10B981",
  },
  requestLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 14,
    color: "#9CA3AF",
    textTransform: "capitalize",
  },
  viewButton: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#10B981",
  },
  offlineState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  offlineIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  offlineText: {
    fontSize: 16,
    color: "#6B7280",
  },
});
