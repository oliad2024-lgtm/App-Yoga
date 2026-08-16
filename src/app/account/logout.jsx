import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth";
import { useAuthModal } from "@/utils/auth/store";

export default function LogoutPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();
  const { open } = useAuthModal();

  useEffect(() => {
    // Sign out and navigate to home
    signOut();

    // Wait a moment then navigate to home and open signin modal
    const timeout = setTimeout(() => {
      router.replace("/(tabs)");
      // Open signin modal after navigation
      setTimeout(() => {
        open({ mode: "signin" });
      }, 100);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [signOut, router, open]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F5F5F0",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <StatusBar style="dark" />

      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: "#FFFFFF",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <ActivityIndicator size="large" color="#C9B891" />
      </View>

      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          color: "#2C2C2C",
          marginBottom: 8,
        }}
      >
        Signing Out...
      </Text>

      <Text
        style={{
          fontSize: 15,
          color: "#6B6B6B",
          textAlign: "center",
          paddingHorizontal: 40,
        }}
      >
        Thank you for practicing with us today
      </Text>
    </View>
  );
}
