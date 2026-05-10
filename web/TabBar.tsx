import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { House, Library, Trophy, ChartNoAxesColumn } from "lucide-react-native";
import type { TabName } from "./App";

const TABS: { name: TabName; label: string; Icon: React.ComponentType<{ color: string; size: number; strokeWidth: number }> }[] = [
  { name: "home", label: "ホーム", Icon: House },
  { name: "challenge", label: "コンテンツ", Icon: Library },
  { name: "community", label: "コース", Icon: Trophy },
  { name: "activity", label: "アクティビティ", Icon: ChartNoAxesColumn },
];

export default function TabBar({ active, onSwitch }: { active: TabName; onSwitch: (t: TabName) => void }) {
  return (
    <View style={styles.tabBar}>
      {TABS.map(({ name, label, Icon }) => {
        const isActive = name === active;
        const color = isActive ? "#18181b" : "#a1a1aa";
        return (
          <Pressable key={name} style={styles.tab} onPress={() => onSwitch(name)}>
            <Icon color={color} size={24} strokeWidth={isActive ? 2.5 : 1.5} />
            <Text style={[styles.label, { color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f4f4f5",
    paddingBottom: Platform.OS === "web" ? 4 : 0,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    gap: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
});
