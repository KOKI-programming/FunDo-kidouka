import React, { memo, useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Search, Target, Activity, ChevronRight, Plus } from "lucide-react-native";
import Svg, { Text as SvgText, Path, G } from "react-native-svg";
import * as Haptics from "expo-haptics";
import FadeInOnFocus from "@/components/FadeInOnFocus";

const FILTERS = ["すべて", "Study", "Work", "Exercise", "Clean", "Routine", "Tasks"] as const;
type Filter = (typeof FILTERS)[number];

type Course = {
  id: string;
  rank: number;
  days: 1 | 3;
  title: string;
  goal: string;
  participants: string;
  imageUrl: string;
  color: string;
};

const RANK_COLORS = ["#10b981", "#8b5cf6", "#f59e0b", "#3b82f6", "#0ea5e9"] as const;
const colorAt = (i: number): string => RANK_COLORS[i % RANK_COLORS.length] as string;

const COURSES: Course[] = [
  { id: "c1", rank: 1, days: 1, title: "5分だけジム前のだるさを抜ける", goal: "着替えて家を出る", participants: "4,231人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=600", color: "#10b981" },
  { id: "c2", rank: 2, days: 1, title: "3分だけ後回しを壊す", goal: "ずっと残っている1つ", participants: "4,100人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=600", color: "#8b5cf6" },
  { id: "c3", rank: 3, days: 1, title: "3分だけ運動の面倒を超える", goal: "まずは1セット", participants: "3,890人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?auto=format&fit=crop&q=80&w=600", color: "#10b981" },
  { id: "c4", rank: 4, days: 1, title: "3分だけ夜ダラダラを抜ける", goal: "スマホを置いてリセット", participants: "3,500人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600", color: "#f59e0b" },
  { id: "c5", rank: 5, days: 1, title: "5分だけ面倒タスクに触る", goal: "心理的ハードルを下げる", participants: "3,200人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1544411047-c491574abbde?auto=format&fit=crop&q=80&w=600", color: "#8b5cf6" },
  { id: "c6", rank: 6, days: 1, title: "5分だけ着手の壁を壊す", goal: "最重要タスク開始", participants: "3,102人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=600", color: "#3b82f6" },
  { id: "c7", rank: 7, days: 1, title: "5分だけ朝のだるさを切る", goal: "1日の勢いを作る", participants: "2,900人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600", color: "#f59e0b" },
  { id: "c8", rank: 8, days: 1, title: "3分だけ仕事前のだるさを超える", goal: "モード切り替え", participants: "2,750人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=600", color: "#3b82f6" },
  { id: "c9", rank: 9, days: 1, title: "3分だけ勉強の重さを超える", goal: "まずは机に向かう", participants: "2,453人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600", color: "#f59e0b" },
  { id: "c10", rank: 10, days: 1, title: "3分だけ体を動かし始める", goal: "ゼロを防ぐ", participants: "2,100人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1594882645126-14020914d58d?auto=format&fit=crop&q=80&w=600", color: "#10b981" },
  { id: "c11", rank: 11, days: 1, title: "3分だけ片付けの面倒を超える", goal: "1ヶ所だけリセット", participants: "2,100人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=600", color: "#0ea5e9" },
  { id: "c12", rank: 12, days: 1, title: "10分だけ気が重いことを進める", goal: "着実に消化する", participants: "1,900人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&q=80&w=600", color: "#8b5cf6" },
  { id: "c13", rank: 13, days: 1, title: "5分だけ夜の勉強だるさを抜ける", goal: "夜の着火", participants: "1,892人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600", color: "#f59e0b" },
  { id: "c14", rank: 14, days: 1, title: "5分だけ部屋のだるさを減らす", goal: "床の物を取り除く", participants: "1,850人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&q=80&w=600", color: "#0ea5e9" },
  { id: "c15", rank: 15, days: 1, title: "10分だけ最初の仕事を進める", goal: "波に乗る", participants: "1,543人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=600", color: "#3b82f6" },
  { id: "c16", rank: 16, days: 1, title: "5分だけ寝る前の乱れを戻す", goal: "穏やかに眠る準備", participants: "1,400人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600", color: "#f59e0b" },
  { id: "c17", rank: 17, days: 1, title: "10分だけ課題の先延ばしを壊す", goal: "最初の1問に着手", participants: "1,240人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=600", color: "#f59e0b" },
  { id: "c18", rank: 18, days: 1, title: "5分だけ机まわりを整える", goal: "集中環境を作る", participants: "1,200人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f816b1a238?auto=format&fit=crop&q=80&w=600", color: "#0ea5e9" },
  { id: "c19", rank: 19, days: 3, title: "運動再開 3日コース", goal: "「久々」の壁を壊す", participants: "1,120人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=600", color: "#10b981" },
  { id: "c20", rank: 20, days: 3, title: "後回し清算 3日コース", goal: "3日で3つの負債を消す", participants: "1,100人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1522071823990-9512fe9df94c?auto=format&fit=crop&q=80&w=600", color: "#8b5cf6" },
  { id: "c21", rank: 21, days: 3, title: "先延ばし仕事撃破 3日コース", goal: "心理的負債を整理", participants: "920人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=600", color: "#3b82f6" },
  { id: "c22", rank: 22, days: 3, title: "夜勉強再起動 3日コース", goal: "3日連続で開始する", participants: "856人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600", color: "#f59e0b" },
  { id: "c23", rank: 23, days: 3, title: "朝を取り戻す 3日コース", goal: "最初の10分を固定", participants: "800人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&q=80&w=600", color: "#f59e0b" },
  { id: "c24", rank: 24, days: 3, title: "部屋リセット 3日コース", goal: "主要エリアを整える", participants: "650人が挑戦中", imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600", color: "#0ea5e9" },
];

const AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100",
];

const Logo = memo(function Logo() {
  return (
    <Svg viewBox="0 0 400 140" width={112} height={39.2}>
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

const RankNumber = memo(function RankNumber({ rank, color }: { rank: number; color: string }) {
  const isDouble = rank >= 10;
  return (
    <Svg width={isDouble ? 130 : 90} height={110} viewBox={isDouble ? "0 0 130 110" : "0 0 90 110"}>
      <SvgText
        x={0}
        y={92}
        fontSize={110}
        fontWeight="900"
        fontStyle="italic"
        fontFamily="System"
        letterSpacing={-6}
        fill="#ffffff"
        stroke={color}
        strokeWidth={2}
      >
        {String(rank)}
      </SvgText>
    </Svg>
  );
});

const CourseCard = memo(function CourseCard({
  course,
  onPress,
}: {
  course: Course;
  onPress: (c: Course) => void;
}) {
  return (
    <Pressable onPress={() => onPress(course)} style={styles.cardOuter} testID={`course-${course.id}`}>
      <View style={[styles.rankNumWrap, course.rank >= 10 && styles.rankNumWrapDouble]} pointerEvents="none">
        <RankNumber rank={course.rank} color={course.color} />
      </View>
      <View style={styles.card}>
        <Image source={{ uri: course.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        <View style={styles.cardOverlay} />
        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <View style={styles.daysBadge}>
              <Text style={styles.daysBadgeText}>{course.days} {course.days === 1 ? "DAY" : "DAYS"}</Text>
            </View>
            <Text style={styles.courseGoalLabel}>COURSE GOAL</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {course.title}
          </Text>
          <View style={styles.cardBottomRow}>
            <View style={styles.cardMetaCol}>
              <View style={styles.metaRow}>
                <Target color="#ffffff" size={14} strokeWidth={2} />
                <Text style={styles.metaText}>{course.goal}</Text>
              </View>
              <View style={styles.metaRow}>
                <Activity color="rgba(255,255,255,0.6)" size={12} strokeWidth={2} />
                <Text style={styles.metaTextDim}>{course.participants}</Text>
              </View>
            </View>
            <View style={styles.chevronCircle}>
              <ChevronRight color="#ffffff" size={18} strokeWidth={2} />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

export default function CourseScreen() {
  const [active, setActive] = useState<Filter>("すべて");

  const handleFilter = useCallback((f: Filter) => {
    setActive(f);
    void Haptics.selectionAsync();
  }, []);

  const handlePress = useCallback((c: Course) => {
    console.log(`[course] tapped: ${c.id}`);
    void Haptics.selectionAsync();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FadeInOnFocus>
      <View style={styles.header}>
        <Logo />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        testID="course-scroll"
      >
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>コース</Text>
          <Pressable style={styles.searchBtn} testID="course-search">
            <Search color="#18181b" size={22} strokeWidth={2} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const isActive = f === active;
            return (
              <Pressable
                key={f}
                onPress={() => handleFilter(f)}
                style={[styles.chip, isActive && styles.chipActive]}
                testID={`course-filter-${f}`}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.headingBlock}>
          <Text style={styles.headingTitle}>人気コースランキング</Text>
          <Text style={styles.headingSub}>現在、多くのユーザーが挑戦している人気のコースです。</Text>
        </View>

        <View style={styles.list}>
          {COURSES.map((c, i) => (
            <CourseCard key={c.id} course={{ ...c, color: colorAt(i) }} onPress={handlePress} />
          ))}
        </View>

        <View style={styles.roadmapCard}>
          <View style={styles.roadmapIcon}>
            <Plus color="#d4d4d8" size={24} strokeWidth={2} />
          </View>
          <Text style={styles.roadmapLabel}>ROADMAP UPDATE INCOMING</Text>
          <Text style={styles.roadmapText}>
            あなたの行動を加速させる新しい短期コースを準備中です。
          </Text>
        </View>

        <View style={styles.cheerWrap}>
          <View style={styles.avatarsRow}>
            {AVATARS.map((url, i) => (
              <View key={url} style={[styles.avatarRing, { marginLeft: i === 0 ? 0 : -8, zIndex: AVATARS.length - i }]}>
                <Image source={{ uri: url }} style={styles.avatar} contentFit="cover" />
              </View>
            ))}
            <View style={[styles.avatarRing, styles.avatarPlus]}>
              <Text style={styles.avatarPlusText}>+99</Text>
            </View>
          </View>
          <Text style={styles.cheerText}>EVERYONE IS CHEERING YOU ON!</Text>
        </View>
      </ScrollView>
      </FadeInOnFocus>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
  },
  scroll: { paddingBottom: 60 },
  titleRow: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  titleText: { fontSize: 20, fontWeight: "800" as const, color: "#18181b", letterSpacing: -0.5 },
  searchBtn: {
    position: "absolute",
    right: 16,
    top: 8,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  filterRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f4f4f5",
    marginRight: 8,
  },
  chipActive: { backgroundColor: "#ffedd5" },
  chipText: { fontSize: 13, fontWeight: "800" as const, color: "#71717a" },
  chipTextActive: { color: "#ea580c" },
  headingBlock: { paddingHorizontal: 24, marginTop: 8, marginBottom: 12 },
  headingTitle: { fontSize: 22, fontWeight: "800" as const, color: "#18181b", letterSpacing: -0.5 },
  headingSub: { fontSize: 13, color: "#71717a", fontWeight: "500" as const, marginTop: 2 },
  list: { paddingHorizontal: 16, gap: 16 },
  cardOuter: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  rankNumWrap: {
    position: "absolute",
    left: -8,
    zIndex: 20,
    top: "50%",
    marginTop: -55,
  },
  rankNumWrapDouble: { left: -16 },
  card: {
    height: 176,
    flex: 1,
    borderRadius: 36,
    overflow: "hidden",
    marginLeft: 48,
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#f4f4f5",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  cardContent: {
    flex: 1,
    padding: 22,
    paddingLeft: 36,
    justifyContent: "flex-end",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  daysBadge: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  daysBadgeText: { fontSize: 9, fontWeight: "900" as const, color: "#18181b", letterSpacing: -0.3 },
  courseGoalLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 9,
    fontWeight: "900" as const,
    letterSpacing: 1.5,
    fontStyle: "italic",
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "900" as const,
    fontStyle: "italic",
    letterSpacing: -0.6,
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  cardMetaCol: { gap: 2, flex: 1, paddingRight: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "700" as const,
    fontStyle: "italic",
  },
  metaTextDim: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontWeight: "700" as const,
    fontStyle: "italic",
  },
  chevronCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  roadmapCard: {
    marginTop: 28,
    marginHorizontal: 16,
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderRadius: 36,
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderStyle: "dashed",
    alignItems: "center",
  },
  roadmapIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  roadmapLabel: {
    fontSize: 10,
    fontWeight: "900" as const,
    color: "#a1a1aa",
    letterSpacing: 2,
    fontStyle: "italic",
    marginBottom: 8,
  },
  roadmapText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#71717a",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 18,
  },
  cheerWrap: {
    marginTop: 56,
    alignItems: "center",
    paddingBottom: 20,
  },
  avatarsRow: { flexDirection: "row", marginBottom: 16 },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#ffffff",
    backgroundColor: "#fafafa",
    overflow: "hidden",
  },
  avatar: { width: "100%", height: "100%" },
  avatarPlus: {
    marginLeft: -8,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlusText: { fontSize: 10, fontWeight: "900" as const, color: "#a1a1aa" },
  cheerText: {
    fontSize: 10,
    fontWeight: "900" as const,
    color: "#a1a1aa",
    letterSpacing: 2,
    fontStyle: "italic",
  },
});
