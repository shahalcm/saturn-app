import 'react-native-gesture-handler';
import React from "react";
import { LogBox } from "react-native";

// Global Crash and Unhandled Error Loggers
const defaultErrorHandler = (globalThis as any).ErrorUtils?.getGlobalHandler();
(globalThis as any).ErrorUtils?.setGlobalHandler((error: any, isFatal: boolean) => {
  console.error("⚡ [GLOBAL RUNTIME ERROR]:", error, "Fatal:", isFatal);
  if (defaultErrorHandler) {
    defaultErrorHandler(error, isFatal);
  }
});

const defaultPromiseTracker = (globalThis as any).promiseRejectionTracker;
(globalThis as any).promiseRejectionTracker = (id: any, state: any, promise: any, error: any) => {
  console.warn("⚡ [UNHANDLED PROMISE REJECTION]:", error, "ID:", id, "State:", state);
  if (defaultPromiseTracker) {
    defaultPromiseTracker(id, state, promise, error);
  }
};

// Suppress deprecation warnings
LogBox.ignoreLogs([
  "InteractionManager has been deprecated",
  "[Reanimated] The `isReanimated3` function is deprecated",
]);

import { registerRootComponent } from "expo";
import App from "./src/App";

registerRootComponent(App);
