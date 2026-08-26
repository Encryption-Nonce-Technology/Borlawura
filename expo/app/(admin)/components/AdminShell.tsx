import { router, usePathname } from "expo-router";
import type { ReactNode } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors, { Brand } from "@/constants/colors";

type AdminShellProps = {
  title: string;
  children: ReactNode;
};

const tabs = [
  { label: "Overview", path: "/(admin)/dashboard" },
  { label: "Users", path: "/(admin)/users" },
  { label: "Collectors", path: "/(admin)/collectors" },
  { label: "Requests", path: "/(admin)/requests" },
];

export default function AdminShell({ title, children }: AdminShellProps) {
  const pathname = usePathname();

  if (Platform.OS !== "web") {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.nativeOnlyCard}>
          <Text style={styles.nativeOnlyTitle}>Admin dashboard is web-only.</Text>
          <Text style={styles.nativeOnlyText}>
            Open Borlawura in your browser to access admin management tools.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.brand}>{Brand.appName} Admin</Text>
        <Text style={styles.subtitle}>{title}</Text>
      </View>

      <ScrollView horizontal style={styles.tabScroll} contentContainerStyle={styles.tabRow}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <TouchableOpacity
              key={tab.path}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => router.replace(tab.path as any)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  brand: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  subtitle: {
    marginTop: 2,
    color: Colors.light.muted,
    fontWeight: "600" as const,
  },
  tabScroll: {
    maxHeight: 50,
  },
  tabRow: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 8,
  },
  tab: {
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tabActive: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    color: "#374151",
    fontWeight: "600" as const,
    fontSize: 13,
  },
  tabTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nativeOnlyCard: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  nativeOnlyTitle: {
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  nativeOnlyText: {
    color: Colors.light.muted,
  },
});

