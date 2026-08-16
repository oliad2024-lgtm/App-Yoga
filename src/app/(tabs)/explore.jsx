import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  PanResponder,
} from "react-native";
import { Image } from "expo-image";
import { useState, useRef, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Search, SlidersHorizontal, Heart, Bell, X } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function ExplorePage() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTimeRange, setSelectedTimeRange] = useState(null); // null means "All"
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Filter states
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [minDuration, setMinDuration] = useState(0); // in minutes
  const [maxDuration, setMaxDuration] = useState(60); // in minutes
  const [sortBy, setSortBy] = useState("newest"); // newest, duration-asc, duration-desc, difficulty

  // Favorites state
  const [favorites, setFavorites] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = "user-123"; // Temporary userId
  const router = useRouter();

  // Fetch classes and favorites on mount
  useEffect(() => {
    fetchClasses();
    fetchFavorites();
    fetchUnreadCount();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchClasses();
  }, [selectedCategory, minDuration, maxDuration, sortBy, searchQuery]);

  // Refresh unread count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      let url = `/api/practices/list?sortBy=${sortBy}`;

      if (selectedCategory && selectedCategory !== "All") {
        url += `&category=${selectedCategory}`;
      }

      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      if (minDuration > 0) {
        url += `&minDuration=${minDuration}`;
      }

      if (maxDuration < 60) {
        url += `&maxDuration=${maxDuration}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch practices: ${response.status}`);
      }
      const data = await response.json();

      // Map practices to class format
      const mappedClasses = (data.practices || []).map((practice) => ({
        id: practice.id,
        practiceId: practice.id,
        title: practice.title,
        duration: practice.duration,
        durationNum: practice.duration_minutes,
        difficulty: practice.level.toUpperCase(),
        category: practice.category,
        dateAdded: new Date(practice.created_at),
        image: practice.image,
      }));

      setClasses(mappedClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
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

  const categories = ["All", "Vinyasa", "Hatha", "Power"];
  const difficulties = ["EASY", "MEDIUM", "HARD"];

  const timeRanges = [
    { label: "~15", min: 0, max: 15 },
    { label: "15-30", min: 15, max: 30 },
    { label: "30-45", min: 30, max: 45 },
    { label: "45+", min: 45, max: 999 },
  ];

  const toggleDifficulty = (difficulty) => {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty)
        ? prev.filter((d) => d !== difficulty)
        : [...prev, difficulty],
    );
  };

  const clearFilters = () => {
    setSelectedDifficulties([]);
    setMinDuration(0);
    setMaxDuration(60);
    setSortBy("newest");
  };

  // Filter classes by difficulty and time range (client-side only for these)
  let filteredClasses = classes.filter((classItem) => {
    const matchesDifficulty =
      selectedDifficulties.length === 0 ||
      selectedDifficulties.includes(classItem.difficulty);

    // Time range filter
    let matchesTimeRange = true;
    if (selectedTimeRange) {
      matchesTimeRange =
        classItem.durationNum >= selectedTimeRange.min &&
        classItem.durationNum <= selectedTimeRange.max;
    }

    return matchesDifficulty && matchesTimeRange;
  });

  const activeFilterCount =
    (selectedDifficulties.length > 0 ? 1 : 0) +
    (minDuration > 0 || maxDuration < 60 ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

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
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
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
              fontSize: 24,
              fontWeight: "700",
              color: "#2C2C2C",
              position: "absolute",
              left: 0,
              right: 0,
              textAlign: "center",
            }}
          >
            Explore
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

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <Search color="#9B9B9B" size={20} />
            <TextInput
              placeholder="Search classes, teachers..."
              placeholderTextColor="#9B9B9B"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 15,
                color: "#2C2C2C",
              }}
            />
          </View>
          <TouchableOpacity
            onPress={() => setFilterModalVisible(true)}
            style={{
              backgroundColor: activeFilterCount > 0 ? "#C9B891" : "#FFFFFF",
              padding: 12,
              borderRadius: 16,
              position: "relative",
            }}
          >
            <SlidersHorizontal
              color={activeFilterCount > 0 ? "#FFFFFF" : "#2C2C2C"}
              size={20}
            />
            {activeFilterCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  backgroundColor: "#2C2C2C",
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "700" }}
                >
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginTop: 8 }}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={{
              backgroundColor:
                selectedCategory === category ? "#C9B891" : "#FFFFFF",
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 20,
              marginRight: 12,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: selectedCategory === category ? "600" : "500",
                color: selectedCategory === category ? "#2C2C2C" : "#6B6B6B",
              }}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Browse by time */}
      <View
        style={{
          paddingHorizontal: 20,
          marginTop: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#2C2C2C",
            }}
          >
            Browse by time
          </Text>
          {selectedTimeRange && (
            <TouchableOpacity
              onPress={() => setSelectedTimeRange(null)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                backgroundColor: "#FFFFFF",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#C9B891",
                }}
              >
                Clear
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range.label}
              onPress={() =>
                setSelectedTimeRange(selectedTimeRange === range ? null : range)
              }
              style={{
                backgroundColor:
                  selectedTimeRange === range ? "#C9B891" : "#FFFFFF",
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: selectedTimeRange === range ? "600" : "500",
                  color: selectedTimeRange === range ? "#FFFFFF" : "#6B6B6B",
                }}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Classes Grid */}
      <ScrollView
        style={{ flex: 1, marginTop: 24 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredClasses.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 60,
            }}
          >
            <Text
              style={{ fontSize: 16, color: "#9B9B9B", textAlign: "center" }}
            >
              No classes found
            </Text>
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            {filteredClasses.map((classItem, index) => (
              <TouchableOpacity
                key={classItem.id}
                style={{
                  width: index % 3 === 2 ? "100%" : "calc(50% - 8px)",
                  marginBottom: 16,
                }}
                onPress={() =>
                  router.push({
                    pathname: "/practice-detail",
                    params: {
                      id: classItem.practiceId,
                      title: classItem.title,
                      duration: classItem.duration,
                      level: classItem.difficulty,
                      category: classItem.category,
                      image: classItem.image,
                    },
                  })
                }
              >
                <View
                  style={{
                    backgroundColor: "#D4C4B0",
                    borderRadius: 20,
                    height: index % 3 === 2 ? 180 : 240,
                    overflow: "hidden",
                    marginBottom: 12,
                  }}
                >
                  <Image
                    source={{ uri: classItem.image }}
                    style={{ width: "100%", height: "100%" }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      bottom: 12,
                      left: 12,
                      backgroundColor: "rgba(255,255,255,0.95)",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: "#2C2C2C",
                        letterSpacing: 0.5,
                      }}
                    >
                      {classItem.difficulty}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleFavorite(classItem.practiceId);
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
                      size={16}
                      fill={
                        favorites.includes(classItem.practiceId)
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
                  {classItem.title}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 13, color: "#9B9B9B" }}>
                    ⏱️ {classItem.duration}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#F5F5F0",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 24,
              paddingBottom: insets.bottom + 24,
              maxHeight: "80%",
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 24,
                marginBottom: 24,
              }}
            >
              <Text
                style={{ fontSize: 22, fontWeight: "700", color: "#2C2C2C" }}
              >
                Filters & Sort
              </Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <X color="#2C2C2C" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 24 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Difficulty Filter */}
              <View style={{ marginBottom: 32 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#2C2C2C",
                    marginBottom: 12,
                  }}
                >
                  Difficulty
                </Text>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {difficulties.map((difficulty) => (
                    <TouchableOpacity
                      key={difficulty}
                      onPress={() => toggleDifficulty(difficulty)}
                      style={{
                        flex: 1,
                        backgroundColor: selectedDifficulties.includes(
                          difficulty,
                        )
                          ? "#C9B891"
                          : "#FFFFFF",
                        paddingVertical: 14,
                        borderRadius: 16,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: selectedDifficulties.includes(difficulty)
                            ? "#FFFFFF"
                            : "#6B6B6B",
                        }}
                      >
                        {difficulty}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Duration Range Slider */}
              <View style={{ marginBottom: 32 }}>
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
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#2C2C2C",
                    }}
                  >
                    Duration Range
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#C9B891",
                    }}
                  >
                    {minDuration} - {maxDuration} min
                  </Text>
                </View>

                <DurationSlider
                  min={minDuration}
                  max={maxDuration}
                  onMinChange={setMinDuration}
                  onMaxChange={setMaxDuration}
                />
              </View>

              {/* Sort Options */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#2C2C2C",
                    marginBottom: 12,
                  }}
                >
                  Sort By
                </Text>
                <View style={{ gap: 12 }}>
                  {[
                    { value: "newest", label: "Newest First" },
                    { value: "duration-asc", label: "Shortest First" },
                    { value: "duration-desc", label: "Longest First" },
                    { value: "difficulty", label: "Easiest First" },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setSortBy(option.value)}
                      style={{
                        backgroundColor:
                          sortBy === option.value ? "#C9B891" : "#FFFFFF",
                        paddingVertical: 16,
                        paddingHorizontal: 20,
                        borderRadius: 16,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color:
                            sortBy === option.value ? "#FFFFFF" : "#6B6B6B",
                        }}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                paddingHorizontal: 24,
                paddingTop: 24,
              }}
            >
              <TouchableOpacity
                onPress={clearFilters}
                style={{
                  flex: 1,
                  backgroundColor: "#FFFFFF",
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#6B6B6B" }}
                >
                  Clear All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={{
                  flex: 1,
                  backgroundColor: "#C9B891",
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}
                >
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Duration Slider Component
function DurationSlider({ min, max, onMinChange, onMaxChange }) {
  const [sliderWidth, setSliderWidth] = useState(0);
  const minValueRef = useRef(min);
  const maxValueRef = useRef(max);

  const MIN_VALUE = 0;
  const MAX_VALUE = 60;

  const valueToPosition = (value) => {
    return ((value - MIN_VALUE) / (MAX_VALUE - MIN_VALUE)) * sliderWidth;
  };

  const positionToValue = (position) => {
    const value = Math.round(
      (position / sliderWidth) * (MAX_VALUE - MIN_VALUE) + MIN_VALUE,
    );
    return Math.max(MIN_VALUE, Math.min(MAX_VALUE, value));
  };

  const minPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, gestureState) => {
        if (sliderWidth === 0) return;
        const newValue = positionToValue(
          valueToPosition(min) + gestureState.dx,
        );
        if (newValue < max - 5) {
          minValueRef.current = newValue;
          onMinChange(newValue);
        }
      },
    }),
  ).current;

  const maxPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, gestureState) => {
        if (sliderWidth === 0) return;
        const newValue = positionToValue(
          valueToPosition(max) + gestureState.dx,
        );
        if (newValue > min + 5) {
          maxValueRef.current = newValue;
          onMaxChange(newValue);
        }
      },
    }),
  ).current;

  const minPosition = valueToPosition(min);
  const maxPosition = valueToPosition(max);

  return (
    <View style={{ paddingVertical: 20 }}>
      <View
        onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
        style={{
          height: 6,
          backgroundColor: "#E5E5E0",
          borderRadius: 3,
          position: "relative",
        }}
      >
        {/* Active range */}
        <View
          style={{
            position: "absolute",
            left: minPosition,
            width: maxPosition - minPosition,
            height: 6,
            backgroundColor: "#C9B891",
            borderRadius: 3,
          }}
        />

        {/* Min handle */}
        <View
          {...minPanResponder.panHandlers}
          style={{
            position: "absolute",
            left: minPosition - 16,
            top: -11,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: "#FFFFFF",
            borderWidth: 3,
            borderColor: "#C9B891",
            justifyContent: "center",
            alignItems: "center",
          }}
        />

        {/* Max handle */}
        <View
          {...maxPanResponder.panHandlers}
          style={{
            position: "absolute",
            left: maxPosition - 16,
            top: -11,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: "#FFFFFF",
            borderWidth: 3,
            borderColor: "#C9B891",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </View>

      {/* Value labels */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 12,
        }}
      >
        <Text style={{ fontSize: 12, color: "#9B9B9B" }}>0 min</Text>
        <Text style={{ fontSize: 12, color: "#9B9B9B" }}>60 min</Text>
      </View>
    </View>
  );
}
