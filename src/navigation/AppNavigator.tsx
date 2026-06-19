import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { COLORS } from "../constants/colors";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";

export const AppNavigator = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const { religion } = useUser();

  React.useEffect(() => {
    console.log("🚀 [Lifecycle Log]: Navigation mounted");
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn && religion ? (
        <MainNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};
