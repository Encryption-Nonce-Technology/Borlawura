import { useLocalSearchParams, router } from "expo-router";
import {
  MapPin,
  Phone,
  Star,
  Clock,
  Check,
  Shield,
  MessageSquare,
  ArrowLeft,
  Share2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors, { Brand } from "@/constants/colors";
import UberMap from "@/components/UberMap";
import { useSession } from "@/lib/session";
import { trpc } from "@/lib/trpc";

type PickupStatus = "searching" | "assigned" | "on_way" | "arrived" | "collected";

const statusConfig: Record<
  PickupStatus,
  { label: string; color: string; description: string; stepIndex: number }
> = {
  searching: { label: "Dispatching", color: "#F59E0B", description: "Finding closest Borlawura truck...", stepIndex: 1 },
  assigned: { label: "Driver Assigned", color: "#0EA5E9", description: "Kwame accepted your request", stepIndex: 2 },
  on_way: { label: "Driver En Route", color: "#8B5CF6", description: "Collector is driving to your pickup spot", stepIndex: 3 },
  arrived: { label: "Driver Arrived", color: "#10B981", description: "Collector is at your gate/compound", stepIndex: 4 },
  collected: { label: "Waste Collected", color: "#10B981", description: "Job completed cleanly", stepIndex: 5 },
};

export default function TrackingScreen() {
  const params = useLocalSearchParams();
  const pickupId = params.pickupId as string;
  const [pollingInterval, setPollingInterval] = useState<number>(2000);
  const [selectedTip, setSelectedTip] = useState<number | null>(5);
  const [rating, setRating] = useState<number>(5);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);
  const { session } = useSession();

  const pickupQuery = trpc.pickups.getById.useQuery(
    { id: pickupId },
    { refetchInterval: pollingInterval },
  );

  const pickup = pickupQuery.data;

  const collectorQuery = trpc.pickups.getCollectorById.useQuery(
    { id: pickup?.collectorId || "" },
    { enabled: !!pickup?.collectorId },
  );

  const collector = collectorQuery.data || {
    id: "c_demo",
    name: "Kwame Mensah",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    rating: 4.94,
    vehicleType: "Piaggio Ape Heavy (Tricycle)",
    licenseNumber: "GW-4821-24",
  };

  const paymentMutation = trpc.pickups.payForPickup.useMutation();
  const ratingMutation = trpc.ratings.leaveReview.useMutation();

  useEffect(() => {
    if (pickup?.status === "collected") {
      setPollingInterval(0);
    }
  }, [pickup?.status]);

  const currentStatusKey: PickupStatus = (pickup?.status as PickupStatus) || "on_way";
  const status = statusConfig[currentStatusKey];

  const handlePay = () => {
    if (!pickup) return;
    paymentMutation.mutate({
      pickupId: pickup.id,
      method: (pickup.paymentMethod as any) || "mtn_momo",
    });
    Alert.alert("Payment Approved", `₵${pickup.price + (selectedTip || 0)} charged via MTN Mobile Money.`);
  };

  const handleRate = () => {
    if (!pickup) return;
    ratingMutation.mutate({
      pickupId: pickup.id,
      fromUserId: session?.user.id ?? "",
      toUserId: collector?.id || "c_demo",
      rating,
      comment: "Prompt and clean service!",
    });
    setRatingSubmitted(true);
    Alert.alert("Thank You!", "Your 5★ rating was submitted.");
  };

  return (
    <View style={styles.container}>
      {/* Top Floating Action Bar */}
      <SafeAreaView style={styles.topFloatBar} edges={["top"]}>
        <TouchableOpacity style={styles.backCircle} onPress={() => router.push("/(user)/home" as any)}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.topStatusPill}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={styles.topStatusText}>{status.label}</Text>
        </View>
        <TouchableOpacity
          style={styles.backCircle}
          onPress={() => Alert.alert("Trip Shared", "Live pickup tracking link copied to clipboard.")}
        >
          <Share2 size={18} color="#0F172A" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Fullscreen Map */}
      <View style={styles.mapWrap}>
        <UberMap
          userLocation={
            pickup?.location || {
              latitude: 5.6037,
              longitude: -0.1870,
            }
          }
          collectorLocation={
            pickup?.collectorLocation || {
              latitude: (pickup?.location.latitude || 5.6037) + 0.002,
              longitude: (pickup?.location.longitude || -0.1870) - 0.003,
            }
          }
          activeRoute={true}
        />
      </View>

      {/* Bottom Uber Journey Card */}
      <View style={styles.bottomCardWrap}>
        <ScrollView style={styles.bottomCard} showsVerticalScrollIndicator={false}>
          {/* ETA & Status Header */}
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.etaBigText}>
                {currentStatusKey === "collected" ? "Completed" : `${pickup?.eta || 4} mins away`}
              </Text>
              <Text style={styles.etaSubText}>{status.description}</Text>
            </View>
            <View style={styles.plateBadge}>
              <Text style={styles.plateBadgeText}>{collector.licenseNumber}</Text>
            </View>
          </View>

          {/* Stepper Progress Line */}
          <View style={styles.progressLineWrap}>
            {[1, 2, 3, 4, 5].map((sIndex) => (
              <View
                key={sIndex}
                style={[
                  styles.progressStep,
                  sIndex <= status.stepIndex ? styles.progressStepActive : styles.progressStepInactive,
                ]}
              />
            ))}
          </View>

          {/* Collector Profile Card */}
          <View style={styles.collectorBox}>
            <Image source={{ uri: collector.photo }} style={styles.collectorAvatar} />
            <View style={styles.collectorInfo}>
              <Text style={styles.collectorName}>{collector.name}</Text>
              <View style={styles.collectorRatingRow}>
                <Star size={13} color="#D97706" fill="#D97706" />
                <Text style={styles.collectorRatingText}>{collector.rating.toFixed(2)}</Text>
                <Text style={styles.collectorTripsText}>• Top Rated Borlawura Partner</Text>
              </View>
              <Text style={styles.vehicleType}>{collector.vehicleType}</Text>
            </View>
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => Alert.alert("Calling Collector", `Dialing ${collector.name}...`)}
            >
              <Phone size={18} color="#10B981" />
              <Text style={styles.actionBtnText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => Alert.alert("Chat", "Type instructions: e.g. Trash is behind the gate.")}
            >
              <MessageSquare size={18} color="#0EA5E9" />
              <Text style={styles.actionBtnText}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => Alert.alert("Emergency Assist", "Ghana Fire/Police & Borlawura 24/7 Hotline connected.")}
            >
              <Shield size={18} color="#EF4444" />
              <Text style={[styles.actionBtnText, { color: "#EF4444" }]}>Emergency</Text>
            </TouchableOpacity>
          </View>

          {/* Completed State Rating & Payment Modal */}
          {currentStatusKey === "collected" && (
            <View style={styles.collectedReceiptBox}>
              <View style={styles.checkGlow}>
                <CheckCircle2 size={36} color="#10B981" />
              </View>
              <Text style={styles.receiptTitle}>Clean Pickup Complete!</Text>
              <Text style={styles.receiptSub}>Your premises was serviced successfully.</Text>

              {/* Tipping Selector */}
              <Text style={styles.tipLabel}>Add a tip for Kwame?</Text>
              <View style={styles.tipRow}>
                {[0, 5, 10, 20].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[styles.tipChip, selectedTip === amount && styles.tipChipActive]}
                    onPress={() => setSelectedTip(amount)}
                  >
                    <Text style={[styles.tipChipText, selectedTip === amount && styles.tipChipTextActive]}>
                      {amount === 0 ? "No tip" : `+₵${amount}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Rate Driver */}
              {!ratingSubmitted ? (
                <View style={styles.rateBox}>
                  <Text style={styles.tipLabel}>Rate Kwame&apos;s Service</Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <TouchableOpacity key={s} onPress={() => setRating(s)}>
                        <Star
                          size={28}
                          color={s <= rating ? "#F59E0B" : "#CBD5E1"}
                          fill={s <= rating ? "#F59E0B" : "transparent"}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity style={styles.submitRatingBtn} onPress={handleRate}>
                    <Text style={styles.submitRatingText}>Submit Rating & Finish</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.ratingDoneBanner}>
                  <Text style={styles.ratingDoneText}>⭐⭐⭐⭐⭐ Rating Recorded</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.doneHomeBtn}
                onPress={() => router.push("/(user)/home" as any)}
              >
                <Text style={styles.doneHomeBtnText}>Back to Home Map</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090A0C",
  },
  topFloatBar: {
    position: "absolute",
    top: 14,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 40,
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  topStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
    backdropFilter: "blur(10px)",
  } as any,
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  topStatusText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  mapWrap: {
    flex: 1,
  },
  bottomCardWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "54%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 30,
  },
  bottomCard: {
    padding: 22,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  etaBigText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  etaSubText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  plateBadge: {
    backgroundColor: "#FEF08A",
    borderWidth: 1.5,
    borderColor: "#000000",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  plateBadgeText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 0.6,
  },
  progressLineWrap: {
    flexDirection: "row",
    gap: 6,
    marginVertical: 14,
  },
  progressStep: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: "#10B981",
  },
  progressStepInactive: {
    backgroundColor: "#E2E8F0",
  },
  collectorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  collectorAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
  },
  collectorInfo: {
    flex: 1,
  },
  collectorName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  collectorRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  collectorRatingText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#D97706",
  },
  collectorTripsText: {
    fontSize: 11,
    color: "#64748B",
  },
  vehicleType: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  collectedReceiptBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  checkGlow: {
    marginBottom: 8,
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  receiptSub: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  tipLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 8,
  },
  tipRow: {
    flexDirection: "row",
    gap: 8,
  },
  tipChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tipChipActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  tipChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  tipChipTextActive: {
    color: "#000000",
  },
  rateBox: {
    width: "100%",
    alignItems: "center",
    marginTop: 12,
  },
  starsRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 8,
  },
  submitRatingBtn: {
    backgroundColor: "#0F172A",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    width: "100%",
    alignItems: "center",
  },
  submitRatingText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  ratingDoneBanner: {
    backgroundColor: "#ECFDF5",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  ratingDoneText: {
    color: "#065F46",
    fontSize: 13,
    fontWeight: "700",
  },
  doneHomeBtn: {
    marginTop: 12,
    paddingVertical: 8,
  },
  doneHomeBtnText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "800",
  },
});
