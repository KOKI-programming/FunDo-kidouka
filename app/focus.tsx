import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Pause, Play, CheckCircle } from "lucide-react-native";

type FocusParams = {
  id?: string;
  title?: string;
  subtitle?: string;
  duration?: string;
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function FocusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<FocusParams>();
  const durationMinutes = Number(params.duration ?? "3");
  const safeDurationMinutes =
    Number.isFinite(durationMinutes) && durationMinutes > 0
      ? durationMinutes
      : 3;
  const totalSeconds = safeDurationMinutes * 60;

  const [remainingSeconds, setRemainingSeconds] = useState<number>(totalSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log(
      `[focus] mounted mission=${params.id ?? "unknown"} duration=${safeDurationMinutes}`
    );
  }, [params.id, safeDurationMinutes]);

  useEffect(() => {
    if (!isRunning || isComplete) return;

    const interval = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          setIsComplete(true);
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          console.log("[focus] mission completed");
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isComplete]);

  useEffect(() => {
    const ratio = 1 - remainingSeconds / totalSeconds;
    Animated.timing(progressAnim, {
      toValue: ratio,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [remainingSeconds, progressAnim, totalSeconds]);

  useEffect(() => {
    if (!isRunning) {
      pulseAnim.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isRunning, pulseAnim]);

  const handleToggle = useCallback(() => {
    if (isComplete) return;
    console.log(`[focus] toggle timer running=${!isRunning}`);
    setIsRunning((c) => !c);
    void Haptics.selectionAsync();

    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.92,
        useNativeDriver: Platform.OS !== "web",
        speed: 40,
        bounciness: 6,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: Platform.OS !== "web",
        speed: 40,
        bounciness: 6,
      }),
    ]).start();
  }, [buttonScale, isRunning, isComplete]);

  const progressPercentage = useMemo(() => {
    return Math.round((1 - remainingSeconds / totalSeconds) * 100);
  }, [remainingSeconds, totalSeconds]);

  return (
    <View style={styles.screen} testID="focus-screen">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={styles.headerButton}
            testID="back-button"
          >
            <ArrowLeft color="#18181b" size={20} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerEyebrow}>FOCUS MODE</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {params.title ?? "Mission"}
            </Text>
          </View>
          <View style={{ width: 42 }} />
        </View>

        <View style={styles.centerContent}>
          <Animated.View
            style={[styles.timerCircle, { transform: [{ scale: pulseAnim }] }]}
          >
            <View style={styles.timerCircleInner}>
              {isComplete ? (
                <View style={styles.completeWrap}>
                  <CheckCircle color="#16a34a" size={40} />
                  <Text style={styles.completeText}>COMPLETE!</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.timerLabel}>残り時間</Text>
                  <Text style={styles.timerValue}>
                    {formatTime(remainingSeconds)}
                  </Text>
                  <Text style={styles.timerMeta}>
                    {progressPercentage}% 完了
                  </Text>
                </>
              )}
            </View>
          </Animated.View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>進捗</Text>
              <Text style={styles.progressValue}>{progressPercentage}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
          </View>

          <Text style={styles.subtitle}>
            {params.subtitle ??
              "小さなアクションを一つだけ、タイマーが終わるまで続けよう。"}
          </Text>
        </View>

        <View style={styles.bottomSection}>
          {isComplete ? (
            <Pressable
              onPress={() => router.back()}
              style={styles.doneButton}
              testID="done-button"
            >
              <Text style={styles.doneButtonText}>ホームに戻る</Text>
            </Pressable>
          ) : (
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <Pressable
                onPress={handleToggle}
                style={[
                  styles.actionButton,
                  !isRunning && styles.actionButtonPaused,
                ]}
                testID="toggle-timer-button"
              >
                {isRunning ? (
                  <Pause color="#ffffff" size={22} />
                ) : (
                  <Play color="#ffffff" size={22} />
                )}
                <Text style={styles.actionButtonText}>
                  {isRunning ? "一時停止" : "再開"}
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#f4f4f5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  headerEyebrow: {
    color: "#a1a1aa",
    fontSize: 10,
    fontWeight: "800" as const,
    letterSpacing: 2,
    marginBottom: 4,
    textTransform: "uppercase" as const,
  },
  headerTitle: {
    color: "#18181b",
    fontSize: 17,
    fontWeight: "800" as const,
    textAlign: "center",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
  },
  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#fff7ed",
    borderWidth: 4,
    borderColor: "#f97316",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#f97316",
    shadowOpacity: 0.15,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  timerCircleInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  timerLabel: {
    color: "#a1a1aa",
    fontSize: 12,
    fontWeight: "700" as const,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  timerValue: {
    color: "#18181b",
    fontSize: 48,
    fontWeight: "900" as const,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },
  timerMeta: {
    color: "#ea580c",
    fontSize: 13,
    fontWeight: "700" as const,
  },
  completeWrap: {
    alignItems: "center",
    gap: 10,
  },
  completeText: {
    color: "#16a34a",
    fontSize: 20,
    fontWeight: "900" as const,
    letterSpacing: 1,
  },
  progressSection: {
    width: "100%",
    gap: 8,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressLabel: {
    color: "#71717a",
    fontSize: 13,
    fontWeight: "600" as const,
  },
  progressValue: {
    color: "#18181b",
    fontSize: 14,
    fontWeight: "800" as const,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#f4f4f5",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#f97316",
  },
  subtitle: {
    color: "#71717a",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 280,
  },
  bottomSection: {
    paddingBottom: 16,
  },
  actionButton: {
    height: 58,
    borderRadius: 20,
    backgroundColor: "#f97316",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#f97316",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  actionButtonPaused: {
    backgroundColor: "#18181b",
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900" as const,
  },
  doneButton: {
    height: 58,
    borderRadius: 20,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#16a34a",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  doneButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900" as const,
  },
});
