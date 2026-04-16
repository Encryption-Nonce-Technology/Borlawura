import { useLocalSearchParams, router } from "expo-router";
import { Camera, CheckCircle } from "lucide-react-native";
import { Alert, Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { trpc } from "@/lib/trpc";

export default function RequestDetailsScreen() {
  const params = useLocalSearchParams();
  const requestId = params.requestId as string;
  const requestQuery = trpc.pickups.getById.useQuery({ id: requestId });
  const completeMutation = trpc.pickups.completePickup.useMutation({
    onSuccess: () => {
      Alert.alert("Done", "Pickup completed and earnings recorded.");
      router.back();
    },
  });
  const rateMutation = trpc.ratings.leaveReview.useMutation();

  const request = requestQuery.data;
  if (!request) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Loading request...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Text style={styles.title}>Request #{request.id}</Text>
      <Text style={styles.meta}>
        {request.trashType} • {request.quantity} • ₵{request.price}
      </Text>
      <Text style={styles.address}>{request.address}</Text>

      {request.photos[0] && <Image source={{ uri: request.photos[0] }} style={styles.preview} />}

      <TouchableOpacity
        style={styles.cta}
        onPress={() =>
          completeMutation.mutate({
            id: request.id,
            collectorId: "c1",
            afterPhoto:
              "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=700&q=60",
          })
        }
      >
        <Camera size={18} color="#fff" />
        <Text style={styles.ctaText}>
          {completeMutation.isPending ? "Saving proof..." : "Upload after-photo & complete"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.cta, { backgroundColor: "#2563EB" }]}
        onPress={() =>
          rateMutation.mutate({
            pickupId: request.id,
            fromUserId: "u2",
            toUserId: "u1",
            rating: 5,
            comment: "User was cooperative and ready on time",
          })
        }
      >
        <CheckCircle size={18} color="#fff" />
        <Text style={styles.ctaText}>{rateMutation.isPending ? "Saving..." : "Rate user (5★)"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  meta: {
    marginTop: 8,
    color: Colors.light.primaryDark,
    fontWeight: "600" as const,
  },
  address: {
    marginTop: 8,
    color: Colors.light.muted,
  },
  preview: {
    marginTop: 16,
    width: "100%",
    height: 220,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
  },
  cta: {
    marginTop: 16,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "700" as const,
  },
});

