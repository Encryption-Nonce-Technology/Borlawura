import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors, { Brand } from "@/constants/colors";
import { saveSession } from "@/lib/session";
import { trpc } from "@/lib/trpc";

const roleLabels: Record<"user" | "collector" | "admin", string> = {
  user: "I need pickup",
  collector: "I collect waste",
  admin: "I manage operations",
};

export default function LoginScreen() {
  const initialRoleParam = useLocalSearchParams().role as
    | "user"
    | "collector"
    | "admin"
    | undefined;
  const [phone, setPhone] = useState("+233240000000");
  const [otp, setOtp] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [role, setRole] = useState<"user" | "collector" | "admin">(initialRoleParam ?? "user");
  const [otpRequested, setOtpRequested] = useState(false);

  const requestOtp = trpc.auth.requestOtp.useMutation({
    onSuccess: (data) => {
      setErrorMessage(null);
      setOtpRequested(true);
      if (data.codeForDev) {
        setDevCode(data.codeForDev);
        setOtp(data.codeForDev);
      }
    },
    onError: (error) => {
      setErrorMessage(error.message);
      Alert.alert("Could not send OTP", error.message);
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

  const pending = requestOtp.isPending || verifyOtp.isPending;

  const submit = () => {
    setErrorMessage(null);
    if (!otpRequested) {
      requestOtp.mutate({ phone: phone.trim() });
      return;
    }
    const name =
      role === "collector" ? "Verified Collector" : role === "admin" ? "Administrator" : "Borlawura User";
    verifyOtp.mutate({ phone: phone.trim(), code: otp.trim(), role, name });
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.hero}>
        <Image source={require("@/assets/images/icon.png")} style={styles.logo} />
        <Text style={styles.title}>{Brand.appName}</Text>
        <Text style={styles.subtitle}>Waste pickup made simple.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>{otpRequested ? "Verify your number" : "Sign in"}</Text>
        <Text style={styles.help}>
          {otpRequested
            ? `Enter the 6-digit verification code sent to ${phone}`
            : "Use your phone number to securely access your account."}
        </Text>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        ) : null}

        {devCode && otpRequested ? (
          <Pressable
            style={styles.devBanner}
            onPress={() => setOtp(devCode)}
          >
            <Text style={styles.devBannerTitle}>⚡ Development OTP Code:</Text>
            <Text style={styles.devBannerCode}>{devCode}</Text>
            <Text style={styles.devBannerHint}>(Tap to auto-fill)</Text>
          </Pressable>
        ) : null}

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={(t) => {
              setPhone(t);
              setErrorMessage(null);
            }}
            keyboardType="phone-pad"
            placeholder="+233 24 000 0000"
            placeholderTextColor="#9CA3AF"
            editable={!otpRequested && !pending}
          />
        </View>

        {!otpRequested && (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Sign In As</Text>
            <View style={styles.roleRow}>
              {(["user", "collector", "admin"] as const).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => {
                    setRole(item);
                    if (item === "admin" && phone === "+233240000000") {
                      setPhone("+233200000999");
                    }
                  }}
                  style={[styles.role, role === item && styles.roleActive]}
                >
                  <Text style={[styles.roleText, role === item && styles.roleTextActive]}>
                    {roleLabels[item]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {otpRequested && (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>6-Digit OTP Code</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              value={otp}
              onChangeText={(t) => {
                setOtp(t);
                setErrorMessage(null);
              }}
              keyboardType="number-pad"
              placeholder="123456"
              placeholderTextColor="#9CA3AF"
              maxLength={6}
              autoFocus
            />
          </View>
        )}

        <Pressable
          style={[styles.button, (pending || phone.length < 8 || (otpRequested && otp.length !== 6)) && styles.disabled]}
          onPress={submit}
          disabled={pending || phone.length < 8 || (otpRequested && otp.length !== 6)}
        >
          {pending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {otpRequested ? "Verify and Sign In" : "Send OTP Code"}
            </Text>
          )}
        </Pressable>

        {otpRequested && (
          <Pressable
            style={styles.changeNumberButton}
            onPress={() => {
              setOtpRequested(false);
              setOtp("");
              setDevCode(null);
              setErrorMessage(null);
            }}
          >
            <Text style={styles.changeNumberText}>← Change phone number</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F7FAF9", padding: 24, justifyContent: "center" },
  hero: { alignItems: "center", marginBottom: 28 },
  logo: { width: 76, height: 76, borderRadius: 38, marginBottom: 12 },
  title: { fontSize: 32, fontWeight: "800", color: Colors.light.text },
  subtitle: { color: Colors.light.muted, marginTop: 6 },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 24, gap: 14, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
  heading: { fontSize: 24, fontWeight: "700", color: Colors.light.text },
  help: { color: Colors.light.muted, lineHeight: 20, fontSize: 14 },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: "#4B5563", textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: Colors.light.border, borderRadius: 12, padding: 14, fontSize: 16, color: Colors.light.text, backgroundColor: "#FAFAFA" },
  otpInput: { fontSize: 22, fontWeight: "700", textAlign: "center", letterSpacing: 8 },
  roleRow: { flexDirection: "row", gap: 10 },
  role: { flex: 1, borderWidth: 1, borderColor: Colors.light.border, padding: 12, borderRadius: 12, alignItems: "center" },
  roleActive: { borderColor: Colors.light.primary, backgroundColor: "#ECFDF5" },
  roleText: { fontSize: 12, color: Colors.light.muted, fontWeight: "600", textAlign: "center" },
  roleTextActive: { color: Colors.light.primaryDark, fontWeight: "700" },
  button: { backgroundColor: Colors.light.primary, borderRadius: 12, padding: 16, alignItems: "center", marginTop: 4 },
  disabled: { opacity: 0.55 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  devBanner: { backgroundColor: "#FEF3C7", borderColor: "#F59E0B", borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  devBannerTitle: { fontSize: 12, fontWeight: "700", color: "#92400E" },
  devBannerCode: { fontSize: 24, fontWeight: "800", color: "#B45309", letterSpacing: 4, marginVertical: 2 },
  devBannerHint: { fontSize: 11, color: "#92400E" },
  errorBanner: { backgroundColor: "#FEE2E2", borderColor: "#EF4444", borderWidth: 1, borderRadius: 10, padding: 10 },
  errorText: { color: "#B91C1C", fontSize: 13, fontWeight: "600" },
  changeNumberButton: { alignItems: "center", paddingVertical: 6 },
  changeNumberText: { color: Colors.light.primary, fontSize: 14, fontWeight: "600" },
});
