import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GradientButton } from "../components/GradientButton";
import { COLORS } from "../constants/colors";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";

type PendingVerificationScreenProps = NativeStackScreenProps<
  any,
  "PendingVerification"
>;

export const PendingVerificationScreen: React.FC<
  PendingVerificationScreenProps
> = ({ navigation }) => {
  const { login, logout } = useAuth();
  const { setProviderVerified, setProviderPending, religion } = useUser();

  const handleGoToHome = async () => {
    try {
      // Approve provider in context & AsyncStorage
      await setProviderVerified(true);
      await setProviderPending(false);

      // AppNavigator will trigger rendering of ProviderMainNavigator
    } catch (error) {
      alert("Error logging in. Please try again.");
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will update automatically in AppNavigator
    } catch (error) {
      alert("Logout failed");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.content}>
        {/* Under Review Illustration */}
        <LinearGradient
          colors={["#FFF0D6", "#FFE0B0"]}
          style={styles.illustrationCircle}
        >
          <Ionicons name="time-outline" size={56} color={COLORS.primary} />
        </LinearGradient>

        <Text style={styles.title}>Under Review</Text>
        <Text style={styles.description}>
          Your profile has been submitted for verification. Our team will review
          your documents within 24-48 hours. You will receive a notification
          once approved.
        </Text>

        {/* Info Cards */}
        <View style={styles.infoCardsContainer}>
          <View style={styles.infoCard}>
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color="#4CAF50"
            />
            <Text style={styles.infoCardText}>Profile submitted successfully</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="document-text-outline" size={22} color="#F5A623" />
            <Text style={styles.infoCardText}>Documents under review</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="notifications-outline" size={22} color="#1A6BF5" />
            <Text style={styles.infoCardText}>You'll be notified within 48hrs</Text>
          </View>
        </View>

        {/* Go to Home */}
        <GradientButton
          title="Go to Home"
          onPress={handleGoToHome}
          containerStyle={styles.homeButton}
          style={{ width: "100%" }}
        />

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  illustrationCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  infoCardsContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  infoCardText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  homeButton: {
    width: "100%",
    height: 54,
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 16,
    padding: 8,
  },
  logoutText: {
    fontSize: 14,
    color: "#FF4444",
    fontWeight: "600",
  },
});
