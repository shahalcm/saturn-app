import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { useUser } from "../context/UserContext";

const { width: screenWidth } = Dimensions.get("window");

export const ProviderDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { profile, providerType, isOnline, setOnlineStatus } = useUser();

  // Stats data mapping
  const statsMap = {
    astrologer: [
      { icon: "chatbubble-outline", value: "24", label: "Total\nChats" },
      { icon: "call-outline", value: "12", label: "Total\nCalls" },
      { icon: "star-outline", value: "4.9", label: "Rating" },
      { icon: "wallet-outline", value: "₹2.4k", label: "Earned" },
    ],
    doctor: [
      { icon: "people-outline", value: "38", label: "Patients" },
      { icon: "call-outline", value: "15", label: "Consults" },
      { icon: "star-outline", value: "4.8", label: "Rating" },
      { icon: "wallet-outline", value: "₹5.1k", label: "Earned" },
    ],
    teacher: [
      { icon: "people-outline", value: "56", label: "Students" },
      { icon: "book-outline", value: "3", label: "Courses" },
      { icon: "star-outline", value: "4.7", label: "Rating" },
      { icon: "wallet-outline", value: "₹3.2k", label: "Earned" },
    ],
  };

  const getStats = () => {
    return statsMap[providerType || "astrologer"];
  };

  // Quick actions grid
  const actionsMap = {
    astrologer: [
      { icon: "add-circle-outline", label: "New Session", color: "#F5A623" },
      { icon: "cash-outline", label: "Earnings", color: "#4CAF50" },
      { icon: "person-add-outline", label: "My Profile", color: "#1A6BF5" },
      { icon: "settings-outline", label: "Availability", color: "#9C27B0" },
    ],
    doctor: [
      { icon: "add-circle-outline", label: "New Consult", color: "#F5A623" },
      { icon: "medical-outline", label: "Prescriptions", color: "#4CAF50" },
      { icon: "people-outline", label: "My Patients", color: "#1A6BF5" },
      { icon: "time-outline", label: "Schedule", color: "#9C27B0" },
    ],
    teacher: [
      { icon: "add-circle-outline", label: "New Class", color: "#F5A623" },
      { icon: "book-outline", label: "My Courses", color: "#4CAF50" },
      { icon: "people-outline", label: "Students", color: "#1A6BF5" },
      { icon: "videocam-outline", label: "Live Class", color: "#9C27B0" },
    ],
  };

  const getActions = () => {
    return actionsMap[providerType || "astrologer"];
  };

  // Mock sessions
  const mockSessions = [
    {
      seekerName: "Rahul M.",
      type: "Chat",
      date: "12",
      month: "Jun",
      time: "10:30 AM",
      status: "Confirmed",
    },
    {
      seekerName: "Priya S.",
      type: "Call",
      date: "12",
      month: "Jun",
      time: "2:00 PM",
      status: "Confirmed",
    },
    {
      seekerName: "Arjun K.",
      type: "Video",
      date: "13",
      month: "Jun",
      time: "11:00 AM",
      status: "Pending",
    },
  ];

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Chat":
        return { bg: "#FFF0D6", text: "#E8841A" };
      case "Call":
        return { bg: "#E8F5E9", text: "#2E7D32" };
      case "Video":
        return { bg: "#E8F0FF", text: "#1A6BF5" };
      default:
        return { bg: "#F0E8FF", text: "#9C27B0" };
    }
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

      {/* HEADER SECTION with Gradient */}
      <LinearGradient
        colors={COLORS.gradient}
        style={[
          styles.header,
          { paddingTop: insets.top + 12 },
        ]}
      >
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>Good Morning 👋</Text>
            <Text style={styles.profileName} numberOfLines={1}>
              {profile?.name || "Service Provider"}
            </Text>
          </View>

          <View style={styles.headerActionRow}>
            <TouchableOpacity
              style={styles.headerIconButton}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("Notifications")}
            >
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>

            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {getInitials(profile?.name || "")}
              </Text>
            </View>
          </View>
        </View>

        {/* Online/Offline Availability Toggle */}
        <View style={styles.statusToggleRow}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                isOnline ? styles.toggleOptionActive : null,
              ]}
              onPress={() => setOnlineStatus(true)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleText,
                  isOnline ? styles.toggleTextActive : null,
                ]}
              >
                🟢 Online
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleOption,
                !isOnline ? styles.toggleOptionActive : null,
              ]}
              onPress={() => setOnlineStatus(false)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleText,
                  !isOnline ? styles.toggleTextActive : null,
                ]}
              >
                🔴 Offline
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* BODY SCROLLVIEW */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* STATS ROW */}
        <View style={styles.statsRow}>
          {getStats().map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <Ionicons name={stat.icon as any} size={22} color={COLORS.primary} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* UPCOMING SESSIONS SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Sessions")}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {mockSessions.length === 0 ? (
            <View style={styles.emptySessionsCard}>
              <Ionicons name="calendar-outline" size={44} color="#CCCCCC" />
              <Text style={styles.emptySessionsText}>No upcoming sessions</Text>
            </View>
          ) : (
            mockSessions.map((session, index) => {
              const badgeColors = getTypeBadgeColor(session.type);
              return (
                <View key={index} style={styles.sessionCard}>
                  {/* Left date block */}
                  <LinearGradient
                    colors={COLORS.gradient}
                    style={styles.dateBlock}
                  >
                    <Text style={styles.dateDay}>{session.date}</Text>
                    <Text style={styles.dateMonth}>{session.month}</Text>
                  </LinearGradient>

                  {/* Center details */}
                  <View style={styles.sessionDetails}>
                    <Text style={styles.seekerName}>{session.seekerName}</Text>
                    <View style={styles.sessionBadgeTimeRow}>
                      <View
                        style={[
                          styles.typeBadge,
                          { backgroundColor: badgeColors.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.typeBadgeText,
                            { color: badgeColors.text },
                          ]}
                        >
                          {session.type}
                        </Text>
                      </View>
                      <Text style={styles.sessionTimeText}>{session.time}</Text>
                    </View>
                  </View>

                  {/* Right Status */}
                  <View style={styles.statusSection}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            session.status === "Confirmed"
                              ? "#4CAF50"
                              : "#FFB300",
                        },
                      ]}
                    />
                    <Text style={styles.statusText}>{session.status}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* QUICK ACTIONS SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionsGrid}>
            {getActions().map((action, idx) => {
              const cardWidth = (screenWidth - 50) / 2; // Screen width - horizontal offsets / 2 columns
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.actionCard, { width: cardWidth }]}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (action.label === "New Session" || action.label === "New Consult" || action.label === "New Class") {
                      navigation.navigate("Sessions");
                    } else if (action.label === "Earnings") {
                      navigation.navigate("Earnings");
                    } else if (action.label === "My Profile") {
                      navigation.navigate("Profile");
                    } else if (action.label === "Availability" || action.label === "Schedule") {
                      navigation.navigate("Availability");
                    } else if (action.label === "Prescriptions") {
                      navigation.navigate("Prescriptions");
                    } else if (action.label === "My Patients" || action.label === "Students") {
                      navigation.navigate("Clients");
                    } else if (action.label === "My Courses") {
                      navigation.navigate("Courses");
                    } else if (action.label === "Live Class") {
                      navigation.navigate("LiveClass");
                    } else {
                      alert(`${action.label} feature coming soon`);
                    }
                  }}
                >
                  <Ionicons name={action.icon as any} size={28} color={action.color} />
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* RECENT REVIEWS SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>

          {/* Review 1 */}
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewAvatarText}>RM</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.reviewerName}>Rahul M.</Text>
                <Text style={styles.reviewDate}>2 days ago</Text>
              </View>
              <View style={styles.ratingStarsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Text key={s} style={{ fontSize: 12 }}>
                    ⭐
                  </Text>
                ))}
              </View>
            </View>
            <Text style={styles.reviewText}>
              Excellent consultation! Very accurate and helpful guidance.
            </Text>
          </View>

          {/* Review 2 */}
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={[styles.reviewAvatar, { backgroundColor: "#E8F0FF" }]}>
                <Text style={[styles.reviewAvatarText, { color: "#1A6BF5" }]}>
                  PS
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.reviewerName}>Priya S.</Text>
                <Text style={styles.reviewDate}>5 days ago</Text>
              </View>
              <View style={styles.ratingStarsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Text key={s} style={{ fontSize: 12 }}>
                    ⭐
                  </Text>
                ))}
              </View>
            </View>
            <Text style={styles.reviewText}>
              Highly recommended. Very professional service and support.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greetingText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 2,
  },
  headerActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4444",
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  statusToggleRow: {
    marginTop: 14,
  },
  toggleContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    borderRadius: 20,
    padding: 4,
    flexDirection: "row",
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleOptionActive: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.8)",
  },
  toggleTextActive: {
    color: COLORS.primary,
  },
  scrollContent: {
    paddingTop: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#666666",
    marginTop: 2,
    textAlign: "center",
    lineHeight: 14,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  seeAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
  },
  emptySessionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptySessionsText: {
    color: "#999999",
    marginTop: 8,
    fontSize: 14,
  },
  sessionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  dateBlock: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dateDay: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  dateMonth: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "600",
  },
  sessionDetails: {
    flex: 1,
    marginHorizontal: 12,
  },
  seekerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  sessionBadgeTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  typeBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  sessionTimeText: {
    fontSize: 13,
    color: "#666666",
  },
  statusSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "600",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 8,
    textAlign: "center",
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF0D6",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  reviewDate: {
    fontSize: 11,
    color: "#999999",
    marginTop: 2,
  },
  ratingStarsRow: {
    flexDirection: "row",
    gap: 1,
  },
  reviewText: {
    fontSize: 13,
    color: "#666666",
    marginTop: 10,
    lineHeight: 20,
  },
});
