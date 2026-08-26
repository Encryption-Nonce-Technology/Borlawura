import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { router } from "expo-router";
import {
  Truck,
  Package,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Calendar,
  DollarSign,
  ChevronRight,
  User,
  Recycle,
  Trash2,
  Navigation,
  Globe,
  Star,
  Activity,
  Layers,
} from "lucide-react-native";

import Colors, { Brand, WasteTiers, WasteCategories } from "@/constants/colors";
import UberMap from "@/components/UberMap";
import { useSession } from "@/lib/session";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_DESKTOP = Platform.OS === "web" && SCREEN_WIDTH > 860;

export default function BorlaPlusInspiredHomepage() {
  const [activeTab, setActiveTab] = useState<"instant" | "schedule" | "drive">("instant");
  const [address, setAddress] = useState<string>("East Legon, Accra");
  const [selectedTier, setSelectedTier] = useState<string>("small");
  const { session } = useSession();

  const handleLaunchApp = (role: "user" | "collector" | "admin" = "user") => {
    if (session && session.user.role === role) {
      if (role === "collector") router.push("/(collector)/home" as any);
      else if (role === "admin") router.push("/(admin)/dashboard" as any);
      else router.push("/(user)/home" as any);
      return;
    }

    router.push({
      pathname: "/(auth)/login",
      params: { role },
    } as any);
  };

  return (
    <View style={styles.rootContainer}>
      {/* 1. TOP HEADER (Inspired by BorlaPlus with top-right Login) */}
      <View style={styles.navHeader}>
        <View style={styles.navLeft}>
          <TouchableOpacity style={styles.brandLogoRow} onPress={() => router.push("/" as any)}>
            <Image
              source={require("@/assets/images/borlawura_logo.png")}
              style={styles.brandMascotLogo}
              resizeMode="contain"
            />
            <View style={styles.brandTextGroup}>
              <View style={styles.brandNameRow}>
                <Text style={styles.brandBorla}>Borla</Text>
                <Text style={styles.brandWura}>Wura</Text>
              </View>
              <Text style={styles.brandSlogan}>WASTE TO WEALTH</Text>
            </View>
          </TouchableOpacity>

          {IS_DESKTOP && (
            <View style={styles.navCenterLinks}>
              <TouchableOpacity style={styles.navLink} onPress={() => handleLaunchApp("user")}>
                <Text style={styles.navLinkText}>Services</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLink} onPress={() => handleLaunchApp("user")}>
                <Text style={styles.navLinkText}>How It Works</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLink} onPress={() => handleLaunchApp("user")}>
                <Text style={styles.navLinkText}>Pricing</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLink} onPress={() => handleLaunchApp("collector")}>
                <Text style={styles.navLinkText}>Driver Fleet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLink} onPress={() => handleLaunchApp("admin")}>
                <Text style={styles.navLinkText}>Operations</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Top Right Login & CTA */}
        <View style={styles.navRight}>
          {IS_DESKTOP && (
            <View style={styles.supportPhonePill}>
              <Phone size={14} color="#2D7A4D" />
              <Text style={styles.supportPhoneText}>+233 24 555 0192</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.loginHeaderBtn}
            onPress={() => router.push("/(auth)/login" as any)}
            activeOpacity={0.88}
          >
            <User size={16} color="#2D7A4D" style={{ marginRight: 6 }} />
            <Text style={styles.loginHeaderBtnText}>Log in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.requestPickupTopBtn}
            onPress={() => handleLaunchApp("user")}
            activeOpacity={0.88}
          >
            <Text style={styles.requestPickupTopBtnText}>Book Pickup</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.pageScrollView} showsVerticalScrollIndicator={false}>
        {/* 2. HERO SECTION */}
        <View style={[styles.heroSection, IS_DESKTOP ? styles.heroDesktop : styles.heroMobile]}>
          {/* Hero Left Content & Booking Widget */}
          <View style={styles.heroLeftCol}>
            <View style={styles.heroBadge}>
              <Recycle size={14} color="#2D7A4D" />
              <Text style={styles.heroBadgeText}>GHANA’S #1 ON-DEMAND REFUSE PICKUP</Text>
            </View>

            <Text style={styles.heroTitle}>
              Smart, Automated <Text style={styles.greenHighlight}>Waste Collection</Text> For Ghana
            </Text>

            <Text style={styles.heroSub}>
              Say goodbye to delayed trash pickups. Request an on-demand Borlawura collector in 60 seconds with live GPS tracking and instant Mobile Money payments.
            </Text>

            {/* Quick Booking Card */}
            <View style={styles.bookingCard}>
              {/* Tab Selector */}
              <View style={styles.cardTabsRow}>
                <TouchableOpacity
                  style={[styles.cardTab, activeTab === "instant" && styles.cardTabActive]}
                  onPress={() => setActiveTab("instant")}
                >
                  <Package size={16} color={activeTab === "instant" ? "#FFFFFF" : "#64748B"} />
                  <Text style={[styles.cardTabText, activeTab === "instant" && styles.cardTabTextActive]}>
                    Instant Pickup
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cardTab, activeTab === "schedule" && styles.cardTabActive]}
                  onPress={() => setActiveTab("schedule")}
                >
                  <Calendar size={16} color={activeTab === "schedule" ? "#FFFFFF" : "#64748B"} />
                  <Text style={[styles.cardTabText, activeTab === "schedule" && styles.cardTabTextActive]}>
                    Schedule Routine
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cardTab, activeTab === "drive" && styles.cardTabActive]}
                  onPress={() => setActiveTab("drive")}
                >
                  <Truck size={16} color={activeTab === "drive" ? "#FFFFFF" : "#64748B"} />
                  <Text style={[styles.cardTabText, activeTab === "drive" && styles.cardTabTextActive]}>
                    Drive & Earn
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Instant Pickup Tab */}
              {activeTab === "instant" && (
                <View style={styles.tabContent}>
                  <Text style={styles.tabHeading}>Where should we pick up?</Text>
                  
                  <View style={styles.addressInputBox}>
                    <MapPin size={18} color="#2D7A4D" />
                    <TextInput
                      style={styles.addressInput}
                      value={address}
                      onChangeText={setAddress}
                      placeholder="Enter pickup address in Accra..."
                    />
                    <TouchableOpacity onPress={() => setAddress("East Legon, Accra")}>
                      <Navigation size={16} color="#F5B025" />
                    </TouchableOpacity>
                  </View>

                  {/* Tier Chips */}
                  <View style={styles.tierChipsRow}>
                    {WasteTiers.slice(0, 3).map((tier) => (
                      <TouchableOpacity
                        key={tier.id}
                        style={[styles.tierChip, selectedTier === tier.id && styles.tierChipActive]}
                        onPress={() => setSelectedTier(tier.id)}
                      >
                        <Text style={styles.tierChipIcon}>{tier.icon}</Text>
                        <Text style={[styles.tierChipName, selectedTier === tier.id && styles.tierChipTextActive]}>
                          {tier.name}
                        </Text>
                        <Text style={[styles.tierChipPrice, selectedTier === tier.id && styles.tierChipPriceActive]}>
                          {Brand.currency.symbol}{tier.price}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.mainDispatchBtn}
                    onPress={() => handleLaunchApp("user")}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.mainDispatchBtnText}>Request Borlawura Pickup Now</Text>
                    <ArrowRight size={20} color="#FFFFFF" />
                  </TouchableOpacity>

                  <View style={styles.trustFooterRow}>
                    <Text style={styles.trustFooterItem}>⚡ 3 Min Avg Arrival</Text>
                    <Text style={styles.trustFooterItem}>💳 MTN MoMo / Telecel</Text>
                    <Text style={styles.trustFooterItem}>⭐ 4.96 Rating</Text>
                  </View>
                </View>
              )}

              {/* Schedule Tab */}
              {activeTab === "schedule" && (
                <View style={styles.tabContent}>
                  <Text style={styles.tabHeading}>Automate Your Weekly Collection</Text>
                  <Text style={styles.tabDesc}>
                    Never worry about overflowing bins. Enjoy routine Tuesday and Friday scheduled pickups from ₵120/month.
                  </Text>
                  <TouchableOpacity
                    style={styles.mainDispatchBtn}
                    onPress={() => handleLaunchApp("user")}
                  >
                    <Text style={styles.mainDispatchBtnText}>Set Up Subscription</Text>
                    <ArrowRight size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Drive Tab */}
              {activeTab === "drive" && (
                <View style={styles.tabContent}>
                  <Text style={styles.tabHeading}>Earn ₵280 - ₵450 Daily</Text>
                  <Text style={styles.tabDesc}>
                    Own a tricycle, truck, or pickup? Register as a verified Borlawura collector and withdraw earnings directly to MoMo daily.
                  </Text>
                  <TouchableOpacity
                    style={styles.mainDispatchBtn}
                    onPress={() => handleLaunchApp("collector")}
                  >
                    <Text style={styles.mainDispatchBtnText}>Register As Collector</Text>
                    <ArrowRight size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Hero Right Visual Column */}
          <View style={styles.heroRightCol}>
            <View style={styles.mascotShowcaseCard}>
              <Image
                source={require("@/assets/images/borlawura_logo.png")}
                style={styles.largeHeroMascot}
                resizeMode="contain"
              />
              <View style={styles.floatingMascotBadge}>
                <View style={styles.radarPulseDot} />
                <View>
                  <Text style={styles.badgeMascotTitle}>18 Active Trucks Roaming</Text>
                  <Text style={styles.badgeMascotSub}>Greater Accra Coverage</Text>
                </View>
              </View>
            </View>

            {/* Embedded Live Map Preview */}
            <View style={styles.heroMapSnippet}>
              <UberMap userLocation={{ latitude: 5.6037, longitude: -0.1870 }} />
            </View>
          </View>
        </View>

        {/* 3. CORE WASTE SERVICES (Strictly Waste Collection) */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionSubtitle}>OUR SPECIALIZED CAPABILITIES</Text>
          <Text style={styles.sectionTitle}>Modern Waste Collection Services</Text>

          <View style={[styles.servicesGrid, IS_DESKTOP && styles.servicesGridDesktop]}>
            {/* Service 1 */}
            <View style={styles.serviceCard}>
              <View style={styles.serviceIconWrap}>
                <Trash2 size={26} color="#2D7A4D" />
              </View>
              <Text style={styles.serviceCardTitle}>On-Demand Doorstep Pickups</Text>
              <Text style={styles.serviceCardDesc}>
                Snap a photo and book instant bag, sack, or bin trash pickups. Dispatched directly to your GPS coordinates.
              </Text>
            </View>

            {/* Service 2 */}
            <View style={styles.serviceCard}>
              <View style={[styles.serviceIconWrap, { backgroundColor: "#FEF3C7" }]}>
                <Calendar size={26} color="#D97706" />
              </View>
              <Text style={styles.serviceCardTitle}>Routine Household Subscriptions</Text>
              <Text style={styles.serviceCardDesc}>
                Set it and forget it. Weekly and bi-weekly scheduled collections ensure your home or office remains pristine.
              </Text>
            </View>

            {/* Service 3 */}
            <View style={styles.serviceCard}>
              <View style={[styles.serviceIconWrap, { backgroundColor: "#DCFCE7" }]}>
                <Truck size={26} color="#16A34A" />
              </View>
              <Text style={styles.serviceCardTitle}>Bulky Waste & Bin Hauling</Text>
              <Text style={styles.serviceCardDesc}>
                Heavy 240L wheelie bins, garden trimmings, estate waste, and commercial bulk refuse moved effortlessly.
              </Text>
            </View>

            {/* Service 4 */}
            <View style={styles.serviceCard}>
              <View style={[styles.serviceIconWrap, { backgroundColor: "#E0F2FE" }]}>
                <Recycle size={26} color="#0284C7" />
              </View>
              <Text style={styles.serviceCardTitle}>Eco Sorting & Recycling</Text>
              <Text style={styles.serviceCardDesc}>
                Dedicated recycling channels for plastics, cardboard, and scrap that turn everyday waste into economic wealth.
              </Text>
            </View>
          </View>
        </View>

        {/* 4. HOW IT WORKS */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionSubtitle}>SIMPLE & AUTOMATED</Text>
          <Text style={styles.sectionTitle}>How Borlawura Works in 4 Steps</Text>

          <View style={[styles.stepsContainer, IS_DESKTOP && styles.stepsContainerDesktop]}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepItemTitle}>Snap & Request</Text>
              <Text style={styles.stepItemDesc}>
                Confirm your pickup location and choose between instant bag, sack, or 240L bin.
              </Text>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumberBadge, { backgroundColor: "#F5B025" }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepItemTitle}>GPS Dispatch</Text>
              <Text style={styles.stepItemDesc}>
                The closest verified tricycle or truck accepts your request with real-time route tracking.
              </Text>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumberBadge, { backgroundColor: "#2D7A4D" }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepItemTitle}>Spotless Collection</Text>
              <Text style={styles.stepItemDesc}>
                Collector arrives at your gate, clears the waste cleanly, and verifies with an after-photo.
              </Text>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumberBadge, { backgroundColor: "#0F172A" }]}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepItemTitle}>Seamless MoMo Pay</Text>
              <Text style={styles.stepItemDesc}>
                Pay automatically via Mobile Money or Cash with transparent, upfront pricing.
              </Text>
            </View>
          </View>
        </View>

        {/* 5. PRICING TIERS */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionSubtitle}>TRANSPARENT RATES</Text>
          <Text style={styles.sectionTitle}>Upfront Waste Collection Tiers</Text>

          <View style={[styles.pricingGrid, IS_DESKTOP && styles.pricingGridDesktop]}>
            {WasteTiers.map((tier) => (
              <View key={tier.id} style={styles.pricingCard}>
                <View style={styles.pricingBadge}>
                  <Text style={styles.pricingBadgeText}>{tier.badge}</Text>
                </View>
                <Image source={{ uri: tier.image }} style={styles.pricingImage} />
                <Text style={styles.pricingName}>{tier.name}</Text>
                <Text style={styles.pricingSub}>{tier.subtitle}</Text>
                <Text style={styles.pricingAmount}>
                  {Brand.currency.symbol}{tier.price} <Text style={styles.pricingPer}>/ pickup</Text>
                </Text>
                <TouchableOpacity
                  style={styles.pricingBookBtn}
                  onPress={() => handleLaunchApp("user")}
                >
                  <Text style={styles.pricingBookBtnText}>Book This Tier</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* 6. ADMIN & COLLECTOR GATEWAYS BANNER */}
        <View style={styles.gatewayBanner}>
          <Text style={styles.gatewayTitle}>Direct Platform Portals</Text>
          <Text style={styles.gatewaySub}>Choose your role to access dedicated dashboards</Text>

          <View style={styles.gatewayButtonsRow}>
            <TouchableOpacity style={styles.gatewayBtn} onPress={() => handleLaunchApp("user")}>
              <Text style={styles.gatewayBtnText}>User Booking App →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gatewayBtn} onPress={() => handleLaunchApp("collector")}>
              <Text style={styles.gatewayBtnText}>Collector Driver Portal →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.gatewayBtn, styles.gatewayBtnAdmin]} onPress={() => handleLaunchApp("admin")}>
              <Text style={styles.gatewayBtnText}>Operations Command Tower →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 7. FOOTER */}
        <View style={styles.pageFooter}>
          <View style={styles.footerBrandBlock}>
            <View style={styles.brandNameRow}>
              <Text style={[styles.brandBorla, { color: "#FFFFFF" }]}>Borla</Text>
              <Text style={styles.brandWura}>Wura</Text>
            </View>
            <Text style={styles.footerSlogan}>WASTE TO WEALTH • GHANA</Text>
            <Text style={styles.footerCopy}>© 2026 BorlaWura Technologies Inc. All rights reserved.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  navHeader: {
    height: 76,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    zIndex: 50,
  },
  navLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 32,
  },
  brandLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandMascotLogo: {
    width: 44,
    height: 44,
  },
  brandTextGroup: {
    justifyContent: "center",
  },
  brandNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandBorla: {
    fontSize: 22,
    fontWeight: "900",
    color: "#2D7A4D",
    letterSpacing: -0.5,
  },
  brandWura: {
    fontSize: 22,
    fontWeight: "900",
    color: "#F5B025",
    letterSpacing: -0.5,
  },
  brandSlogan: {
    fontSize: 8,
    fontWeight: "800",
    color: "#F5B025",
    letterSpacing: 1.2,
  },
  navCenterLinks: {
    flexDirection: "row",
    gap: 24,
  },
  navLink: {
    paddingVertical: 6,
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  supportPhonePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  supportPhoneText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2D7A4D",
  },
  loginHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  loginHeaderBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2D7A4D",
  },
  requestPickupTopBtn: {
    backgroundColor: "#2D7A4D",
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 20,
    shadowColor: "#2D7A4D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  requestPickupTopBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  pageScrollView: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 32,
    paddingVertical: 48,
    backgroundColor: "#FFFFFF",
    gap: 36,
  },
  heroDesktop: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 600,
  },
  heroMobile: {
    flexDirection: "column",
  },
  heroLeftCol: {
    flex: 1.1,
    justifyContent: "center",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0FDF4",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    marginBottom: 16,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2D7A4D",
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -1.2,
    lineHeight: 46,
  },
  greenHighlight: {
    color: "#2D7A4D",
  },
  heroSub: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 24,
    marginTop: 14,
    marginBottom: 24,
  },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
  },
  cardTabsRow: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  cardTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  cardTabActive: {
    backgroundColor: "#2D7A4D",
  },
  cardTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  cardTabTextActive: {
    color: "#FFFFFF",
  },
  tabContent: {
    gap: 14,
  },
  tabHeading: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },
  tabDesc: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 20,
  },
  addressInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  addressInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  tierChipsRow: {
    flexDirection: "row",
    gap: 10,
  },
  tierChip: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  tierChipActive: {
    backgroundColor: "#F0FDF4",
    borderColor: "#2D7A4D",
  },
  tierChipIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tierChipName: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },
  tierChipPrice: {
    fontSize: 13,
    fontWeight: "900",
    color: "#2D7A4D",
    marginTop: 2,
  },
  tierChipTextActive: {
    color: "#2D7A4D",
  },
  tierChipPriceActive: {
    color: "#2D7A4D",
  },
  mainDispatchBtn: {
    backgroundColor: "#2D7A4D",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#2D7A4D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
  },
  mainDispatchBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  trustFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  trustFooterItem: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  heroRightCol: {
    flex: 1,
    gap: 18,
  },
  mascotShowcaseCard: {
    backgroundColor: "#FDFBF7",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FEEBC8",
    position: "relative",
    minHeight: 260,
  },
  largeHeroMascot: {
    width: 220,
    height: 220,
  },
  floatingMascotBadge: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  radarPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
  },
  badgeMascotTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },
  badgeMascotSub: {
    fontSize: 10,
    color: "#64748B",
  },
  heroMapSnippet: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    minHeight: 240,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  servicesSection: {
    paddingHorizontal: 32,
    paddingVertical: 56,
    backgroundColor: "#F8FAFC",
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2D7A4D",
    textAlign: "center",
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 40,
    letterSpacing: -0.8,
  },
  servicesGrid: {
    gap: 20,
  },
  servicesGridDesktop: {
    flexDirection: "row",
  },
  serviceCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  serviceIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  serviceCardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  serviceCardDesc: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 20,
  },
  howItWorksSection: {
    paddingHorizontal: 32,
    paddingVertical: 56,
    backgroundColor: "#FFFFFF",
  },
  stepsContainer: {
    gap: 16,
  },
  stepsContainerDesktop: {
    flexDirection: "row",
  },
  stepItem: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  stepNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2D7A4D",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  stepItemTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  stepItemDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
  },
  pricingSection: {
    paddingHorizontal: 32,
    paddingVertical: 56,
    backgroundColor: "#F8FAFC",
  },
  pricingGrid: {
    gap: 16,
  },
  pricingGridDesktop: {
    flexDirection: "row",
  },
  pricingCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  pricingBadge: {
    backgroundColor: "#F0FDF4",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  pricingBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2D7A4D",
  },
  pricingImage: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    marginBottom: 12,
  },
  pricingName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  pricingSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  pricingAmount: {
    fontSize: 24,
    fontWeight: "900",
    color: "#2D7A4D",
    marginTop: 12,
    marginBottom: 14,
  },
  pricingPer: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  pricingBookBtn: {
    backgroundColor: "#2D7A4D",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  pricingBookBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  gatewayBanner: {
    backgroundColor: "#0B130E",
    paddingHorizontal: 32,
    paddingVertical: 48,
    alignItems: "center",
  },
  gatewayTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  gatewaySub: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 24,
  },
  gatewayButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
  },
  gatewayBtn: {
    backgroundColor: "#1E293B",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  gatewayBtnAdmin: {
    backgroundColor: "#2D7A4D",
    borderColor: "#2D7A4D",
  },
  gatewayBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  pageFooter: {
    backgroundColor: "#060A08",
    paddingHorizontal: 32,
    paddingVertical: 32,
    alignItems: "center",
  },
  footerBrandBlock: {
    alignItems: "center",
  },
  footerSlogan: {
    fontSize: 10,
    fontWeight: "800",
    color: "#F5B025",
    marginTop: 4,
    letterSpacing: 1.2,
  },
  footerCopy: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 8,
  },
});
