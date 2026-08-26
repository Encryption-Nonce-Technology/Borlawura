/**
 * Collector live-job tracker.
 * Polls pickups assigned to the signed-in collector and lets them progress
 * the job through assigned -> on_way -> arrived -> collected, capture proof,
 * and rate the customer afterwards.
 */

import { router } from "expo-router";
import { Camera, CheckCircle, MapPin, Star } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors, { Brand } from "@/constants/colors";
import { useSession } from "@/lib/session";
import { trpc } from "@/lib/trpc";

type JobStatus = "assigned" | "on_way" | "arrived" | "collected";

const STEPS: { status: JobStatus; label: string }[] = [
  { status: "assigned", label: "Accepted" },
  { status: "on_way", label: "On the way" },
  { status: "arrived", label: "Arrived" },
  { status: "collected", label: "Collected" },
];

const PROOF_PHOTO_URL =
  "https://images.unsplash.com/photo-1532999122724-e3c354a0b15b?auto=format&fit=crop&w=700&q=60";

const trashEmoji = (trashType: string) =>
  trashType === "plastic" ? "♻️" : trashType === "organic" ? "🌱" : trashType === "ewaste" ? "⚡" : "🗑️";

export default function ActivePickupScreen() {
  const { session } = useSession();
  const myCollectorId = session ? `c_${session.user.id}` : "";
  const [completedJob, setCompletedJob] = useState<{
    pickupId: string;
    userId: string;
    price: number;
  } | null>(null);

  const jobsQuery = trpc.pickups.getCollectorPickups.useQuery(
    { collectorId: myCollectorId },
    { enabled: !!myCollectorId, refetchInterval: completedJob ? 0 : 2500 },
  );
  const advanceMutation = trpc.pickups.updateStatus.useMutation({
    onSuccess: () => jobsQuery.refetch(),
    onError: (error) => Alert.alert("Could not update status", error.message),
  });
  const completeMutation = trpc.pickups.completePickup.useMutation({
    onSuccess: () => {
      Alert.alert("Done", "Pickup completed and earnings recorded.");
      jobsQuery.refetch();
    },
    onError: (error) => Alert.alert("Could not complete pickup", error.message),
  });
  const rateMutation = trpc.ratings.leaveReview.useMutation({
    onSuccess: () => setCompletedJob(null),
    onError: (error) => Alert.alert("Could not save rating", error.message),
  });

  const job = useMemo(
    () =>
      (jobsQuery.data ?? []).find(
        (pickup) =>
          pickup.status === "assigned" || pickup.status === "on_way" || pickup.status === "arrived",
      ) ?? null,
    [jobsQuery.data],
  );
  const currentStep = job
    ? STEPS.findIndex((step) => step.status === (job.status as JobStatus))
    : -1;

  if (!session || !myCollectorId) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.centerText}>Loading your live job...</Text>
      </View>
    );
  }

  const handlePrimaryAction = () => {
    if (!job) return;
    if (job.status === "assigned") {
      advanceMutation.mutate({ id: job.id, status: "on_way" });
    } else if (job.status === "on_way") {
      advanceMutation.mutate({ id: job.id, status: "arrived" });
    } else {
      // Capture customer details before completing — the jobs feed drops
      // collected pickups, so this snapshot keeps the rating card visible.
      setCompletedJob({ pickupId: job.id, userId: job.userId, price: job.price });
      completeMutation.mutate({ id: job.id, afterPhoto: PROOF_PHOTO_URL });
    }
  };

  const handleRateCustomer = () => {
    if (!completedJob) return;
    if (!completedJob.userId) {
      Alert.alert("No customer linked", "This pickup has no customer account to rate.");
      return;
    }
    rateMutation.mutate({
      pickupId: completedJob.pickupId,
      fromUserId: session.user.id,
      toUserId: completedJob.userId,
      rating: 5,
      comment: "Customer was ready on time",
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {jobsQuery.isLoading && (
          <View style={styles.card}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.centerText}>Checking your assignments...</Text>
          </View>
        )}

        {completedJob && (
          <View style={[styles.card, styles.completionCard]}>
            <CheckCircle size={48} color="#10B981" />
            <Text style={styles.completedTitle}>Pickup #{completedJob.pickupId} complete</Text>
            <Text style={styles.muted}>
              You earned {Brand.currency.symbol}
              {completedJob.price}
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              testID="rate-customer-button"
              onPress={handleRateCustomer}
              disabled={rateMutation.isPending}
            >
              <Star size={18} color="#fff" />
              <Text style={styles.buttonText}>
                {rateMutation.isPending ? "Saving..." : "Rate customer ★"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setCompletedJob(null)}>
              <Text style={styles.secondaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {!jobsQuery.isLoading && job ? (
          <>
            <View style={styles.stepper}>
              {STEPS.map((step, index) => (
                <View key={step.status} style={[styles.stepPill, index <= currentStep && styles.stepDone]}>
                  <Text style={[styles.stepText, index <= currentStep && styles.stepTextDone]}>
                    {step.label}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.typeTitle}>
                  {trashEmoji(job.trashType)} {job.trashType}
                </Text>
                <Text style={styles.price}>
                  {Brand.currency.symbol}
                  {job.price}
                </Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
                {job.photos.slice(0, 3).map((photo, index) => (
                  <Image key={index} source={{ uri: photo }} style={styles.photo} />
                ))}
              </ScrollView>

              <View style={styles.addressRow}>
                <MapPin size={16} color="#6B7280" />
                <Text style={styles.address}>{job.address}</Text>
              </View>
              {!!job.eta && <Text style={styles.eta}>ETA ~{job.eta} min</Text>}

              <TouchableOpacity
                style={styles.primaryButton}
                testID="advance-job-button"
                onPress={handlePrimaryAction}
                activeOpacity={0.8}
                disabled={advanceMutation.isPending || completeMutation.isPending}
              >
                {job.status === "arrived" && <Camera size={18} color="#fff" />}
                <Text style={styles.buttonText}>
                  {completeMutation.isPending || advanceMutation.isPending
                    ? "Updating..."
                    : job.status === "assigned"
                      ? "Start heading there"
                      : job.status === "on_way"
                        ? "I've arrived"
                        : "Upload proof & complete"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}

        {!jobsQuery.isLoading && !job && !completedJob && (
          <View style={styles.card}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>No active job</Text>
            <Text style={styles.muted}>
              Accept a request from your home screen to start tracking it here.
            </Text>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
              <Text style={styles.secondaryButtonText}>Back to requests</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scroll: { padding: 20, gap: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F9FAFB", padding: 20 },
  centerText: { marginTop: 12, fontSize: 16, color: "#6B7280", textAlign: "center" },
  stepper: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 4 },
  stepPill: { borderRadius: 999, backgroundColor: "#E5E7EB", paddingHorizontal: 12, paddingVertical: 6 },
  stepDone: { backgroundColor: Colors.light.primary },
  stepText: { fontSize: 12, fontWeight: "600" as const, color: "#6B7280" },
  stepTextDone: { color: "#fff" },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 18,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  completionCard: { alignItems: "center" },
  completedTitle: { fontSize: 20, fontWeight: "700" as const, color: Colors.light.text, marginTop: 12 },
  muted: { color: Colors.light.muted, textAlign: "center", lineHeight: 20, marginTop: 4 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 12 },
  typeTitle: { fontSize: 18, fontWeight: "700" as const, color: Colors.light.text, textTransform: "capitalize" },
  price: { fontSize: 20, fontWeight: "800" as const, color: Colors.light.primary },
  photoRow: { alignSelf: "stretch", marginBottom: 12 },
  photo: { width: 96, height: 96, borderRadius: 12, marginRight: 10, backgroundColor: "#E5E7EB" },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 8, width: "100%" },
  address: { flex: 1, color: Colors.light.muted },
  eta: { marginTop: 6, fontSize: 13, fontWeight: "600" as const, color: Colors.light.primaryDark },
  primaryButton: {
    marginTop: 16,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "stretch",
  },
  buttonText: { color: "#fff", fontWeight: "700" as const, fontSize: 15 },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: "stretch",
    alignItems: "center",
  },
  secondaryButtonText: { color: Colors.light.text, fontWeight: "600" as const },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 18, fontWeight: "700" as const, color: Colors.light.text, marginTop: 8 },
});
