import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Share,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Play,
  Heart,
  Share2,
  Plus,
  X,
  Pause,
  Maximize,
} from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { useState, useRef, useEffect } from "react";
import * as Linking from "expo-linking";
import { useUser } from "@/utils/auth/useUser";
import { useAuth } from "@/utils/auth/useAuth";

const { width } = Dimensions.get("window");

export default function PracticeDetailPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useUser();
  const { signUp } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const videoRef = useRef(null);
  const [favorites, setFavorites] = useState([]);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  // Get params or use defaults
  const practiceId = params.id || "morning-vitality-flow";
  const title = params.title || "Morning Vitality Flow";
  const duration = params.duration || "20 mins";
  const level = params.level || "Intermediate";
  const category = params.category || "Vinyasa";
  const image =
    params.image ||
    "https://ucarecdn.com/a7046044-d8e0-4cd1-bd50-70a259459ec8/-/format/auto/";

  // Sample yoga video URL - using a public domain video
  const videoSource =
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  // Create video player
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  // Track video time and duration
  useEffect(() => {
    const interval = setInterval(() => {
      if (player) {
        setCurrentTime(player.currentTime || 0);
        setVideoDuration(player.duration || 0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player]);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (showControls && isPlaying) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [showControls, isPlaying]);

  // Temporary userId
  const userId = "user-123";

  // Up Next videos
  const upNextVideos = [
    {
      id: "deep-stretch-relax",
      title: "Deep Stretch & Relax",
      duration: "30 mins",
      category: "Hatha",
      level: "Beginner",
      image:
        "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=200&h=200&fit=crop",
    },
    {
      id: "evening-zen-meditation",
      title: "Evening Zen Meditation",
      duration: "15 mins",
      category: "Meditation",
      level: "Beginner",
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop",
    },
  ];

  // Format time in mm:ss
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePlayPause = () => {
    // Check if user is authenticated before playing
    if (!user) {
      signUp();
      return;
    }

    // Navigate to the video player instead of playing inline
    router.push({
      pathname: "/video-player",
      params: {
        videoId: practiceId,
        videoTitle: title,
        videoImage: image,
        timestamp: "0", // Start from beginning
      },
    });
  };

  const handleSeek = (percentage) => {
    if (videoDuration > 0) {
      player.currentTime = videoDuration * percentage;
    }
  };

  const enterFullscreen = async () => {
    if (videoRef.current) {
      await videoRef.current.enterFullscreen();
    }
  };

  const handleClose = () => {
    // Stop the video
    player.pause();
    // Navigate back to home
    router.push("/(tabs)");
  };

  const handleShare = async () => {
    try {
      // Create a deep link to this practice
      const deepLink = Linking.createURL("practice-detail", {
        queryParams: {
          id: practiceId,
          title: title,
          duration: duration,
          level: level,
          category: category,
          image: image,
        },
      });

      await Share.share({
        message: `Check out this yoga practice: ${title}\n\n${category} • ${duration} • ${level}\n\nJoin me on this wellness journey! 🧘‍♀️\n\n${deepLink}`,
        title: title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Fetch favorites on mount
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

  const toggleFavorite = async () => {
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

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F0" }}>
      <StatusBar style="light" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Video Player */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowControls(!showControls)}
          style={{
            height: 400,
            backgroundColor: "#1A1A1A",
            position: "relative",
          }}
        >
          <VideoView
            ref={videoRef}
            player={player}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            nativeControls={false}
            allowsFullscreen
            allowsPictureInPicture
            allowsVideoFrameAnalysis={false}
            requiresLinearPlayback={true}
          />

          {/* Large Play Button (only when paused and controls visible) */}
          {!isPlaying && showControls && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.3)",
              }}
            >
              <TouchableOpacity
                onPress={togglePlayPause}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: "rgba(255,255,255,0.95)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Play color="#2C2C2C" size={32} fill="#2C2C2C" />
              </TouchableOpacity>
            </View>
          )}

          {/* Header Overlay */}
          {showControls && (
            <View
              style={{
                position: "absolute",
                top: insets.top + 16,
                left: 0,
                right: 0,
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 20,
              }}
            >
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ArrowLeft color="#FFFFFF" size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleClose}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <X color="#FFFFFF" size={20} />
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={handleShare}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Share2 color="#FFFFFF" size={18} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={toggleFavorite}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Heart
                    color="#FFFFFF"
                    size={18}
                    fill={
                      favorites.includes(practiceId) ? "#FFFFFF" : "transparent"
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Bottom Controls Bar */}
          {showControls && (
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: "rgba(0,0,0,0.7)",
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              {/* Seek Bar */}
              <TouchableOpacity
                activeOpacity={1}
                onPress={(e) => {
                  const locationX = e.nativeEvent.locationX;
                  const barWidth = width - 32;
                  const percentage = locationX / barWidth;
                  handleSeek(percentage);
                }}
                style={{
                  height: 4,
                  backgroundColor: "rgba(255,255,255,0.3)",
                  borderRadius: 2,
                  marginBottom: 12,
                  position: "relative",
                }}
              >
                {/* Progress */}
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: 4,
                    width: `${videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0}%`,
                    backgroundColor: "#C9B891",
                    borderRadius: 2,
                  }}
                />
                {/* Scrubber */}
                <View
                  style={{
                    position: "absolute",
                    left: `${videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0}%`,
                    top: -4,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#C9B891",
                    transform: [{ translateX: -6 }],
                  }}
                />
              </TouchableOpacity>

              {/* Controls Row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {/* Play/Pause & Time */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <TouchableOpacity
                    onPress={togglePlayPause}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "rgba(255,255,255,0.2)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {isPlaying ? (
                      <Pause color="#FFFFFF" size={18} fill="#FFFFFF" />
                    ) : (
                      <Play color="#FFFFFF" size={18} fill="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 13,
                      fontWeight: "500",
                    }}
                  >
                    {formatTime(currentTime)} / {formatTime(videoDuration)}
                  </Text>
                </View>

                {/* Fullscreen Button */}
                <TouchableOpacity
                  onPress={enterFullscreen}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Maximize color="#FFFFFF" size={18} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Class Info */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <View
            style={{
              backgroundColor: "rgba(201, 184, 145, 0.2)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              alignSelf: "flex-start",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#6B5D52",
                letterSpacing: 1,
              }}
            >
              {category.toUpperCase()}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 32,
              fontWeight: "700",
              color: "#2C2C2C",
              marginBottom: 8,
              lineHeight: 38,
            }}
          >
            {title}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              marginTop: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 15, color: "#6B6B6B" }}>
                ⏱️ {duration}
              </Text>
            </View>
            <View
              style={{ width: 1, height: 12, backgroundColor: "#D0D0D0" }}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 15, color: "#6B6B6B" }}>📊 {level}</Text>
            </View>
            <View
              style={{ width: 1, height: 12, backgroundColor: "#D0D0D0" }}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 15, color: "#6B6B6B" }}>🔥 240 cal</Text>
            </View>
          </View>

          <Text
            style={{
              fontSize: 16,
              color: "#6B6B6B",
              marginTop: 20,
              lineHeight: 24,
            }}
          >
            Start your day with renewed energy. This flowing sequence combines
            breath work with dynamic postures to awaken your body and mind.
            Perfect for morning practice.
          </Text>
        </View>

        {/* Instructor Info */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 28,
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: "#4A6B6B",
              overflow: "hidden",
            }}
          >
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=10" }}
              style={{ width: "100%", height: "100%" }}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{ fontSize: 18, fontWeight: "600", color: "#2C2C2C" }}
              >
                Instructor Marcus
              </Text>
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: "#C9B891",
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 6,
                }}
              >
                <Text style={{ fontSize: 10, color: "#FFFFFF" }}>✓</Text>
              </View>
            </View>
            <Text style={{ fontSize: 14, color: "#9B9B9B", marginTop: 2 }}>
              Certified Vinyasa Teacher
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsFollowing(!isFollowing)}
            style={{
              backgroundColor: isFollowing ? "#F5F5F0" : "#C9B891",
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: isFollowing ? 1 : 0,
              borderColor: "#C9B891",
            }}
          >
            {!isFollowing && (
              <Plus color="#2C2C2C" size={16} style={{ marginRight: 4 }} />
            )}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#2C2C2C",
              }}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Share Your Energy */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#C9B891",
              borderRadius: 20,
              padding: 20,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#2C2C2C",
                marginBottom: 4,
              }}
            >
              ✨ Share your energy
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B5D52",
              }}
            >
              Post to community after your practice
            </Text>
          </TouchableOpacity>
        </View>

        {/* Up Next */}
        <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: "#2C2C2C",
              marginBottom: 16,
            }}
          >
            Up Next
          </Text>

          <View style={{ gap: 16 }}>
            {upNextVideos.map((video) => (
              <TouchableOpacity
                key={video.id}
                onPress={() =>
                  router.push({
                    pathname: "/practice-detail",
                    params: {
                      id: video.id,
                      title: video.title,
                      duration: video.duration,
                      level: video.level,
                      category: video.category,
                      image: video.image,
                    },
                  })
                }
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Image
                  source={{
                    uri: video.image,
                  }}
                  style={{ width: 80, height: 80, borderRadius: 16 }}
                />
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#2C2C2C",
                      marginBottom: 4,
                    }}
                  >
                    {video.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#9B9B9B",
                    }}
                  >
                    {video.duration} • {video.category}
                  </Text>
                </View>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "#F5F5F0",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Play color="#2C2C2C" size={16} fill="#2C2C2C" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
