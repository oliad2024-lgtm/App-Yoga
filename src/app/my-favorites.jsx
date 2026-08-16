import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, Heart } from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

export default function MyFavoritesPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);

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
    {
      id: "evening-wind-down",
      title: "Evening Wind Down",
      duration: "25 mins",
      level: "Beginner",
      image:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop",
    },
    {
      id: "power-yoga-session",
      title: "Power Yoga Session",
      duration: "45 mins",
      level: "Advanced",
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop",
    },
  ];

  // Filter to get only favorited practices
  const favoritedPractices = allPractices.filter((practice) =>
    favorites.includes(practice.id),
  );

  useEffect(() => {
    fetchFavorites();
  }, []);

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

  const handlePracticePress = (practice) => {
    router.push({
      pathname: "/practice-detail",
      params: {
        id: practice.id,
        title: practice.title,
        duration: practice.duration,
        level: practice.level,
        image: practice.image,
      },
    });
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
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="#2C2C2C" size={28} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            color: "#2C2C2C",
          }}
        >
          My Favorites
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {favoritedPractices.length === 0 ? (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 40,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 32,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#F8F6F3",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Heart color="#C9B891" size={36} />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: "#2C2C2C",
                marginBottom: 8,
              }}
            >
              No favorites yet
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: "#9B9B9B",
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              Start exploring and tap the heart icon to save your favorite
              classes
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
            <Text
              style={{
                fontSize: 15,
                color: "#6B6B6B",
                marginBottom: 16,
              }}
            >
              {favoritedPractices.length}{" "}
              {favoritedPractices.length === 1 ? "class" : "classes"}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
              {favoritedPractices.map((practice) => (
                <TouchableOpacity
                  key={practice.id}
                  onPress={() => handlePracticePress(practice)}
                  style={{ width: "calc(50% - 8px)" }}
                >
                  <View
                    style={{
                      backgroundColor: "#D4A574",
                      borderRadius: 20,
                      height: 180,
                      overflow: "hidden",
                      marginBottom: 12,
                    }}
                  >
                    <Image
                      source={{ uri: practice.image }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                      transition={100}
                    />
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite(practice.id);
                      }}
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: "rgba(255,255,255,0.9)",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Heart color="#C9B891" size={18} fill="#C9B891" />
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
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
