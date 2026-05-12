import React, { memo, useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Search } from "lucide-react-native";
import Svg, { Defs, LinearGradient, Stop, Text as SvgText, Path, G } from "react-native-svg";
import * as Haptics from "expo-haptics";
import FadeInOnFocus from "@/components/FadeInOnFocus";
import { useRouter } from "expo-router";
import {
  type ContentItem,
  type ContentCategory,
  TOP10,
  WORKOUT,
  CLEANING,
  TOP_SESSIONS,
  SELF,
  STUDY,
  GROWTH,
  BRAND,
  MORNING,
  NIGHT,
} from "@/constants/contents";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_CARD_WIDTH = (SCREEN_WIDTH - 16 - 8) / 2;
const GRID_CARD_HEIGHT = 140;
const RANK_CARD_WIDTH = 280;
const RANK_CARD_HEIGHT = 160;

const FILTERS = [
  "すべて",
  "お気に入り",
  "音楽",
  "ポッドキャスト",
  "オススメ",
  "集中",
  "モチベーションUP",
  "知識・情報",
] as const;

type Filter = (typeof FILTERS)[number];


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

const RankNumber = memo(function RankNumber({ rank, gradId }: { rank: number; gradId: string }) {
  const text = String(rank);
  return (
    <Svg width={180} height={180} viewBox="0 0 120 100">
      <Defs>
        <LinearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#F97316" />
          <Stop offset="100%" stopColor="#EA580C" />
        </LinearGradient>
      </Defs>
      <SvgText
        x={0}
        y={90}
        fontSize={100}
        fontWeight="900"
        fontStyle="italic"
        fontFamily="System"
        letterSpacing={-5}
        fill="none"
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={3}
      >
        {text}
      </SvgText>
      <SvgText
        x={0}
        y={90}
        fontSize={100}
        fontWeight="900"
        fontStyle="italic"
        fontFamily="System"
        letterSpacing={-5}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={2}
      >
        {text}
      </SvgText>
    </Svg>
  );
});

const CategoryBadge = memo(function CategoryBadge({ category }: { category: ContentCategory }) {
  return (
    <View style={styles.categoryBadge}>
      <Text style={styles.categoryBadgeText}>{category}</Text>
    </View>
  );
});

const RankCard = memo(function RankCard({
  item,
  rank,
  gradId,
  onPress,
}: {
  item: ContentItem;
  rank: number;
  gradId: string;
  onPress: (item: ContentItem) => void;
}) {
  return (
    <View style={styles.rankCardContainer}>
      <View style={styles.rankNumberWrap} pointerEvents="none">
        <RankNumber rank={rank} gradId={gradId} />
      </View>
      <Pressable
        style={({ pressed }) => [styles.rankCard, pressed && styles.pressed]}
        onPress={() => onPress(item)}
        testID={`rank-card-${item.id}`}
      >
        <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        <View style={styles.rankCardTopRight}>
          <CategoryBadge category={item.category} />
        </View>
      </Pressable>
    </View>
  );
});

const GridCard = memo(function GridCard({ item, onPress }: { item: ContentItem; onPress: (i: ContentItem) => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.gridCard, pressed && styles.pressed]}
      onPress={() => onPress(item)}
      testID={`grid-card-${item.id}`}
    >
      <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      <View style={styles.gridCardTopRight}>
        <CategoryBadge category={item.category} />
      </View>
    </Pressable>
  );
});

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionAccent} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function RankSection({
  title,
  items,
  gradPrefix,
  onPress,
}: {
  title: string;
  items: ContentItem[];
  gradPrefix: string;
  onPress: (i: ContentItem) => void;
}) {
  return (
    <View style={styles.sectionWrap}>
      <SectionHeader title={title} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rankScrollContent}
        decelerationRate={0.95}
      >
        {items.map((it, i) => (
          <RankCard key={it.id} item={it} rank={i + 1} gradId={`${gradPrefix}-${i}`} onPress={onPress} />
        ))}
      </ScrollView>
    </View>
  );
}

function GridSection({
  title,
  items,
  onPress,
}: {
  title: string;
  items: ContentItem[];
  onPress: (i: ContentItem) => void;
}) {
  return (
    <View style={styles.sectionWrap}>
      <SectionHeader title={title} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gridScrollContent}
      >
        {items.map((it) => (
          <GridCard key={it.id} item={it} onPress={onPress} />
        ))}
      </ScrollView>
    </View>
  );
}

export default function ChallengeScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<Filter>("すべて");

  const handleFilter = useCallback((f: Filter) => {
    setActiveFilter(f);
    void Haptics.selectionAsync();
  }, []);

  const handleItemPress = useCallback((item: ContentItem) => {
    void Haptics.selectionAsync();
    router.push({
      pathname: "/content-detail",
      params: {
        id: item.id,
        title: item.title,
        imageUrl: item.imageUrl,
        category: item.category,
      },
    });
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FadeInOnFocus>
      <View style={styles.header}>
        <Logo />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} testID="content-scroll">
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>コンテンツ</Text>
          <Pressable style={styles.searchBtn} testID="search-btn">
            <Search color="#18181b" size={24} strokeWidth={2.5} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const active = f === activeFilter;
            return (
              <Pressable
                key={f}
                onPress={() => handleFilter(f)}
                style={[styles.filterChip, active && styles.filterChipActive]}
                testID={`filter-${f}`}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <RankSection title="人気コンテンツトップ10" items={TOP10} gradPrefix="rank-grad-1" onPress={handleItemPress} />
        <GridSection title="筋トレ・運動系" items={WORKOUT} onPress={handleItemPress} />
        <GridSection title="掃除・家事" items={CLEANING} onPress={handleItemPress} />
        <RankSection title="あなたへのトップセッション10" items={TOP_SESSIONS} gradPrefix="rank-grad-2" onPress={handleItemPress} />
        <GridSection title="自己嫌悪・落ち込み" items={SELF} onPress={handleItemPress} />
        <GridSection title="勉強・作業" items={STUDY} onPress={handleItemPress} />
        <GridSection title="ライフハック・自己成長" items={GROWTH} onPress={handleItemPress} />
        <GridSection title="男磨き・自己ブランディング" items={BRAND} onPress={handleItemPress} />
        <GridSection title="朝・スタートダッシュ" items={MORNING} onPress={handleItemPress} />
        <GridSection title="夜・振り返り・整える" items={NIGHT} onPress={handleItemPress} />
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
    paddingBottom: 0,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
  },
  scrollContent: { paddingBottom: 32 },
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
  searchBtn: {
    position: "absolute",
    right: 20,
    top: 8,
    padding: 4,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#f4f4f5",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#f97316",
    shadowColor: "#fed7aa",
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "800" as const,
    color: "#71717a",
  },
  filterTextActive: { color: "#ffffff" },
  sectionWrap: {
    marginTop: 8,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 6,
  },
  sectionAccent: {
    width: 6,
    height: 24,
    borderRadius: 3,
    backgroundColor: "#f97316",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900" as const,
    color: "#18181b",
    letterSpacing: -0.5,
  },
  rankScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 16,
  },
  rankCardContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: RANK_CARD_HEIGHT + 24,
    marginRight: 16,
  },
  rankNumberWrap: {
    position: "absolute",
    left: -24,
    bottom: -25,
    width: 180,
    height: 180,
    zIndex: 10,
  },
  rankCard: {
    width: RANK_CARD_WIDTH,
    height: RANK_CARD_HEIGHT,
    borderRadius: 24,
    overflow: "hidden",
    marginLeft: 56,
    backgroundColor: "#27272a",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  rankCardTopRight: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  gridScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  gridCard: {
    width: GRID_CARD_WIDTH,
    height: GRID_CARD_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 8,
    backgroundColor: "#27272a",
  },
  gridCardTopRight: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  categoryBadge: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  categoryBadgeText: {
    color: "#fb923c",
    fontSize: 10,
    fontWeight: "900" as const,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
