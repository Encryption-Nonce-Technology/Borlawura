import { useLocalSearchParams, router } from "expo-router";
import * as Location from "expo-location";
import { Package } from "lucide-react-native";
import { useState, useEffect } from "react";
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

import { trpc } from "@/lib/trpc";

type TrashType = "plastic" | "organic" | "mixed" | "ewaste";
type Quantity = "small" | "sack" | "bin";

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

  const createPickupMutation = trpc.pickups.create.useMutation();

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
            latitude: -1.2921,
            longitude: 36.8219,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
        setAddress("Nairobi, Kenya");
      }
    })();
  }, []);

  const selectedPrice = quantities.find((q) => q.id === selectedQuantity)?.price || 0;

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
      });

      console.log("Pickup created:", pickup.id);
      router.push({
        pathname: "/(user)/tracking" as any,
        params: { pickupId: pickup.id },
      });
    } catch (error) {
      console.error("Error creating pickup:", error);
      Alert.alert("Error", "Failed to create pickup request");
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
              <Text style={styles.quantityPrice}>KSh {qty.price}</Text>
            </TouchableOpacity>
          ))}
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
          <Text style={styles.priceValue}>KSh {selectedPrice}</Text>
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
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
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
    backgroundColor: "#fff",
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
    borderColor: "#E5E7EB",
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
    color: "#1F2937",
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
    borderColor: "#E5E7EB",
  },
  quantityCardActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
  },
  quantityInfo: {
    flex: 1,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  quantityDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  quantityPrice: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#10B981",
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
    color: "#1F2937",
  },
  footer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
    color: "#6B7280",
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#10B981",
  },
  confirmButton: {
    backgroundColor: "#10B981",
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
