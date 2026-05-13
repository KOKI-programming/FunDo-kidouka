import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { getContentsForMission, getContentsForMood, type ContentItem } from "@/constants/contents";
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
import { ArrowLeft, ArrowRight, VolumeX } from "lucide-react-native";

type RecommendParams = {
  id?: string;
  title?: string;
  subtitle?: string;
  duration?: string;
};

type MoodItem = {
  id: string;
  label: string;
  english: string;
  emoji: string;
  color: string;
  badge?: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MOODS: MoodItem[] = [
  { id: "m1", label: "自信を付けたい", english: "CONFIDENCE", emoji: "✨", color: "#ec4899", badge: "CONFIDENCE" },
  { id: "m2", label: "集中したい", english: "Concentration", emoji: "🎯", color: "#3b82f6" },
  { id: "m3", label: "テンションを上げたい", english: "High Tension", emoji: "🔥", color: "#f97316" },
  { id: "m4", label: "情報を手に入れたい", english: "Information", emoji: "📚", color: "#10b981" },
];

const TITLES = ["おすすめ", "気分選択", "コンテンツ選択"] as const;

export default function RecommendScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<RecommendParams>();
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [selectedMood, setSelectedMood] = useState<string>("m1");

  const CONTENTS = useMemo(() => getContentsForMission(params.id ?? ""), [params.id]);
  const MOOD_FILTERED_CONTENTS = useMemo(() => getContentsForMood(selectedMood), [selectedMood]);
  const pagerRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handlePageChange = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.x;
      const idx = Math.round(offset / SCREEN_WIDTH);
      const clamped = Math.max(0, Math.min(idx, 2));
      if (clamped !== pageIndex) {
        setPageIndex(clamped);
        void Haptics.selectionAsync();
      }
    },
    [pageIndex]
  );

  const goToPage = useCallback((idx: number) => {
    pagerRef.current?.scrollTo({ x: idx * SCREEN_WIDTH, animated: true });
    setPageIndex(idx);
    void Haptics.selectionAsync();
  }, []);

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
        useNativeDriver: Platform.OS !== "web",
      }),
    [scrollX]
  );

  const handleContentPress = useCallback(
    (content: ContentItem) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: "/focus",
        params: {
          id: params.id ?? "mission",
          title: params.title ?? content.title,
          subtitle: content.title,
          duration: params.duration ?? "3",
        },
      });
    },
    [router, params]
  );

  const handleNoContentPress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/focus",
      params: {
        id: params.id ?? "mission",
        title: params.title ?? "Mission",
        subtitle: params.subtitle ?? "",
        duration: params.duration ?? "3",
      },
    });
  }, [router, params]);

  const renderContentGrid = useCallback(
    (items: ContentItem[]) => (
      <View style={styles.grid}>
        {items.map((c: ContentItem) => (
          <View key={c.id} style={styles.gridCard}>
            <Pressable
              onPress={() => handleContentPress(c)}
              style={({ pressed }) => [styles.gridCardPressable, pressed && styles.pressed]}
              testID={`content-${c.id}`}
            >
              <Image
                source={{ uri: c.imageUrl }}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
                transition={300}
              />
              <View style={styles.gridCardOverlay} />
              <View style={styles.gridCardContent}>
                <Text style={styles.gridCardCategory}>{c.category.toUpperCase()}</Text>
                <Text style={styles.gridCardTitle} numberOfLines={2}>
                  {c.title}
                </Text>
              </View>
            </Pressable>
          </View>
        ))}
      </View>
    ),
    [handleContentPress]
  );

  return (
    <View style={styles.screen} testID="recommend-screen">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (pageIndex > 0) {
                goToPage(pageIndex - 1);
              } else {
                router.back();
              }
            }}
            style={styles.headerBackButton}
            testID="back-button"
          >
            <ArrowLeft color="#18181b" size={22} strokeWidth={2.5} />
            <Text style={styles.headerBackLabel}>戻る</Text>
          </Pressable>

          <View style={styles.titleContainer}>
            {TITLES.map((title, i) => {
              const opacity = scrollX.interpolate({
                inputRange: [
                  (i - 1) * SCREEN_WIDTH,
                  i * SCREEN_WIDTH,
                  (i + 1) * SCREEN_WIDTH,
                ],
                outputRange: [0, 1, 0],
                extrapolate: "clamp",
              });
              const translateY = scrollX.interpolate({
                inputRange: [
                  (i - 1) * SCREEN_WIDTH,
                  i * SCREEN_WIDTH,
                  (i + 1) * SCREEN_WIDTH,
                ],
                outputRange: [10, 0, -10],
                extrapolate: "clamp",
              });
              return (
                <Animated.Text
                  key={title}
                  style={[styles.headerTitle, { opacity, transform: [{ translateY }] }]}
                >
                  {title}
                </Animated.Text>
              );
            })}
          </View>

          {pageIndex < 2 ? (
            <Pressable
              onPress={() => goToPage(pageIndex + 1)}
              style={styles.headerNext}
              testID="next-button"
            >
              <Text style={styles.headerNextLabel}>
                {pageIndex === 0 ? "気分別" : "コンテンツ"}
              </Text>
              <ArrowRight color="#18181b" size={22} strokeWidth={2.5} />
            </Pressable>
          ) : (
            <View style={styles.headerButton} />
          )}
        </View>

        <Animated.ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handlePageChange}
          onScroll={onScroll}
          scrollEventThrottle={16}
          testID="recommend-pager"
        >
          {/* Page 1: おすすめ */}
          <ScrollView
            style={{ width: SCREEN_WIDTH }}
            contentContainerStyle={styles.pageContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.pageHeading}>✨ おすすめのコンテンツ</Text>
            <Text style={styles.pageSubtitle}>
              最高の自分を引き出すコンテンツで、自信をチャージ。
            </Text>
            {renderContentGrid(CONTENTS)}
            <Pressable
              onPress={handleNoContentPress}
              style={({ pressed }) => [styles.noContentButton, pressed && styles.pressed]}
              testID="no-content"
            >
              <View style={styles.noContentIcon}>
                <VolumeX color="#ffffff" size={22} />
              </View>
              <View>
                <Text style={styles.noContentTitle}>コンテンツなし</Text>
                <Text style={styles.noContentSub}>NO CONTENT</Text>
              </View>
            </Pressable>
          </ScrollView>

          {/* Page 2: 気分選択 */}
          <ScrollView
            style={{ width: SCREEN_WIDTH }}
            contentContainerStyle={styles.pageContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.pageHeading}>どう行動する？</Text>

            <View style={styles.missionBanner}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=600",
                }}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
              />
              <View style={styles.missionBannerOverlay} />
              <View style={styles.missionBannerContent}>
                <Text style={styles.missionBannerEyebrow}>SELECTED MISSION</Text>
                <Text style={styles.missionBannerTitle}>
                  {(params.title ?? "MISSION").toString().toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.moodGrid}>
              {MOODS.map((m) => {
                const isSelected = selectedMood === m.id;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => {
                      setSelectedMood(m.id);
                      void Haptics.selectionAsync();
                      setTimeout(() => goToPage(2), 120);
                    }}
                    style={({ pressed }) => [
                      styles.moodCard,
                      isSelected && { borderColor: m.color, backgroundColor: `${m.color}10` },
                      pressed && styles.pressed,
                    ]}
                    testID={`mood-${m.id}`}
                  >
                    {isSelected && m.badge && (
                      <View style={[styles.moodBadge, { backgroundColor: m.color }]}>
                        <Text style={styles.moodBadgeText}>{m.badge}</Text>
                      </View>
                    )}
                    <View style={[styles.moodEmojiWrap, { backgroundColor: m.color }]}>
                      <Text style={styles.moodEmoji}>{m.emoji}</Text>
                    </View>
                    <Text style={styles.moodLabel}>{m.label}</Text>
                    <Text style={styles.moodEnglish}>{m.english.toUpperCase()}</Text>
                  </Pressable>
                );
              })}

              <Pressable
                onPress={handleNoContentPress}
                style={({ pressed }) => [styles.moodNoContent, pressed && styles.pressed]}
                testID="mood-no-content"
              >
                <View style={[styles.moodEmojiSmall, { backgroundColor: "#71717a" }]}>
                  <VolumeX color="#ffffff" size={18} />
                </View>
                <View>
                  <Text style={styles.moodLabel}>コンテンツなし</Text>
                  <Text style={styles.moodEnglish}>NO CONTENT</Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>

          {/* Page 3: コンテンツ選択 */}
          <ScrollView
            style={{ width: SCREEN_WIDTH }}
            contentContainerStyle={styles.pageContent}
            showsVerticalScrollIndicator={false}
          >
            {(() => {
              const mood = MOODS.find((m) => m.id === selectedMood);
              return (
                <>
                  <View style={styles.moodHeadingRow}>
                    <Text style={styles.moodHeadingEmoji}>{mood?.emoji ?? "✨"}</Text>
                    <Text style={[styles.moodHeadingLabel, { color: mood?.color ?? "#f97316" }]}>
                      {mood?.label ?? "コンテンツ選択"}
                    </Text>
                  </View>
                  <Text style={styles.pageSubtitle}>
                    {mood?.label ?? "気分"}にぴったりのコンテンツを選んで始めよう。
                  </Text>
                </>
              );
            })()}
            {renderContentGrid(MOOD_FILTERED_CONTENTS)}
            <Pressable
              onPress={handleNoContentPress}
              style={({ pressed }) => [styles.noContentButton, pressed && styles.pressed]}
            >
              <View style={styles.noContentIcon}>
                <VolumeX color="#ffffff" size={22} />
              </View>
              <View>
                <Text style={styles.noContentTitle}>コンテンツなし</Text>
                <Text style={styles.noContentSub}>NO CONTENT</Text>
              </View>
            </Pressable>
          </ScrollView>
        </Animated.ScrollView>

        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.dot, pageIndex === i && styles.dotActive]}
            />
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 12) / 2;
const CARD_HEIGHT = CARD_WIDTH / 0.8;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#ffffff" },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
    height: 52,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  headerBackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 40,
    paddingHorizontal: 4,
    borderRadius: 20,
  },
  headerBackLabel: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#18181b",
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  headerTitle: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "900" as const,
    color: "#18181b",
    letterSpacing: -0.5,
  },
  headerNext: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    height: 40,
  },
  headerNextLabel: {
    fontSize: 10,
    fontWeight: "800" as const,
    color: "#a1a1aa",
  },
  pageContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  pageHeading: {
    fontSize: 30,
    fontWeight: "900" as const,
    color: "#18181b",
    letterSpacing: -1.5,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#71717a",
    marginBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#f4f4f5",
    backgroundColor: "#f4f4f5",
  },
  gridCardPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  gridCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  gridCardContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 14,
    justifyContent: "flex-end",
  },
  gridCardCategory: {
    color: "#fb923c",
    fontSize: 9,
    fontWeight: "900" as const,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  gridCardTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900" as const,
    lineHeight: 18,
  },
  noContentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 18,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#f4f4f5",
    backgroundColor: "#fafafa",
  },
  noContentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#71717a",
    alignItems: "center",
    justifyContent: "center",
  },
  noContentTitle: {
    fontSize: 14,
    fontWeight: "900" as const,
    color: "#18181b",
  },
  noContentSub: {
    fontSize: 10,
    fontWeight: "900" as const,
    color: "#a1a1aa",
    letterSpacing: 1.5,
    marginTop: 2,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  missionBanner: {
    width: "100%",
    aspectRatio: 2.5 / 1,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#f4f4f5",
    marginBottom: 24,
  },
  missionBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  missionBannerContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  missionBannerEyebrow: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontWeight: "900" as const,
    letterSpacing: 2,
    marginBottom: 4,
  },
  missionBannerTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900" as const,
    fontStyle: "italic",
    letterSpacing: -1,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  moodCard: {
    width: CARD_WIDTH,
    padding: 18,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#f4f4f5",
    backgroundColor: "#fafafa",
    alignItems: "center",
    gap: 10,
    position: "relative",
  },
  moodBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    zIndex: 10,
  },
  moodBadgeText: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "900" as const,
    letterSpacing: 0.5,
  },
  moodEmojiWrap: {
    width: 60,
    height: 60,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: "900" as const,
    color: "#18181b",
    textAlign: "center",
  },
  moodEnglish: {
    fontSize: 9,
    fontWeight: "800" as const,
    color: "#a1a1aa",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  moodNoContent: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 16,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#f4f4f5",
    backgroundColor: "#fafafa",
  },
  moodEmojiSmall: {
    width: 38,
    height: 38,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dots: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e4e4e7",
  },
  dotActive: {
    backgroundColor: "#f97316",
    width: 18,
  },
  moodHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  moodHeadingEmoji: {
    fontSize: 32,
  },
  moodHeadingLabel: {
    fontSize: 30,
    fontWeight: "900" as const,
    letterSpacing: -1.5,
    flexShrink: 1,
  },
});
