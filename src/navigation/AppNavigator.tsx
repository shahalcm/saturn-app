import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { COLORS } from "../constants/colors";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { ProviderNavigator } from "./ProviderMainNavigator";

export const AppNavigator = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const { religion, userRole, isProviderVerified } = useUser();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn && religion && userRole && (userRole !== "provider" || isProviderVerified) ? (
        userRole === "provider" ? (
          <ProviderNavigator />
        ) : (
          <MainNavigator />
        )
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};
