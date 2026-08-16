import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Share,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Bell,
  ImageIcon,
  MapPin,
  ThumbsUp,
  MessageCircle,
  Send,
  X,
  ShareIcon,
} from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useUpload } from "@/utils/useUpload";
import { useAuth } from "@/utils/auth/useAuth";
import { useRouter } from "expo-router";

export default function CommunityPage() {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeComments, setActiveComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedPostForShare, setSelectedPostForShare] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [upload, { loading: uploadLoading }] = useUpload();
  const { isAuthenticated, signUp } = useAuth();
  const router = useRouter();

  // Temporary user info
  const currentUser = {
    id: "user-123",
    name: "Sarah Miller",
    avatar: "https://i.pravatar.cc/150?img=5",
  };

  useEffect(() => {
    fetchPosts();
    fetchUnreadCount();
  }, []);

  // Refresh unread count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(
        `/api/posts/list?userId=${currentUser.id}&limit=20`,
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(
        `/api/notifications/unread-count?userId=${currentUser.id}`,
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "We need permission to access your photos",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleGetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "We need permission to access your location",
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address[0]) {
        const locationString = `${address[0].city}, ${address[0].region}`;
        setSelectedLocation({
          coords: location.coords,
          address: locationString,
        });
        Alert.alert("Location added", locationString);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get location");
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert("Error", "Please write something to post");
      return;
    }

    try {
      let imageUrl = null;

      if (selectedImage) {
        const uploadResult = await upload({
          reactNativeAsset: selectedImage,
        });

        if (uploadResult.error) {
          throw new Error(uploadResult.error);
        }
        imageUrl = uploadResult.url;
      }

      const response = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          content: newPostContent,
          imageUrl,
          location: selectedLocation?.address,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create post: ${response.status}`);
      }

      setNewPostContent("");
      setSelectedImage(null);
      setSelectedLocation(null);
      await fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to create post");
    }
  };

  const handleToggleLike = async (postId) => {
    if (!isAuthenticated) {
      signUp();
      return;
    }

    // Optimistic update
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              is_liked: !post.is_liked,
              like_count: post.is_liked
                ? parseInt(post.like_count) - 1
                : parseInt(post.like_count) + 1,
            }
          : post,
      ),
    );

    try {
      const response = await fetch("/api/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          postId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle like: ${response.status}`);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert on error
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                is_liked: !post.is_liked,
                like_count: post.is_liked
                  ? parseInt(post.like_count) + 1
                  : parseInt(post.like_count) - 1,
              }
            : post,
        ),
      );
    }
  };

  const toggleComments = (postId) => {
    if (!isAuthenticated) {
      signUp();
      return;
    }
    setActiveComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleAddComment = async (postId) => {
    if (!isAuthenticated) {
      signUp();
      return;
    }
    const content = commentText[postId];
    if (!content?.trim()) return;

    try {
      const response = await fetch("/api/posts/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          postId,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.status}`);
      }

      setCommentText((prev) => ({ ...prev, [postId]: "" }));
      await fetchPosts();
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment");
    }
  };

  const handleSharePost = (post) => {
    setSelectedPostForShare(post);
    setShareModalVisible(true);
  };

  const sharePostLink = async () => {
    if (!selectedPostForShare) return;

    try {
      const postUrl = `${process.env.EXPO_PUBLIC_BASE_URL}/community/post/${selectedPostForShare.id}`;
      await Share.share({
        message: `Check out this post from ${selectedPostForShare.user_name}: ${postUrl}`,
      });
      setShareModalVisible(false);
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diff = Math.floor((now - postTime) / 1000); // seconds

    if (diff < 60) return "JUST NOW";
    if (diff < 3600) return `${Math.floor(diff / 60)} MIN AGO`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} HOURS AGO`;
    return `${Math.floor(diff / 86400)} DAYS AGO`;
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
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
            }}
          >
            Community
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

        {/* Tabs */}
        {/* <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            paddingBottom: 16,
            gap: 24,
          }}
        >
          <View
            style={{
              borderBottomWidth: 2,
              borderBottomColor: "#2C2C2C",
              paddingBottom: 8,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#2C2C2C" }}>
              Feed
            </Text>
          </View>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "500",
              color: "#9B9B9B",
              paddingBottom: 8,
            }}
          >
            Groups
          </Text>
         <Text
            style={{
              fontSize: 15,
              fontWeight: "500",
              color: "#9B9B9B",
              paddingBottom: 8,
            }}
          >
            Events
          </Text>
        </View> */}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Post Input */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              marginHorizontal: 20,
              marginBottom: 16,
              borderRadius: 20,
              padding: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{ uri: currentUser.avatar }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
              <TextInput
                placeholder="Share your practice..."
                placeholderTextColor="#9B9B9B"
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
                style={{
                  flex: 1,
                  marginLeft: 12,
                  fontSize: 15,
                  color: "#2C2C2C",
                  maxHeight: 100,
                }}
              />
            </View>

            {/* Image Preview */}
            {selectedImage && (
              <View style={{ marginTop: 12, position: "relative" }}>
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={{ width: "100%", height: 200, borderRadius: 12 }}
                />
                <TouchableOpacity
                  onPress={() => setSelectedImage(null)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: 12,
                    padding: 4,
                  }}
                >
                  <X color="#FFFFFF" size={16} />
                </TouchableOpacity>
              </View>
            )}

            {/* Location Preview */}
            {selectedLocation && (
              <View
                style={{
                  marginTop: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F8F6F3",
                  padding: 8,
                  borderRadius: 12,
                }}
              >
                <MapPin color="#C9B891" size={16} />
                <Text
                  style={{
                    fontSize: 13,
                    color: "#2C2C2C",
                    marginLeft: 6,
                    flex: 1,
                  }}
                >
                  {selectedLocation.address}
                </Text>
                <TouchableOpacity onPress={() => setSelectedLocation(null)}>
                  <X color="#9B9B9B" size={16} />
                </TouchableOpacity>
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: "#F0F0F0",
              }}
            >
              <View style={{ flexDirection: "row", gap: 16 }}>
                <TouchableOpacity onPress={handlePickImage}>
                  <ImageIcon
                    color={selectedImage ? "#C9B891" : "#9B9B9B"}
                    size={20}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleGetLocation}>
                  <MapPin
                    color={selectedLocation ? "#C9B891" : "#9B9B9B"}
                    size={20}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleCreatePost}
                disabled={uploadLoading}
                style={{
                  backgroundColor: uploadLoading ? "#E5E5E0" : "#C9B891",
                  paddingVertical: 8,
                  paddingHorizontal: 20,
                  borderRadius: 16,
                }}
              >
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#2C2C2C" }}
                >
                  {uploadLoading ? "Posting..." : "Post"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Feed Posts */}
          {posts.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 60,
              }}
            >
              <MessageCircle color="#C9B891" size={48} />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#2C2C2C",
                  marginTop: 16,
                }}
              >
                No posts yet
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: "#9B9B9B",
                  marginTop: 8,
                  textAlign: "center",
                  paddingHorizontal: 40,
                }}
              >
                Be the first to share your mindfulness journey!
              </Text>
            </View>
          ) : (
            posts.map((post) => (
              <View
                key={post.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  marginHorizontal: 20,
                  marginBottom: 16,
                  borderRadius: 20,
                  padding: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Image
                    source={{
                      uri:
                        post.user_avatar || "https://i.pravatar.cc/150?img=1",
                    }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: "#2C2C2C",
                      }}
                    >
                      {post.user_name}
                    </Text>
                    <Text style={{ fontSize: 13, color: "#9B9B9B" }}>
                      {formatTime(post.created_at)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleSharePost(post)}>
                    <Text style={{ fontSize: 20 }}>⋯</Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={{
                    fontSize: 15,
                    color: "#2C2C2C",
                    marginBottom: post.image_url ? 12 : 0,
                    lineHeight: 22,
                  }}
                >
                  {post.content}
                </Text>

                {post.location && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 8,
                      marginBottom: post.image_url ? 12 : 0,
                    }}
                  >
                    <MapPin color="#C9B891" size={14} />
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#6B6B6B",
                        marginLeft: 4,
                      }}
                    >
                      {post.location}
                    </Text>
                  </View>
                )}

                {post.image_url && (
                  <View
                    style={{
                      backgroundColor: "#C9B891",
                      borderRadius: 16,
                      overflow: "hidden",
                      height: 280,
                      marginBottom: 12,
                    }}
                  >
                    <Image
                      source={{ uri: post.image_url }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </View>
                )}

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: "#F0F0F0",
                  }}
                >
                  <View style={{ flexDirection: "row", gap: 16 }}>
                    <TouchableOpacity
                      onPress={() => handleToggleLike(post.id)}
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <ThumbsUp
                        color={post.is_liked ? "#C9B891" : "#6B6B6B"}
                        size={18}
                        fill={post.is_liked ? "#C9B891" : "transparent"}
                      />
                      <Text
                        style={{
                          fontSize: 14,
                          color: post.is_liked ? "#C9B891" : "#6B6B6B",
                          marginLeft: 6,
                          fontWeight: "500",
                        }}
                      >
                        {parseInt(post.like_count) > 0
                          ? `${post.like_count} High-five${
                              parseInt(post.like_count) !== 1 ? "s" : ""
                            }`
                          : "High-five"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleComments(post.id)}
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <MessageCircle color="#6B6B6B" size={18} />
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#6B6B6B",
                          marginLeft: 6,
                          fontWeight: "500",
                        }}
                      >
                        {parseInt(post.comment_count) > 0
                          ? `${post.comment_count} Comment${
                              parseInt(post.comment_count) !== 1 ? "s" : ""
                            }`
                          : "Comment"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Comment Section */}
                {activeComments[post.id] && (
                  <View
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTopWidth: 1,
                      borderTopColor: "#F0F0F0",
                    }}
                  >
                    {/* Existing Comments */}
                    {post.comments && post.comments.length > 0 && (
                      <View style={{ marginBottom: 12 }}>
                        {post.comments.map((comment, index) => (
                          <View
                            key={comment.id || index}
                            style={{
                              flexDirection: "row",
                              marginBottom: 12,
                            }}
                          >
                            <Image
                              source={{
                                uri:
                                  comment.user_avatar ||
                                  "https://i.pravatar.cc/150?img=1",
                              }}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                              }}
                            />
                            <View
                              style={{
                                flex: 1,
                                marginLeft: 10,
                                backgroundColor: "#F8F6F3",
                                borderRadius: 12,
                                padding: 12,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  marginBottom: 4,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: "#2C2C2C",
                                  }}
                                >
                                  {comment.user_name}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 12,
                                    color: "#9B9B9B",
                                  }}
                                >
                                  {formatTime(comment.created_at)}
                                </Text>
                              </View>
                              <Text
                                style={{
                                  fontSize: 14,
                                  color: "#2C2C2C",
                                  lineHeight: 20,
                                }}
                              >
                                {comment.content}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Comment Input */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#F8F6F3",
                        borderRadius: 20,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                      }}
                    >
                      <Image
                        source={{ uri: currentUser.avatar }}
                        style={{ width: 28, height: 28, borderRadius: 14 }}
                      />
                      <TextInput
                        placeholder="Write a comment..."
                        placeholderTextColor="#9B9B9B"
                        value={commentText[post.id] || ""}
                        onChangeText={(text) =>
                          setCommentText((prev) => ({
                            ...prev,
                            [post.id]: text,
                          }))
                        }
                        style={{
                          flex: 1,
                          marginLeft: 12,
                          fontSize: 14,
                          color: "#2C2C2C",
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => handleAddComment(post.id)}
                      >
                        <Send color="#C9B891" size={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Share Modal */}
        <Modal
          visible={shareModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShareModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShareModalVisible(false)}
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: 20,
                width: "80%",
                maxWidth: 300,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#2C2C2C",
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                Share Post
              </Text>
              <TouchableOpacity
                onPress={sharePostLink}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#C9B891",
                  paddingVertical: 14,
                  borderRadius: 16,
                  marginBottom: 12,
                }}
              >
                <ShareIcon color="#FFFFFF" size={20} />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#FFFFFF",
                    marginLeft: 8,
                  }}
                >
                  Share Link
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShareModalVisible(false)}
                style={{
                  paddingVertical: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: "#9B9B9B",
                    textAlign: "center",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
