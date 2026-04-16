import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Package } from "lucide-react-native";
import { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors, { Brand } from "@/constants/colors";
import { trpc } from "@/lib/trpc";

type TrashType = "plastic" | "organic" | "mixed" | "ewaste";
type Quantity = "small" | "sack" | "bin";
type PaymentMethod = "mtn_momo" | "vodafone_cash" | "airteltigo_cash";
type PlanType = "weekly" | "monthly";

const trashTypes: { id: TrashType; label: string; icon: string; color: string }[] = [
  { id: "plastic", label: "Plastic", icon: "♻️", color: "#3B82F6" },
  { id: "organic", label: "Organic", icon: "🌱", color: "#10B981" },
  { id: "mixed", label: "Mixed", icon: "🗑️", color: "#6B7280" },
  { id: "ewaste", label: "E-waste", icon: "⚡", color: "#F59E0B" },
];

const quantities: { id: Quantity; label: string; price: number; description: string }[] = [
  { id: "small", label: "Small Bag", price: 50, description: "~5kg" },
  { id: "sack", label: "Sack", price: 150, description: "~15kg" },
  { id: "bin", label: "Bin", price: 300, description: "~30kg+" },
];

export default function TrashDetailsScreen() {
  const params = useLocalSearchParams();
  const photos = JSON.parse((params.photos as string) || "[]") as string[];
  const [selectedType, setSelectedType] = useState<TrashType | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<Quantity | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string>("Getting location...");
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [communityCode, setCommunityCode] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mtn_momo");
  const [subscriptionPlan, setSubscriptionPlan] = useState<PlanType | null>(null);

  const createPickupMutation = trpc.pickups.create.useMutation();
  const plansQuery = trpc.subscriptions.plans.useQuery();

  useEffect(() => {
    (async () => {
      try {
        console.log("Getting current location...");
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        console.log("Reverse geocoding...");
        const geocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        if (geocode[0]) {
          const addr = `${geocode[0].street || ""}, ${geocode[0].city || geocode[0].region || ""}`.trim();
          console.log("Address:", addr);
          setAddress(addr || "Unknown location");
        }
      } catch (error) {
        console.error("Error getting location:", error);
        setLocation({
          coords: {
            latitude: 5.6037,
            longitude: -0.187,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
        setAddress("Accra, Ghana");
      }
    })();
  }, []);

  const selectedPrice = useMemo(
    () => quantities.find((q) => q.id === selectedQuantity)?.price || 0,
    [selectedQuantity],
  );

  const handleConfirm = async () => {
    console.log("Confirming pickup request...");
    if (!selectedType || !selectedQuantity || !location) {
      Alert.alert("Missing Information", "Please select trash type and quantity");
      return;
    }

    try {
      const pickup = await createPickupMutation.mutateAsync({
        userId: "user1",
        photos,
        trashType: selectedType,
        quantity: selectedQuantity,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        address,
        isUrgent,
        communityCode: communityCode || undefined,
        subscriptionPlan: subscriptionPlan ?? undefined,
        paymentMethod,
      });

      console.log("Pickup created:", pickup.id);
      router.push({
        pathname: "/(user)/tracking" as any,
        params: { pickupId: pickup.id },
      });
    } catch (error) {
      console.error("Error creating pickup:", error);
      const queuedKey = `offline-pickup-${Date.now()}`;
      await AsyncStorage.setItem(
        queuedKey,
        JSON.stringify({
          userId: "user1",
          photos,
          trashType: selectedType,
          quantity: selectedQuantity,
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          address,
          isUrgent,
          communityCode: communityCode || undefined,
          subscriptionPlan: subscriptionPlan ?? undefined,
          paymentMethod,
        }),
      );
      Alert.alert("Offline saved", "Request saved locally and will be synced when backend is reachable.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.photosSection}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
            {photos.map((photo, index) => (
              <Image key={index} source={{ uri: photo }} style={styles.photo} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trash Type</Text>
          <View style={styles.optionsGrid}>
            {trashTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                testID={`trash-type-${type.id}`}
                style={[
                  styles.typeCard,
                  selectedType === type.id && [
                    styles.typeCardActive,
                    { borderColor: type.color },
                  ],
                ]}
                onPress={() => setSelectedType(type.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={styles.typeLabel}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          {quantities.map((qty) => (
            <TouchableOpacity
              key={qty.id}
              testID={`quantity-${qty.id}`}
              style={[
                styles.quantityCard,
                selectedQuantity === qty.id && styles.quantityCardActive,
              ]}
              onPress={() => setSelectedQuantity(qty.id)}
              activeOpacity={0.7}
            >
              <View style={styles.quantityInfo}>
                <Text style={styles.quantityLabel}>{qty.label}</Text>
                <Text style={styles.quantityDescription}>{qty.description}</Text>
              </View>
              <Text style={styles.quantityPrice}>
                {Brand.currency.symbol} {qty.price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Options</Text>
          <TouchableOpacity
            style={[styles.quantityCard, isUrgent && styles.quantityCardActive]}
            onPress={() => setIsUrgent((v) => !v)}
            activeOpacity={0.7}
          >
            <View style={styles.quantityInfo}>
              <Text style={styles.quantityLabel}>SOS Cleanup Request</Text>
              <Text style={styles.quantityDescription}>Urgent pickup with higher fee</Text>
            </View>
            <Text style={styles.quantityPrice}>{isUrgent ? "ON" : "OFF"}</Text>
          </TouchableOpacity>
          <View style={styles.locationCard}>
            <View style={styles.quantityInfo}>
              <Text style={styles.quantityLabel}>Community Pickup Code</Text>
              <Text style={styles.quantityDescription}>
                Add code to group with neighbors (example: OSU-BLOCK-A)
              </Text>
            </View>
            <TouchableOpacity
              style={styles.communityChip}
              onPress={() => setCommunityCode(communityCode ? "" : "OSU-BLOCK-A")}
            >
              <Text style={styles.communityChipText}>{communityCode || "Set sample"}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.locationCard}>
            <View style={styles.quantityInfo}>
              <Text style={styles.quantityLabel}>Payment Method</Text>
              <Text style={styles.quantityDescription}>MTN MoMo, Vodafone Cash, AirtelTigo</Text>
            </View>
            <Text style={styles.locationText}>{paymentMethod.replace("_", " ")}</Text>
          </View>
          <View style={styles.optionsGrid}>
            {(["mtn_momo", "vodafone_cash", "airteltigo_cash"] as PaymentMethod[]).map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.typeCard,
                  paymentMethod === method && styles.typeCardActive,
                ]}
                onPress={() => setPaymentMethod(method)}
              >
                <Text style={styles.typeLabel}>{method.replace("_", " ").toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Subscription Plan</Text>
          <View style={styles.optionsGrid}>
            {(plansQuery.data ?? []).map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[styles.typeCard, subscriptionPlan === plan.id && styles.typeCardActive]}
                onPress={() =>
                  setSubscriptionPlan((prev) => (prev === plan.id ? null : (plan.id as PlanType)))
                }
              >
                <Text style={styles.typeLabel}>{plan.label}</Text>
                <Text style={styles.quantityDescription}>
                  {Brand.currency.symbol} {plan.price}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Location</Text>
          <View style={styles.locationCard}>
            <View style={styles.locationIcon}>
              <Package size={20} color="#10B981" />
            </View>
            <Text style={styles.locationText}>{address}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Estimated Cost</Text>
          <Text style={styles.priceValue}>
            {Brand.currency.symbol} {selectedPrice}
          </Text>
        </View>
        <TouchableOpacity
          testID="confirm-button"
          style={[
            styles.confirmButton,
            (!selectedType || !selectedQuantity || createPickupMutation.isPending) &&
              styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!selectedType || !selectedQuantity || createPickupMutation.isPending}
          activeOpacity={0.8}
        >
          {createPickupMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Request</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  photosSection: {
    padding: 20,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  photoScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#E5E7EB",
  },
  section: {
    padding: 20,
    backgroundColor: Colors.light.card,
    marginTop: 8,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeCard: {
    flex: 1,
    minWidth: "45%",
    aspectRatio: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  typeCardActive: {
    backgroundColor: "#ECFDF5",
    borderWidth: 2,
  },
  typeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  quantityCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  quantityCardActive: {
    backgroundColor: "#ECFDF5",
    borderColor: Colors.light.primary,
  },
  quantityInfo: {
    flex: 1,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  quantityDescription: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  quantityPrice: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  locationText: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
  },
  communityChip: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  communityChipText: {
    color: Colors.light.primaryDark,
    fontWeight: "600" as const,
    fontSize: 12,
  },
  footer: {
    backgroundColor: Colors.light.card,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
    color: Colors.light.muted,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  confirmButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
