import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const RN_WEB = path.resolve(__dirname, "node_modules/react-native-web");

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["@babel/plugin-transform-flow-strip-types"],
      },
    }),
  ],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, ".") },
      {
        find: /^react-native\/(.*)$/,
        replacement: `${RN_WEB}/$1`,
      },
      {
        find: "react-native",
        replacement: "react-native-web",
      },
      {
        find: "react-native-svg",
        replacement: path.resolve(
          __dirname,
          "node_modules/react-native-svg/src/ReactNativeSVG.web.ts"
        ),
      },
      {
        find: "expo-router",
        replacement: path.resolve(__dirname, "web/expo-router-shim.tsx"),
      },
      {
        find: "expo-haptics",
        replacement: path.resolve(__dirname, "web/empty.ts"),
      },
      {
        find: "expo-image",
        replacement: path.resolve(__dirname, "web/expo-image-shim.tsx"),
      },
      {
        find: "expo-splash-screen",
        replacement: path.resolve(__dirname, "web/empty.ts"),
      },
      {
        find: "expo-constants",
        replacement: path.resolve(__dirname, "web/empty.ts"),
      },
      {
        find: "@react-navigation/native",
        replacement: path.resolve(__dirname, "web/react-navigation-shim.ts"),
      },
    ],
    extensions: [
      ".web.tsx",
      ".web.ts",
      ".web.jsx",
      ".web.js",
      ".tsx",
      ".ts",
      ".jsx",
      ".js",
    ],
  },
  define: {
    global: "window",
    __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV ?? "development"
    ),
  },
  optimizeDeps: {
    exclude: ["react-native"],
    include: ["react-native-web"],
    esbuildOptions: {
      resolveExtensions: [
        ".web.tsx",
        ".web.ts",
        ".web.jsx",
        ".web.js",
        ".tsx",
        ".ts",
        ".jsx",
        ".js",
      ],
      loader: {
        ".js": "jsx",
      },
    },
  },
  ssr: {
    noExternal: true,
  },
});
