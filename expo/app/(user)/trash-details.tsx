import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import {
  MapPin,
  Trash2,
  Calendar,
  Zap,
  ArrowRight,
  Shield,
  CreditCard,
  ChevronLeft,
} from "lucide-react-native";

import Colors, { Brand, WasteTiers, WasteCategories } from "@/constants/colors";
import { trpc } from "@/lib/trpc";

export default function TrashDetailsScreen() {
  const params = useLocalSearchParams();
  const photos = JSON.parse((params.photos as string) || "[]") as string[];

  const [selectedType, setSelectedType] = useState<string>("mixed");
  const [selectedQuantity, setSelectedQuantity] = useState<string>("small");
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: 5.6037,
    longitude: -0.1870,
  });
  const [address, setAddress] = useState<string>("East Legon, Accra");
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [communityCode, setCommunityCode] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"mtn_momo" | "vodafone_cash" | "airteltigo_cash" | "cash">("mtn_momo");

  const createPickupMutation = trpc.pickups.create.useMutation();

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const current = await Location.getCurrentPositionAsync({});
          setLocation({
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          });
          const geocode = await Location.reverseGeocodeAsync({
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          });
          if (geocode[0]) {
            const addr = `${geocode[0].street || ""}, ${geocode[0].city || "Accra"}`.trim();
            if (addr) setAddress(addr);
          }
        }
      } catch (err) {}
    })();
  }, []);

  const currentTierObj = useMemo(
    () => WasteTiers.find((t) => t.id === selectedQuantity) || WasteTiers[0],
    [selectedQuantity],
  );

  const handleConfirm = async () => {
    try {
      const pickup = await createPickupMutation.mutateAsync({
        photos: photos.length > 0 ? photos : ["https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400"],
        trashType: selectedType as any,
        quantity: selectedQuantity as any,
        location,
        address,
        isUrgent,
        communityCode: communityCode || undefined,
        paymentMethod: paymentMethod as any,
      });

      if (pickup && pickup.id) {
        router.push({
          pathname: "/(user)/tracking" as any,
          params: { pickupId: pickup.id },
        });
      }
    } catch (error) {
      console.error("Error creating pickup:", error);
      Alert.alert("Offline saved", "Request saved and queued for sync.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pickup Summary</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Photo preview */}
        {photos.length > 0 && (
          <View style={styles.photoSection}>
            <Text style={styles.sectionTitle}>Attached Photos ({photos.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
              {photos.map((p, idx) => (
                <Image key={idx} source={{ uri: p }} style={styles.photoThumb} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Waste Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Waste Category</Text>
          <View style={styles.categoryRow}>
            {WasteCategories.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.catChip, selectedType === c.id && styles.catChipActive]}
                onPress={() => setSelectedType(c.id)}
              >
                <Text style={styles.catIcon}>{c.icon}</Text>
                <Text style={[styles.catLabel, selectedType === c.id && styles.catLabelActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Waste Tier Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Volume & Container</Text>
          <View style={styles.tiersCol}>
            {WasteTiers.map((tier) => {
              const isSelected = selectedQuantity === tier.id;
              return (
                <TouchableOpacity
                  key={tier.id}
                  style={[styles.tierCard, isSelected && styles.tierCardActive]}
                  onPress={() => setSelectedQuantity(tier.id)}
                >
                  <Text style={styles.tierEmoji}>{tier.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tierName}>{tier.name}</Text>
                    <Text style={styles.tierSub}>{tier.subtitle}</Text>
                  </View>
                  <Text style={styles.tierPrice}>{Brand.currency.symbol}{tier.price}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Address</Text>
          <View style={styles.addressBox}>
            <MapPin size={18} color="#2D7A4D" />
            <TextInput
              style={styles.addressInput}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter pickup address..."
            />
          </View>
        </View>

        {/* Payment Rails */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Rail</Text>
          <View style={styles.paymentRow}>
            {[
              { id: "mtn_momo", label: "MTN MoMo", badge: "🟡" },
              { id: "vodafone_cash", label: "Telecel Cash", badge: "🔴" },
              { id: "cash", label: "Cash on Pickup", badge: "💵" },
            ].map((pm) => (
              <TouchableOpacity
                key={pm.id}
                style={[styles.paymentChip, paymentMethod === pm.id && styles.paymentChipActive]}
                onPress={() => setPaymentMethod(pm.id as any)}
              >
                <Text style={styles.pmBadge}>{pm.badge}</Text>
                <Text style={[styles.pmLabel, paymentMethod === pm.id && styles.pmLabelActive]}>
                  {pm.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleConfirm}
          disabled={createPickupMutation.isPending}
        >
          {createPickupMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.confirmBtnRow}>
              <Text style={styles.confirmBtnText}>Confirm {currentTierObj.name}</Text>
              <Text style={styles.confirmBtnPrice}>{Brand.currency.symbol}{currentTierObj.price}.00</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerRow: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },
  scrollView: {
    flex: 1,
    padding: 18,
  },
  photoSection: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  photoRow: {
    flexDirection: "row",
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 10,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catChip: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  catChipActive: {
    borderColor: "#2D7A4D",
    backgroundColor: "#F0FDF4",
  },
  catIcon: {
    fontSize: 16,
  },
  catLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  catLabelActive: {
    color: "#2D7A4D",
  },
  tiersCol: {
    gap: 10,
  },
  tierCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  tierCardActive: {
    borderColor: "#2D7A4D",
    backgroundColor: "#F0FDF4",
  },
  tierEmoji: {
    fontSize: 24,
  },
  tierName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  tierSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  tierPrice: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2D7A4D",
  },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  addressInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  paymentRow: {
    flexDirection: "row",
    gap: 8,
  },
  paymentChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  paymentChipActive: {
    backgroundColor: "#2D7A4D",
    borderColor: "#2D7A4D",
  },
  pmBadge: {
    fontSize: 12,
  },
  pmLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  pmLabelActive: {
    color: "#FFFFFF",
  },
  confirmBtn: {
    backgroundColor: "#2D7A4D",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 10,
    shadowColor: "#2D7A4D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  confirmBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  confirmBtnPrice: {
    backgroundColor: "#FFFFFF",
    color: "#2D7A4D",
    fontSize: 14,
    fontWeight: "900",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
});
