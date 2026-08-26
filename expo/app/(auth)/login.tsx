import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  Sparkles,
  ArrowRight,
  Shield,
  Phone,
  User,
  Truck,
  Building,
} from "lucide-react-native";

import Colors, { Brand } from "@/constants/colors";
import { saveSession } from "@/lib/session";
import { trpc } from "@/lib/trpc";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_DESKTOP = Platform.OS === "web" && SCREEN_WIDTH > 840;

export default function BorlaColorsLoginScreen() {
  const initialRoleParam = useLocalSearchParams().role as
    | "user"
    | "collector"
    | "admin"
    | undefined;

  const [phoneOrEmail, setPhoneOrEmail] = useState<string>("+233240000000");
  const [passwordOrOtp, setPasswordOrOtp] = useState<string>("");
  const [role, setRole] = useState<"user" | "collector" | "admin">(initialRoleParam ?? "user");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [otpRequested, setOtpRequested] = useState<boolean>(false);

  const requestOtp = trpc.auth.requestOtp.useMutation({
    onSuccess: (data) => {
      setErrorMessage(null);
      setOtpRequested(true);
      if (data.codeForDev) {
        setDevCode(data.codeForDev);
        setPasswordOrOtp(data.codeForDev);
      }
    },
    onError: (error) => {
      setErrorMessage(error.message);
      Alert.alert("Could not send code", error.message);
    },
  });

  const verifyOtp = trpc.auth.verifyOtp.useMutation({
    onSuccess: async (data) => {
      setErrorMessage(null);
      if (data && data.user) {
        await saveSession({ token: data.token, user: data.user as any });
        if (data.user.role === "collector") {
          router.replace("/(collector)/home" as any);
        } else if (data.user.role === "admin") {
          router.replace("/(admin)/dashboard" as any);
        } else {
          router.replace("/(user)/home" as any);
        }
      }
    },
    onError: (error) => {
      setErrorMessage(error.message);
      Alert.alert("Could not sign in", error.message);
    },
  });

  const isPending = requestOtp.isPending || verifyOtp.isPending;

  const handleSignIn = () => {
    setErrorMessage(null);
    if (!otpRequested) {
      requestOtp.mutate({ phone: phoneOrEmail.trim() });
      return;
    }
    const name =
      role === "collector"
        ? "Verified Collector"
        : role === "admin"
        ? "Administrator"
        : "Edgar Ghansah";

    verifyOtp.mutate({
      phone: phoneOrEmail.trim(),
      code: passwordOrOtp.trim(),
      role,
      name,
    });
  };

  const handleQuickDemoSign = async (targetRole: "user" | "collector" | "admin") => {
    setRole(targetRole);
    setErrorMessage(null);

    const demoPhone =
      targetRole === "collector"
        ? "+233240000001"
        : targetRole === "admin"
        ? "+233200000999"
        : "+233240000000";

    const name =
      targetRole === "collector"
        ? "Kwame Mensah"
        : targetRole === "admin"
        ? "Administrator"
        : "Edgar Ghansah";

    try {
      // Step 1: Request OTP to get a real dev code
      const otpResult = await requestOtp.mutateAsync({ phone: demoPhone });
      const realCode = otpResult.codeForDev;

      if (!realCode) {
        setErrorMessage("OTP provider did not return a dev code. Enter the OTP manually.");
        setOtpRequested(true);
        setPhoneOrEmail(demoPhone);
        return;
      }

      // Step 2: Auto-verify with the real code
      setPasswordOrOtp(realCode);
      setOtpRequested(true);

      await verifyOtp.mutateAsync({
        phone: demoPhone,
        code: realCode,
        role: targetRole,
        name,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Quick sign-in failed. Try manual login.");
    }
  };

  return (
    <View style={styles.outerBackground}>
      {/* Radiant Borla Green & Gold Atmosphere Blurs */}
      <View style={styles.blurSphereGreen} />
      <View style={styles.blurSphereGold} />
      <View style={styles.blurSphereMint} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainCardContainer, IS_DESKTOP ? styles.desktopCard : styles.mobileCard]}>
          {/* =========================================================================
              LEFT COLUMN: HERO SHOWCASE (Borla Forest Green & Gold Iridescent Card)
             ========================================================================= */}
          {IS_DESKTOP && (
            <View style={styles.leftShowcaseCol}>
              {/* Top Big Styled Typography */}
              <View style={styles.showcaseHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.brandBorlaLarge}>Borla</Text>
                  <Text style={styles.brandWuraLarge}>Wura</Text>
                </View>
                <Text style={styles.showcaseSuperSub}>WASTE TO WEALTH • SMART DISPATCH</Text>
              </View>

              {/* Central Glowing 3D Orb with Official Mascot */}
              <View style={styles.orbContainer}>
                <View style={styles.glowingOrbOuter}>
                  <View style={styles.glowingOrbInner}>
                    <Image
                      source={require("@/assets/images/borlawura_logo.png")}
                      style={styles.orbMascotLogo}
                      resizeMode="contain"
                    />
                  </View>
                </View>
                <View style={styles.orbReflectionGlow} />
              </View>

              {/* Bottom Feature Copy */}
              <View style={styles.showcaseFooter}>
                <Text style={styles.showcaseTitle}>Smart Waste Logistics</Text>
                <Text style={styles.showcaseDesc}>
                  Experience automated doorstep waste pickups with real-time GPS telemetry, verified local collectors & instant Mobile Money payouts across Ghana.
                </Text>
              </View>
            </View>
          )}

          {/* =========================================================================
              RIGHT COLUMN: SIGN IN FORM
             ========================================================================= */}
          <View style={styles.rightFormCol}>
            {/* Top Brand Icon chip */}
            <View style={styles.topIconChip}>
              <Image
                source={require("@/assets/images/borlawura_logo.png")}
                style={{ width: 30, height: 30 }}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.welcomeHeading}>Welcome Back</Text>
            <Text style={styles.welcomeSub}>Sign in to access your BorlaWura platform</Text>

            {/* Role Switcher Chips */}
            <View style={styles.roleChipsRow}>
              {[
                { id: "user", label: "User", icon: "👤" },
                { id: "collector", label: "Collector", icon: "🚛" },
                { id: "admin", label: "Admin", icon: "🛡️" },
              ].map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roleChip, role === r.id && styles.roleChipActive]}
                  onPress={() => {
                    setRole(r.id as any);
                    setErrorMessage(null);
                  }}
                >
                  <Text style={styles.roleChipIcon}>{r.icon}</Text>
                  <Text style={[styles.roleChipText, role === r.id && styles.roleChipTextActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorAlert}>
                <Text style={styles.errorAlertText}>⚠️ {errorMessage}</Text>
              </View>
            ) : null}

            {/* Dev Auto-Fill Helper */}
            {otpRequested && devCode && (
              <TouchableOpacity
                style={styles.devCodeBanner}
                onPress={() => setPasswordOrOtp(devCode)}
              >
                <Sparkles size={14} color="#2D7A4D" />
                <Text style={styles.devCodeText}>
                  Development Code: <Text style={{ fontWeight: "900", color: "#2D7A4D" }}>{devCode}</Text> (Tap to auto-fill)
                </Text>
              </TouchableOpacity>
            )}

            {/* Email / Phone Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phone Number / Email</Text>
              <View style={styles.inputWrap}>
                <Mail size={18} color="#2D7A4D" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInputField}
                  value={phoneOrEmail}
                  onChangeText={setPhoneOrEmail}
                  placeholder="+233 24 000 0000 or email"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password / OTP Verification Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                {otpRequested ? "6-Digit Verification Code" : "Security Password / OTP"}
              </Text>
              <View style={styles.inputWrap}>
                <Lock size={18} color="#2D7A4D" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInputField}
                  value={passwordOrOtp}
                  onChangeText={setPasswordOrOtp}
                  placeholder={otpRequested ? "Enter 6-digit code..." : "••••••••"}
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword && !otpRequested}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeToggleBtn}
                >
                  {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <Check size={12} color="#FFFFFF" />}
                </View>
                <Text style={styles.checkboxLabel}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Alert.alert("Password Reset", "An OTP verification code will be sent to your phone.")}
              >
                <Text style={styles.forgotPassText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Big Borla Forest Green Sign In Button */}
            <TouchableOpacity
              style={[styles.primarySignInBtn, isPending && { opacity: 0.7 }]}
              onPress={handleSignIn}
              disabled={isPending}
              activeOpacity={0.88}
            >
              {isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primarySignInBtnText}>
                  {otpRequested ? "Verify & Sign In" : "Sign In"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Or Continue With */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or Continue With</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Quick Demo Sign In */}
            <TouchableOpacity
              style={styles.googleSocialBtn}
              onPress={() => handleQuickDemoSign(role)}
              activeOpacity={0.88}
            >
              <Text style={styles.googleIconText}>⚡</Text>
              <Text style={styles.googleBtnText}>Quick Sign In as {role.toUpperCase()}</Text>
            </TouchableOpacity>

            {/* Don't have an account */}
            <View style={styles.signupPromptRow}>
              <Text style={styles.signupPromptText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => handleQuickDemoSign("user")}>
                <Text style={styles.signupLinkText}>Sign up</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Social Proof Badge */}
            <View style={styles.socialProofCard}>
              <View style={styles.avatarOverlapRow}>
                <View style={[styles.avatarDot, { backgroundColor: "#2D7A4D" }]}>
                  <Text style={styles.avatarInitial}>B</Text>
                </View>
                <View style={[styles.avatarDot, { backgroundColor: "#F5B025", marginLeft: -8 }]}>
                  <Text style={styles.avatarInitial}>W</Text>
                </View>
                <View style={[styles.avatarDot, { backgroundColor: "#10B981", marginLeft: -8 }]}>
                  <Text style={styles.avatarInitial}>✓</Text>
                </View>
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.socialProofNumber}>15,000+ Clean Pickups</Text>
                <Text style={styles.socialProofSub}>completed across Greater Accra</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerBackground: {
    flex: 1,
    backgroundColor: "#DCFCE7",
    position: "relative",
  },
  blurSphereGreen: {
    position: "absolute",
    top: "5%",
    left: "10%",
    width: 480,
    height: 480,
    borderRadius: 240,
    backgroundColor: "#86EFAC",
    opacity: 0.6,
  },
  blurSphereGold: {
    position: "absolute",
    bottom: "10%",
    right: "15%",
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: "#FDE68A",
    opacity: 0.55,
  },
  blurSphereMint: {
    position: "absolute",
    top: "40%",
    right: "30%",
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: "#A7F3D0",
    opacity: 0.45,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  mainCardContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderRadius: 36,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#2D7A4D",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 36,
    overflow: "hidden",
  },
  desktopCard: {
    flexDirection: "row",
    width: 980,
    minHeight: 640,
  },
  mobileCard: {
    flexDirection: "column",
    width: "100%",
    maxWidth: 440,
    padding: 24,
  },

  /* LEFT SHOWCASE STYLES */
  leftShowcaseCol: {
    flex: 1.1,
    backgroundColor: "linear-gradient(135deg, #DCFCE7 0%, #FEF3C7 50%, #ECFDF5 100%)",
    padding: 36,
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
    borderTopLeftRadius: 36,
    borderBottomLeftRadius: 36,
  } as any,
  showcaseHeader: {
    marginTop: 8,
  },
  brandBorlaLarge: {
    fontSize: 44,
    fontWeight: "900",
    color: "#2D7A4D",
    letterSpacing: -1,
  },
  brandWuraLarge: {
    fontSize: 44,
    fontWeight: "900",
    color: "#F5B025",
    letterSpacing: -1,
  },
  showcaseSuperSub: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2D7A4D",
    letterSpacing: 2,
    marginTop: 2,
  },
  orbContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 28,
  },
  glowingOrbOuter: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#2D7A4D",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
  },
  glowingOrbInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  orbMascotLogo: {
    width: 96,
    height: 96,
  },
  orbReflectionGlow: {
    width: 120,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(45, 122, 77, 0.2)",
    marginTop: 14,
    alignSelf: "center",
  },
  showcaseFooter: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
  },
  showcaseTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 4,
  },
  showcaseDesc: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
  },

  /* RIGHT FORM STYLES */
  rightFormCol: {
    flex: 1.2,
    padding: 36,
    justifyContent: "center",
  },
  topIconChip: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    marginBottom: 16,
  },
  welcomeHeading: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.6,
  },
  welcomeSub: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 3,
    marginBottom: 18,
  },
  roleChipsRow: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  roleChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  roleChipActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  roleChipIcon: {
    fontSize: 14,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  roleChipTextActive: {
    color: "#2D7A4D",
    fontWeight: "800",
  },
  errorAlert: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  errorAlertText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "700",
  },
  devCodeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#86EFAC",
    borderRadius: 10,
    padding: 10,
    gap: 8,
    marginBottom: 14,
  },
  devCodeText: {
    fontSize: 12,
    color: "#166534",
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInputField: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  eyeToggleBtn: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxActive: {
    backgroundColor: "#2D7A4D",
    borderColor: "#2D7A4D",
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
  forgotPassText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2D7A4D",
  },
  primarySignInBtn: {
    backgroundColor: "#2D7A4D",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2D7A4D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
  },
  primarySignInBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
  },
  googleSocialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  googleIconText: {
    fontSize: 15,
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  signupPromptRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  signupPromptText: {
    fontSize: 12,
    color: "#64748B",
  },
  signupLinkText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2D7A4D",
  },
  socialProofCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 12,
    marginTop: 22,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  avatarOverlapRow: {
    flexDirection: "row",
  },
  avatarDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarInitial: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  socialProofNumber: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },
  socialProofSub: {
    fontSize: 10,
    color: "#64748B",
  },
});
