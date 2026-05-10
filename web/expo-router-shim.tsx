import React, { useContext } from "react";
import { RouterContext } from "./App";

export function useRouter() {
  const { push, back, params } = useContext(RouterContext);
  return {
    push: (arg: { pathname: string; params?: Record<string, string> } | string) => {
      const pathname = typeof arg === "string" ? arg : arg.pathname;
      const p = typeof arg === "object" && "params" in arg ? (arg.params ?? {}) : {};
      const name = pathname.replace(/^\//, "") as "recommend" | "focus";
      if (name === "recommend" || name === "focus") {
        push({ name, params: p });
      }
    },
    back,
    replace: back,
    navigate: back,
  };
}

export function useLocalSearchParams<T extends Record<string, string>>(): T {
  const { params } = useContext(RouterContext);
  return params as T;
}

export function Stack() {
  return null;
}
Stack.Screen = function StackScreen(_props: unknown) {
  return null;
};
