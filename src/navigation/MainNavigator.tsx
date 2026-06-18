import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { AstrologersScreen } from "../screens/AstrologersScreen";
import { ChatListScreen } from "../screens/ChatListScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { CommunityScreen } from "../screens/CommunityScreen";
import { DoctorsScreen } from "../screens/DoctorsScreen";
import { EducationScreen } from "../screens/EducationScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { NotificationScreen } from "../screens/NotificationScreen";
import { PrayerScreen } from "../screens/PrayerScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SearchScreen } from "../screens/SearchScreen";
import CustomerCareScreen from "../screens/CustomerCareScreen";

export type MainStackParamList = {
  Home: undefined;
  Chat: { astrologer: any };
  Prayer: undefined;
  Education: undefined;
  ChatList: undefined;
  Community: undefined;
  Profile: undefined;
  Astrologers: undefined;
  Doctors: undefined;
  Search: undefined;
  Notifications: undefined;
};

const Tab = createBottomTabNavigator<MainStackParamList>();
const HomeStack = createNativeStackNavigator();
const ChatListStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen as any} />
      <HomeStack.Screen name="Chat" component={ChatScreen as any} />
      <HomeStack.Screen name="Prayer" component={PrayerScreen as any} />
      <HomeStack.Screen name="Education" component={EducationScreen as any} />
      <HomeStack.Screen
        name="Astrologers"
        component={AstrologersScreen as any}
      />
      <HomeStack.Screen name="Doctors" component={DoctorsScreen as any} />
      <HomeStack.Screen name="Search" component={SearchScreen as any} />
      <HomeStack.Screen
        name="Notifications"
        component={NotificationScreen as any}
      />
    </HomeStack.Navigator>
  );
};

const ChatListStackNavigator = () => {
  return (
    <ChatListStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatListStack.Screen
        name="ChatListMain"
        component={ChatListScreen as any}
      />
      <ChatListStack.Screen name="Chat" component={ChatScreen as any} />
    </ChatListStack.Navigator>
  );
};

const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        },
        tabBarStyle: {
          position: "absolute",
          bottom: insets.bottom > 0 ? insets.bottom + 6 : 14,
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
          paddingBottom: 0,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#000000",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.activeTabCircle]}>
              <FontAwesome name="home" size={24} color={focused ? COLORS.primary : "#000000"} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ChatList"
        component={ChatListStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.activeTabCircle]}>
              <MaterialIcons
                name="message"
                size={24}
                color={focused ? COLORS.primary : "#000000"}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen as any}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.activeTabCircle]}>
              <FontAwesome name="users" size={22} color={focused ? COLORS.primary : "#000000"} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen as any}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.activeTabCircle]}>
              <FontAwesome name="user" size={24} color={focused ? COLORS.primary : "#000000"} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const CustomDrawerContent = (props: any) => {
  const { religion, profile } = useUser();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();

  const religionLabel =
    religion === "muslim"
      ? "Muslim"
      : religion === "hindu"
        ? "Hindu"
        : religion === "christian"
          ? "Christian"
          : "";

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Header Profile Section with Gradient */}
      <LinearGradient
        colors={COLORS.gradient}
        style={[
          styles.drawerHeader,
          { paddingTop: insets.top > 0 ? insets.top + 20 : 30 },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.drawerCloseButton,
            { top: insets.top > 0 ? insets.top + 8 : 12 },
          ]}
          onPress={() => props.navigation.closeDrawer()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.drawerAvatar}>
          <Text style={styles.drawerAvatarText}>👤</Text>
        </View>
        <Text style={styles.drawerName}>{profile?.name || "User Profile"}</Text>
        {religionLabel ? (
          <View style={styles.drawerReligionTag}>
            <Text style={styles.drawerReligionText}>{religionLabel}</Text>
          </View>
        ) : null}
      </LinearGradient>

      {/* Drawer Items */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 10 }}
      >
        <DrawerItem
          label="Home"
          icon={({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          )}
          activeTintColor={COLORS.primary}
          inactiveTintColor="#1A1A1A"
          labelStyle={styles.drawerLabel}
          onPress={() => props.navigation.navigate("Home")}
        />
        <DrawerItem
          label="Chats"
          icon={({ color, size }) => (
            <MaterialIcons name="message" size={size} color={color} />
          )}
          activeTintColor={COLORS.primary}
          inactiveTintColor="#1A1A1A"
          labelStyle={styles.drawerLabel}
          onPress={() => props.navigation.navigate("ChatList")}
        />
        <DrawerItem
          label="Community"
          icon={({ color, size }) => (
            <FontAwesome name="users" size={size} color={color} />
          )}
          activeTintColor={COLORS.primary}
          inactiveTintColor="#1A1A1A"
          labelStyle={styles.drawerLabel}
          onPress={() => props.navigation.navigate("Community")}
        />
        <DrawerItem
          label="Profile"
          icon={({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          )}
          activeTintColor={COLORS.primary}
          inactiveTintColor="#1A1A1A"
          labelStyle={styles.drawerLabel}
          onPress={() => props.navigation.navigate("Profile")}
        />
      </DrawerContentScrollView>

      {/* Bottom Footer Section with Logout */}
      <View
        style={[
          styles.drawerFooter,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 20 },
        ]}
      >
        <TouchableOpacity
          style={styles.drawerLogoutButton}
          onPress={async () => {
            try {
              await logout();
            } catch (err) {
              alert("Logout failed");
            }
          }}
        >
          <Text style={styles.drawerLogoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

import VideoCallScreen from "../screens/VideoCallScreen";
import AudioCallScreen from "../screens/AudioCallScreen";
import IncomingCallScreen from "../screens/IncomingCallScreen";

const MainStack = createNativeStackNavigator();

const MainDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      useLegacyImplementation={false}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 280,
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
        },
      }}
    >
      <Drawer.Screen name="MainTabs" component={MainTabNavigator} />
    </Drawer.Navigator>
  );
};

export const MainNavigator = () => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainDrawer" component={MainDrawerNavigator} />
      <MainStack.Screen
        name="VideoCall"
        component={VideoCallScreen as any}
        options={{ presentation: "fullScreenModal" }}
      />
      <MainStack.Screen
        name="AudioCall"
        component={AudioCallScreen as any}
        options={{ presentation: "fullScreenModal" }}
      />
      <MainStack.Screen
        name="IncomingCall"
        component={IncomingCallScreen as any}
        options={{ presentation: "fullScreenModal" }}
      />
      <MainStack.Screen
        name="CustomerCare"
        component={CustomerCareScreen as any}
      />
    </MainStack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabCircle: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  drawerHeader: {
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  drawerAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  drawerAvatarText: {
    fontSize: 36,
  },
  drawerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  drawerReligionTag: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  drawerReligionText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  drawerLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: -10,
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  drawerLogoutButton: {
    backgroundColor: "#FFE8E8",
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  drawerLogoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FF4444",
  },
  drawerCloseButton: {
    position: "absolute",
    top: 12,
    left: 12,
    padding: 8,
  },
});
