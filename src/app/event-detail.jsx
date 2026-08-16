import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Share2,
  Calendar,
  MapPin,
  Users,
  Check,
} from "lucide-react-native";
import Toast from "@/components/Toast";

export default function EventDetailPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isBooked, setIsBooked] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Parse event data from params
  const event = {
    id: params.id,
    title: params.title || "Event Title",
    price: params.price || "$25.00",
    image: params.image || "",
    rating: params.rating || "4.8",
    date: params.date || "Monday, Oct 28 • 7:00 PM - 8:30 PM",
    location: params.location || "Event Location",
    category: "WELLNESS RETREAT",
    description:
      "Join us for an enchanting evening of yoga under the full moon. This special vinyasa flow class combines fluid movements with breathwork, designed to help you connect with the lunar energy and find inner peace. Perfect for all levels.",
    attendees: 10,
    totalSpots: 15,
    hostName: "Sarah Jenkins",
    hostImage: "https://i.pravatar.cc/150?img=5",
  };

  // Check if event is already booked
  useEffect(() => {
    checkBookingStatus();
  }, []);

  const checkBookingStatus = async () => {
    try {
      const userId = "user123"; // Replace with actual user ID from auth
      const response = await fetch("/api/events/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsBooked(data.bookedEventIds.includes(event.id.toString()));
      }
    } catch (error) {
      console.error("Error checking booking status:", error);
    }
  };

  const handleBooking = async () => {
    if (isBooked) {
      // Unbook
      try {
        const userId = "user123"; // Replace with actual user ID from auth
        const response = await fetch("/api/events/unbook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, eventId: event.id.toString() }),
        });

        if (response.ok) {
          setIsBooked(false);
          setToastMessage("Booking Cancelled");
          setToastVisible(true);
        }
      } catch (error) {
        console.error("Error unbooking event:", error);
      }
    } else {
      // Book
      try {
        const userId = "user123"; // Replace with actual user ID from auth
        const response = await fetch("/api/events/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, eventId: event.id.toString() }),
        });

        if (response.ok) {
          setIsBooked(true);
        }
      } catch (error) {
        console.error("Error booking event:", error);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="light" />
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Header Image */}
        <View style={{ position: "relative", height: 400 }}>
          <Image
            source={{ uri: event.image }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />

          {/* Back and Share Buttons */}
          <View
            style={{
              position: "absolute",
              top: insets.top + 12,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowLeft size={24} color="#2C2C2C" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Share2 size={20} color="#2C2C2C" />
            </TouchableOpacity>
          </View>

          {/* Event Info Card Overlay */}
          <View
            style={{
              position: "absolute",
              bottom: -60,
              left: 20,
              right: 20,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            {/* Category */}
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#C9B891",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: "#FFFFFF",
                  letterSpacing: 1,
                }}
              >
                {event.category}
              </Text>
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: "#2C2C2C",
                marginBottom: 16,
              }}
            >
              {event.title}
            </Text>

            {/* Date */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <Calendar size={18} color="#6B6B6B" />
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
                gap: 10,
              }}
            >
              <MapPin size={18} color="#6B6B6B" />
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B6B6B",
                }}
              >
                {event.location}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={{ marginTop: 80, paddingHorizontal: 20 }}>
          {/* About the Event */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#2C2C2C",
                marginBottom: 12,
              }}
            >
              About the Event
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: "#6B6B6B",
                lineHeight: 24,
              }}
            >
              {event.description}
            </Text>
          </View>

          {/* Spots Filled */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#2C2C2C",
                marginBottom: 16,
              }}
            >
              Spots Filled
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#2C2C2C",
              }}
            >
              10/15
            </Text>
          </View>

          {/* Hosted by */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#2C2C2C",
                marginBottom: 16,
              }}
            >
              Hosted by
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Image
                  source={{ uri: event.hostImage }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                  }}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#2C2C2C",
                  }}
                >
                  {event.hostName}
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#C9B891",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#C9B891",
                  }}
                >
                  Follow
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Fixed Bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 20,
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 12,
                color: "#6B6B6B",
                marginBottom: 4,
              }}
            >
              Starting From
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: "#2C2C2C",
              }}
            >
              {event.price}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleBooking}
            disabled={isBooked}
            style={{
              backgroundColor: "#C9B891",
              paddingHorizontal: 40,
              paddingVertical: 16,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: isBooked ? 0.7 : 1,
            }}
          >
            {isBooked && <Check size={20} color="#FFFFFF" />}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#FFFFFF",
              }}
            >
              {isBooked ? "Booked" : "Book Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
