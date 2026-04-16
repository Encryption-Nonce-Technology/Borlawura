import { httpLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import Constants from "expo-constants";
import { Platform } from "react-native";
import superjson from "superjson";

import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const configuredUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    process.env.EXPO_PUBLIC_RORK_API_BASE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (Platform.OS === "web") {
    return "http://localhost:3000";
  }

  // Expo hostUri usually looks like "192.168.x.x:8081"; use host for backend.
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  if (host) {
    return `http://${host}:3000`;
  }

  return "http://localhost:3000";
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/trpc`,
      transformer: superjson,
    }),
  ],
});
