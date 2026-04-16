import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Alert,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { saveSession } from "@/lib/session";
import { trpc } from "@/lib/trpc";

export default function LoginScreen() {
  const [phone, setPhone] = useState("+233");
  const [otp, setOtp] = useState("");
  const [selectedRole, setSelectedRole] = useState<"user" | "collector" | "admin">("user");
  const [otpRequested, setOtpRequested] = useState(false);
  const entrance = useRef(new Animated.Value(0)).current;
  const otpReveal = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const blobOne = useRef(new Animated.Value(0)).current;
  const blobTwo = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  useEffect(() => {
    const loopOne = Animated.loop(
      Animated.sequence([
        Animated.timing(blobOne, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(blobOne, {
          toValue: 0,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const loopTwo = Animated.loop(
      Animated.sequence([
        Animated.timing(blobTwo, {
          toValue: 1,
          duration: 6400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(blobTwo, {
          toValue: 0,
          duration: 6400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loopOne.start();
    loopTwo.start();
    return () => {
      loopOne.stop();
      loopTwo.stop();
    };
  }, [blobOne, blobTwo]);

  useEffect(() => {
    Animated.timing(otpReveal, {
      toValue: otpRequested ? 1 : 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [otpRequested, otpReveal]);

  const requestOtp = trpc.auth.requestOtp.useMutation({
    onSuccess: (data) => {
      setOtpRequested(true);
      if (data.codeForDev) {
        Alert.alert("OTP sent", `Dev OTP: ${data.codeForDev}`);
      } else {
        Alert.alert("OTP sent", "Please check your SMS.");
      }
    },
    onError: (error) => Alert.alert("OTP failed", error.message),
  });
  const verifyOtp = trpc.auth.verifyOtp.useMutation({
    onSuccess: async (data) => {
      await saveSession({
        token: data.token,
        user: {
          id: data.user!.id,
          name: data.user!.name,
          phone: data.user!.phone,
          role: data.user!.role as "user" | "collector" | "admin",
        },
      });
      Alert.alert("Success", "You are logged in.");
      router.replace("/" as any);
    },
    onError: (error) => Alert.alert("Login failed", error.message),
  });

  const animateButton = (pressed: boolean) => {
    Animated.spring(buttonScale, {
      toValue: pressed ? 0.97 : 1,
      speed: 30,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const cardTranslateY = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [22, 0],
  });
  const logoScale = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });
  const otpTranslateY = otpReveal.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 0],
  });
  const otpOpacity = otpReveal.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.keyboardWrapper}
      >
        <Animated.View
          style={[styles.brandBlock, { opacity: entrance, transform: [{ scale: logoScale }] }]}
        >
          <Image source={require("@/assets/images/icon.png")} style={styles.logo} />
          <Text style={styles.brandTitle}>Borlawura</Text>
          <Text style={styles.brandSubtitle}>Secure login with phone and OTP</Text>
        </Animated.View>

        <Animated.View
          style={[styles.cardWrap, { opacity: entrance, transform: [{ translateY: cardTranslateY }] }]}
        >
          <View style={styles.card}>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subheading}>Enter your phone number to continue.</Text>

          <View style={styles.formPanel}>
            <Text style={styles.sectionTitle}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+233..."
              placeholderTextColor="rgba(226,232,240,0.6)"
            />

            <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Account Type</Text>
            <View style={styles.roleGrid}>
              {(
                [
                  { id: "user", emoji: "🧍", label: "User" },
                  { id: "collector", emoji: "🚛", label: "Collector" },
                  { id: "admin", emoji: "🧑‍💼", label: "Admin" },
                ] as const
              ).map((role) => (
                <Pressable
                  key={role.id}
                  style={({ pressed }) => [
                    styles.roleChip,
                    selectedRole === role.id && styles.roleChipActive,
                    pressed && styles.roleChipPressed,
                  ]}
                  onPress={() => setSelectedRole(role.id)}
                >
                  <Text style={styles.roleEmoji}>{role.emoji}</Text>
                  <Text
                    style={[
                      styles.roleChipText,
                      selectedRole === role.id && styles.roleChipTextActive,
                    ]}
                  >
                    {role.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Animated.View
              style={{
                maxHeight: otpRequested ? 120 : 0,
                opacity: otpOpacity,
                overflow: "hidden",
                transform: [{ translateY: otpTranslateY }],
              }}
            >
              {otpRequested && (
                <>
                  <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Enter OTP</Text>
                  <TextInput
                    style={styles.input}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    placeholder="6-digit code"
                    placeholderTextColor="rgba(226,232,240,0.6)"
                    maxLength={6}
                  />
                </>
              )}
            </Animated.View>
          </View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Pressable
              style={[
                styles.button,
                ((otpRequested && otp.length < 6) || (!otpRequested && phone.length < 8)) &&
                  styles.buttonDisabled,
              ]}
              onPressIn={() => animateButton(true)}
              onPressOut={() => animateButton(false)}
              onPress={() => {
                if (!otpRequested) {
                  requestOtp.mutate({ phone });
                  return;
                }
                verifyOtp.mutate({ phone, code: otp, role: selectedRole, name: "Borlawura User" });
              }}
              disabled={
                requestOtp.isPending ||
                verifyOtp.isPending ||
                (otpRequested ? otp.length < 6 : phone.length < 8)
              }
            >
              <Text style={styles.buttonText}>
                {!otpRequested
                  ? requestOtp.isPending
                    ? "Sending OTP..."
                    : "Request OTP"
                  : verifyOtp.isPending
                    ? "Verifying..."
                    : "Verify OTP"}
              </Text>
            </Pressable>
          </Animated.View>

          <Text style={styles.helperText}>
            {otpRequested
              ? "OTP expires in 5 minutes."
              : "We will send a one-time code to this number."}
          </Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: "center",
  },
  keyboardWrapper: {
    gap: 18,
  },
  brandBlock: {
    alignItems: "center",
  },
  logo: {
    width: 74,
    height: 74,
    borderRadius: 37,
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#111827",
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500" as const,
  },
  cardWrap: {
    borderRadius: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  heading: {
    fontSize: 27,
    fontWeight: "700" as const,
    color: "#111827",
    letterSpacing: -0.3,
  },
  subheading: {
    marginTop: 4,
    marginBottom: 12,
    color: "#6B7280",
    fontSize: 14,
  },
  formPanel: {
    marginTop: 6,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "700" as const,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: "#FFFFFF",
    color: "#111827",
    fontSize: 17,
  },
  roleGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  roleChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  roleChipActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
  },
  roleChipPressed: {
    opacity: 0.92,
  },
  roleEmoji: {
    fontSize: 18,
    marginBottom: 3,
  },
  roleChipText: {
    color: "#374151",
    fontWeight: "700" as const,
    fontSize: 11,
    textTransform: "uppercase",
  },
  roleChipTextActive: {
    color: "#047857",
  },
  button: {
    marginTop: 16,
    backgroundColor: "#111827",
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 15,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700" as const,
    fontSize: 15,
    letterSpacing: 0.1,
  },
  helperText: {
    marginTop: 10,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
});

