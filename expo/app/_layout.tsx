import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

import Colors, { Brand } from "@/constants/colors";
import { useSession } from "@/lib/session";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: Colors.light.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "600" as const },
        headerTitle: Brand.appName,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* Screens in the (user), (collector) and (admin) groups configure their own headers. */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, loading } = useSession();
  const isReplaying = useRef(false);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (loading) return;
    const rootSegment = segments[0];
    const inAdminGroup = rootSegment === "(admin)";
    const inUserGroup = rootSegment === "(user)";
    const inCollectorGroup = rootSegment === "(collector)";

    if (!session && rootSegment !== "(auth)") {
      router.replace("/(auth)/login" as any);
      return;
    }

    if (!session) return;

    if (rootSegment === "(auth)") {
      router.replace("/" as any);
      return;
    }

    if (inAdminGroup && session.user.role !== "admin") {
      router.replace("/" as any);
      return;
    }
    if (inCollectorGroup && !["collector", "admin"].includes(session.user.role)) {
      router.replace("/" as any);
      return;
    }
    if (inUserGroup && !["user", "admin"].includes(session.user.role)) {
      router.replace("/" as any);
    }
  }, [loading, router, segments, session]);

  useEffect(() => {
    if (loading || !session || isReplaying.current) return;
    isReplaying.current = true;
    (async () => {
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const queueKeys = allKeys.filter((key) => key.startsWith("offline-pickup-"));
        for (const key of queueKeys) {
          const raw = await AsyncStorage.getItem(key);
          if (!raw) continue;
          const payload = JSON.parse(raw);
          try {
            await trpcClient.pickups.create.mutate(payload);
            await AsyncStorage.removeItem(key);
          } catch {
            // Keep queued if backend is still unreachable.
          }
        }
      } finally {
        isReplaying.current = false;
      }
    })();
  }, [loading, session]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={styles.container}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
