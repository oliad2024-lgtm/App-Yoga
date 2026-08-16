import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import {
  Edit,
  SlidersHorizontal,
  CreditCard,
  Bell,
  Heart,
  LogOut,
} from "lucide-react-native";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { useAuth } from "@/utils/auth";
import { useUser } from "@/utils/auth/useUser";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function ProfilePage() {
  const insets = useSafeAreaInsets();
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({
    dayStreak: 0,
    totalClasses: 0,
    totalHours: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const { signOut } = useAuth();
  const { user, refetch: refetchUser } = useUser();

  // Temporary userId
  const userId = "user-123";

  // All available practices
  const allPractices = [
    {
      id: "morning-flow",
      title: "Morning Flow",
      duration: "20 mins",
      level: "Intermediate",
      image:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop",
    },
    {
      id: "deep-zen-meditation",
      title: "Deep Zen Meditation",
      duration: "15 mins",
      level: "Beginner",
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop",
    },
    {
      id: "deep-stretch-relax",
      title: "Deep Stretch & Relax",
      duration: "15 mins",
      level: "Beginner",
      image:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop",
    },
    {
      id: "forest-flow-series",
      title: "Forest Flow Series",
      duration: "30 mins",
      level: "Intermediate",
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop",
    },
    {
      id: "morning-vitality-flow",
      title: "Morning Vitality Flow",
      duration: "20 mins",
      level: "Intermediate",
      image:
        "https://ucarecdn.com/a7046044-d8e0-4cd1-bd50-70a259459ec8/-/format/auto/",
    },
  ];

  // Filter to get only favorited practices
  const favoritedPractices = allPractices.filter((practice) =>
    favorites.includes(practice.id),
  );

  // Fetch favorites and stats on mount
  useEffect(() => {
    fetchFavorites();
    fetchStats();
    fetchNotificationPreferences();
    fetchUnreadCount();
  }, []);

  // Refresh unread count when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, []),
  );

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`/api/favorites/list?userId=${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch favorites: ${response.status}`);
      }
      const data = await response.json();
      setFavorites(data.practiceIds || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/user/stats?userId=${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }
      const data = await response.json();
      setStats({
        dayStreak: data.dayStreak || 0,
        totalClasses: data.totalClasses || 0,
        totalHours: data.totalHours || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchNotificationPreferences = async () => {
    try {
      const response = await fetch(
        `/api/notifications/preferences?userId=${userId}`,
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch notification preferences: ${response.status}`,
        );
      }
      const data = await response.json();
      setNotificationsEnabled(data.push_enabled ?? true);
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
    }
  };

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

  const toggleNotifications = async (value) => {
    // Optimistic update
    setNotificationsEnabled(value);

    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          push_enabled: value,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update notifications: ${response.status}`);
      }

      // Show success message
      Alert.alert(
        value ? "Notifications Enabled" : "Notifications Disabled",
        value
          ? "You'll receive updates about events, community posts, and practice reminders."
          : "You won't receive push notifications. You can re-enable them anytime.",
      );
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      // Revert on error
      setNotificationsEnabled(!value);
      Alert.alert(
        "Error",
        "Failed to update notification preferences. Please try again.",
      );
    }
  };

  const handleEditProfilePicture = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos to update your profile picture.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setUploading(true);

        try {
          // Convert image to base64
          const base64 = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Upload the image using base64
          const uploadResponse = await fetch("/_create/api/upload/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              base64: `data:image/jpeg;base64,${base64}`,
            }),
          });

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload image");
          }

          const uploadData = await uploadResponse.json();

          // Update user profile with new image
          const updateResponse = await fetch("/api/user/update-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user?.id,
              image: uploadData.url,
            }),
          });

          if (!updateResponse.ok) {
            throw new Error("Failed to update profile");
          }

          // Refresh user data
          await refetchUser();
          Alert.alert("Success", "Profile picture updated!");
        } catch (uploadError) {
          console.error("Error uploading:", uploadError);
          Alert.alert(
            "Upload Failed",
            "Could not update profile picture. Please try again.",
          );
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      Alert.alert("Error", "Failed to update profile picture");
      setUploading(false);
    }
  };

  const toggleFavorite = async (practiceId) => {
    const isFavorited = favorites.includes(practiceId);
    const endpoint = isFavorited
      ? "/api/favorites/remove"
      : "/api/favorites/add";

    // Optimistic update
    setFavorites((prev) =>
      isFavorited
        ? prev.filter((id) => id !== practiceId)
        : [...prev, practiceId],
    );

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, practiceId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle favorite: ${response.status}`);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert on error
      setFavorites((prev) =>
        isFavorited
          ? [...prev, practiceId]
          : prev.filter((id) => id !== practiceId),
      );
    }
  };

  const handleSignOut = () => {
    router.push("/account/logout");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F0" }}>
      <StatusBar style="dark" />

      {/* Header */}
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
        <ExpoImage
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
          }}
        >
          My Zen Journey
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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={{ alignItems: "center", marginTop: 24 }}>
          <View style={{ position: "relative" }}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: "#4A6B6B",
                overflow: "hidden",
                borderWidth: 4,
                borderColor: "#FFFFFF",
              }}
            >
              <ExpoImage
                source={{
                  uri: user?.image || "https://i.pravatar.cc/240?img=5",
                }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </View>
            <TouchableOpacity
              onPress={handleEditProfilePicture}
              disabled={uploading}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: uploading ? "#9B9B9B" : "#C9B891",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 3,
                borderColor: "#F5F5F0",
              }}
            >
              <Edit color="#2C2C2C" size={16} />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: "#2C2C2C",
              marginTop: 16,
            }}
          >
            {user?.name || user?.email || "Guest User"}
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: "#6B6B6B",
              marginTop: 4,
            }}
          >
            Mindfulness Practitioner • San Francisco
          </Text>
        </View>

        {/* Stats */}
        <View
          style={{
            flexDirection: "row",
            marginTop: 32,
            marginHorizontal: 20,
            gap: 12,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 32,
                fontWeight: "700",
                color: "#C9B891",
              }}
            >
              {stats.dayStreak}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#9B9B9B",
                marginTop: 4,
                fontWeight: "500",
                letterSpacing: 0.5,
              }}
            >
              DAY STREAK
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#C9B891",
            }}
          >
            <Text
              style={{
                fontSize: 32,
                fontWeight: "700",
                color: "#C9B891",
              }}
            >
              {stats.totalClasses}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#9B9B9B",
                marginTop: 4,
                fontWeight: "500",
                letterSpacing: 0.5,
              }}
            >
              CLASSES
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 32,
                fontWeight: "700",
                color: "#C9B891",
              }}
            >
              {stats.totalHours}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#9B9B9B",
                marginTop: 4,
                fontWeight: "500",
                letterSpacing: 0.5,
              }}
            >
              HOURS
            </Text>
          </View>
        </View>

        {/* My Favorites */}
        <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: "#2C2C2C",
              }}
            >
              My Favorites
            </Text>
            {favoritedPractices.length > 0 && (
              <TouchableOpacity onPress={() => router.push("/my-favorites")}>
                <Text
                  style={{
                    fontSize: 15,
                    color: "#C9B891",
                    fontWeight: "500",
                  }}
                >
                  SEE ALL
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {favoritedPractices.length === 0 ? (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: 32,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "#F8F6F3",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Heart color="#C9B891" size={28} />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#2C2C2C",
                  marginBottom: 8,
                }}
              >
                No favorites yet
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#9B9B9B",
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                Start exploring and tap the heart icon to save your favorite
                classes
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
              {favoritedPractices.slice(0, 4).map((practice) => (
                <View key={practice.id} style={{ width: "calc(50% - 8px)" }}>
                  <View
                    style={{
                      backgroundColor: "#D4A574",
                      borderRadius: 20,
                      height: 160,
                      overflow: "hidden",
                      marginBottom: 12,
                    }}
                  >
                    <ExpoImage
                      source={{ uri: practice.image }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                      transition={100}
                    />
                    <TouchableOpacity
                      onPress={() => toggleFavorite(practice.id)}
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: "rgba(255,255,255,0.9)",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Heart color="#C9B891" size={16} fill="#C9B891" />
                    </TouchableOpacity>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#2C2C2C",
                      marginBottom: 4,
                    }}
                  >
                    {practice.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#9B9B9B",
                    }}
                  >
                    {practice.duration} • {practice.level}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: "#2C2C2C",
              marginBottom: 16,
            }}
          >
            Settings
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "#F8F6F3",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <SlidersHorizontal color="#C9B891" size={20} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                fontWeight: "500",
                color: "#2C2C2C",
                marginLeft: 16,
              }}
            >
              Preferences
            </Text>
            <Text style={{ fontSize: 20, color: "#9B9B9B" }}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "#F8F6F3",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CreditCard color="#C9B891" size={20} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                fontWeight: "500",
                color: "#2C2C2C",
                marginLeft: 16,
              }}
            >
              Subscription
            </Text>
            <Text style={{ fontSize: 20, color: "#9B9B9B" }}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => toggleNotifications(!notificationsEnabled)}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "#F8F6F3",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Bell color="#C9B891" size={20} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                fontWeight: "500",
                color: "#2C2C2C",
                marginLeft: 16,
              }}
            >
              Notifications
            </Text>
            <View
              style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                backgroundColor: notificationsEnabled ? "#C9B891" : "#E5E5E5",
                justifyContent: "center",
                paddingHorizontal: 2,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: "#FFFFFF",
                  alignSelf: notificationsEnabled ? "flex-end" : "flex-start",
                }}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignOut}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "#FEF2F2",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LogOut color="#DC2626" size={20} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                fontWeight: "500",
                color: "#DC2626",
                marginLeft: 16,
              }}
            >
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
