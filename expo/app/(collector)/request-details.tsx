import { useLocalSearchParams, router } from "expo-router";
import { Check, MapPin } from "lucide-react-native";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors, { Brand } from "@/constants/colors";
import { useSession } from "@/lib/session";
import { trpc } from "@/lib/trpc";

export default function RequestDetailsScreen() {
  const params = useLocalSearchParams();
  const requestId = params.requestId as string;
  const { session } = useSession();

  const requestQuery = trpc.pickups.getById.useQuery(
    { id: requestId },
    { refetchInterval: 3000 },
  );
  const acceptMutation = trpc.pickups.acceptRequest.useMutation({
    onSuccess: () => {
      Alert.alert("Request accepted", "Head over to your live job to get started.");
      router.replace("/(collector)/active-pickup" as any);
    },
    onError: (error) => Alert.alert("Could not accept request", error.message),
  });

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
      <View style={styles.headerRow}>
        <Text style={styles.title}>Request #{request.id}</Text>
        <Text style={[styles.statusPill, request.status === "searching" && styles.statusPillOpen]}>
          {request.status.replace("_", " ").toUpperCase()}
        </Text>
      </View>
      <Text style={styles.meta}>
        {request.trashType} • {request.quantity} • {Brand.currency.symbol}
        {request.price}
      </Text>
      <View style={styles.addressRow}>
        <MapPin size={16} color="#6B7280" />
        <Text style={styles.address}>{request.address}</Text>
      </View>

      {request.photos[0] && <Image source={{ uri: request.photos[0] }} style={styles.preview} />}

      {request.status === "searching" ? (
        <TouchableOpacity
          style={styles.cta}
          testID="accept-request-button"
          onPress={() => acceptMutation.mutate({ pickupId: request.id })}
          activeOpacity={0.8}
        >
          <Check size={18} color="#fff" />
          <Text style={styles.ctaText}>
            {acceptMutation.isPending ? "Accepting..." : "Accept this request"}
          </Text>
        </TouchableOpacity>
      ) : request.status === "collected" ? (
        <Text style={styles.secondaryText}>This pickup is already completed.</Text>
      ) : (
        <TouchableOpacity
          style={[styles.cta, styles.ctaSecondary]}
          onPress={() => router.push("/(collector)/active-pickup" as any)}
        >
          <Text style={styles.ctaText}>Open live job</Text>
        </TouchableOpacity>
      )}
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
    flex: 1,
    marginTop: 0,
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  statusPill: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#065F46",
    backgroundColor: "#D1FAE5",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    textTransform: "uppercase",
    overflow: "hidden",
  },
  statusPillOpen: {
    color: "#92400E",
    backgroundColor: "#FEF3C7",
  },
  addressRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  secondaryText: {
    marginTop: 16,
    color: Colors.light.muted,
  },
  ctaSecondary: {
    backgroundColor: "#2563EB",
  },
});

