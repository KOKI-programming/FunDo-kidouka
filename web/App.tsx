import React, { useState, useCallback } from "react";
import { View, StyleSheet, SafeAreaView, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import HomeScreen from "../app/(tabs)/(home)/index";
import ChallengeScreen from "../app/(tabs)/challenge";
import CommunityScreen from "../app/(tabs)/community";
import ActivityScreen from "../app/(tabs)/activity";
import TabBar from "./TabBar";
import FocusScreen from "../app/focus";
import RecommendScreen from "../app/recommend";

export type Screen =
  | { name: "home" }
  | { name: "challenge" }
  | { name: "community" }
  | { name: "activity" }
  | { name: "recommend"; params: Record<string, string> }
  | { name: "focus"; params: Record<string, string> };

export type TabName = "home" | "challenge" | "community" | "activity";

export const RouterContext = React.createContext<{
  push: (screen: Screen) => void;
  back: () => void;
  params: Record<string, string>;
}>({
  push: () => {},
  back: () => {},
  params: {},
});

export default function App() {
  const [history, setHistory] = useState<Screen[]>([{ name: "home" }]);
  const current = history[history.length - 1];

  const push = useCallback((screen: Screen) => {
    setHistory((h) => [...h, screen]);
  }, []);

  const back = useCallback(() => {
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  }, []);

  const activeTab: TabName =
    current.name === "recommend" || current.name === "focus"
      ? ((history.findLast((s) => ["home", "challenge", "community", "activity"].includes(s.name))?.name ?? "home") as TabName)
      : (current.name as TabName);

  const switchTab = useCallback((tab: TabName) => {
    setHistory([{ name: tab }]);
  }, []);

  const params = "params" in current ? current.params : {};
  const isModal = current.name === "recommend" || current.name === "focus";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RouterContext.Provider value={{ push, back, params }}>
          <View style={styles.root}>
            {/* Tab screens */}
            <View style={[styles.screen, isModal && styles.hidden]}>
              {activeTab === "home" && <HomeScreen />}
              {activeTab === "challenge" && <ChallengeScreen />}
              {activeTab === "community" && <CommunityScreen />}
              {activeTab === "activity" && <ActivityScreen />}
            </View>

            {/* Modal screens */}
            {isModal && (
              <View style={styles.screen}>
                {current.name === "recommend" && <RecommendScreen />}
                {current.name === "focus" && <FocusScreen />}
              </View>
            )}

            {!isModal && <TabBar active={activeTab} onSwitch={switchTab} />}
          </View>
        </RouterContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  screen: {
    flex: 1,
  },
  hidden: {
    display: "none",
  },
});
