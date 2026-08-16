import { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Toast({ message, visible, onHide, duration = 3000 }) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: insets.top + 16,
        left: 20,
        right: 20,
        backgroundColor: "#2C2C2C",
        padding: 16,
        borderRadius: 12,
        opacity: opacity,
        transform: [{ translateY }],
        zIndex: 1000,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: "#FFFFFF",
          textAlign: "center",
        }}
      >
        {message}
      </Text>
    </Animated.View>
  );
}
