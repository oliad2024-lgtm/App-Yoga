import { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { Clock, Play, Heart } from "lucide-react-native";
import { useRouter } from "expo-router";
import TabHeader from "@/components/TabHeader";

export default function HomePage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [continueProgress, setContinueProgress] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Temporary userId - replace with actual user authentication
  const userId = "user-123";

  // Filter courses based on selected category
  const filteredCourses =
    selectedCategory === "All"
      ? allCourses
      : allCourses.filter((course) => course.category === selectedCategory);

  // Fetch practices, favorites, and progress on mount
  useEffect(() => {
    fetchPractices();
    fetchFavorites();
    fetchContinueProgress();
  }, []);

  const fetchPractices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/practices/list");
      if (!response.ok) {
        throw new Error(`Failed to fetch practices: ${response.status}`);
      }
      const data = await response.json();
      // Limit to first 4 for homepage
      setAllCourses((data.practices || []).slice(0, 4));
    } catch (error) {
      console.error("Error fetching practices:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContinueProgress = async () => {
    try {
      const response = await fetch(
        `/api/video-progress/get-latest?userId=${userId}`,
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch video progress: ${response.status}`);
      }
      const data = await response.json();
      setContinueProgress(data.progress);
    } catch (error) {
      console.error("Error fetching video progress:", error);
    }
  };

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F0" }}>
      <StatusBar style="dark" />

      {/* Header */}
      <TabHeader title="Retreat Wanderlust" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Practice of the Day Hero */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <View
            style={{
              backgroundColor: "#6B5D52",
              borderRadius: 24,
              overflow: "hidden",
              height: 380,
            }}
          >
            <Image
              source={{
                uri: "https://ucarecdn.com/b4f4ad2b-b783-4b63-a0c7-43af6aa49216/-/format/auto/",
              }}
              style={{ width: "100%", height: "100%", position: "absolute" }}
              contentFit="cover"
              transition={100}
            />
            <View
              style={{
                flex: 1,
                padding: 24,
                justifyContent: "space-between",
                backgroundColor: "rgba(0,0,0,0.25)",
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#FFFFFF",
                    letterSpacing: 2,
                    marginBottom: 12,
                    opacity: 0.95,
                    fontWeight: "600",
                  }}
                >
                  PRACTICE OF THE DAY
                </Text>
                <Text
                  style={{
                    fontSize: 34,
                    fontWeight: "700",
                    color: "#FFFFFF",
                    marginBottom: 16,
                    lineHeight: 40,
                  }}
                >
                  Morning Vitality Flow
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Clock color="#FFFFFF" size={18} />
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#FFFFFF",
                      marginLeft: 8,
                      opacity: 0.95,
                    }}
                  >
                    20 min • Start your day with energy
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/practice-detail")}
                style={{
                  backgroundColor: "#C9B891",
                  paddingVertical: 18,
                  paddingHorizontal: 36,
                  borderRadius: 30,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "600",
                    color: "#2C2C2C",
                  }}
                >
                  Start Now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Continue Practice */}
        {continueProgress && (
          <View style={{ paddingHorizontal: 20, marginTop: 36 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: "#2C2C2C",
                marginBottom: 20,
              }}
            >
              Continue Practice
            </Text>

            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Image
                source={{
                  uri:
                    continueProgress.video_image ||
                    "https://ucarecdn.com/6357d7c7-8ff9-4915-90b8-961458ce47b0/-/format/auto/",
                }}
                style={{ width: 80, height: 80, borderRadius: 16 }}
                contentFit="cover"
                transition={100}
              />
              <View style={{ flex: 1, marginLeft: 16, marginRight: 12 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#2C2C2C",
                    marginBottom: 6,
                  }}
                >
                  {continueProgress.video_title}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#9B9B9B",
                    marginBottom: 10,
                  }}
                >
                  {Math.round(
                    (continueProgress.current_time_seconds /
                      continueProgress.video_duration) *
                      100,
                  )}
                  % complete •{" "}
                  {formatTime(
                    continueProgress.video_duration -
                      continueProgress.current_time_seconds,
                  )}{" "}
                  left
                </Text>
                <View
                  style={{
                    height: 6,
                    backgroundColor: "#F0F0F0",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${
                        (continueProgress.current_time_seconds /
                          continueProgress.video_duration) *
                        100
                      }%`,
                      height: "100%",
                      backgroundColor: "#C9B891",
                    }}
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: "/video-player",
                    params: {
                      videoId: continueProgress.video_id,
                      videoTitle: continueProgress.video_title,
                      videoImage: continueProgress.video_image,
                      timestamp: continueProgress.current_time_seconds,
                    },
                  });
                }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#C9B891",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Play color="#2C2C2C" size={20} fill="#2C2C2C" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Category Pills - Moved below Continue Practice */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 28, flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory("All")}
            style={{
              backgroundColor:
                selectedCategory === "All" ? "#C9B891" : "#FFFFFF",
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 24,
              marginRight: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: selectedCategory === "All" ? "600" : "500",
                color: selectedCategory === "All" ? "#2C2C2C" : "#6B6B6B",
              }}
            >
              🍃 All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedCategory("Hatha")}
            style={{
              backgroundColor:
                selectedCategory === "Hatha" ? "#C9B891" : "#FFFFFF",
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 24,
              marginRight: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: selectedCategory === "Hatha" ? "600" : "500",
                color: selectedCategory === "Hatha" ? "#2C2C2C" : "#6B6B6B",
              }}
            >
              🧘 Hatha
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedCategory("Vinyasa")}
            style={{
              backgroundColor:
                selectedCategory === "Vinyasa" ? "#C9B891" : "#FFFFFF",
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 24,
              marginRight: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: selectedCategory === "Vinyasa" ? "600" : "500",
                color: selectedCategory === "Vinyasa" ? "#2C2C2C" : "#6B6B6B",
              }}
            >
              🌊 Vinyasa
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Recommended For You */}
        <View style={{ paddingHorizontal: 20, marginTop: 36 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: "#2C2C2C",
              }}
            >
              Recommended For You
            </Text>
            <TouchableOpacity onPress={() => router.push("/explore")}>
              <Text
                style={{
                  fontSize: 15,
                  color: "#C9B891",
                  fontWeight: "500",
                }}
              >
                See all
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
            {filteredCourses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={{ width: "47%" }}
                onPress={() =>
                  router.push({
                    pathname: "/practice-detail",
                    params: {
                      id: course.id,
                      title: course.title,
                      duration: course.duration,
                      level: course.level,
                      category: course.category,
                      image: course.image,
                    },
                  })
                }
              >
                <View
                  style={{
                    backgroundColor: "#D4A574",
                    borderRadius: 20,
                    height: 220,
                    overflow: "hidden",
                    marginBottom: 12,
                  }}
                >
                  <Image
                    source={{ uri: course.image }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    transition={100}
                  />
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleFavorite(course.id);
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
                    <Heart
                      color="#C9B891"
                      size={18}
                      fill={
                        favorites.includes(course.id)
                          ? "#C9B891"
                          : "transparent"
                      }
                    />
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
                  {course.title}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#9B9B9B",
                  }}
                >
                  {course.duration} • {course.level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
