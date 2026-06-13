import React from "react";
import { LogBox } from "react-native";
import "react-native-gesture-handler";
import * as Reanimated from "react-native-reanimated";

// Suppress deprecation warnings
LogBox.ignoreLogs([
  "InteractionManager has been deprecated",
  "[Reanimated] The `isReanimated3` function is deprecated",
]);

// Polyfill useAnimatedGestureHandler for react-native-reanimated v4
if (typeof (Reanimated as any).useAnimatedGestureHandler === "undefined") {
  (Reanimated as any).useAnimatedGestureHandler =
    function useAnimatedGestureHandler(handlers: any, sharedValuesOrDeps: any) {
      const runOnJS = (Reanimated as any).runOnJS;

      // Direct UI execution mode for react-navigation drawer
      if (
        sharedValuesOrDeps &&
        typeof sharedValuesOrDeps.translationX !== "undefined"
      ) {
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
        } = sharedValuesOrDeps;

        const contextRef = React.useRef<any>({});

        return (Reanimated as any).useEvent(
          (event: any) => {
            "worklet";
            const context = contextRef.current;

            if (event.state === 2) {
              // BEGAN / START
              context.hasCalledOnStart = false;
              context.startX = translationX.value;
              gestureState.value = event.state;
              touchStartX.value = event.x;
            }

            if (event.state === 4) {
              // ACTIVE
              touchX.value = event.x;
              translationX.value = context.startX + event.translationX;
              gestureState.value = event.state;

              if (!context.hasCalledOnStart) {
                context.hasCalledOnStart = true;
                runOnJS(onGestureStart)();
              }
            }

            if (event.state === 5 || event.state === 3 || event.state === 1) {
              // END or CANCELLED or FAILED
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
          },
          ["onGestureHandlerStateChange", "onGestureHandlerEvent"],
        );
      }

      // Fallback mode for standard useAnimatedGestureHandler calls (running on JS thread)
      const contextRefFallback = React.useRef<any>({});
      return (Reanimated as any).useEvent(
        (event: any) => {
          "worklet";
          const { onStart, onActive, onEnd, onFinish, onFail, onCancel } =
            handlers;
          const context = contextRefFallback.current;

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
        },
        ["onGestureHandlerStateChange", "onGestureHandlerEvent"],
      );
    };
}

import { registerRootComponent } from "expo";
import App from "./src/App";

registerRootComponent(App);
