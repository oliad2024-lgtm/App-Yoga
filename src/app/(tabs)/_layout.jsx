import { Platform } from "react-native";
import {
  NativeTabs,
  Icon,
  Label,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import { Home, Search, Calendar, Users, User } from "lucide-react-native";

export default function TabLayout() {
  return (
    <NativeTabs
      labelStyle={{ color: "#FFFFFF" }}
      tintColor="#FFFFFF"
      backgroundColor="rgba(44, 44, 44, 0.85)"
    >
      <NativeTabs.Trigger name="index">
        <Label selectedStyle={{ color: "#C9B891" }}>Home</Label>
        <Icon src={<Home size={24} />} selectedColor="#C9B891" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <Label selectedStyle={{ color: "#C9B891" }}>Explore</Label>
        <Icon src={<Search size={24} />} selectedColor="#C9B891" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="events">
        <Label selectedStyle={{ color: "#C9B891" }}>Events</Label>
        <Icon src={<Calendar size={24} />} selectedColor="#C9B891" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="community">
        <Label selectedStyle={{ color: "#C9B891" }}>Community</Label>
        <Icon src={<Users size={24} />} selectedColor="#C9B891" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Label selectedStyle={{ color: "#C9B891" }}>Profile</Label>
        <Icon src={<User size={24} />} selectedColor="#C9B891" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
