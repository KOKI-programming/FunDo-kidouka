import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Text as SvgText, G } from "react-native-svg";
import { CirclePlay, CircleCheck, Music, Plus } from "lucide-react-native";
import { MISSIONS, type Mission } from "@/constants/missions";
import FadeInOnFocus from "@/components/FadeInOnFocus";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.7, 260);
const CARD_HEIGHT = 320;
const CARD_GAP = 16;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

const DAYS = ["土", "日", "月", "火", "水", "木", "金"] as const;

const Logo = memo(function Logo() {
  return (
    <Svg viewBox="0 0 400 140" width={112} height={39.2}>
      <Defs>
        <LinearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#ea580c" />
          <Stop offset="50%" stopColor="#fdba74" />
          <Stop offset="100%" stopColor="#ea580c" />
        </LinearGradient>
      </Defs>
      <SvgText x={10} y={100} fontSize={90} fontWeight="900" fontStyle="italic" fill="#18181b" letterSpacing={-5}>
        Fun
      </SvgText>
      <SvgText x={172} y={100} fontSize={90} fontWeight="900" fontStyle="italic" fill="#18181b" letterSpacing={-5}>
        DO
      </SvgText>
      <G fill="none" stroke="#18181b" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M 197 110 C 212 135, 242 130, 257 100" />
        <Path d="M 237 100 L 260 97 L 257 120" />
      </G>
    </Svg>
  );
});

const MissionCard = memo(function MissionCard({
  mission,
  index,
  scrollX,
  onPress,
}: {
  mission: Mission;
  index: number;
  scrollX: Animated.Value;
  onPress: (mission: Mission, index: number) => void;
}) {
  const cardCenter = index * SNAP_INTERVAL;
  const isFirst = index === 0;

  const scale = scrollX.interpolate({
    inputRange: [cardCenter - SNAP_INTERVAL, cardCenter, cardCenter + SNAP_INTERVAL],
    outputRange: [0.92, 1.02, 0.92],
    extrapolate: "clamp",
  });

  const cardOpacity = scrollX.interpolate({
    inputRange: [cardCenter - SNAP_INTERVAL, cardCenter, cardCenter + SNAP_INTERVAL],
    outputRange: [0.6, 1, 0.6],
    extrapolate: "clamp",
  });

  const ringOpacity = scrollX.interpolate({
    inputRange: [cardCenter - SNAP_INTERVAL * 0.5, cardCenter, cardCenter + SNAP_INTERVAL * 0.5],
    outputRange: [0, 1, 0],
    extrapolate: "clamp",
  });

  const pressScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(pressScale, { toValue: 0.96, useNativeDriver: Platform.OS !== "web", speed: 30, bounciness: 4 }).start();
  }, [pressScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: Platform.OS !== "web", speed: 30, bounciness: 4 }).start();
  }, [pressScale]);

  const compositeScale = Animated.multiply(scale, pressScale);

  return (
    <Animated.View
      style={{
        transform: [{ scale: compositeScale }],
        opacity: cardOpacity,
        width: CARD_WIDTH,
        marginRight: CARD_GAP,
      }}
    >
      <Pressable
        onPress={() => onPress(mission, index)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.missionCard}
        testID={`mission-card-${mission.id}`}
      >
        <Image source={{ uri: mission.imageUrl }} style={styles.missionCardImage} contentFit="cover" transition={300} />
        <View style={styles.missionCardOverlay} />
        <View style={styles.missionCardContent}>
          <View style={styles.missionCardLabelBg}>
            <Text style={styles.missionCardTitle}>{mission.title}</Text>
            <View style={styles.missionCardBadge}>
              <Text style={styles.missionCardSubtitle}>
                {mission.durationMinutes}分間 {mission.subtitle}
              </Text>
              {isFirst && (
                <>
                  <View style={styles.missionCardBadgeDivider} />
                  <Music color="#fb923c" size={12} strokeWidth={2} />
                </>
              )}
            </View>
          </View>
        </View>
        <Animated.View style={[styles.missionCardRing, { opacity: ringOpacity }]} pointerEvents="none" />
      </Pressable>
    </Animated.View>
  );
});

const INITIAL_INDEX = 0;
const INITIAL_OFFSET = INITIAL_INDEX * SNAP_INTERVAL;

type ActionMode = "do" | "log";

export default function HomeScreen() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number>(INITIAL_INDEX);
  const [actionMode, setActionMode] = useState<ActionMode>("do");
  const ctaButtonScale = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const ctaScrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(INITIAL_OFFSET)).current;
  const lastHapticIndex = useRef<number>(INITIAL_INDEX);

  const todayIndex = 0;

  useEffect(() => {
    console.log("[home] mounting home screen");
  }, []);

  const handleMomentumEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const centerIndex = Math.round(offsetX / SNAP_INTERVAL);
    const clampedIndex = Math.max(0, Math.min(centerIndex, MISSIONS.length - 1));
    setSelectedIndex(clampedIndex);
  }, []);

  const handleScrollEvent = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const centerIndex = Math.round(offsetX / SNAP_INTERVAL);
    const clampedIndex = Math.max(0, Math.min(centerIndex, MISSIONS.length - 1));
    if (clampedIndex !== lastHapticIndex.current) {
      lastHapticIndex.current = clampedIndex;
      setSelectedIndex(clampedIndex);
      void Haptics.selectionAsync();
    }
  }, []);

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
        useNativeDriver: Platform.OS !== "web",
        listener: handleScrollEvent as (event: { nativeEvent: NativeScrollEvent }) => void,
      }),
    [scrollX, handleScrollEvent]
  );

  const handleMissionPress = useCallback(
    (_m: Mission, idx: number) => {
      if (idx === selectedIndex) return;
      setSelectedIndex(idx);
      scrollViewRef.current?.scrollTo({ x: idx * SNAP_INTERVAL, animated: true });
      void Haptics.selectionAsync();
    },
    [selectedIndex]
  );

  const handleCtaPress = useCallback(() => {
    const mission = MISSIONS[selectedIndex];
    if (!mission) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Animated.sequence([
      Animated.spring(ctaButtonScale, { toValue: 0.95, useNativeDriver: Platform.OS !== "web", speed: 40, bounciness: 4 }),
      Animated.spring(ctaButtonScale, { toValue: 1, useNativeDriver: Platform.OS !== "web", speed: 40, bounciness: 4 }),
    ]).start();

    if (actionMode === "do") {
      router.push({
        pathname: "/recommend",
        params: {
          id: mission.id,
          title: mission.title,
          subtitle: mission.subtitle,
          duration: String(mission.durationMinutes),
        },
      });
    } else {
      console.log(`[home] log mission: ${mission.id}`);
    }
  }, [selectedIndex, router, ctaButtonScale, actionMode]);

  const handleCtaPressIn = useCallback(() => {
    Animated.spring(ctaButtonScale, { toValue: 0.97, useNativeDriver: Platform.OS !== "web", speed: 40, bounciness: 4 }).start();
  }, [ctaButtonScale]);

  const handleCtaPressOut = useCallback(() => {
    Animated.spring(ctaButtonScale, { toValue: 1, useNativeDriver: Platform.OS !== "web", speed: 40, bounciness: 4 }).start();
  }, [ctaButtonScale]);

  const ctaWidth = SCREEN_WIDTH - 40;

  const handleCtaScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.x;
      const idx = Math.round(offset / ctaWidth);
      const next: ActionMode = idx === 0 ? "do" : "log";
      if (next !== actionMode) {
        setActionMode(next);
        void Haptics.selectionAsync();
      }
    },
    [ctaWidth, actionMode]
  );

  return (
    <View style={styles.screen} testID="home-screen">
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <FadeInOnFocus>
        <View style={styles.header}>
          <Logo />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          testID="home-scroll"
        >
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>ミッション</Text>
            <Pressable style={styles.titleAction} testID="add-mission">
              <Plus color="#18181b" size={26} strokeWidth={2.5} />
            </Pressable>
          </View>

          <View style={styles.daysRow}>
            {DAYS.map((d, i) => {
              const isToday = i === todayIndex;
              return (
                <View key={d} style={styles.dayItem}>
                  <Text style={[styles.dayLabel, isToday ? styles.dayLabelActive : styles.dayLabelInactive]}>{d}</Text>
                  <View style={[styles.dayCircle, isToday && styles.dayCircleActive]}>
                    <View style={styles.dayDot} />
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.missionSection}>
            <Animated.ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={SNAP_INTERVAL}
              snapToAlignment="start"
              decelerationRate={0.98}
              contentContainerStyle={{
                paddingLeft: SIDE_PADDING,
                paddingRight: SIDE_PADDING - CARD_GAP,
                paddingBottom: 24,
                paddingTop: 16,
              }}
              onScroll={onScroll}
              onMomentumScrollEnd={handleMomentumEnd}
              scrollEventThrottle={8}
              contentOffset={{ x: INITIAL_OFFSET, y: 0 }}
              testID="mission-carousel"
            >
              {MISSIONS.map((mission, index) => (
                <MissionCard key={mission.id} mission={mission} index={index} scrollX={scrollX} onPress={handleMissionPress} />
              ))}
            </Animated.ScrollView>
          </View>

          <View style={styles.ctaWrap}>
            <ScrollView
              ref={ctaScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleCtaScrollEnd}
              testID="cta-pager"
            >
              <View style={{ width: ctaWidth }}>
                <Animated.View style={{ transform: [{ scale: ctaButtonScale }] }}>
                  <Pressable
                    onPress={handleCtaPress}
                    onPressIn={handleCtaPressIn}
                    onPressOut={handleCtaPressOut}
                    style={[styles.ctaButton, styles.ctaButtonOrange]}
                    testID="do-it-button"
                  >
                    <View style={[styles.ctaInner, { backgroundColor: "#f97316" }]}>
                      <View style={styles.ctaTextWrap}>
                        <Text style={styles.ctaText}>DO</Text>
                        <Svg viewBox="0 0 120 40" width={70} height={24} style={styles.underlineSvg}>
                          <G fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round">
                            <Path d="M25 5 C 35 25, 85 25, 95 5" />
                            <Path d="M82 12 L 95 5 L 90 18" />
                          </G>
                        </Svg>
                      </View>
                      <Text style={[styles.ctaText, { marginLeft: 12 }]}>IT</Text>
                      <CirclePlay color="#ffffff" size={32} strokeWidth={3} style={{ marginLeft: 10 }} />
                    </View>
                  </Pressable>
                </Animated.View>
              </View>
              <View style={{ width: ctaWidth }}>
                <Animated.View style={{ transform: [{ scale: ctaButtonScale }] }}>
                  <Pressable
                    onPress={handleCtaPress}
                    onPressIn={handleCtaPressIn}
                    onPressOut={handleCtaPressOut}
                    style={[styles.ctaButton, styles.ctaButtonDark]}
                    testID="log-it-button"
                  >
                    <View style={[styles.ctaInner, { backgroundColor: "#18181b" }]}>
                      <View style={styles.ctaTextWrap}>
                        <Text style={styles.ctaText}>LOG</Text>
                        <Svg viewBox="0 0 120 40" width={70} height={24} style={styles.underlineSvg}>
                          <G fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round">
                            <Path d="M25 5 C 35 25, 85 25, 95 5" />
                            <Path d="M82 12 L 95 5 L 90 18" />
                          </G>
                        </Svg>
                      </View>
                      <Text style={[styles.ctaText, { marginLeft: 12 }]}>IT</Text>
                      <CircleCheck color="#ffffff" size={32} strokeWidth={3} style={{ marginLeft: 10 }} />
                    </View>
                  </Pressable>
                </Animated.View>
              </View>
            </ScrollView>

            <View style={styles.dotsRow}>
              <View style={[styles.dot, actionMode === "do" && styles.dotActive]} />
              <View style={[styles.dot, actionMode === "log" && styles.dotActive]} />
            </View>

            <Text style={styles.hint}>※ 小さな目標から始めよう。すぐに終わってもOK。</Text>
          </View>
        </ScrollView>
        </FadeInOnFocus>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#ffffff" },
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 0,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
  },
  titleRow: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#18181b",
    letterSpacing: -0.5,
  },
  titleAction: {
    position: "absolute",
    right: 20,
    top: 8,
    padding: 4,
  },
  daysRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 4,
  },
  dayItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: "800" as const,
  },
  dayLabelActive: { color: "#18181b" },
  dayLabelInactive: { color: "#a1a1aa" },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",
  },
  dayCircleActive: {
    backgroundColor: "#f4f4f5",
    borderWidth: 2,
    borderColor: "#e4e4e7",
  },
  dayDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e4e4e7",
  },
  missionSection: {
    paddingTop: 0,
  },
  missionCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
  },
  missionCardRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4,
    borderColor: "#f97316",
    borderRadius: 20,
  },
  missionCardImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.8,
  },
  missionCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.30)",
  },
  missionCardContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  missionCardLabelBg: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.20)",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  missionCardTitle: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "900" as const,
    fontStyle: "italic",
    letterSpacing: -1.5,
    textTransform: "uppercase" as const,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  missionCardBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.50)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    gap: 8,
  },
  missionCardBadgeDivider: {
    width: 1,
    height: 10,
    backgroundColor: "rgba(255,255,255,0.20)",
  },
  missionCardSubtitle: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700" as const,
  },
  ctaWrap: {
    paddingHorizontal: 20,
    gap: 8,
  },
  ctaButton: {
    borderRadius: 32,
    overflow: "hidden",
    padding: 6,
  },
  ctaButtonOrange: {
    backgroundColor: "#f97316",
    shadowColor: "#f97316",
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  ctaButtonDark: {
    backgroundColor: "#18181b",
    shadowColor: "#18181b",
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  ctaInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 22,
    borderRadius: 26,
  },
  ctaTextWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "900" as const,
    fontStyle: "italic",
    letterSpacing: -1.5,
    textTransform: "uppercase" as const,
  },
  underlineSvg: {
    position: "absolute",
    bottom: -10,
    left: 0,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e4e4e7",
  },
  dotActive: {
    backgroundColor: "#f97316",
  },
  hint: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#a1a1aa",
    marginTop: 8,
  },
});
