import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Location from "expo-location";
import {
  MapPin,
  RefreshCw,
  Menu,
  ChevronRight,
  Trash2,
  Calendar,
  Clock,
  CreditCard,
  User,
  Home,
  X,
  Camera,
  CheckCircle2,
  Phone,
  MessageSquare,
  Shield,
  Zap,
  Sparkles,
  ArrowRight,
  LogOut,
} from "lucide-react-native";

import Colors, { Brand, WasteTiers, WasteCategories, PresetLocations } from "@/constants/colors";
import UberMap from "@/components/UberMap";
import { clearSession, useSession } from "@/lib/session";
import { trpc } from "@/lib/trpc";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_DESKTOP = Platform.OS === "web" && SCREEN_WIDTH > 900;

export default function UserHomeScreen() {
  const { session } = useSession();
  const [activeTab, setActiveTab] = useState<"home" | "history" | "payment" | "account">("home");
  const [showPickupModal, setShowPickupModal] = useState<boolean>(false);
  const [showBinModal, setShowBinModal] = useState<boolean>(false);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [assignedCollector, setAssignedCollector] = useState<any>(null);

  const [location, setLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: 5.6120,
    longitude: -0.1780,
  });
  const [address, setAddress] = useState<string>("Grey Villa, 5th St, Accra");
  const [selectedTier, setSelectedTier] = useState<string>("small");
  const [selectedCategory, setSelectedCategory] = useState<string>("mixed");
  const [photos, setPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500",
  ]);
  const [paymentMethod, setPaymentMethod] = useState<string>("mtn_momo");
  const [promoCode, setPromoCode] = useState<string>("FREEDOM69");

  const logoutMutation = trpc.auth.logout.useMutation();
  const createPickupMutation = trpc.pickups.create.useMutation();

  const userName = session?.user?.name || "Edgar Ghansah";

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
            const place = `${geocode[0].name || geocode[0].street || "Grey Villa"}, ${geocode[0].city || "Accra"}`.trim();
            if (place) setAddress(place);
          }
        }
      } catch (e) {}
    })();
  }, []);

  const currentTierObj = useMemo(
    () => WasteTiers.find((t) => t.id === selectedTier) || WasteTiers[0],
    [selectedTier],
  );

  const calculatedPrice = useMemo(() => {
    let base = currentTierObj.price;
    if (promoCode === "FREEDOM69") {
      base = Math.round(base * 0.5);
    }
    return base;
  }, [currentTierObj, promoCode]);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Log out of BorlaWura?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await logoutMutation.mutateAsync();
          } catch {}
          await clearSession();
          router.replace("/(auth)/login" as any);
        },
      },
    ]);
  };

  const handleRequestPickup = async () => {
    setIsMatching(true);
    try {
      await createPickupMutation.mutateAsync({
        photos,
        trashType: selectedCategory as any,
        quantity: (selectedTier === "sos" ? "bin" : selectedTier) as any,
        location,
        address,
        paymentMethod: paymentMethod as any,
      });

      setTimeout(() => {
        setIsMatching(false);
        setShowPickupModal(false);
        setAssignedCollector({
          name: "Kwame Mensah",
          role: "Verified Collector",
          phone: "+233 24 555 0192",
          vehicle: "Heavy Tipper Tricycle",
          plate: "GW-4821-24",
          eta: "3 mins",
          rating: "5.0 ★",
          photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
        });
      }, 2000);
    } catch (err: any) {
      setIsMatching(false);
      setShowPickupModal(false);
      setAssignedCollector({
        name: "Kwame Mensah",
        role: "Verified Collector",
        phone: "+233 24 555 0192",
        vehicle: "BorlaWura Collection Truck",
        plate: "GW-4821-24",
        eta: "3 mins",
        rating: "5.0 ★",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      });
    }
  };

  return (
    <View style={styles.rootContainer}>
      <View style={[styles.mainLayout, IS_DESKTOP && styles.desktopCenterWrap]}>
        <View style={[styles.appFrame, IS_DESKTOP && styles.appFrameDesktop]}>
          {/* Top Status & Greeting Area */}
          <SafeAreaView style={styles.topHeaderArea} edges={["top"]}>
            <View style={styles.headerRow}>
              <View style={styles.greetingBlock}>
                <Text style={styles.greetingText}>Good morning, {userName}</Text>
                <TouchableOpacity
                  style={styles.locationSubRow}
                  onPress={() => setAddress("Grey Villa, 5th St, Accra")}
                >
                  <MapPin size={14} color="#2D7A4D" />
                  <Text style={styles.locationSubText} numberOfLines={1}>{address}</Text>
                  <RefreshCw size={12} color="#64748B" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.menuCircleBtn} onPress={handleSignOut} activeOpacity={0.8}>
                <Menu size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Interactive Map Area with Floating Collector Pill */}
          <View style={styles.mapArea}>
            <UberMap
              userLocation={location}
              style={{ width: "100%", height: "100%" }}
              showRadar={true}
            />

            {/* Floating "Connecting a Collector" Banner */}
            <TouchableOpacity
              style={styles.floatingCollectorCard}
              onPress={() => setShowPickupModal(true)}
              activeOpacity={0.9}
            >
              <View style={styles.collectorTruckCircle}>
                <Text style={{ fontSize: 18 }}>🚛</Text>
              </View>
              <View style={styles.collectorInfo}>
                <Text style={styles.collectorTitle}>
                  {assignedCollector ? `${assignedCollector.name} Assigned` : "Finding Nearby Collector"}
                </Text>
                <Text style={styles.collectorSub}>
                  {assignedCollector ? `Arriving in ${assignedCollector.eta} • ${assignedCollector.plate}` : "Tema West Municipal, Greater Accra"}
                </Text>
              </View>
              <ChevronRight size={18} color="#2D7A4D" />
            </TouchableOpacity>
          </View>

          {/* Bottom Action Sheet */}
          <ScrollView style={styles.bottomSheet} showsVerticalScrollIndicator={false}>
            <View style={styles.dragHandle} />

            {/* 1. Instant Pickup Main Pill */}
            <TouchableOpacity
              style={styles.instantPickupBanner}
              onPress={() => setShowPickupModal(true)}
              activeOpacity={0.88}
            >
              <View style={styles.instantPickupLeft}>
                <View style={styles.instantPickupPin}>
                  <MapPin size={18} color="#2D7A4D" fill="#2D7A4D" />
                </View>
                <View>
                  <Text style={styles.instantPickupTitle}>Instant Waste Pickup</Text>
                  <Text style={styles.instantPickupSub}>Tap to request doorstep collection</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#2D7A4D" />
            </TouchableOpacity>

            {/* 2. Grid Cards: Request Bin & Schedule Pickup */}
            <View style={styles.gridCardsRow}>
              {/* Request Bin */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setShowBinModal(true)}
                activeOpacity={0.88}
              >
                <View style={styles.actionCardHeader}>
                  <View style={styles.greenIconCircle}>
                    <Trash2 size={20} color="#2D7A4D" />
                  </View>
                  <ChevronRight size={16} color="#94A3B8" />
                </View>
                <Text style={styles.actionCardTitle}>Request Bin</Text>
                <Text style={styles.actionCardSub}>Get a new refuse bin delivered today</Text>
              </TouchableOpacity>

              {/* Schedule Pickup */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setShowScheduleModal(true)}
                activeOpacity={0.88}
              >
                <View style={styles.actionCardHeader}>
                  <View style={styles.greenIconCircle}>
                    <Calendar size={20} color="#2D7A4D" />
                  </View>
                  <ChevronRight size={16} color="#94A3B8" />
                </View>
                <Text style={styles.actionCardTitle}>Schedule Pickup</Text>
                <Text style={styles.actionCardSub}>Set up weekly routine collections</Text>
              </TouchableOpacity>
            </View>

            {/* 3. Promo Banner: FREEDOM69 */}
            <TouchableOpacity
              style={styles.heritagePromoCard}
              onPress={() => {
                setPromoCode("FREEDOM69");
                setShowPickupModal(true);
              }}
              activeOpacity={0.92}
            >
              <View style={styles.promoContentLeft}>
                <View style={styles.promoBadge}>
                  <Text style={styles.promoBadgeText}>FREEDOM69 🔥</Text>
                </View>
                <Text style={styles.promoHeadline}>Enjoy 50% off every pickup this month</Text>
                <Text style={styles.promoCodeTag}>Save 50% • Code: FREEDOM69</Text>
              </View>

              <View style={styles.promoAvatarGraphic}>
                <Image
                  source={require("@/assets/images/borlawura_logo.png")}
                  style={{ width: 44, height: 44 }}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>

            <View style={{ height: 16 }} />
          </ScrollView>

          {/* Bottom Navigation Bar */}
          <View style={styles.bottomTabBar}>
            {/* Home */}
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab("home")}
            >
              <Home size={22} color={activeTab === "home" ? "#2D7A4D" : "#94A3B8"} />
              <Text style={[styles.tabLabel, activeTab === "home" && styles.tabLabelActive]}>
                Home
              </Text>
            </TouchableOpacity>

            {/* History */}
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => {
                setActiveTab("history");
                Alert.alert("Pickup History", "You have completed 4 pickups this month with verified collectors.");
              }}
            >
              <Clock size={22} color={activeTab === "history" ? "#2D7A4D" : "#94A3B8"} />
              <Text style={[styles.tabLabel, activeTab === "history" && styles.tabLabelActive]}>
                History
              </Text>
            </TouchableOpacity>

            {/* Center Floating Action Button */}
            <TouchableOpacity
              style={styles.centerFabButton}
              onPress={() => setShowPickupModal(true)}
              activeOpacity={0.88}
            >
              <Image
                source={require("@/assets/images/borlawura_logo.png")}
                style={{ width: 34, height: 34 }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Payment */}
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => {
                setActiveTab("payment");
                Alert.alert("Payment Rails", "Active Method: MTN Mobile Money (MoMo).");
              }}
            >
              <CreditCard size={22} color={activeTab === "payment" ? "#2D7A4D" : "#94A3B8"} />
              <Text style={[styles.tabLabel, activeTab === "payment" && styles.tabLabelActive]}>
                Payment
              </Text>
            </TouchableOpacity>

            {/* Account */}
            <TouchableOpacity
              style={styles.tabItem}
              onPress={handleSignOut}
            >
              <User size={22} color={activeTab === "account" ? "#2D7A4D" : "#94A3B8"} />
              <Text style={[styles.tabLabel, activeTab === "account" && styles.tabLabelActive]}>
                Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* =========================================================================
          INSTANT PICKUP MODAL
         ========================================================================= */}
      <Modal visible={showPickupModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Request Waste Pickup</Text>
                <Text style={styles.modalSubtitle}>Dispatch a verified collector to {address}</Text>
              </View>
              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowPickupModal(false)}>
                <X size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Waste Tiers */}
              <Text style={styles.modalSectionLabel}>Select Quantity / Container Type</Text>
              <View style={styles.modalTiersRow}>
                {WasteTiers.map((t) => {
                  const isSelected = selectedTier === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.modalTierCard, isSelected && styles.modalTierCardActive]}
                      onPress={() => setSelectedTier(t.id)}
                    >
                      <Text style={styles.modalTierIcon}>{t.icon}</Text>
                      <Text style={[styles.modalTierName, isSelected && { color: "#2D7A4D" }]}>{t.name}</Text>
                      <Text style={styles.modalTierEta}>{t.etaMinutes} min</Text>
                      <Text style={styles.modalTierPrice}>{Brand.currency.symbol}{t.price}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Waste Category */}
              <Text style={styles.modalSectionLabel}>Waste Category</Text>
              <View style={styles.modalCatRow}>
                {WasteCategories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.modalCatChip, selectedCategory === c.id && styles.modalCatChipActive]}
                    onPress={() => setSelectedCategory(c.id)}
                  >
                    <Text style={styles.modalCatText}>{c.icon} {c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Promo code applied */}
              {promoCode === "FREEDOM69" && (
                <View style={styles.appliedPromoPill}>
                  <Text style={styles.appliedPromoText}>🔥 Promo FREEDOM69 Applied • 50% Off</Text>
                </View>
              )}

              {/* Dispatch Button */}
              <TouchableOpacity
                style={[styles.dispatchPickupBtn, isMatching && { opacity: 0.6 }]}
                onPress={handleRequestPickup}
                disabled={isMatching}
              >
                {isMatching ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <View style={styles.dispatchBtnContent}>
                    <Text style={styles.dispatchBtnTitle}>Confirm & Request Collector</Text>
                    <Text style={styles.dispatchBtnPrice}>{Brand.currency.symbol}{calculatedPrice}.00</Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* =========================================================================
          REQUEST BIN MODAL
         ========================================================================= */}
      <Modal visible={showBinModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Request a Refuse Bin</Text>
                <Text style={styles.modalSubtitle}>Delivered right to your doorstep in Accra</Text>
              </View>
              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowBinModal(false)}>
                <X size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <View style={styles.binOptionCard}>
              <Text style={{ fontSize: 32 }}>🗑️</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>Standard 240L Heavy Bin</Text>
                <Text style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>Heavy duty wheels with secure odor lid</Text>
                <Text style={{ fontSize: 16, fontWeight: "900", color: "#2D7A4D", marginTop: 4 }}>₵180.00 (One-time)</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.dispatchPickupBtn}
              onPress={() => {
                setShowBinModal(false);
                Alert.alert("Bin Order Received", "Your 240L Refuse Bin will be delivered by the BorlaWura team today.");
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800", textAlign: "center" }}>
                Confirm Bin Order (₵180)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* =========================================================================
          SCHEDULE PICKUP MODAL
         ========================================================================= */}
      <Modal visible={showScheduleModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Schedule Routine Pickup</Text>
                <Text style={styles.modalSubtitle}>Never worry about trash overflow again</Text>
              </View>
              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowScheduleModal(false)}>
                <X size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <View style={styles.binOptionCard}>
              <Text style={{ fontSize: 32 }}>📅</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>Weekly Routine Plan</Text>
                <Text style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>Pickups every Tuesday & Friday morning</Text>
                <Text style={{ fontSize: 16, fontWeight: "900", color: "#2D7A4D", marginTop: 4 }}>₵120.00 / month</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.dispatchPickupBtn}
              onPress={() => {
                setShowScheduleModal(false);
                Alert.alert("Subscription Active", "Weekly recurring pickups registered. Your next collection is Tuesday 7:00 AM.");
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800", textAlign: "center" }}>
                Activate Routine Schedule
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  mainLayout: {
    flex: 1,
  },
  desktopCenterWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  appFrame: {
    flex: 1,
    width: "100%",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  appFrameDesktop: {
    maxWidth: 430,
    maxHeight: 900,
    borderRadius: 44,
    borderWidth: 8,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
  },
  topHeaderArea: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    zIndex: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingBlock: {
    flex: 1,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  locationSubRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  locationSubText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
    marginLeft: 4,
  },
  menuCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  mapArea: {
    height: 220,
    position: "relative",
    backgroundColor: "#E2E8F0",
  },
  floatingCollectorCard: {
    position: "absolute",
    bottom: 14,
    left: 18,
    right: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  collectorTruckCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2D7A4D",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  collectorInfo: {
    flex: 1,
  },
  collectorTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  collectorSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -16,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
    marginBottom: 14,
  },
  instantPickupBanner: {
    backgroundColor: "#F0FDF4",
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    marginBottom: 14,
  },
  instantPickupLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  instantPickupPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  instantPickupTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  instantPickupSub: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 2,
  },
  gridCardsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  greenIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
  },
  actionCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  actionCardSub: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 16,
  },
  heritagePromoCard: {
    backgroundColor: "#2D7A4D",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  promoContentLeft: {
    flex: 1,
    paddingRight: 12,
  },
  promoBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  promoBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  promoHeadline: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18,
  },
  promoCodeTag: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
  },
  promoAvatarGraphic: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomTabBar: {
    height: 72,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 3,
  },
  tabLabelActive: {
    color: "#2D7A4D",
    fontWeight: "800",
  },
  centerFabButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#2D7A4D",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -28,
    shadowColor: "#2D7A4D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  closeModalBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 8,
  },
  modalTiersRow: {
    flexDirection: "row",
    gap: 8,
  },
  modalTierCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  modalTierCardActive: {
    borderColor: "#2D7A4D",
    backgroundColor: "#F0FDF4",
  },
  modalTierIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  modalTierName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalTierEta: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
  },
  modalTierPrice: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 4,
  },
  modalCatRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modalCatChip: {
    backgroundColor: "#F8FAFC",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalCatChipActive: {
    borderColor: "#2D7A4D",
    backgroundColor: "#F0FDF4",
  },
  modalCatText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  appliedPromoPill: {
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
    alignItems: "center",
  },
  appliedPromoText: {
    color: "#2D7A4D",
    fontSize: 12,
    fontWeight: "800",
  },
  dispatchPickupBtn: {
    backgroundColor: "#2D7A4D",
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 18,
    alignItems: "center",
    shadowColor: "#2D7A4D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
  },
  dispatchBtnContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  dispatchBtnTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  dispatchBtnPrice: {
    backgroundColor: "#FFFFFF",
    color: "#2D7A4D",
    fontSize: 15,
    fontWeight: "900",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  binOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginVertical: 14,
  },
});
