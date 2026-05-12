import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";
import { useIsFocused } from "@react-navigation/native";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  duration?: number;
};

export default function FadeInOnFocus({ children, style, duration = 300 }: Props) {
  const isFocused = useIsFocused();
  const opacity = useRef(new Animated.Value(0));
  const translateY = useRef(new Animated.Value(10));
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isFocused && !hasAnimated.current) {
      hasAnimated.current = true;
      opacity.current.setValue(0);
      translateY.current.setValue(10);
      Animated.parallel([
        Animated.timing(opacity.current, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY.current, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFocused, duration]);

  return (
    <Animated.View style={[{ flex: 1, opacity: opacity.current, transform: [{ translateY: translateY.current }] }, style]}>
      {children}
    </Animated.View>
  );
}
