import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useState, useEffect, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Calendar, MapPin, Star, Bell } from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";

export default function EventsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [bookedEventIds, setBookedEventIds] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userId = "user123"; // Replace with actual user ID from auth

  const events = [
    {
      id: 1,
      title: "Sunset Yoga on the Beach",
      price: "$25.00",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      rating: 4.8,
      date: "Sat, Mar 30 • 6:00 PM",
      location: "Santa Monica Beach, CA",
    },
    {
      id: 2,
      title: "Morning Meditation Workshop",
      price: "Free",
      image:
        "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&h=600&fit=crop",
      rating: 4.9,
      date: "Sun, Mar 31 • 8:00 AM",
      location: "Zen Garden Studio",
    },
    {
      id: 3,
      title: "Power Vinyasa Flow Class",
      price: "$30.00",
      image:
        "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&h=600&fit=crop",
      rating: 4.7,
      date: "Mon, Apr 1 • 7:00 PM",
      location: "Flow Yoga Studio",
    },
    {
      id: 4,
      title: "Wellness & Mindfulness Retreat",
      price: "$150.00",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      rating: 5.0,
      date: "Sat, Apr 6 • 9:00 AM",
      location: "Mountain View Retreat",
    },
  ];

  useFocusEffect(
    useCallback(() => {
      fetchBookedEvents();
      fetchUnreadCount();
    }, []),
  );

  // Refresh unread count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchBookedEvents = async () => {
    try {
      const response = await fetch("/api/events/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setBookedEventIds(data.bookedEventIds);
      }
    } catch (error) {
      console.error("Error fetching booked events:", error);
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

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F0" }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "#F5F5F0",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ width: 32 }} />
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#2C2C2C",
            textAlign: "center",
          }}
        >
          Upcoming Events
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

      {/* Events List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {events.map((event) => (
          <View
            key={event.id}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              marginBottom: 20,
              overflow: "hidden",
            }}
          >
            {/* Event Image */}
            <View style={{ position: "relative" }}>
              <Image
                source={{ uri: event.image }}
                style={{ width: "100%", height: 200 }}
                contentFit="cover"
              />
              {/* Price Tag */}
              <View
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  backgroundColor:
                    event.price === "Free" ? "#C9B891" : "#2C2C2C",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#FFFFFF",
                  }}
                >
                  {event.price}
                </Text>
              </View>
              {/* Booked Badge */}
              {bookedEventIds.includes(event.id.toString()) && (
                <View
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    backgroundColor: "#C9B891",
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#FFFFFF",
                    }}
                  >
                    Booked
                  </Text>
                </View>
              )}
            </View>

            {/* Event Details */}
            <View style={{ padding: 16 }}>
              {/* Title and Rating */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#2C2C2C",
                    flex: 1,
                    marginRight: 12,
                  }}
                >
                  {event.title}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Star size={16} color="#FFB800" fill="#FFB800" />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#2C2C2C",
                    }}
                  >
                    {event.rating}
                  </Text>
                </View>
              </View>

              {/* Date */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <Calendar size={16} color="#6B6B6B" />
                <Text
                  style={{
                    fontSize: 14,
                    color: "#6B6B6B",
                  }}
                >
                  {event.date}
                </Text>
              </View>

              {/* Location */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <MapPin size={16} color="#6B6B6B" />
                <Text
                  style={{
                    fontSize: 14,
                    color: "#6B6B6B",
                  }}
                >
                  {event.location}
                </Text>
              </View>

              {/* View Details Button */}
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: "/event-detail",
                    params: {
                      id: event.id,
                      title: event.title,
                      price: event.price,
                      image: event.image,
                      rating: event.rating,
                      date: event.date,
                      location: event.location,
                    },
                  });
                }}
                style={{
                  backgroundColor: "#C9B891",
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  View Details
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
