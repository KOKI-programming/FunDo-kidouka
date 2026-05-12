import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { getContentsForMission, MOOD_CONTENTS, type ContentItem } from "@/constants/contents";
import {
  Animated,
  Dimensions,
  Modal,
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
import { ArrowLeft, X, VolumeX } from "lucide-react-native";

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
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MOODS: MoodItem[] = [
  { id: "m1", label: "自信を付けたい", english: "CONFIDENCE", emoji: "✨", color: "#ec4899" },
  { id: "m2", label: "集中したい", english: "Concentration", emoji: "🎯", color: "#3b82f6" },
  { id: "m3", label: "テンションを上げたい", english: "High Tension", emoji: "🔥", color: "#f97316" },
  { id: "m4", label: "情報を手に入れたい", english: "Information", emoji: "📚", color: "#10b981" },
];

const TITLES = ["おすすめ", "気分選択"] as const;

export default function RecommendScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<RecommendParams>();
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [moodModal, setMoodModal] = useState<{ mood: MoodItem; contents: ContentItem[] } | null>(null);

  const CONTENTS = useMemo(() => getContentsForMission(params.id ?? ""), [params.id]);
  const pagerRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handlePageChange = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.x;
      const idx = Math.round(offset / SCREEN_WIDTH);
      const clamped = Math.max(0, Math.min(idx, 1));
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
      setMoodModal(null);
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
    setMoodModal(null);
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

  const handleMoodPress = useCallback((mood: MoodItem) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const contents = MOOD_CONTENTS[mood.id] ?? [];
    setMoodModal({ mood, contents });
  }, []);

  const renderContentGrid = useCallback(
    (items: ContentItem[]) => (
      <View style={styles.grid}>
        {items.map((c: ContentItem) => (
          <View key={c.id} style={styles.gridCard}>
            <Pressable
              onPress={() => handleContentPress(c)}
              style={({ pressed }) => [styles.gridCardPressable, pressed && styles.pressed]}
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
            style={styles.headerButton}
            testID="back-button"
          >
            <ArrowLeft color="#18181b" size={22} strokeWidth={2.5} />
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

          <View style={styles.headerButton} />
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
              {MOODS.map((m) => (
                <Pressable
                  key={m.id}
                  onPress={() => handleMoodPress(m)}
                  style={({ pressed }) => [styles.moodCard, pressed && styles.pressed]}
                  testID={`mood-${m.id}`}
                >
                  <View style={[styles.moodEmojiWrap, { backgroundColor: m.color }]}>
                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  </View>
                  <Text style={styles.moodLabel}>{m.label}</Text>
                  <Text style={styles.moodEnglish}>{m.english.toUpperCase()}</Text>
                </Pressable>
              ))}

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
        </Animated.ScrollView>

        <View style={styles.dots}>
          {[0, 1].map((i) => (
            <View
              key={i}
              style={[styles.dot, pageIndex === i && styles.dotActive]}
            />
          ))}
        </View>
      </SafeAreaView>

      {/* 気分別コンテンツ モーダル */}
      <Modal
        visible={moodModal !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setMoodModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View>
                {moodModal && (
                  <>
                    <Text style={styles.modalTitle}>{moodModal.mood.label}</Text>
                    <Text style={styles.modalSubtitle}>{moodModal.mood.english}</Text>
                  </>
                )}
              </View>
              <Pressable
                onPress={() => setMoodModal(null)}
                style={styles.modalClose}
              >
                <X color="#18181b" size={20} strokeWidth={2.5} />
              </Pressable>
            </View>

            {moodModal && renderContentGrid(moodModal.contents)}

            <Pressable
              onPress={handleNoContentPress}
              style={({ pressed }) => [styles.noContentButton, styles.modalNoContent, pressed && styles.pressed]}
            >
              <View style={styles.noContentIcon}>
                <VolumeX color="#ffffff" size={22} />
              </View>
              <View>
                <Text style={styles.noContentTitle}>コンテンツなし</Text>
                <Text style={styles.noContentSub}>NO CONTENT</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e4e4e7",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900" as const,
    color: "#18181b",
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 10,
    fontWeight: "800" as const,
    color: "#a1a1aa",
    letterSpacing: 2,
    marginTop: 2,
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f4f4f5",
    alignItems: "center",
    justifyContent: "center",
  },
  modalNoContent: {
    marginTop: 0,
  },
});
