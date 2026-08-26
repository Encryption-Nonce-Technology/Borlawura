import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Power,
  Wallet,
  MapPin,
  TrendingUp,
  Clock,
  Shield,
  Navigation,
  LogOut,
  Sparkles,
  ChevronRight,
  Flame,
  CheckCircle,
} from "lucide-react-native";

import Colors, { Brand } from "@/constants/colors";
import UberMap from "@/components/UberMap";
import { clearSession, useSession } from "@/lib/session";
import { trpc } from "@/lib/trpc";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_DESKTOP = Platform.OS === "web" && SCREEN_WIDTH > 768;

export default function CollectorHomeScreen() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [incomingOffer, setIncomingOffer] = useState<any>(null);
  const [offerTimer, setOfferTimer] = useState<number>(15);
  const { session } = useSession();

  const myCollectorId = session ? `c_${session.user.id}` : "c_kwame";
  const myJobsQuery = trpc.pickups.getCollectorPickups.useQuery(
    { collectorId: myCollectorId },
    { enabled: !!myCollectorId, refetchInterval: isOnline ? 4000 : 0 },
  );
  const requestsQuery = trpc.pickups.getActiveRequests.useQuery(undefined, {
    refetchInterval: isOnline ? 3000 : 0,
  });
  const acceptPickupMutation = trpc.pickups.acceptPickup.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();

  // Simulate an incoming Uber Driver offer after 3 seconds when online
  useEffect(() => {
    if (isOnline && !incomingOffer) {
      const timer = setTimeout(() => {
        setIncomingOffer({
          id: "req_demo_89",
          tier: "Borla Sack",
          category: "Mixed Trash 🗑️",
          address: "Lagos Ave, East Legon, Accra",
          distance: "1.4 km",
          payout: 35,
          customerName: "Ama Serwaa",
          customerRating: "⭐ 4.9",
          photos: ["https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500"],
        });
        setOfferTimer(15);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, incomingOffer]);

  // Countdown timer for incoming offer
  useEffect(() => {
    if (incomingOffer && offerTimer > 0) {
      const interval = setInterval(() => setOfferTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (incomingOffer && offerTimer === 0) {
      setIncomingOffer(null);
    }
  }, [incomingOffer, offerTimer]);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Log out of Borlawura Collector Driver App?", [
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

  const handleAcceptOffer = async () => {
    try {
      if (incomingOffer?.id) {
        await acceptPickupMutation.mutateAsync({
          pickupId: incomingOffer.id,
          collectorId: myCollectorId,
        });
      }
    } catch {}
    setIncomingOffer(null);
    router.push("/(collector)/active-pickup" as any);
  };

  const activeRequests = requestsQuery.data || [];

  return (
    <View style={styles.root}>
      {/* Top Driver Bar */}
      <View style={styles.driverTopNav}>
        <View style={styles.driverProfile}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" }}
            style={styles.driverAvatar}
          />
          <View>
            <Text style={styles.driverName}>{session?.user?.name || "Kwame Mensah"}</Text>
            <Text style={styles.driverRating}>⭐ 4.94 Partner • Tricycle #GW-4821-24</Text>
          </View>
        </View>

        {/* Daily Earnings Pill */}
        <TouchableOpacity
          style={styles.earningsPill}
          onPress={() => router.push("/(collector)/wallet" as any)}
          activeOpacity={0.8}
        >
          <Wallet size={16} color="#10B981" />
          <View>
            <Text style={styles.earningsLabel}>TODAY</Text>
            <Text style={styles.earningsValue}>{Brand.currency.symbol}340.00</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <LogOut size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Main Body */}
      <View style={[styles.mainLayout, IS_DESKTOP ? styles.desktopRow : styles.mobileCol]}>
        {/* Left Side: Driver Controls & Job Feed */}
        <View style={[styles.driverSidebar, IS_DESKTOP ? styles.sidebarDesktop : styles.sheetMobile]}>
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* 1. Large Online/Offline Circular Toggle */}
            <View style={styles.toggleCard}>
              <TouchableOpacity
                style={[styles.powerRing, isOnline ? styles.powerRingOnline : styles.powerRingOffline]}
                onPress={() => setIsOnline(!isOnline)}
                activeOpacity={0.85}
              >
                <Power size={36} color={isOnline ? "#000000" : "#94A3B8"} />
                <Text style={[styles.powerRingText, isOnline ? { color: "#000000" } : { color: "#94A3B8" }]}>
                  {isOnline ? "ONLINE" : "OFFLINE"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.onlineStatusSub}>
                {isOnline
                  ? "🟢 You are live on the radar. Ready for dispatch."
                  : "⚪ You are offline. Tap ring to start earning."}
              </Text>
            </View>

            {/* 2. Surge / High Demand Heatmap Alert */}
            {isOnline && (
              <View style={styles.surgeBanner}>
                <Flame size={20} color="#F59E0B" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.surgeTitle}>Surge Demand in East Legon (+₵15)</Text>
                  <Text style={styles.surgeSub}>14 households requested pickups in your 3km radius</Text>
                </View>
              </View>
            )}

            {/* 3. Incoming Offer Modal Card (Uber Driver Style) */}
            {incomingOffer && (
              <View style={styles.incomingOfferCard}>
                <View style={styles.offerHeader}>
                  <View style={styles.timerCircle}>
                    <Text style={styles.timerText}>{offerTimer}s</Text>
                  </View>
                  <View>
                    <Text style={styles.incomingOfferTitle}>NEW PICKUP OFFER</Text>
                    <Text style={styles.incomingOfferSub}>{incomingOffer.distance} away</Text>
                  </View>
                  <Text style={styles.offerPayoutText}>{Brand.currency.symbol}{incomingOffer.payout}</Text>
                </View>

                <View style={styles.offerDetailsRow}>
                  <MapPin size={16} color="#10B981" />
                  <Text style={styles.offerAddress}>{incomingOffer.address}</Text>
                </View>

                <View style={styles.offerTierBadge}>
                  <Text style={styles.offerTierText}>{incomingOffer.tier} • {incomingOffer.category}</Text>
                </View>

                <TouchableOpacity style={styles.acceptJobBtn} onPress={handleAcceptOffer} activeOpacity={0.88}>
                  <Text style={styles.acceptJobBtnText}>ACCEPT JOB ({offerTimer}s)</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 4. Active Job Shortcut */}
            {myJobsQuery.data && myJobsQuery.data.length > 0 && (
              <TouchableOpacity
                style={styles.activeJobCard}
                onPress={() => router.push("/(collector)/active-pickup" as any)}
              >
                <Navigation size={20} color="#10B981" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.activeJobTitle}>Active Pickup In Progress</Text>
                  <Text style={styles.activeJobSub}>Tap to open turn-by-turn navigation</Text>
                </View>
                <ChevronRight size={20} color="#10B981" />
              </TouchableOpacity>
            )}

            {/* 5. Live Feed of Requests */}
            <Text style={styles.sectionTitle}>Available Nearby Pickups ({activeRequests.length})</Text>
            {activeRequests.length === 0 ? (
              <View style={styles.emptyCard}>
                <Clock size={28} color="#94A3B8" />
                <Text style={styles.emptyTitle}>Scanning Accra for pickup requests...</Text>
                <Text style={styles.emptySub}>Stay online to receive instant sound alerts.</Text>
              </View>
            ) : (
              activeRequests.map((req) => (
                <TouchableOpacity
                  key={req.id}
                  style={styles.reqCard}
                  onPress={() =>
                    router.push({
                      pathname: "/(collector)/request-details" as any,
                      params: { requestId: req.id },
                    })
                  }
                >
                  <View style={styles.reqCardTop}>
                    <Text style={styles.reqTier}>{req.quantity.toUpperCase()} PICKUP</Text>
                    <Text style={styles.reqPrice}>{Brand.currency.symbol}{req.price}</Text>
                  </View>
                  <Text style={styles.reqAddr} numberOfLines={1}>📍 {req.address}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Right Side: Map Canvas */}
        <View style={styles.mapCanvas}>
          <UberMap
            userLocation={{ latitude: 5.6037, longitude: -0.1870 }}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#090A0C",
  },
  driverTopNav: {
    height: 70,
    backgroundColor: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  driverProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  driverName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  driverRating: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  earningsPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  earningsLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  earningsValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#10B981",
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },
  mainLayout: {
    flex: 1,
  },
  desktopRow: {
    flexDirection: "row",
  },
  mobileCol: {
    flexDirection: "column-reverse",
  },
  driverSidebar: {
    backgroundColor: "#0F172A",
    zIndex: 20,
  },
  sidebarDesktop: {
    width: 440,
    height: "100%",
    borderRightWidth: 1,
    borderRightColor: "#1E293B",
  },
  sheetMobile: {
    width: "100%",
    maxHeight: "55%",
  },
  scrollArea: {
    padding: 20,
  },
  toggleCard: {
    alignItems: "center",
    backgroundColor: "#18191E",
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#27272A",
    marginBottom: 16,
  },
  powerRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  powerRingOnline: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
  },
  powerRingOffline: {
    backgroundColor: "#27272A",
    shadowColor: "#000000",
  },
  powerRingText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 4,
  },
  onlineStatusSub: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 14,
    textAlign: "center",
  },
  surgeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.4)",
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginBottom: 16,
  },
  surgeTitle: {
    color: "#F59E0B",
    fontSize: 14,
    fontWeight: "800",
  },
  surgeSub: {
    color: "#CBD5E1",
    fontSize: 12,
    marginTop: 2,
  },
  incomingOfferCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  offerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "900",
  },
  incomingOfferTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: 0.5,
  },
  incomingOfferSub: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  offerPayoutText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#10B981",
  },
  offerDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  offerAddress: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  offerTierBadge: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  offerTierText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  acceptJobBtn: {
    backgroundColor: "#000000",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 14,
  },
  acceptJobBtnText: {
    color: "#10B981",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  activeJobCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18191E",
    borderWidth: 1,
    borderColor: "#10B981",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  activeJobTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  activeJobSub: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 12,
    marginTop: 6,
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#18191E",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10,
  },
  emptySub: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  reqCard: {
    backgroundColor: "#18191E",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  reqCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reqTier: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "800",
  },
  reqPrice: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  reqAddr: {
    color: "#CBD5E1",
    fontSize: 13,
    marginTop: 4,
  },
  mapCanvas: {
    flex: 1,
    height: "100%",
    minHeight: 400,
  },
});
