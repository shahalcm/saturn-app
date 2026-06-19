import 'react-native-gesture-handler';
import React from "react";
import { LogBox } from "react-native";

// Require and polyfill raw module exports before any ES6 imports wrap and freeze them
const ReanimatedModule = require("react-native-reanimated");

// Polyfill useAnimatedGestureHandler for react-native-reanimated v4 if useEvent is available
if (
  typeof ReanimatedModule.useAnimatedGestureHandler === "undefined" &&
  typeof ReanimatedModule.useEvent === "function"
) {
  ReanimatedModule.useAnimatedGestureHandler =
    function useAnimatedGestureHandler(handlers: any, sharedValuesOrDeps: any) {
      const runOnJS = ReanimatedModule.runOnJS;
      const contextRef = React.useRef<any>({});

      // Check if drawer mode is being triggered
      const isDrawerMode = !!(
        sharedValuesOrDeps && typeof sharedValuesOrDeps.translationX !== "undefined"
      );

      // Unconditionally extract variables (falling back to empty object destructuring)
      const {
        translationX,
        touchX,
        touchStartX,
        gestureState,
        swipeVelocityThreshold,
        swipeDistanceThreshold,
        drawerPosition,
        open,
        onGestureStart,
        onGestureFinish,
        toggleDrawer,
        SWIPE_DISTANCE_MINIMUM,
      } = isDrawerMode ? sharedValuesOrDeps : {};

      return ReanimatedModule.useEvent(
        (event: any) => {
          "worklet";
          const context = contextRef.current;

          if (isDrawerMode) {
            // --- DRAWER MODE ---
            if (event.state === 2) {
              context.hasCalledOnStart = false;
              context.startX = translationX.value;
              gestureState.value = event.state;
              touchStartX.value = event.x;
            }

            if (event.state === 4) {
              touchX.value = event.x;
              translationX.value = context.startX + event.translationX;
              gestureState.value = event.state;

              if (!context.hasCalledOnStart) {
                context.hasCalledOnStart = true;
                runOnJS(onGestureStart)();
              }
            }

            if (event.state === 5 || event.state === 3 || event.state === 1) {
              gestureState.value = event.state;

              const nextOpen =
                (Math.abs(event.translationX) > SWIPE_DISTANCE_MINIMUM &&
                  Math.abs(event.translationX) > swipeVelocityThreshold) ||
                Math.abs(event.translationX) > swipeDistanceThreshold
                  ? drawerPosition === "left"
                    ? (event.velocityX === 0
                        ? event.translationX
                        : event.velocityX) > 0
                    : (event.velocityX === 0
                        ? event.translationX
                        : event.velocityX) < 0
                  : open;

              runOnJS(toggleDrawer)({
                open: nextOpen,
                isUserInitiated: true,
                velocity: event.velocityX,
              });

              runOnJS(onGestureFinish)();
            }
          } else {
            // --- FALLBACK MODE ---
            const { onStart, onActive, onEnd, onFinish, onFail, onCancel } =
              handlers;

            if (onStart && event.state === 2) {
              runOnJS(onStart)(event, context);
            }
            if (onActive && event.state === 4) {
              runOnJS(onActive)(event, context);
            }
            if (onEnd && event.state === 5) {
              runOnJS(onEnd)(event, context);
            }
            if (
              onFinish &&
              (event.state === 5 || event.state === 3 || event.state === 1)
            ) {
              runOnJS(onFinish)(event, context, true);
            }
            if (onFail && event.state === 1) {
              runOnJS(onFail)(event, context);
            }
            if (onCancel && event.state === 3) {
              runOnJS(onCancel)(event, context);
            }
          }
        },
        ["onGestureHandlerStateChange", "onGestureHandlerEvent"]
      );
    };
}

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
