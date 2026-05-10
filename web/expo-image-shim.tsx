import React from "react";
import { Image as RNImage, ImageStyle, StyleProp } from "react-native";

interface ImageProps {
  source: { uri: string } | number;
  style?: StyleProp<ImageStyle>;
  contentFit?: string;
  transition?: number;
  [key: string]: unknown;
}

export function Image({ source, style, ...rest }: ImageProps) {
  const uri = typeof source === "object" && "uri" in source ? source.uri : undefined;
  return <RNImage source={uri ? { uri } : (source as number)} style={style} resizeMode="cover" />;
}
