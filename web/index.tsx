import React from "react";
import { AppRegistry } from "react-native";
import App from "./App";

AppRegistry.registerComponent("FunDO", () => App);
AppRegistry.runApplication("FunDO", {
  rootTag: document.getElementById("root"),
});
