export type ContentCategory = "音楽" | "ポッドキャスト";

export type ContentItem = {
  id: string;
  title: string;
  imageUrl: string;
  category: ContentCategory;
};

export const TOP10: ContentItem[] = [
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

export const WORKOUT: ContentItem[] = TOP10.slice(0, 8);

export const CLEANING: ContentItem[] = [
  { id: "c1", title: "ダルいを吹き飛ばす音", imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "c2", title: "何も考えずこれ流せ", imageUrl: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "c3", title: "とりあえずやる", imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "c4", title: "部屋も人生も整える時間", imageUrl: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "c5", title: "動き出したら勝ち", imageUrl: "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "c6", title: "気づいたら終わってる掃除", imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "c7", title: "無心で片付ける", imageUrl: "https://images.unsplash.com/photo-1595667949212-fa133a67d224?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "c8", title: "自分リセットタイム", imageUrl: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
];

export const TOP_SESSIONS: ContentItem[] = [
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

export const SELF: ContentItem[] = [
  { id: "se1", title: "何もできなかった日のあなたへ", imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "se2", title: "自己嫌悪リセット音声", imageUrl: "https://images.unsplash.com/photo-1499209974431-9dac3adaf477?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "se3", title: "大丈夫、まだいける", imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "se4", title: "もう一回立て直す時間", imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "se5", title: "自分を責めすぎてる人へ", imageUrl: "https://images.unsplash.com/photo-1528712306091-ed0763094c98?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "se6", title: "今日ダメでも明日は変えられる", imageUrl: "https://images.unsplash.com/photo-1474418397713-7ede21d49118?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "se7", title: "落ち込んだ夜のリカバリー", imageUrl: "https://images.unsplash.com/photo-1516585427369-139f3769e7cf?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "se8", title: "メンタル応急処置", imageUrl: "https://images.unsplash.com/photo-1506485338023-6ce5f366927f?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
];

export const STUDY: ContentItem[] = [
  { id: "st1", title: "脳をゾーンに入れる", imageUrl: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "st2", title: "これ流したら終わるまでやれ", imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "st3", title: "ガチ集中モード", imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "st4", title: "世界を遮断する音", imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "st5", title: "静かに狂う作業時間", imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "st6", title: "圧倒的没入モード", imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "st7", title: "思考を研ぎ澄ます音", imageUrl: "https://images.unsplash.com/photo-1488190211405-58a4a58e17b4?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "st8", title: "今やらないと終わる", imageUrl: "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
];

export const GROWTH: ContentItem[] = [
  { id: "g1", title: "世界が変わる！読書の習慣", imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "g2", title: "人生効率化ラジオ", imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "g3", title: "無駄を削る思考", imageUrl: "https://images.unsplash.com/photo-1491336477066-31156b5e4f35?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "g4", title: "成長したいやつだけ聞け", imageUrl: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "g5", title: "頭いい人の習慣", imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "g6", title: "明日から変わる思考法", imageUrl: "https://images.unsplash.com/photo-1454165833767-027469550d33?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "g7", title: "成果出す人の裏側", imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "g8", title: "人生を加速させる時間", imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
];

export const BRAND: ContentItem[] = [
  { id: "b1", title: "モテる男の習慣", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "b2", title: "自分の価値を上げる時間", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "b3", title: "かっこいい男の作り方", imageUrl: "https://images.unsplash.com/photo-1550133730-695473e544be?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "b4", title: "一段上の男になる", imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "b5", title: "舐められない自分へ", imageUrl: "https://images.unsplash.com/photo-1552581234-2612df0dd050?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "b6", title: "余裕ある男の思考", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "b7", title: "自信を作る時間", imageUrl: "https://images.unsplash.com/photo-1531384441138-203d9f0bd6d5?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "b8", title: "見た目も中身も整える", imageUrl: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&q=80&w=600", category: "音楽" },
];

export const MORNING: ContentItem[] = [
  { id: "m1", title: "今日を勝ちに行く朝", imageUrl: "https://images.unsplash.com/photo-1495539406979-bf61750d38ad?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "m2", title: "朝から差をつける", imageUrl: "https://images.unsplash.com/photo-1499591934245-40b55745b905?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "m3", title: "スイッチ入れる", imageUrl: "https://images.unsplash.com/photo-1508138221679-760a23a2285b?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "m4", title: "最強の1日スタート", imageUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "m5", title: "だるい朝をぶっ壊す", imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600", category: "音楽" },
  { id: "m6", title: "朝を制する者が人生を制す", imageUrl: "https://images.unsplash.com/photo-1495364141860-b0d03eccd065?auto=format&fit=crop&q=80&w=600", category: "音楽" },
];

export const NIGHT: ContentItem[] = [
  { id: "n1", title: "今日をちゃんと終わらせる", imageUrl: "https://images.unsplash.com/photo-1505322022379-7c3353ee6291?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "n2", title: "明日に繋げる夜", imageUrl: "https://images.unsplash.com/photo-1511289080610-b6cb7829db7b?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "n3", title: "1日を無駄にしない振り返り", imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "n4", title: "心を整える時間", imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
  { id: "n5", title: "明日勝つための夜", imageUrl: "https://images.unsplash.com/photo-1531353826977-0941b4779a1c?auto=format&fit=crop&q=80&w=600", category: "ポッドキャスト" },
];

// 気分IDに対応するコンテンツ（4件）
export const MOOD_CONTENTS: Record<string, ContentItem[]> = {
  m1: [
    BRAND[1],  // 自分の価値を上げる時間
    BRAND[6],  // 自信を作る時間
    SELF[8 - 1] ?? SELF[7], // メンタル応急処置
    TOP10[1],  // 限界を更新する
  ],
  m2: [
    STUDY[2],  // ガチ集中モード
    STUDY[3],  // 世界を遮断する音
    STUDY[4],  // 静かに狂う作業時間
    STUDY[1],  // これ流したら終わるまでやれ
  ],
  m3: [
    TOP10[2],  // サボる自分を潰す音
    TOP10[5],  // 心拍数ぶち上げモード
    WORKOUT[4],// 鬼集中ワークアウト
    MORNING[3],// 最強の1日スタート
  ],
  m4: [
    GROWTH[0], // 世界が変わる！読書の習慣
    GROWTH[1], // 人生効率化ラジオ
    GROWTH[4], // 頭いい人の習慣
    GROWTH[5], // 明日から変わる思考法
  ],
};

// ミッションIDに対応するおすすめコンテンツ（4件）
export const MISSION_CONTENTS: Record<string, ContentItem[]> = {
  "lazy-start": [
    SELF[0],   // 何もできなかった日のあなたへ
    MORNING[4], // だるい朝をぶっ壊す
    CLEANING[0], // ダルいを吹き飛ばす音
    SELF[4],   // 自分を責めすぎてる人へ
  ],
  "reading": [
    GROWTH[0],  // 世界が変わる！読書の習慣
    STUDY[0],   // 脳をゾーンに入れる
    GROWTH[4],  // 頭いい人の習慣
    STUDY[2],   // ガチ集中モード
  ],
  "cleaning": [
    CLEANING[2], // とりあえずやる
    CLEANING[3], // 部屋も人生も整える時間
    CLEANING[6], // 無心で片付ける
    MORNING[0],  // 今日を勝ちに行く朝
  ],
  "deep-work": [
    STUDY[2],   // ガチ集中モード
    STUDY[3],   // 世界を遮断する音
    STUDY[4],   // 静かに狂う作業時間
    STUDY[1],   // これ流したら終わるまでやれ
  ],
};

export function getContentsForMission(missionId: string): ContentItem[] {
  return MISSION_CONTENTS[missionId] ?? [
    TOP10[7], // バチバチに仕上げる時間
    CLEANING[7], // 自分リセットタイム
    BRAND[2], // かっこいい男の作り方
    BRAND[5], // 余裕ある男の思考
  ];
}
