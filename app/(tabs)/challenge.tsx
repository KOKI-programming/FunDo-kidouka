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

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_CARD_WIDTH = (SCREEN_WIDTH - 16 - 8) / 2;
const GRID_CARD_HEIGHT = 140;
const RANK_CARD_WIDTH = 280;
const RANK_CARD_HEIGHT = 160;

type ContentCategory = "音楽" | "ポッドキャスト";

type ContentItem = {
  id: string;
  title: string;
  imageUrl: string;
  category: ContentCategory;
};

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

const TOP10: ContentItem[] = [
  { id: "t1", title: "筋トレが続く5つの習慣", imageUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "t2", title: "限界を更新する", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "t3", title: "サボる自分を潰す音", imageUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "t4", title: "今日は自分に勝つ日", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "t5", title: "鬼集中ワークアウト", imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "t6", title: "心拍数ぶち上げモード", imageUrl: "https://images.unsplash.com/photo-1599058917233-57c0e6843651?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "t7", title: "「あと1回」を引き出す音", imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "t8", title: "バチバチに仕上げる時間", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "t9", title: "ダルいを吹き飛ばす音", imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "t10", title: "何も考えずこれ流せ", imageUrl: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=600", category: "音楽" },
];

const WORKOUT: ContentItem[] = TOP10.slice(0, 8);

const CLEANING: ContentItem[] = [
  { id: "c1", title: "ダルいを吹き飛ばす音", imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "c2", title: "何も考えずこれ流せ", imageUrl: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "c3", title: "とりあえずやる", imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "c4", title: "部屋も人生も整える時間", imageUrl: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "c5", title: "動き出したら勝ち", imageUrl: "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "c6", title: "気づいたら終わってる掃除", imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "c7", title: "無心で片付ける", imageUrl: "https://images.unsplash.com/photo-1595667949212-fa133a67d224?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "c8", title: "自分リセットタイム", imageUrl: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
];

const TOP_SESSIONS: ContentItem[] = [
  { id: "s1", title: "とりあえずやる", imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "s2", title: "部屋も人生も整える時間", imageUrl: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "s3", title: "動き出したら勝ち", imageUrl: "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "s4", title: "気づいたら終わってる掃除", imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "s5", title: "無心で片付ける", imageUrl: "https://images.unsplash.com/photo-1595667949212-fa133a67d224?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "s6", title: "自分リセットタイム", imageUrl: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "s7", title: "何もできなかった日のあなたへ", imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "s8", title: "自己嫌悪リセット音声", imageUrl: "https://images.unsplash.com/photo-1499209974431-9dac3adaf477?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "s9", title: "大丈夫、まだいける", imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "s10", title: "もう一回立て直す時間", imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
];

const SELF: ContentItem[] = [
  { id: "se1", title: "何もできなかった日のあなたへ", imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "se2", title: "自己嫌悪リセット音声", imageUrl: "https://images.unsplash.com/photo-1499209974431-9dac3adaf477?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "se3", title: "大丈夫、まだいける", imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "se4", title: "もう一回立て直す時間", imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "se5", title: "自分を責めすぎてる人へ", imageUrl: "https://images.unsplash.com/photo-1528712306091-ed0763094c98?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "se6", title: "今日ダメでも明日は変えられる", imageUrl: "https://images.unsplash.com/photo-1474418397713-7ede21d49118?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "se7", title: "落ち込んだ夜のリカバリー", imageUrl: "https://images.unsplash.com/photo-1516585427369-139f3769e7cf?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "se8", title: "メンタル応急処置", imageUrl: "https://images.unsplash.com/photo-1506485338023-6ce5f366927f?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
];

const STUDY: ContentItem[] = [
  { id: "st1", title: "脳をゾーンに入れる", imageUrl: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "st2", title: "これ流したら終わるまでやれ", imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "st3", title: "ガチ集中モード", imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "st4", title: "世界を遮断する音", imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "st5", title: "静かに狂う作業時間", imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "st6", title: "圧倒的没入モード", imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "st7", title: "思考を研ぎ澄ます音", imageUrl: "https://images.unsplash.com/photo-1488190211405-58a4a58e17b4?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "st8", title: "今やらないと終わる", imageUrl: "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
];

const GROWTH: ContentItem[] = [
  { id: "g1", title: "世界が変わる！読書の習慣", imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "g2", title: "人生効率化ラジオ", imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "g3", title: "無駄を削る思考", imageUrl: "https://images.unsplash.com/photo-1491336477066-31156b5e4f35?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "g4", title: "成長したいやつだけ聞け", imageUrl: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "g5", title: "頭いい人の習慣", imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "g6", title: "明日から変わる思考法", imageUrl: "https://images.unsplash.com/photo-1454165833767-027469550d33?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "g7", title: "成果出す人の裏側", imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "g8", title: "人生を加速させる時間", imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
];

const BRAND: ContentItem[] = [
  { id: "b1", title: "モテる男の習慣", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "b2", title: "自分の価値を上げる時間", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "b3", title: "かっこいい男の作り方", imageUrl: "https://images.unsplash.com/photo-1550133730-695473e544be?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "b4", title: "一段上の男になる", imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "b5", title: "舐められない自分へ", imageUrl: "https://images.unsplash.com/photo-1552581234-2612df0dd050?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "b6", title: "余裕ある男の思考", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "b7", title: "自信を作る時間", imageUrl: "https://images.unsplash.com/photo-1531384441138-203d9f0bd6d5?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "b8", title: "見た目も中身も整える", imageUrl: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&q=80&w=600", category: "音楽" },
];

const MORNING: ContentItem[] = [
  { id: "m1", title: "今日を勝ちに行く朝", imageUrl: "https://images.unsplash.com/photo-1495539406979-bf61750d38ad?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "m2", title: "朝から差をつける", imageUrl: "https://images.unsplash.com/photo-1499591934245-40b55745b905?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "m3", title: "スイッチ入れる", imageUrl: "https://images.unsplash.com/photo-1508138221679-760a23a2285b?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "m4", title: "最強の1日スタート", imageUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "m5", title: "だるい朝をぶっ壊す", imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "m6", title: "朝を制する者が人生を制す", imageUrl: "https://images.unsplash.com/photo-1495364141860-b0d03eccd065?auto=format&fit=crop&q=80&w=600", category: "音楽" },
];

const NIGHT: ContentItem[] = [
  { id: "n1", title: "今日をちゃんと終わらせる", imageUrl: "https://images.unsplash.com/photo-1505322022379-7c3353ee6291?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "n2", title: "明日に繋げる夜", imageUrl: "https://images.unsplash.com/photo-1511289080610-b6cb7829db7b?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "n3", title: "1日を無駄にしない振り返り", imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "n4", title: "心を整える時間", imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "n5", title: "明日勝つための夜", imageUrl: "https://images.unsplash.com/photo-1531353826977-0941b4779a1c?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
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
  const [activeFilter, setActiveFilter] = useState<Filter>("すべて");

  const handleFilter = useCallback((f: Filter) => {
    setActiveFilter(f);
    void Haptics.selectionAsync();
  }, []);

  const handleItemPress = useCallback((item: ContentItem) => {
    console.log(`[content] tapped: ${item.id} ${item.title}`);
    void Haptics.selectionAsync();
  }, []);

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
