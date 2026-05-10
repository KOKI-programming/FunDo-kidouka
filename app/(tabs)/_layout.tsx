import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { House, Trophy, Library, ChartNoAxesColumn } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#18181b",
        tabBarInactiveTintColor: "#a1a1aa",
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: styles.tabIcon,
        ...(Platform.OS === "web" ? { tabBarItemStyle: { paddingBottom: 4 } } : {}),
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "ホーム",
          tabBarIcon: ({ color, size }) => (
            <House color={color} size={size} strokeWidth={color === "#18181b" ? 2.5 : 1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="challenge"
        options={{
          title: "コンテンツ",
          tabBarIcon: ({ color, size }) => (
            <Library color={color} size={size} strokeWidth={color === "#18181b" ? 2.5 : 1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "コース",
          tabBarIcon: ({ color, size }) => (
            <Trophy color={color} size={size} strokeWidth={color === "#18181b" ? 2.5 : 1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "アクティビティ",
          tabBarIcon: ({ color, size }) => (
            <ChartNoAxesColumn color={color} size={size} strokeWidth={color === "#18181b" ? 2.5 : 1.5} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopColor: "#f4f4f5",
    borderTopWidth: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700" as const,
    marginTop: 2,
  },
  tabIcon: {
    marginBottom: -2,
  },
});
