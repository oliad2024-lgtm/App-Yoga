import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { useState, useRef, useEffect } from "react";

export default function VideoPlayer() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressInterval = useRef(null);
  const hasSeekdToStart = useRef(false);

  const videoId = params.videoId || "forest-flow-series";
  const videoTitle = params.videoTitle || "Forest Flow Series";
  const videoImage =
    params.videoImage ||
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop";
  const startTime = parseFloat(params.timestamp || "0");

  // Use a placeholder video URL - replace with actual video URL
  const videoUrl =
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  const userId = "user-123"; // Replace with actual user ID from auth

  // Create video player
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
    player.muted = false;
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  // Track video time
  useEffect(() => {
    const interval = setInterval(() => {
      if (player) {
        setCurrentTime(player.currentTime || 0);
        setDuration(player.duration || 0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player]);

  // Seek to start time once duration is loaded
  useEffect(() => {
    if (player && duration > 0 && startTime > 0 && !hasSeekdToStart.current) {
      player.currentTime = startTime;
      hasSeekdToStart.current = true;
      player.play();
    }
  }, [player, duration, startTime]);

  useEffect(() => {
    // Save progress every 5 seconds while playing
    if (isPlaying && currentTime > 0) {
      progressInterval.current = setInterval(() => {
        saveProgress();
      }, 5000);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, currentTime]);

  const saveProgress = async () => {
    if (currentTime === 0 || duration === 0) return;

    try {
      const response = await fetch("/api/video-progress/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          videoId,
          videoTitle,
          videoImage,
          videoDuration: Math.floor(duration),
          currentTime: Math.floor(currentTime),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save progress: ${response.status}`);
      }
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const skipBackward = () => {
    if (player) {
      player.currentTime = Math.max(0, currentTime - 10);
    }
  };

  const skipForward = () => {
    if (player) {
      player.currentTime = Math.min(duration, currentTime + 10);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleBack = async () => {
    await saveProgress();
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <StatusBar style="light" />

      {/* Back Button */}
      <TouchableOpacity
        onPress={handleBack}
        style={{
          position: "absolute",
          top: insets.top + 16,
          left: 20,
          zIndex: 10,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ArrowLeft color="#FFFFFF" size={24} />
      </TouchableOpacity>

      {/* Video */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <VideoView
          player={player}
          style={{
            width: Dimensions.get("window").width,
            height: 300,
          }}
          contentFit="contain"
          nativeControls={false}
          allowsFullscreen
          allowsPictureInPicture
        />
      </View>

      {/* Controls */}
      <View
        style={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
        }}
      >
        {/* Title */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#FFFFFF",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          {videoTitle}
        </Text>

        {/* Progress Bar */}
        <View style={{ marginBottom: 12 }}>
          <View
            style={{
              height: 4,
              backgroundColor: "rgba(255,255,255,0.3)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                height: "100%",
                backgroundColor: "#C9B891",
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <Text style={{ fontSize: 12, color: "#FFFFFF", opacity: 0.7 }}>
              {formatTime(currentTime)}
            </Text>
            <Text style={{ fontSize: 12, color: "#FFFFFF", opacity: 0.7 }}>
              {formatTime(duration)}
            </Text>
          </View>
        </View>

        {/* Playback Controls */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 32,
            marginTop: 20,
          }}
        >
          <TouchableOpacity
            onPress={skipBackward}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: "rgba(255,255,255,0.2)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <SkipBack color="#FFFFFF" size={24} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlayPause}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: "#C9B891",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {isPlaying ? (
              <Pause color="#2C2C2C" size={32} fill="#2C2C2C" />
            ) : (
              <Play color="#2C2C2C" size={32} fill="#2C2C2C" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={skipForward}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: "rgba(255,255,255,0.2)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <SkipForward color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
