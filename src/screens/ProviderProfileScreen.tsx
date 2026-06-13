import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { ClassicAlertModal } from "../components/ClassicAlertModal";

export const ProviderProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const {
    profile,
    providerType,
    religion,
    isProviderVerified,
    isOnline,
    clearUser,
  } = useUser();
  const [alertVisible, setAlertVisible] = useState(false);
  const [reviewsAlertVisible, setReviewsAlertVisible] = useState(false);

  const handleLogout = async () => {
    setAlertVisible(true);
  };

  const handleConfirmLogout = async () => {
    setAlertVisible(false);
    try {
      await logout();
      await clearUser();
    } catch (error) {
      alert("Logout failed");
    }
  };

  const getProviderTypeLabel = () => {
    switch (providerType) {
      case "astrologer":
        return "🔮 Astrologer";
      case "doctor":
        return "🩺 Doctor / Healer";
      case "teacher":
        return "🎓 Teacher / Guru";
      default:
        return "Service Provider";
    }
  };

  const getReligionLabel = () => {
    switch (religion) {
      case "muslim":
        return "🕌 Muslim";
      case "hindu":
        return "🕉️ Hindu";
      case "christian":
        return "✝️ Christian";
      default:
        return "Not specified";
    }
  };

  // Stats mapping for the profile header stats bar
  const statsMap = {
    astrologer: [
      { value: "24", label: "Chats" },
      { value: "12", label: "Calls" },
      { value: "4.9", label: "Rating" },
      { value: "₹2.4k", label: "Earned" },
    ],
    doctor: [
      { value: "38", label: "Patients" },
      { value: "15", label: "Consults" },
      { value: "4.8", label: "Rating" },
      { value: "₹5.1k", label: "Earned" },
    ],
    teacher: [
      { value: "56", label: "Students" },
      { value: "3", label: "Courses" },
      { value: "4.7", label: "Rating" },
      { value: "₹3.2k", label: "Earned" },
    ],
  };

  const getStats = () => {
    return statsMap[providerType || "astrologer"];
  };

  const getInitials = (name: string) => {
    if (!name) return "P";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER with LinearGradient banner */}
      <LinearGradient
        colors={COLORS.gradient}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {getInitials(profile?.name || "")}
          </Text>
        </View>

        <Text style={styles.providerName}>
          {profile?.name || "Service Provider"}
        </Text>

        <View style={styles.badgeRow}>
          <View style={styles.pillBadge}>
            <Text style={styles.pillText}>{getProviderTypeLabel()}</Text>
          </View>
          <View style={styles.pillBadge}>
            <Text style={styles.pillText}>{getReligionLabel()}</Text>
          </View>
        </View>

        <View style={styles.onlineStatusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOnline ? "#4CAF50" : "#9E9E9E" },
            ]}
          />
          <Text style={styles.statusText}>
            {isOnline ? "Online" : "Offline"}
          </Text>
        </View>
      </LinearGradient>

      {/* STATS BAR CARD OVERLAY */}
      <View style={styles.statsBar}>
        {getStats().map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* VERIFICATION CARD */}
        <View style={styles.verificationCard}>
          <Ionicons
            name="shield-checkmark-outline"
            size={28}
            color={isProviderVerified ? "#4CAF50" : "#F5A623"}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.verificationTitle}>
              {isProviderVerified ? "Verified Provider" : "Verification Pending"}
            </Text>
            <Text style={styles.verificationDesc}>
              {isProviderVerified
                ? "Your profile is verified and visible to seekers."
                : "Your documents are currently under review."}
            </Text>
          </View>
        </View>

        {/* PROFILE INFO SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📱 Phone</Text>
            <Text style={styles.infoValue}>
              {profile?.phone || "Not provided"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>✉️ Email</Text>
            <Text style={styles.infoValue}>
              {profile?.email || "Not provided"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📍 Location</Text>
            <Text style={styles.infoValue}>
              {profile?.pob || "Not provided"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🗣️ Languages</Text>
            <Text style={styles.infoValue}>
              {profile?.languages?.join(", ") || "Not provided"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>⏳ Experience</Text>
            <Text style={styles.infoValue}>
              {(profile as any)?.experience ? `${(profile as any).experience} years` : "Not provided"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🏷️ Price</Text>
            <Text style={styles.infoValue}>
              {(profile as any)?.price
                ? `₹${(profile as any).price}/${
                    providerType === "astrologer"
                      ? "min"
                      : providerType === "doctor"
                      ? "consultation"
                      : "month"
                  }`
                : "Not provided"}
            </Text>
          </View>
        </View>

        {/* SETTINGS OPTIONS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate("ProviderCompleteProfile")}
            activeOpacity={0.7}
          >
            <Text style={styles.settingLabel}>👤 Edit Profile</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setReviewsAlertVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.settingLabel}>⭐ My Reviews</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate("Earnings")}
            activeOpacity={0.7}
          >
            <Text style={styles.settingLabel}>💳 Earnings & Payouts</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate("Availability")}
            activeOpacity={0.7}
          >
            <Text style={styles.settingLabel}>🕒 Availability Settings</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate("ProviderReligionSelect")}
            activeOpacity={0.7}
          >
            <Text style={styles.settingLabel}>🕌 Change Religion</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <ClassicAlertModal
        visible={alertVisible}
        type="warning"
        title="Logout"
        message="Are you sure you want to logout?"
        onClose={() => setAlertVisible(false)}
        onConfirm={handleConfirmLogout}
        confirmText="Logout"
        cancelText="Cancel"
      />

      <ClassicAlertModal
        visible={reviewsAlertVisible}
        type="info"
        title="My Reviews"
        message="Review history feature is coming soon!"
        onClose={() => setReviewsAlertVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.primary,
  },
  providerName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 10,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  pillBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  pillText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  onlineStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  statsBar: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 16,
    marginTop: -20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  statLabel: {
    fontSize: 11,
    color: "#666666",
    marginTop: 2,
  },
  scrollContent: {
    paddingTop: 16,
  },
  verificationCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  verificationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  verificationDesc: {
    fontSize: 13,
    color: "#666666",
    marginTop: 2,
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F5F5F5",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F5F5F5",
  },
  settingLabel: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  settingArrow: {
    fontSize: 18,
    color: "#CCCCCC",
  },
  logoutButton: {
    backgroundColor: "#FFE8E8",
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FF4444",
  },
});
