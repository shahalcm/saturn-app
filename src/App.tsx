import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AppNavigator } from "./navigation/AppNavigator";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  console.log("STEP_2_APP");
  React.useEffect(() => {
    console.log("🚀 [Lifecycle Log]: APP_MOUNTED");
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <AuthProvider>
            <UserProvider>
              <LanguageProvider>
                <AppNavigator />
              </LanguageProvider>
            </UserProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
