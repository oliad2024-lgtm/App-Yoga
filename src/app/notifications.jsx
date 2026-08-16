import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Calendar,
  Heart,
  Star,
  Video,
  MessageCircle,
} from "lucide-react-native";
import { useRouter } from "expo-router";

export default function NotificationsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Temporary userId
  const userId = "user-123";

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications/list?userId=${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif,
        ),
      );

      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, notificationId }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Revert on error
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true })),
      );

      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark all as read");
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      // Revert on error
      fetchNotifications();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "event_reminder":
        return <Calendar color="#C9B891" size={20} />;
      case "community":
        return <MessageCircle color="#C9B891" size={20} />;
      case "streak":
        return <Star color="#C9B891" size={20} />;
      case "new_event":
        return <Calendar color="#C9B891" size={20} />;
      case "new_content":
        return <Video color="#C9B891" size={20} />;
      default:
        return <Bell color="#C9B891" size={20} />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F0" }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E5E5",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color="#2C2C2C" size={24} />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: "#2C2C2C",
            }}
          >
            Notifications
          </Text>

          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead}>
              <CheckCheck color="#C9B891" size={24} />
            </TouchableOpacity>
          )}
          {unreadCount === 0 && <View style={{ width: 24 }} />}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View
            style={{
              padding: 40,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 15, color: "#9B9B9B" }}>
              Loading notifications...
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          <View
            style={{
              padding: 40,
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
                marginBottom: 16,
              }}
            >
              <Bell color="#C9B891" size={32} />
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#2C2C2C",
                marginBottom: 8,
              }}
            >
              No notifications yet
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: "#9B9B9B",
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              We'll notify you about events, community interactions, and
              practice reminders
            </Text>
          </View>
        ) : (
          <View style={{ paddingTop: 8 }}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => markAsRead(notification.id)}
                style={{
                  backgroundColor: notification.read ? "#FFFFFF" : "#FFF9F0",
                  marginHorizontal: 16,
                  marginVertical: 6,
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "flex-start",
                  borderWidth: notification.read ? 0 : 2,
                  borderColor: notification.read ? "transparent" : "#C9B891",
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: notification.read ? "#F8F6F3" : "#FFFFFF",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  {getNotificationIcon(notification.type)}
                </View>

                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#2C2C2C",
                        flex: 1,
                        marginRight: 8,
                      }}
                    >
                      {notification.title}
                    </Text>
                    {!notification.read && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#C9B891",
                          marginTop: 6,
                        }}
                      />
                    )}
                  </View>

                  <Text
                    style={{
                      fontSize: 14,
                      color: "#6B6B6B",
                      lineHeight: 20,
                      marginBottom: 6,
                    }}
                  >
                    {notification.message}
                  </Text>

                  <Text
                    style={{
                      fontSize: 13,
                      color: "#9B9B9B",
                    }}
                  >
                    {formatTime(notification.created_at)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
