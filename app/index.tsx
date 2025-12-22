import { router } from "expo-router";
import { Truck, Package } from "lucide-react-native";
import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function RoleSelectorScreen() {
  const [selectedRole, setSelectedRole] = useState<"user" | "collector" | null>(null);

  const handleContinue = () => {
    if (selectedRole === "user") {
      router.push("/(user)/home" as any);
    } else if (selectedRole === "collector") {
      router.push("/(collector)/home" as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>

      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>🌱 WasteWise</Text>
          <Text style={styles.tagline}>Snap it. Request it. It&apos;s gone.</Text>
        </View>

        <View style={styles.rolesContainer}>
          <Text style={styles.title}>Choose your role</Text>

          <TouchableOpacity
            testID="user-role-button"
            style={[styles.roleCard, selectedRole === "user" && styles.roleCardActive]}
            onPress={() => setSelectedRole("user")}
            activeOpacity={0.7}
          >
            <View
              style={[styles.iconContainer, selectedRole === "user" && styles.iconContainerActive]}
            >
              <Package size={32} color={selectedRole === "user" ? "#fff" : "#10B981"} />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>I need pickup</Text>
              <Text style={styles.roleDescription}>Request trash collection from verified collectors</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            testID="collector-role-button"
            style={[styles.roleCard, selectedRole === "collector" && styles.roleCardActive]}
            onPress={() => setSelectedRole("collector")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                selectedRole === "collector" && styles.iconContainerActive,
              ]}
            >
              <Truck size={32} color={selectedRole === "collector" ? "#fff" : "#10B981"} />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>I am a collector</Text>
              <Text style={styles.roleDescription}>Accept requests and earn money collecting waste</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          testID="continue-button"
          style={[styles.button, !selectedRole && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!selectedRole}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  circle1: {
    position: "absolute",
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: (width * 1.5) / 2,
    backgroundColor: "#10B981",
    opacity: 0.05,
    top: -width * 0.7,
    left: -width * 0.3,
  },
  circle2: {
    position: "absolute",
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    backgroundColor: "#059669",
    opacity: 0.05,
    bottom: -width * 0.6,
    right: -width * 0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  rolesContainer: {
    flex: 1,
    justifyContent: "center",
    marginVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 32,
    textAlign: "center",
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  roleCardActive: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  iconContainerActive: {
    backgroundColor: "#10B981",
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#10B981",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
