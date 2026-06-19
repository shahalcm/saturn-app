console.log("STEP_1_INDEX");
import "react-native-gesture-handler";
import React from "react";
import { LogBox } from "react-native";

// Suppress deprecation warnings
LogBox.ignoreLogs([
  "InteractionManager has been deprecated",
  "[Reanimated] The `isReanimated3` function is deprecated",
]);

import { registerRootComponent } from "expo";
import App from "./src/App";

registerRootComponent(App);
