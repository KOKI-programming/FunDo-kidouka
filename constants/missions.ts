export type Mission = {
  id: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  imageUrl: string;
};

export const MISSIONS: Mission[] = [
  {
    id: "lazy-start",
    title: "LAZY START",
    subtitle: "だるい時",
    durationMinutes: 3,
    imageUrl: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "reading",
    title: "READING",
    subtitle: "本を読む",
    durationMinutes: 5,
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "cleaning",
    title: "CLEANING",
    subtitle: "部屋の片付け",
    durationMinutes: 10,
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "deep-work",
    title: "DEEP WORK",
    subtitle: "集中作業",
    durationMinutes: 15,
    imageUrl: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&q=80&w=600",
  },
];
