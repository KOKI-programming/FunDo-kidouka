import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Bookmark, Music, Play, Pause } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const MISSIONS_FOR_CONTENT = [
  {
    id: "lazy-start",
    title: "LAZY START",
    subtitle: "3分間 だるい時",
    imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "reading",
    title: "READING",
    subtitle: "5分間 本を読む",
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "cleaning",
    title: "CLEANING",
    subtitle: "10分間 部屋の片付け",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "deep-work",
    title: "DEEP WORK",
    subtitle: "15分間 集中作業",
    imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=600",
  },
];

export default function ContentDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    title: string;
    imageUrl: string;
    category: string;
  }>();

  const [selectedMission, setSelectedMission] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [playing, setPlaying] = useState(false);

  const scrollY = useSharedValue(0);

  // slide-up entrance animation
  const slideY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    slideY.value = withSpring(0, { damping: 28, stiffness: 260, mass: 0.8 });
    backdropOpacity.value = withTiming(1, { duration: 250 });
  }, []);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleClose = useCallback(() => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    slideY.value = withTiming(SCREEN_HEIGHT, { duration: 320 });
    backdropOpacity.value = withTiming(0, { duration: 280 });
    setTimeout(() => router.back(), 320);
  }, [router]);

  const heroAnimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, SCREEN_HEIGHT * 0.3], [1, 0.6], Extrapolation.CLAMP),
  }));

  const handleMissionSelect = useCallback((index: number) => {
    setSelectedMission(index);
    if (Platform.OS !== "web") {
      void Haptics.selectionAsync();
    }
  }, []);

  const handleBookmark = useCallback(() => {
    setBookmarked((b) => !b);
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleStart = useCallback(() => {
    setPlaying((p) => !p);
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const handleSpotify = useCallback(() => {
    const query = encodeURIComponent(params.title ?? "");
    void Linking.openURL(`https://open.spotify.com/search/${query}`);
  }, [params.title]);

  const title = params.title ?? "";
  const imageUrl = params.imageUrl ?? "";
  const category = params.category ?? "音楽";

  const categoryLabel = category === "音楽" ? "音楽" : "ポッドキャスト";
  const secondaryTag = category === "音楽" ? "筋トレ" : "メンタル";

  return (
    <View style={styles.rootContainer}>
      <Animated.View style={[styles.backdrop, backdropStyle]} />
      <Animated.View style={[styles.root, slideStyle]}>
      <Animated.ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          scrollY.value = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        {/* Hero section */}
        <Animated.View style={[styles.hero, heroAnimStyle]}>
          <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View style={styles.heroGradient} />

          {/* Top bar */}
          <SafeAreaView style={styles.topBar} edges={["top"]}>
            <Pressable
              style={styles.iconBtn}
              onPress={handleClose}
              hitSlop={12}
            >
              <ArrowLeft color="#fff" size={28} strokeWidth={2} />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={handleBookmark} hitSlop={12}>
              <Bookmark
                color="#fff"
                size={28}
                strokeWidth={2.5}
                fill={bookmarked ? "#fff" : "none"}
              />
            </Pressable>
          </SafeAreaView>

          {/* Hero text */}
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{title}</Text>
            <Text style={styles.heroSub}>
              <Text style={styles.heroSubAccent}>{categoryLabel}</Text>
              {"  ・  "}
              {secondaryTag}
            </Text>
          </View>

          {/* Mission selector */}
          <View style={styles.missionSection}>
            <Text style={styles.missionLabel}>SELECT MISSION</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.missionScroll}
              decelerationRate={0.9}
              snapToInterval={SCREEN_WIDTH * 0.72 + 24}
              snapToAlignment="center"
            >
              {MISSIONS_FOR_CONTENT.map((m, i) => {
                const active = i === selectedMission;
                return (
                  <Pressable
                    key={m.id}
                    style={[styles.missionCard, active && styles.missionCardActive]}
                    onPress={() => handleMissionSelect(i)}
                  >
                    <Image source={{ uri: m.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
                    <View style={styles.missionCardOverlay} />
                    <View style={styles.missionCardContent}>
                      <Text style={styles.missionCardTitle}>{m.title}</Text>
                      <View style={styles.missionChip}>
                        <Text style={styles.missionChipText}>{m.subtitle}</Text>
                      </View>
                      <View style={styles.missionMeta}>
                        <Music color="#fb923c" size={12} strokeWidth={2} />
                        <Text style={styles.missionMetaText} numberOfLines={1}>{title}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Animated.View>

        {/* START button */}
        <View style={styles.startWrap}>
          <Pressable
            style={({ pressed }) => [styles.startBtn, pressed && styles.startBtnPressed]}
            onPress={handleStart}
          >
            <View style={styles.startInner}>
              {playing ? (
                <Pause color="#18181b" size={44} strokeWidth={2.5} />
              ) : (
                <Play color="#18181b" size={44} strokeWidth={2.5} fill="#18181b" />
              )}
              <Text style={styles.startLabel}>{playing ? "PAUSE" : "START"}</Text>
            </View>
          </Pressable>
        </View>

        {/* Body content */}
        <View style={styles.body}>
          {/* Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>概要</Text>
            <Text style={styles.bodyText}>
              最高のコンディションへ。追い込みの美学。{"\n"}
              コーチと一緒に、行動を楽しもう。音声ガイドによるアドバイスによって、今まで苦しいと思っていた行動への意識が変わる。
            </Text>
          </View>

          {/* Session detail */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>セッションの詳細</Text>
            <Text style={styles.bodyText}>
              {categoryLabel === "音楽"
                ? "ウォームアップから追い込みまで、最適なテンポで構成されたプレイリスト。"
                : "簡単なステップと、クールダウン。モチベーションを高めながら進められる音声コーチング。"}
            </Text>
          </View>

          {/* Music section */}
          {category === "音楽" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>自信を付ける音楽</Text>
              <View style={styles.musicCard}>
                <View style={styles.musicThumb}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.musicThumbImg}
                    contentFit="cover"
                  />
                </View>
                <View>
                  <Text style={styles.musicTitle}>{title}</Text>
                  <Text style={styles.musicSub}>プレイリスト</Text>
                </View>
              </View>
              <Pressable style={styles.spotifyRow} onPress={handleSpotify}>
                <View style={styles.spotifyIcon}>
                  <Text style={styles.spotifyIconText}>♪</Text>
                </View>
                <Text style={styles.spotifyText}>Spotifyで聴く</Text>
                <Text style={styles.spotifyOpen}>開く</Text>
              </Pressable>
            </View>
          )}

          {/* Coach */}
          <View style={[styles.section, styles.lastSection]}>
            <Text style={styles.sectionTitle}>コーチ プロフィール</Text>
            <Text style={styles.bodyText}>
              プロのコーチとして活躍。数多くのセッションを通じて、人々の行動変容をサポート。{"\n"}
              2013年からプロコーチとして多くのスポーツ選手やビジネスパーソンに指導を展開。{"\n"}
              あなたの最初の一歩を全力で応援します。
            </Text>
          </View>
        </View>
      </Animated.ScrollView>
      </Animated.View>
    </View>
  );
}

const HERO_HEIGHT = SCREEN_HEIGHT * 0.72;
const MISSION_CARD_WIDTH = SCREEN_WIDTH * 0.68;
const MISSION_CARD_HEIGHT = MISSION_CARD_WIDTH * (1 / 1.5);

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  root: {
    flex: 1,
    backgroundColor: "#09090b",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  scroll: {
    flex: 1,
  },
  hero: {
    height: HERO_HEIGHT,
    backgroundColor: "#09090b",
    justifyContent: "flex-end",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 999,
  },
  heroContent: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 32,
    paddingTop: 80,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: "900",
    fontStyle: "italic",
    color: "#fff",
    letterSpacing: -1.5,
    textAlign: "center",
    lineHeight: 46,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  heroSub: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
  },
  heroSubAccent: {
    color: "#fb923c",
  },
  missionSection: {
    marginBottom: 24,
  },
  missionLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 4,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 12,
  },
  missionScroll: {
    paddingHorizontal: SCREEN_WIDTH * 0.15,
    gap: 24,
  },
  missionCard: {
    width: MISSION_CARD_WIDTH,
    height: MISSION_CARD_HEIGHT,
    borderRadius: 40,
    overflow: "hidden",
    opacity: 0.25,
    transform: [{ scale: 0.9 }],
    borderWidth: 3,
    borderColor: "transparent",
  },
  missionCardActive: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
    borderColor: "#f97316",
    shadowColor: "#f97316",
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  missionCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  missionCardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  missionCardTitle: {
    fontSize: 32,
    fontWeight: "900",
    fontStyle: "italic",
    color: "#fff",
    letterSpacing: -1,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 34,
  },
  missionChip: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    transform: [{ rotate: "-1deg" }],
  },
  missionChipText: {
    color: "#18181b",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: -0.5,
  },
  missionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  missionMetaText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
    maxWidth: MISSION_CARD_WIDTH - 80,
  },
  startWrap: {
    alignItems: "center",
    marginTop: -52,
    marginBottom: 8,
    zIndex: 20,
  },
  startBtn: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  startBtnPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  startInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  startLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: "#18181b",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 80,
  },
  section: {
    marginBottom: 40,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    fontStyle: "italic",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 17,
    lineHeight: 28,
    color: "#a1a1aa",
    fontWeight: "500",
  },
  musicCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(39,39,42,0.5)",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginBottom: 16,
  },
  musicThumb: {
    width: 64,
    height: 64,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#27272a",
  },
  musicThumbImg: {
    width: "100%",
    height: "100%",
    opacity: 0.6,
  },
  musicTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  musicSub: {
    fontSize: 13,
    color: "#71717a",
    marginTop: 2,
  },
  spotifyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  spotifyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1DB954",
    alignItems: "center",
    justifyContent: "center",
  },
  spotifyIconText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  spotifyText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    flex: 1,
  },
  spotifyOpen: {
    color: "#71717a",
    fontSize: 14,
    fontWeight: "500",
  },
});
