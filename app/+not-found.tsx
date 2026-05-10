import { Link, Stack } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found", headerStyle: { backgroundColor: "#07111F" }, headerTintColor: "#F4F8FF" }} />
      <View style={styles.container} testID="not-found-screen">
        <Text style={styles.eyebrow}>404</Text>
        <Text style={styles.title}>That screen is not part of this build.</Text>
        <Text style={styles.description}>Go back to the mission dashboard to continue the native redesign preview.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Return home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#07111F",
  },
  eyebrow: {
    color: "#8AA3C8",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    color: "#F6FAFF",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    color: "#AFC0DD",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 280,
  },
  link: {
    marginTop: 22,
    backgroundColor: "#F6FAFF",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  linkText: {
    color: "#07111F",
    fontSize: 14,
    fontWeight: "800",
  },
});
