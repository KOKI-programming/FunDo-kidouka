import React, { useCallback, useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import {
  Animated as RNAnimated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  LayoutChangeEvent,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Settings,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  X,
  Flame,
} from "lucide-react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Text as SvgText, G } from "react-native-svg";
import { MISSIONS } from "@/constants/missions";
import FadeInOnFocus from "@/components/FadeInOnFocus";

const DAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;
type TabKey = "weekly" | "monthly" | "stats";

const ACTIVE_DAY_INDEX = 2;

type ActivityLog = {
  id: string;
  date: string;
  time: string;
  title: string;
  duration: string;
};

const RECENT: ActivityLog[] = [
  { id: "1", date: "MAR 29, 2026", time: "01:16", title: "5分間 本を読む", duration: "0:15" },
  { id: "2", date: "MAR 29, 2026", time: "16:18", title: "3分間 だるい時", duration: "0:07" },
];

type MonthFilter = { id: string; title: string; label: string; imageUrl: string };
const MONTH_FILTERS: MonthFilter[] = [
  {
    id: "all",
    title: "TOTAL",
    label: "すべて",
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600",
  },
  ...MISSIONS.map((m) => ({
    id: m.id,
    title: m.title,
    label: `${m.durationMinutes}分間 ${m.subtitle}`,
    imageUrl: m.imageUrl,
  })),
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const FILTER_CARD_WIDTH = 176;
const FILTER_CARD_GAP = 20;
const FILTER_SNAP = FILTER_CARD_WIDTH + FILTER_CARD_GAP;
const FILTER_SIDE_PAD = (SCREEN_WIDTH - FILTER_CARD_WIDTH) / 2;

function MissionFilterCard({
  filter,
  index,
  scrollX,
  isActive,
  onPress,
}: {
  filter: MonthFilter;
  index: number;
  scrollX: RNAnimated.Value;
  isActive: boolean;
  onPress: (id: string) => void;
}) {
  const center = index * FILTER_SNAP;

  const scale = scrollX.interpolate({
    inputRange: [center - FILTER_SNAP, center, center + FILTER_SNAP],
    outputRange: [0.88, 1.0, 0.88],
    extrapolate: "clamp",
  });

  const cardOpacity = scrollX.interpolate({
    inputRange: [center - FILTER_SNAP, center, center + FILTER_SNAP],
    outputRange: [0.4, 1, 0.4],
    extrapolate: "clamp",
  });

  const ringOpacity = scrollX.interpolate({
    inputRange: [center - FILTER_SNAP * 0.45, center, center + FILTER_SNAP * 0.45],
    outputRange: [0, 1, 0],
    extrapolate: "clamp",
  });

  return (
    <RNAnimated.View
      style={{
        width: FILTER_CARD_WIDTH,
        height: 112,
        marginRight: FILTER_CARD_GAP,
        transform: [{ scale }],
        opacity: cardOpacity,
      }}
    >
      <Pressable
        onPress={() => onPress(filter.id)}
        style={styles.filterCardBase}
      >
        <RNAnimated.Image
          source={{ uri: filter.imageUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View style={[styles.monthFilterOverlay, !isActive && styles.monthFilterOverlayInactive]} />
        <View style={styles.monthFilterInner}>
          <View style={styles.monthFilterPanel}>
            <Text style={styles.monthFilterTitle}>{filter.title}</Text>
            <View style={styles.monthFilterChip}>
              <Text style={styles.monthFilterChipText}>{filter.label}</Text>
            </View>
          </View>
        </View>
        <RNAnimated.View
          style={[styles.filterCardRing, { opacity: ringOpacity }]}
          pointerEvents="none"
        />
      </Pressable>
    </RNAnimated.View>
  );
}

const MONTH_DAYS = 31;
const MONTH_FIRST_WEEKDAY = 4; // Friday (Mon=0)
const TODAY_DAY = 5;

function Logo() {
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
}

export default function ActivityScreen() {
  const [tab, setTab] = useState<TabKey>("weekly");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FadeInOnFocus>
      <View style={styles.header}>
        <Logo />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>アクティビティ</Text>
          <Pressable style={styles.titleIconBtn} hitSlop={8}>
            <Settings size={24} color="#18181b" strokeWidth={2.5} />
          </Pressable>
        </View>

        {/* Segmented tabs */}
        <View style={styles.segmentWrap}>
          <View style={styles.segment}>
            {(["weekly", "monthly", "stats"] as TabKey[]).map((k) => {
              const label = k === "weekly" ? "週間" : k === "monthly" ? "月間" : "統計";
              const active = tab === k;
              return (
                <Pressable
                  key={k}
                  onPress={() => setTab(k)}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {tab === "monthly" ? <MonthlyCard /> : null}
        {tab === "stats" ? <StatsCard /> : null}

        {/* Weekly card */}
        {tab === "weekly" ? (
        <View style={styles.weeklyCard}>
          <View style={styles.weekNavRow}>
            <Pressable hitSlop={8}>
              <ChevronLeft size={18} color="#d4d4d8" strokeWidth={3} />
            </Pressable>
            <Text style={styles.weekRangeText}>5月3日 - 5月9日</Text>
            <Pressable hitSlop={8}>
              <ChevronRight size={18} color="#d4d4d8" strokeWidth={3} />
            </Pressable>
          </View>

          {MISSIONS.map((m) => (
            <View key={m.id} style={styles.missionRow}>
              <View style={styles.missionThumb}>
                <Image source={{ uri: m.imageUrl }} style={styles.missionThumbImg} contentFit="cover" />
                <View style={styles.missionThumbOverlay} />
                <View style={styles.missionThumbContent}>
                  <Text style={styles.missionThumbLabel}>MISSION</Text>
                  <Text style={styles.missionThumbTitle} numberOfLines={2}>
                    {m.title}
                  </Text>
                </View>
              </View>

              <View style={styles.daysRow}>
                {DAYS.map((d, i) => {
                  const isActive = i === ACTIVE_DAY_INDEX;
                  return (
                    <View key={d} style={styles.dayCol}>
                      <Text style={[styles.dayLabel, isActive && styles.dayLabelActive]}>{d}</Text>
                      <View style={[styles.dayBox, isActive && styles.dayBoxActive]}>
                        {isActive ? <View style={styles.dayDot} /> : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
        ) : null}

        {/* Recent */}
        <Text style={styles.recentTitle}>最近のアクティビティ</Text>
        <View style={{ gap: 12 }}>
          {RECENT.map((r) => (
            <View key={r.id} style={styles.recentCard}>
              <View style={styles.recentIconWrap}>
                <CircleCheck size={24} color="#f97316" strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.recentMetaRow}>
                  <Text style={styles.recentDate}>{r.date}</Text>
                  <Text style={styles.recentTime}>{r.time}</Text>
                </View>
                <View style={styles.recentTitleRow}>
                  <Text style={styles.recentItemTitle} numberOfLines={1}>
                    {r.title}
                  </Text>
                  <View style={styles.durationBadge}>
                    <Clock size={10} color="#a1a1aa" strokeWidth={2} />
                    <Text style={styles.durationText}>{r.duration}</Text>
                  </View>
                </View>
              </View>
              <Pressable hitSlop={6} style={styles.deleteBtn}>
                <X size={20} color="#a1a1aa" strokeWidth={2} />
              </Pressable>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      </FadeInOnFocus>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 0,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 4,
    position: "relative",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#18181b",
    letterSpacing: -0.3,
  },
  titleIconBtn: {
    position: "absolute",
    right: 16,
    padding: 4,
  },

  segmentWrap: {
    paddingTop: 4,
    paddingBottom: 8,
    marginBottom: 8,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: "#f4f4f5",
    borderRadius: 16,
    padding: 4,
    gap: 4,
    maxWidth: 360,
    alignSelf: "center",
    width: "100%",
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#a1a1aa",
  },
  segmentTextActive: { color: "#18181b" },

  weeklyCard: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#f4f4f5",
    borderRadius: 36,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 20,
    marginBottom: 32,
    gap: 8,
  },
  weekNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 6,
  },
  weekRangeText: {
    fontSize: 15,
    fontWeight: "900" as const,
    fontStyle: "italic",
    color: "#18181b",
    letterSpacing: -0.3,
  },

  missionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  missionThumb: {
    width: 100,
    height: 80,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f4f4f5",
    backgroundColor: "#000",
  },
  missionThumbImg: { ...StyleSheet.absoluteFillObject },
  missionThumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  missionThumbContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  missionThumbLabel: {
    fontSize: 7,
    fontWeight: "900" as const,
    fontStyle: "italic",
    color: "#f97316",
    letterSpacing: 1,
    marginBottom: 2,
  },
  missionThumbTitle: {
    fontSize: 10,
    fontWeight: "900" as const,
    fontStyle: "italic",
    color: "#ffffff",
    letterSpacing: -0.3,
    textAlign: "center",
  },

  daysRow: {
    flex: 1,
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f4f4f5",
  },
  dayCol: { alignItems: "center", gap: 4 },
  dayLabel: {
    fontSize: 9,
    fontWeight: "900" as const,
    fontStyle: "italic",
    color: "#a1a1aa",
  },
  dayLabelActive: { color: "#f97316" },
  dayBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
  },
  dayBoxActive: {
    borderWidth: 2,
    borderColor: "rgba(249,115,22,0.3)",
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(249,115,22,0.4)",
  },

  recentTitle: {
    fontSize: 22,
    fontWeight: "900" as const,
    color: "#18181b",
    marginBottom: 16,
    letterSpacing: -0.5,
  },

  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#f4f4f5",
    borderRadius: 24,
    padding: 16,
  },
  recentIconWrap: {
    padding: 10,
    borderRadius: 999,
    backgroundColor: "#fff7ed",
  },
  recentMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  recentDate: {
    fontSize: 10,
    fontWeight: "700" as const,
    fontStyle: "italic",
    color: "#a1a1aa",
    letterSpacing: 1.2,
  },
  recentTime: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#a1a1aa",
  },
  recentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  recentItemTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "900" as const,
    color: "#18181b",
    letterSpacing: -0.3,
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "#f4f4f5",
    borderRadius: 6,
  },
  durationText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#71717a",
  },
  deleteBtn: { padding: 6 },

  filterCardBase: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  filterCardRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#f97316",
  },

  // Monthly
  monthFilterRow: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  monthFilterContent: {
    alignItems: "center",
  },
  monthFilterCard: {
    width: 176,
    height: 112,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  monthFilterCardActive: {
    borderWidth: 4,
    borderColor: "#f97316",
    transform: [{ scale: 1.04 }],
  },
  monthFilterCardInactive: {
    opacity: 0.5,
  },
  monthFilterImg: { ...StyleSheet.absoluteFillObject },
  monthFilterOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)" },
  monthFilterOverlayInactive: { backgroundColor: "rgba(0,0,0,0.5)" },
  monthFilterInner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  monthFilterPanel: {
    width: "100%",
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  monthFilterTitle: {
    fontSize: 20,
    fontWeight: "900" as const,
    fontStyle: "italic",
    color: "#fff",
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  monthFilterChip: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  monthFilterChipText: {
    fontSize: 9,
    fontWeight: "700" as const,
    color: "#fff",
  },
  monthFilterDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f97316",
  },

  monthSectionTitle: {
    fontSize: 20,
    fontWeight: "900" as const,
    fontStyle: "italic",
    color: "#18181b",
    letterSpacing: -0.4,
  },
  monthLegendRow: { flexDirection: "row", gap: 8 },
  monthLegendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  monthLegendSwatch: { width: 10, height: 10, borderRadius: 2 },
  monthLegendText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#a1a1aa",
    letterSpacing: 0.5,
  },

  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  monthGridCell: {
    width: "14.2857%",
    aspectRatio: 1,
    padding: 4,
  },
  monthGridDayHeader: {
    fontSize: 10,
    fontWeight: "900" as const,
    fontStyle: "italic",
    color: "#a1a1aa",
    textAlign: "center",
    letterSpacing: 1.5,
  },
  monthGridDayBox: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: "#f4f4f5",
    alignItems: "center",
    justifyContent: "center",
  },
  monthGridDayBoxFuture: { backgroundColor: "transparent", opacity: 0.2 },
  monthGridDayBoxToday: {
    backgroundColor: "#f97316",
    borderWidth: 2,
    borderColor: "#18181b",
  },
  monthGridDayText: {
    fontSize: 10,
    fontWeight: "900" as const,
    fontStyle: "italic",
    color: "#a1a1aa",
  },
  monthGridDayTextToday: { color: "#fff" },

  streakBox: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#f4f4f5",
    borderRadius: 24,
    padding: 24,
    marginTop: 8,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  streakIconWrap: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  streakLabel: {
    fontSize: 11,
    fontWeight: "900" as const,
    color: "#a1a1aa",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  streakValue: {
    fontSize: 30,
    fontWeight: "900" as const,
    fontStyle: "italic",
    color: "#18181b",
    letterSpacing: -1,
  },
  streakUnit: { fontSize: 14, fontWeight: "400" as const, opacity: 0.6 },
  streakHint: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#71717a",
    textAlign: "center",
    lineHeight: 18,
  },

  // Stats
  statsRangeRow: {
    flexDirection: "row",
    backgroundColor: "#f4f4f5",
    borderRadius: 999,
    padding: 4,
    marginBottom: 12,
    gap: 4,
  },
  statsRangeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRangeBtnActive: {
    backgroundColor: "#f97316",
  },
  statsRangeText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#a1a1aa",
  },
  statsRangeTextActive: { color: "#fff" },

  statsHeroRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  statsHeroValue: {
    fontSize: 64,
    fontWeight: "900" as const,
    fontStyle: "italic",
    color: "#18181b",
    letterSpacing: -2,
    lineHeight: 64,
  },
  statsHeroUnit: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#a1a1aa",
    letterSpacing: 1.5,
    paddingBottom: 8,
  },
  statsKpiRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  statsKpiValue: {
    fontSize: 22,
    fontWeight: "900" as const,
    fontStyle: "italic",
    color: "#18181b",
    letterSpacing: -0.5,
  },
  statsKpiLabel: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#a1a1aa",
    letterSpacing: 1.5,
    marginTop: 2,
  },

  chartWrap: {
    flex: 1,
    paddingHorizontal: 4,
    position: "relative",
  },
  chartGridLine: {
    position: "absolute",
    left: 4,
    right: 4,
    height: 1,
    borderTopWidth: 1,
    borderColor: "#f0f0f0",
    borderStyle: "dashed" as const,
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingTop: 8,
  },
  chartBarCol: {
    flex: 1,
    alignItems: "center",
    height: "100%",
  },
  chartBarTrack: {
    flex: 1,
    width: 28,
    justifyContent: "flex-end",
  },
  chartBar: {
    width: 28,
    backgroundColor: "#f97316",
    borderRadius: 6,
  },
  chartBarLabel: {
    fontSize: 7,
    fontWeight: "700" as const,
    color: "#a1a1aa",
    marginTop: 8,
  },
  chartBarEmpty: {
    backgroundColor: "#f4f4f5",
    borderRadius: 6,
  },
  chartContainer: {
    flexDirection: "row",
    marginTop: 20,
    paddingHorizontal: 4,
  },
  chartYAxis: {
    width: 36,
    justifyContent: "space-between",
    paddingVertical: 4,
    alignItems: "flex-end",
    paddingRight: 4,
  },
  chartYLabel: {
    fontSize: 9,
    fontWeight: "700" as const,
    color: "#a1a1aa",
  },
  modeToggleRow: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "#fafafa",
    borderRadius: 999,
    padding: 3,
    gap: 2,
    marginTop: 4,
    marginBottom: 4,
  },
  modeToggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
  },
  modeToggleBtnActive: {
    backgroundColor: "#18181b",
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: "900" as const,
    color: "#a1a1aa",
    letterSpacing: 0.5,
  },
  modeToggleTextActive: {
    color: "#fff",
  },
});

type StatsRange = "week" | "month" | "year" | "all";
type ViewMode = "time" | "count";
type BarDatum = { day: string; seconds: number; count: number };

// Mock raw data per range
const WEEK_BARS: BarDatum[] = [
  { day: "月", seconds: 0, count: 0 },
  { day: "火", seconds: 4, count: 1 },
  { day: "水", seconds: 0, count: 0 },
  { day: "木", seconds: 0, count: 0 },
  { day: "金", seconds: 0, count: 0 },
  { day: "土", seconds: 0, count: 0 },
  { day: "日", seconds: 0, count: 0 },
];

const MONTH_BARS: BarDatum[] = Array.from({ length: 31 }, (_, i) => {
  const d = i + 1;
  if (d === 5) return { day: String(d), seconds: 4, count: 1 };
  return { day: String(d), seconds: 0, count: 0 };
});

const YEAR_BARS: BarDatum[] = [
  "1","2","3","4","5","6","7","8","9","10","11","12",
].map((m) => ({
  day: m,
  seconds: m === "5" ? 4 : 0,
  count: m === "5" ? 1 : 0,
}));

const ALL_BARS: BarDatum[] = [
  { day: "2024", seconds: 0, count: 0 },
  { day: "2025", seconds: 0, count: 0 },
  { day: "2026", seconds: 4, count: 1 },
];

const RANGE_DATA: Record<StatsRange, BarDatum[]> = {
  week: WEEK_BARS,
  month: MONTH_BARS,
  year: YEAR_BARS,
  all: ALL_BARS,
};

const RANGE_LABEL: Record<StatsRange, string> = {
  week: "5月3日 - 5月9日",
  month: "2026年5月",
  year: "2026年",
  all: "すべての期間",
};

const SPRING = { damping: 18, stiffness: 140, mass: 0.9 } as const;

function MorphBar({
  visible,
  left,
  width,
  height,
  chartHeight,
  label,
  delay,
}: {
  visible: boolean;
  left: number;
  width: number;
  height: number;
  chartHeight: number;
  label: string;
  delay: number;
}) {
  const sLeft = useSharedValue<number>(left);
  const sWidth = useSharedValue<number>(width);
  const sHeight = useSharedValue<number>(visible ? Math.max(height, 4) : 4);
  const sOpacity = useSharedValue<number>(visible ? 1 : 0);
  const sIsEmpty = useSharedValue<number>(height === 0 ? 1 : 0);

  useEffect(() => {
    sLeft.value = withDelay(delay, withSpring(left, SPRING));
    sWidth.value = withDelay(delay, withSpring(width, SPRING));
    sHeight.value = withDelay(
      delay,
      withSpring(visible ? Math.max(height, 4) : 4, SPRING)
    );
    sOpacity.value = withTiming(visible ? 1 : 0, { duration: 220 });
    sIsEmpty.value = withTiming(height === 0 ? 1 : 0, { duration: 220 });
  }, [left, width, height, visible, delay, sLeft, sWidth, sHeight, sOpacity, sIsEmpty]);

  const containerStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: sLeft.value,
    bottom: 24,
    width: sWidth.value,
    height: sHeight.value,
    opacity: sOpacity.value,
  }));

  const fillStyle = useAnimatedStyle(() => ({
    flex: 1,
    borderRadius: 6,
    backgroundColor: sIsEmpty.value > 0.5 ? "#f4f4f5" : "#f97316",
  }));

  const LABEL_W = 28;
  const labelStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: sLeft.value + sWidth.value / 2 - LABEL_W / 2,
    width: LABEL_W,
    bottom: 4,
    opacity: sOpacity.value,
    alignItems: "center" as const,
  }));

  return (
    <>
      <Animated.View style={containerStyle} pointerEvents="none">
        <Animated.View style={fillStyle} />
      </Animated.View>
      <Animated.View style={labelStyle} pointerEvents="none">
        <Text style={styles.chartBarLabel} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </>
  );
}

const MAX_BAR_SLOTS = 31;

function formatHMS(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function StatsCard() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [range, setRange] = useState<StatsRange>("week");
  const [mode, setMode] = useState<ViewMode>("time");
  const bars = RANGE_DATA[range];

  const filterScrollX = useRef(new RNAnimated.Value(0)).current;
  const filterScrollRef = useRef<ScrollView>(null);

  const handleFilterScroll = useMemo(
    () =>
      RNAnimated.event([{ nativeEvent: { contentOffset: { x: filterScrollX } } }], {
        useNativeDriver: Platform.OS !== "web",
        listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / FILTER_SNAP);
          const clamped = Math.max(0, Math.min(idx, MONTH_FILTERS.length - 1));
          setActiveFilter(MONTH_FILTERS[clamped].id);
        },
      }),
    [filterScrollX]
  );

  const handleFilterSelect = useCallback((id: string) => {
    const idx = MONTH_FILTERS.findIndex((f) => f.id === id);
    if (idx >= 0) {
      filterScrollRef.current?.scrollTo({ x: idx * FILTER_SNAP, animated: true });
      setActiveFilter(id);
    }
  }, []);

  const { values, maxVal, totalSeconds, totalCount, hero, heroUnit } = useMemo(() => {
    const vals = bars.map((b) => (mode === "time" ? b.seconds / 3600 : b.count));
    const m = Math.max(...vals, 0.0001);
    const ts = bars.reduce((a, b) => a + b.seconds, 0);
    const tc = bars.reduce((a, b) => a + b.count, 0);
    const h = mode === "time" ? (ts / 3600).toFixed(1) : String(tc);
    const u = mode === "time" ? "時間" : "回";
    return { values: vals, maxVal: m, totalSeconds: ts, totalCount: tc, hero: h, heroUnit: u };
  }, [bars, mode]);

  const chartHeight = 160;
  const [chartWidth, setChartWidth] = useState<number>(0);
  const onChartLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (Math.abs(w - chartWidth) > 0.5) setChartWidth(w);
  };
  const yTicks = useMemo(() => {
    const arr = [0, 0.25, 0.5, 0.75, 1].map((p) => maxVal * p);
    return arr;
  }, [maxVal]);

  return (
    <View style={styles.weeklyCard}>
      <View style={styles.weekNavRow}>
        <Pressable hitSlop={8}>
          <ChevronLeft size={18} color="#d4d4d8" strokeWidth={3} />
        </Pressable>
        <Text style={styles.weekRangeText}>{RANGE_LABEL[range]}</Text>
        <Pressable hitSlop={8}>
          <ChevronRight size={18} color="#d4d4d8" strokeWidth={3} />
        </Pressable>
      </View>

      <RNAnimated.ScrollView
        ref={filterScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={FILTER_SNAP}
        snapToAlignment="start"
        decelerationRate={0.98}
        contentContainerStyle={[
          styles.monthFilterContent,
          { paddingLeft: FILTER_SIDE_PAD, paddingRight: FILTER_SIDE_PAD - FILTER_CARD_GAP },
        ]}
        style={styles.monthFilterRow}
        onScroll={handleFilterScroll}
        scrollEventThrottle={8}
      >
        {MONTH_FILTERS.map((f, i) => (
          <MissionFilterCard
            key={f.id}
            filter={f}
            index={i}
            scrollX={filterScrollX}
            isActive={f.id === activeFilter}
            onPress={handleFilterSelect}
          />
        ))}
      </RNAnimated.ScrollView>

      <View style={styles.statsRangeRow}>
        {(["week", "month", "year", "all"] as StatsRange[]).map((r) => {
          const labels: Record<StatsRange, string> = { week: "週", month: "月", year: "年", all: "すべて" };
          const isActive = range === r;
          return (
            <Pressable
              key={r}
              onPress={() => setRange(r)}
              style={[styles.statsRangeBtn, isActive && styles.statsRangeBtnActive]}
            >
              <Text style={[styles.statsRangeText, isActive && styles.statsRangeTextActive]}>
                {labels[r]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={() => setMode(mode === "time" ? "count" : "time")}>
        <Animated.View
          key={`${range}-${mode}-hero`}
          entering={FadeIn.duration(320)}
          exiting={FadeOut.duration(220)}
        >
          <View style={styles.statsHeroRow}>
            <Text style={styles.statsHeroValue}>{hero}</Text>
            <Text style={styles.statsHeroUnit}>{heroUnit}</Text>
          </View>
          <View style={styles.statsKpiRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.statsKpiValue}>{totalCount}</Text>
              <Text style={styles.statsKpiLabel}>タスク数</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statsKpiValue}>{formatHMS(totalSeconds)}</Text>
              <Text style={styles.statsKpiLabel}>合計時間</Text>
            </View>
          </View>
        </Animated.View>
      </Pressable>

      <View style={styles.chartContainer}>
        {/* Y axis labels */}
        <View style={[styles.chartYAxis, { height: chartHeight + 8 }]}>
          {yTicks.slice().reverse().map((v, i) => (
            <Text key={i} style={styles.chartYLabel}>
              {mode === "time" ? v.toFixed(v < 1 ? 4 : 1) : Math.round(v).toString()}
            </Text>
          ))}
        </View>

        {/* Chart area */}
        <View
          style={[styles.chartWrap, { height: chartHeight + 32 }]}
          onLayout={onChartLayout}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <View
              key={p}
              style={[
                styles.chartGridLine,
                { top: 8 + chartHeight * (1 - p) },
              ]}
            />
          ))}
          {chartWidth > 0
            ? Array.from({ length: MAX_BAR_SLOTS }).map((_, i) => {
                const visible = i < bars.length;
                const slotWidth = visible ? chartWidth / bars.length : 0;
                const v = visible ? values[i] : 0;
                const h = v === 0 ? 0 : Math.max(4, (v / maxVal) * chartHeight);
                const barWidth = visible
                  ? Math.max(4, Math.min(28, slotWidth * 0.6))
                  : 4;
                const left = visible
                  ? i * slotWidth + (slotWidth - barWidth) / 2
                  : chartWidth / 2;
                return (
                  <MorphBar
                    key={i}
                    visible={visible}
                    left={left}
                    width={barWidth}
                    height={h}
                    chartHeight={chartHeight}
                    label={
                      visible
                        ? range === "month"
                          ? [1, 6, 11, 16, 21, 26, 31].includes(i + 1)
                            ? bars[i].day
                            : ""
                          : bars[i].day
                        : ""
                    }
                    delay={visible ? i * 8 : 0}
                  />
                );
              })
            : null}
        </View>
      </View>
    </View>
  );
}

function MonthlyCard() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const active = MONTH_FILTERS.find((f) => f.id === activeFilter) ?? MONTH_FILTERS[0];
  const cells: (number | null)[] = [
    ...Array.from({ length: MONTH_FIRST_WEEKDAY }, () => null),
    ...Array.from({ length: MONTH_DAYS }, (_, i) => i + 1),
  ];

  const scrollX = useRef(new RNAnimated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = useMemo(
    () =>
      RNAnimated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
        useNativeDriver: Platform.OS !== "web",
        listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / FILTER_SNAP);
          const clamped = Math.max(0, Math.min(idx, MONTH_FILTERS.length - 1));
          setActiveFilter(MONTH_FILTERS[clamped].id);
        },
      }),
    [scrollX]
  );

  const handleSelect = useCallback((id: string) => {
    const idx = MONTH_FILTERS.findIndex((f) => f.id === id);
    if (idx >= 0) {
      scrollRef.current?.scrollTo({ x: idx * FILTER_SNAP, animated: true });
      setActiveFilter(id);
    }
  }, []);

  return (
    <View style={styles.weeklyCard}>
      <View style={styles.weekNavRow}>
        <Pressable hitSlop={8}>
          <ChevronLeft size={18} color="#d4d4d8" strokeWidth={3} />
        </Pressable>
        <Text style={styles.weekRangeText}>2026年5月</Text>
        <Pressable hitSlop={8}>
          <ChevronRight size={18} color="#d4d4d8" strokeWidth={3} />
        </Pressable>
      </View>

      <RNAnimated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={FILTER_SNAP}
        snapToAlignment="start"
        decelerationRate={0.98}
        contentContainerStyle={[
          styles.monthFilterContent,
          { paddingLeft: FILTER_SIDE_PAD, paddingRight: FILTER_SIDE_PAD - FILTER_CARD_GAP },
        ]}
        style={styles.monthFilterRow}
        onScroll={handleScroll}
        scrollEventThrottle={8}
      >
        {MONTH_FILTERS.map((f, i) => (
          <MissionFilterCard
            key={f.id}
            filter={f}
            index={i}
            scrollX={scrollX}
            isActive={f.id === activeFilter}
            onPress={handleSelect}
          />
        ))}
      </RNAnimated.ScrollView>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          paddingHorizontal: 4,
        }}
      >
        <Text style={styles.monthSectionTitle}>{active.title}</Text>
        <View style={styles.monthLegendRow}>
          <View style={styles.monthLegendItem}>
            <View style={[styles.monthLegendSwatch, { backgroundColor: "#f97316" }]} />
            <Text style={styles.monthLegendText}>完了</Text>
          </View>
          <View style={styles.monthLegendItem}>
            <View style={[styles.monthLegendSwatch, { backgroundColor: "#f4f4f5" }]} />
            <Text style={styles.monthLegendText}>未完了</Text>
          </View>
        </View>
      </View>

      <View style={styles.monthGrid}>
        {["月", "火", "水", "木", "金", "土", "日"].map((d) => (
          <View key={d} style={styles.monthGridCell}>
            <Text style={styles.monthGridDayHeader}>{d}</Text>
          </View>
        ))}
        {cells.map((day, idx) => {
          if (day === null) {
            return <View key={`e-${idx}`} style={styles.monthGridCell} />;
          }
          const isToday = day === TODAY_DAY;
          const isFuture = day > TODAY_DAY;
          return (
            <View key={day} style={styles.monthGridCell}>
              <View
                style={[
                  styles.monthGridDayBox,
                  isFuture && styles.monthGridDayBoxFuture,
                  isToday && styles.monthGridDayBoxToday,
                ]}
              >
                <Text style={[styles.monthGridDayText, isToday && styles.monthGridDayTextToday]}>
                  {day}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.streakBox}>
        <View style={styles.streakRow}>
          <View style={styles.streakIconWrap}>
            <Flame size={24} color="#f97316" strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.streakLabel}>現在の継続日数</Text>
            <Text style={styles.streakValue}>
              1 <Text style={styles.streakUnit}>DAYS</Text>
            </Text>
          </View>
        </View>
        <Text style={styles.streakHint}>
          素晴らしい継続です！この調子でカレンダーをオレンジ色に染めていきましょう。
        </Text>
      </View>
    </View>
  );
}
