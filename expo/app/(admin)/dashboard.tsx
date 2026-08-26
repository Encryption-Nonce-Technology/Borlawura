import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Shield,
  Activity,
  Truck,
  Users,
  DollarSign,
  MapPin,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  LogOut,
  Sliders,
  ChevronRight,
  Trash2,
  FileText,
  BarChart3,
  TrendingUp,
} from "lucide-react-native";

import Colors, { Brand, WasteTiers } from "@/constants/colors";
import UberMap from "@/components/UberMap";
import { clearSession, useSession } from "@/lib/session";
import { trpc } from "@/lib/trpc";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_DESKTOP = Platform.OS === "web" && SCREEN_WIDTH > 900;

export default function AdminCommandCenter() {
  const { session } = useSession();
  const [activeTab, setActiveTab] = useState<"radar" | "requests" | "fleet" | "finance">("radar");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const logoutMutation = trpc.auth.logout.useMutation();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Leave Operations Control Center?", [
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

  // Mock live data for the command center
  const liveFleet = [
    { id: "c1", name: "Kwame Mensah", vehicle: "Piaggio Ape Tricycle", plate: "GW-4821-24", status: "online", trips: 482, rating: "5.0 ★", zone: "East Legon", balance: 340 },
    { id: "c2", name: "Kofi Owusu", vehicle: "5-Ton Compactor Truck", plate: "GN-9102-23", status: "busy", trips: 620, rating: "4.9 ★", zone: "Spintex Rd", balance: 520 },
    { id: "c3", name: "Emmanuel Tetteh", vehicle: "Borla Tipper Trike", plate: "GT-3310-24", status: "online", trips: 310, rating: "4.9 ★", zone: "Tema West", balance: 280 },
    { id: "c4", name: "Ibrahim Adams", vehicle: "Flatbed Waste Van", plate: "GE-7741-22", status: "offline", trips: 195, rating: "4.8 ★", zone: "Airport City", balance: 140 },
  ];

  const recentPickups = [
    { id: "p1", customer: "Edgar Ghansah", addr: "Grey Villa, 5th St", tier: "Borla Bag", price: 15, time: "2 min ago", status: "searching" },
    { id: "p2", customer: "Ama Serwaa", addr: "Lagos Ave, East Legon", tier: "Wheelie Bin", price: 65, time: "8 min ago", status: "assigned", collector: "Kwame M." },
    { id: "p3", customer: "Kojo Mensah", addr: "Mango St, Spintex", tier: "Borla Sack", price: 35, time: "18 min ago", status: "collected", collector: "Kofi O." },
  ];

  return (
    <View style={styles.adminRoot}>
      {/* 1. TOP OPERATIONS COMMAND HEADER */}
      <View style={styles.topCommandBar}>
        <View style={styles.commandLeft}>
          <TouchableOpacity style={styles.brandRow} onPress={() => router.push("/" as any)}>
            <Image
              source={require("@/assets/images/borlawura_logo.png")}
              style={styles.adminLogoImg}
              resizeMode="contain"
            />
            <View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.adminBrandBorla}>Borla</Text>
                <Text style={styles.adminBrandWura}>Wura</Text>
                <View style={styles.adminBadgePill}>
                  <Text style={styles.adminBadgeText}>CONTROL TOWER</Text>
                </View>
              </View>
              <Text style={styles.adminSubSlogan}>Greater Accra Waste Logistics</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.commandRight}>
          <View style={styles.systemStatusPill}>
            <View style={styles.greenRadarPulse} />
            <Text style={styles.systemStatusText}>18 FLEET TRUCKS ACTIVE</Text>
          </View>

          <TouchableOpacity style={styles.quickHomeBtn} onPress={() => router.push("/(user)/home" as any)}>
            <Text style={styles.quickHomeBtnText}>User App View</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.adminLogoutBtn} onPress={handleSignOut}>
            <LogOut size={16} color="#EF4444" />
            <Text style={styles.adminLogoutText}>Exit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.adminScrollView} showsVerticalScrollIndicator={false}>
        {/* 2. STAT KPI CARDS ROW */}
        <View style={[styles.kpiRow, IS_DESKTOP && styles.kpiRowDesktop]}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Today's Volume</Text>
              <Activity size={18} color="#10B981" />
            </View>
            <Text style={styles.kpiValue}>142 Pickups</Text>
            <Text style={styles.kpiTrend}>+18.4% vs yesterday</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Platform Revenue</Text>
              <DollarSign size={18} color="#F5B025" />
            </View>
            <Text style={styles.kpiValue}>₵4,860.00</Text>
            <Text style={styles.kpiTrend}>MTN MoMo & Telecel</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Online Collectors</Text>
              <Truck size={18} color="#10B981" />
            </View>
            <Text style={styles.kpiValue}>18 Active</Text>
            <Text style={styles.kpiTrend}>4 on active trips</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Recycled Mass</Text>
              <TrendingUp size={18} color="#0284C7" />
            </View>
            <Text style={styles.kpiValue}>6.4 Tons</Text>
            <Text style={styles.kpiTrend}>Sorted & Diverted</Text>
          </View>
        </View>

        {/* 3. MAIN SPLIT: RADAR MAP + LIVE DISPATCH FEED */}
        <View style={[styles.mainCommandSplit, IS_DESKTOP && styles.mainSplitDesktop]}>
          {/* Left Column: Live Requests Feed */}
          <View style={styles.dispatchFeedCol}>
            <View style={styles.feedHeader}>
              <View>
                <Text style={styles.feedTitle}>Live Dispatch Stream</Text>
                <Text style={styles.feedSub}>Real-time requests awaiting collector pickup</Text>
              </View>
              <TouchableOpacity style={styles.refreshBtn}>
                <RefreshCw size={14} color="#10B981" />
              </TouchableOpacity>
            </View>

            <View style={styles.requestCardsList}>
              {recentPickups.map((req) => (
                <View key={req.id} style={styles.pickupReqCard}>
                  <View style={styles.reqCardTop}>
                    <View style={styles.reqCustomerWrap}>
                      <Text style={styles.reqCustomerName}>{req.customer}</Text>
                      <Text style={styles.reqTime}>{req.time}</Text>
                    </View>
                    <View
                      style={[
                        styles.reqStatusBadge,
                        req.status === "searching" && styles.reqStatusSearching,
                        req.status === "assigned" && styles.reqStatusAssigned,
                        req.status === "collected" && styles.reqStatusCollected,
                      ]}
                    >
                      <Text style={styles.reqStatusText}>{req.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.reqCardDetails}>
                    <View style={styles.reqRow}>
                      <MapPin size={13} color="#94A3B8" />
                      <Text style={styles.reqAddr}>{req.addr}</Text>
                    </View>
                    <View style={styles.reqRow}>
                      <Trash2 size={13} color="#94A3B8" />
                      <Text style={styles.reqTierText}>{req.tier} • ₵{req.price}.00</Text>
                    </View>
                  </View>

                  <View style={styles.reqCardFooter}>
                    <Text style={styles.reqCollectorName}>
                      {req.collector ? `Assigned to ${req.collector}` : "Scanning nearby tricycles..."}
                    </Text>
                    {req.status === "searching" && (
                      <TouchableOpacity
                        style={styles.manualAssignBtn}
                        onPress={() => Alert.alert("Manual Dispatch", `Dispatched ${req.customer}'s order to Kwame Mensah.`)}
                      >
                        <Text style={styles.manualAssignText}>Force Assign →</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Right Column: Live City Fleet Radar Map */}
          <View style={styles.radarMapCol}>
            <View style={styles.radarHeader}>
              <View>
                <Text style={styles.radarTitle}>Accra Fleet Radar</Text>
                <Text style={styles.radarSub}>Live GPS vector telemetry for all roaming trucks</Text>
              </View>
              <View style={styles.radarControls}>
                <View style={styles.sectorPill}>
                  <Text style={styles.sectorPillText}>Zone: Greater Accra</Text>
                </View>
              </View>
            </View>

            <View style={styles.adminMapContainer}>
              <UberMap userLocation={{ latitude: 5.6037, longitude: -0.1870 }} />
            </View>
          </View>
        </View>

        {/* 4. COLLECTOR FLEET REGISTRY TABLE */}
        <View style={styles.fleetSection}>
          <View style={styles.fleetSectionHeader}>
            <View>
              <Text style={styles.fleetSectionTitle}>Collector Fleet Registry</Text>
              <Text style={styles.fleetSectionSub}>Registered tricycle & truck partners in operation</Text>
            </View>
            <View style={styles.searchBarBox}>
              <Search size={14} color="#64748B" />
              <TextInput
                style={styles.searchBarInput}
                placeholder="Search collector by name or plate..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={styles.fleetTableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.thCell, { flex: 1.5 }]}>COLLECTOR</Text>
              <Text style={[styles.thCell, { flex: 1.5 }]}>VEHICLE & PLATE</Text>
              <Text style={[styles.thCell, { flex: 1 }]}>ZONE</Text>
              <Text style={[styles.thCell, { flex: 1 }]}>STATUS</Text>
              <Text style={[styles.thCell, { flex: 1 }]}>TRIPS / RATING</Text>
              <Text style={[styles.thCell, { flex: 1, textAlign: "right" }]}>EARNINGS</Text>
            </View>

            {/* Table Rows */}
            {liveFleet.map((c) => (
              <View key={c.id} style={styles.tableRow}>
                <View style={[styles.tdCell, { flex: 1.5, flexDirection: "row", alignItems: "center", gap: 10 }]}>
                  <View style={styles.collectorAvatarCircle}>
                    <Text style={styles.collectorInitial}>{c.name[0]}</Text>
                  </View>
                  <Text style={styles.collectorNameText}>{c.name}</Text>
                </View>

                <View style={[styles.tdCell, { flex: 1.5 }]}>
                  <Text style={styles.vehicleText}>{c.vehicle}</Text>
                  <Text style={styles.plateText}>{c.plate}</Text>
                </View>

                <View style={[styles.tdCell, { flex: 1 }]}>
                  <Text style={styles.zoneText}>{c.zone}</Text>
                </View>

                <View style={[styles.tdCell, { flex: 1 }]}>
                  <View
                    style={[
                      styles.statusPill,
                      c.status === "online" && styles.statusOnline,
                      c.status === "busy" && styles.statusBusy,
                      c.status === "offline" && styles.statusOffline,
                    ]}
                  >
                    <Text style={styles.statusPillText}>{c.status.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={[styles.tdCell, { flex: 1 }]}>
                  <Text style={styles.tripsText}>{c.trips} trips</Text>
                  <Text style={styles.ratingText}>{c.rating}</Text>
                </View>

                <View style={[styles.tdCell, { flex: 1, alignItems: "flex-end" }]}>
                  <Text style={styles.earningsAmount}>₵{c.balance}.00</Text>
                  <TouchableOpacity
                    onPress={() => Alert.alert("MoMo Payout", `Approved instant MoMo transfer of ₵${c.balance}.00 to ${c.name}.`)}
                  >
                    <Text style={styles.payoutActionText}>Pay MoMo →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  adminRoot: {
    flex: 1,
    backgroundColor: "#080E0A",
  },
  topCommandBar: {
    height: 72,
    backgroundColor: "#0E1812",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#1B2C21",
    zIndex: 50,
  },
  commandLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  adminLogoImg: {
    width: 38,
    height: 38,
  },
  adminBrandBorla: {
    fontSize: 20,
    fontWeight: "900",
    color: "#2D7A4D",
  },
  adminBrandWura: {
    fontSize: 20,
    fontWeight: "900",
    color: "#F5B025",
  },
  adminBadgePill: {
    backgroundColor: "#1B3B28",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#10B981",
    letterSpacing: 0.8,
  },
  adminSubSlogan: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 1,
  },
  commandRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  systemStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  greenRadarPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  systemStatusText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#10B981",
    letterSpacing: 0.6,
  },
  quickHomeBtn: {
    backgroundColor: "#1B2C21",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2D4736",
  },
  quickHomeBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
  },
  adminLogoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  adminLogoutText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#EF4444",
  },
  adminScrollView: {
    flex: 1,
    padding: 24,
  },
  kpiRow: {
    gap: 16,
    marginBottom: 24,
  },
  kpiRowDesktop: {
    flexDirection: "row",
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#0F1A13",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E3326",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  kpiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  kpiTrend: {
    fontSize: 11,
    color: "#10B981",
    marginTop: 4,
    fontWeight: "600",
  },
  mainCommandSplit: {
    gap: 20,
    marginBottom: 24,
  },
  mainSplitDesktop: {
    flexDirection: "row",
    height: 480,
  },
  dispatchFeedCol: {
    flex: 1,
    backgroundColor: "#0F1A13",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E3326",
  },
  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  feedTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  feedSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1B2C21",
    alignItems: "center",
    justifyContent: "center",
  },
  requestCardsList: {
    gap: 12,
  },
  pickupReqCard: {
    backgroundColor: "#16251C",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#233D2D",
  },
  reqCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reqCustomerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reqCustomerName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  reqTime: {
    fontSize: 11,
    color: "#64748B",
  },
  reqStatusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  reqStatusSearching: {
    backgroundColor: "#78350F",
  },
  reqStatusAssigned: {
    backgroundColor: "#1E3A8A",
  },
  reqStatusCollected: {
    backgroundColor: "#064E3B",
  },
  reqStatusText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  reqCardDetails: {
    marginVertical: 8,
    gap: 4,
  },
  reqRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reqAddr: {
    fontSize: 12,
    color: "#94A3B8",
  },
  reqTierText: {
    fontSize: 12,
    color: "#F5B025",
    fontWeight: "700",
  },
  reqCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#233D2D",
  },
  reqCollectorName: {
    fontSize: 11,
    color: "#94A3B8",
  },
  manualAssignBtn: {
    backgroundColor: "#2D7A4D",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  manualAssignText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  radarMapCol: {
    flex: 1.3,
    backgroundColor: "#0F1A13",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E3326",
    overflow: "hidden",
  },
  radarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  radarTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  radarSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  radarControls: {
    flexDirection: "row",
  },
  sectorPill: {
    backgroundColor: "#1B2C21",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  sectorPillText: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "700",
  },
  adminMapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  fleetSection: {
    backgroundColor: "#0F1A13",
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1E3326",
  },
  fleetSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 12,
  },
  fleetSectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  fleetSectionSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  searchBarBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16251C",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: "#233D2D",
    minWidth: 260,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 13,
    color: "#FFFFFF",
  },
  fleetTableContainer: {
    borderWidth: 1,
    borderColor: "#1E3326",
    borderRadius: 16,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#16251C",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E3326",
  },
  thCell: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#16251C",
    alignItems: "center",
  },
  tdCell: {
    justifyContent: "center",
  },
  collectorAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2D7A4D",
    alignItems: "center",
    justifyContent: "center",
  },
  collectorInitial: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  collectorNameText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  vehicleText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  plateText: {
    fontSize: 10,
    color: "#64748B",
  },
  zoneText: {
    fontSize: 12,
    color: "#94A3B8",
  },
  statusPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  statusOnline: {
    backgroundColor: "#064E3B",
  },
  statusBusy: {
    backgroundColor: "#78350F",
  },
  statusOffline: {
    backgroundColor: "#334155",
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  tripsText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  ratingText: {
    fontSize: 10,
    color: "#F5B025",
  },
  earningsAmount: {
    fontSize: 14,
    fontWeight: "900",
    color: "#10B981",
  },
  payoutActionText: {
    fontSize: 11,
    color: "#38BDF8",
    fontWeight: "700",
    marginTop: 2,
  },
});
