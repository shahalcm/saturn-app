import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { ChatScreen } from "../screens/ChatScreen";
import { ProviderDashboardScreen } from "../screens/ProviderDashboardScreen";
import { ProviderMessagesScreen } from "../screens/ProviderMessagesScreen";
import { ProviderProfileScreen } from "../screens/ProviderProfileScreen";
import { ProviderSessionsScreen } from "../screens/ProviderSessionsScreen";
import { ProviderNotificationScreen } from "../screens/ProviderNotificationScreen";
import { ProviderEarningsScreen } from "../screens/ProviderEarningsScreen";
import { ProviderAvailabilityScreen } from "../screens/ProviderAvailabilityScreen";
import { ProviderPatientsStudentsScreen } from "../screens/ProviderPatientsStudentsScreen";
import { ProviderCoursesScreen } from "../screens/ProviderCoursesScreen";
import { ProviderPrescriptionsScreen } from "../screens/ProviderPrescriptionsScreen";
import { ProviderLiveClassScreen } from "../screens/ProviderLiveClassScreen";
import { ProviderCompleteProfileScreen } from "../screens/ProviderCompleteProfileScreen";
import { ProviderReligionSelectScreen } from "../screens/ProviderReligionSelectScreen";
import { PendingVerificationScreen } from "../screens/PendingVerificationScreen";


export type ProviderStackParamList = {
  Dashboard: undefined;
  Sessions: undefined;
  Messages: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<ProviderStackParamList>();
const MessagesStack = createNativeStackNavigator();

// Stack to wrap messaging list and reuse the ChatScreen directly
const ProviderMessagesStackNavigator = () => {
  return (
    <MessagesStack.Navigator screenOptions={{ headerShown: false }}>
      <MessagesStack.Screen
        name="MessagesMain"
        component={ProviderMessagesScreen}
      />
      <MessagesStack.Screen name="Chat" component={ChatScreen as any} />
    </MessagesStack.Navigator>
  );
};

export const ProviderMainNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: insets.bottom > 0 ? insets.bottom : 12,
          left: 16,
          right: 16,
          backgroundColor: "#EAEAEA",
          borderRadius: 36,
          height: 70,
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
          borderTopWidth: 0,
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 0,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#000000",
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={ProviderDashboardScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <View style={styles.activeTabCircle}>
                <Ionicons name="grid" size={24} color={COLORS.primary} />
              </View>
            ) : (
              <Ionicons name="grid-outline" size={24} color="#000000" />
            ),
        }}
      />
      <Tab.Screen
        name="Sessions"
        component={ProviderSessionsScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <View style={styles.activeTabCircle}>
                <Ionicons name="calendar" size={24} color={COLORS.primary} />
              </View>
            ) : (
              <Ionicons name="calendar-outline" size={24} color="#000000" />
            ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={ProviderMessagesStackNavigator}
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <View style={styles.activeTabCircle}>
                <Ionicons name="chatbubble" size={24} color={COLORS.primary} />
              </View>
            ) : (
              <Ionicons name="chatbubble-outline" size={24} color="#000000" />
            ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProviderProfileScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <View style={styles.activeTabCircle}>
                <Ionicons name="person" size={24} color={COLORS.primary} />
              </View>
            ) : (
              <Ionicons name="person-outline" size={24} color="#000000" />
            ),
        }}
      />
    </Tab.Navigator>
  );
};

const ProviderStack = createNativeStackNavigator();

export const ProviderNavigator = () => {
  return (
    <ProviderStack.Navigator screenOptions={{ headerShown: false }}>
      <ProviderStack.Screen name="ProviderTabs" component={ProviderMainNavigator} />
      <ProviderStack.Screen name="Notifications" component={ProviderNotificationScreen} />
      <ProviderStack.Screen name="Earnings" component={ProviderEarningsScreen} />
      <ProviderStack.Screen name="Availability" component={ProviderAvailabilityScreen} />
      <ProviderStack.Screen name="Clients" component={ProviderPatientsStudentsScreen} />
      <ProviderStack.Screen name="Courses" component={ProviderCoursesScreen} />
      <ProviderStack.Screen name="Prescriptions" component={ProviderPrescriptionsScreen} />
      <ProviderStack.Screen name="LiveClass" component={ProviderLiveClassScreen} />
      <ProviderStack.Screen name="Chat" component={ChatScreen as any} />
      <ProviderStack.Screen name="ProviderCompleteProfile" component={ProviderCompleteProfileScreen as any} />
      <ProviderStack.Screen name="ProviderReligionSelect" component={ProviderReligionSelectScreen as any} />
      <ProviderStack.Screen name="PendingVerification" component={PendingVerificationScreen as any} />
    </ProviderStack.Navigator>
  );
};

const styles = StyleSheet.create({
  activeTabCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});
