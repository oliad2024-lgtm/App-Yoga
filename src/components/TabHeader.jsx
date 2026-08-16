import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function TabHeader({ title }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  const userId = "user-123"; // Temporary userId

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Refresh unread count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(
        `/api/notifications/unread-count?userId=${userId}`,
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch unread count: ${response.status}`);
      }
      const data = await response.json();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  return (
    <View
      style={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: "#F5F5F0",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Image
        source={{
          uri: "https://ucarecdn.com/6cb4397a-5b4a-4542-9e02-1a6a8f7ccc14/-/format/auto/",
        }}
        style={{ width: 32, height: 32 }}
        contentFit="contain"
      />
      <Text
        style={{
          fontSize: 20,
          fontWeight: "600",
          color: "#2C2C2C",
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/notifications")}
        style={{ position: "relative" }}
      >
        <Bell color="#2C2C2C" size={24} />
        {unreadCount > 0 && (
          <View
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: "#C9B891",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: "#FFFFFF",
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
