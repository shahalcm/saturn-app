import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "../components/GradientButton";
import { COLORS } from "../constants/colors";
import {
  PROVIDER_SESSIONS_CANCELLED,
  PROVIDER_SESSIONS_COMPLETED,
  PROVIDER_SESSIONS_UPCOMING,
} from "../constants/mockData";
import { useUser } from "../context/UserContext";
import { ClassicAlertModal } from "../components/ClassicAlertModal";

export const ProviderSessionsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { providerType } = useUser();
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">(
    "upcoming"
  );

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: "success" | "warning" | "error" | "info";
    title: string;
    message: string;
  }>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  const getSessionsList = () => {
    switch (activeTab) {
      case "upcoming":
        return PROVIDER_SESSIONS_UPCOMING;
      case "completed":
        return PROVIDER_SESSIONS_COMPLETED;
      case "cancelled":
        return PROVIDER_SESSIONS_CANCELLED;
      default:
        return [];
    }
  };

  const getBadgeColors = (type: string) => {
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

  const handleAction = (label: string, session: any) => {
    if (label === "Class") {
      navigation.navigate("LiveClass");
    } else if (label === "Chat" || label === "Messaging") {
      navigation.navigate("Chat", { roomId: session.id, name: session.seekerName });
    } else if (label === "Call") {
      setAlertConfig({
        visible: true,
        type: "success",
        title: "Starting Call",
        message: `Calling ${session.seekerName} for your ${session.duration} consultation...\n\nPlease ensure your microphone is enabled.`,
      });
    } else if (label === "Details" || label === "View Details") {
      const isCompleted = session.status === "Completed";
      setAlertConfig({
        visible: true,
        type: "info",
        title: "Session Details",
        message: `Client Name: ${session.seekerName}\nType: ${session.type} Consultation\nScheduled: ${session.time} (${session.date} ${session.month})\nDuration: ${session.duration}\nStatus: ${session.status}${isCompleted ? `\nAmount Earned: ₹${session.amount}` : ""}`,
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER Banner */}
      <LinearGradient
        colors={COLORS.gradient}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.headerTitle}>Sessions</Text>
      </LinearGradient>

      {/* TAB BAR */}
      <View style={styles.tabBar}>
        {(["upcoming", "completed", "cancelled"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab ? styles.tabButtonActive : null,
            ]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab ? styles.tabTextActive : null,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST OF SESSIONS */}
      <FlatList
        data={getSessionsList()}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No {activeTab} sessions found</Text>
          </View>
        }
        renderItem={({ item }: { item: any }) => {
          const badgeColors = getBadgeColors(item.type);
          return (
            <View style={styles.card}>
              {/* Row 1: Left block, Center details, Right status */}
              <View style={styles.row1}>
                {/* Date Block */}
                <LinearGradient
                  colors={COLORS.gradient}
                  style={styles.dateBlock}
                >
                  <Text style={styles.dateDay}>{item.date}</Text>
                  <Text style={styles.dateMonth}>
                    {item.month || "Jun"}
                  </Text>
                </LinearGradient>

                {/* Details */}
                <View style={styles.sessionDetails}>
                  <Text style={styles.seekerName}>{item.seekerName}</Text>
                  <View style={styles.badgeRow}>
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
                        {item.type}
                      </Text>
                    </View>
                    <Text style={styles.timeText}>{item.time}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.durationText}>{item.duration}</Text>
                  </View>
                </View>

                {/* Status */}
                <View style={styles.statusSection}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          item.status === "Completed"
                            ? "#4CAF50"
                            : item.status === "Cancelled"
                            ? "#FF4444"
                            : item.status === "Confirmed"
                            ? "#4CAF50"
                            : "#FFB300",
                      },
                    ]}
                  />
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              {/* Row 2: Tab-specific actions */}
              {activeTab === "upcoming" && (
                <View style={styles.actionRow}>
                  {providerType === "teacher" ? (
                    <>
                      <GradientButton
                        title="Start Class"
                        onPress={() => handleAction("Class", item)}
                        containerStyle={styles.actionBtn}
                        style={{ width: "100%", height: 40 }}
                        textStyle={styles.btnText}
                      />
                      <TouchableOpacity
                        style={styles.outlineBtn}
                        onPress={() => handleAction("Messaging", item)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.outlineBtnText}>Message</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      {item.type === "Chat" ? (
                        <GradientButton
                          title="Start Chat"
                          onPress={() => handleAction("Chat", item)}
                          containerStyle={styles.actionBtn}
                          style={{ width: "100%", height: 40 }}
                          textStyle={styles.btnText}
                        />
                      ) : (
                        <GradientButton
                          title="Start Call"
                          onPress={() => handleAction("Call", item)}
                          containerStyle={styles.actionBtn}
                          style={{ width: "100%", height: 40 }}
                          textStyle={styles.btnText}
                        />
                      )}
                      <TouchableOpacity
                        style={styles.outlineBtn}
                        onPress={() => handleAction("Details", item)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.outlineBtnText}>Details</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}

              {activeTab === "completed" && (
                <View style={styles.completedRow}>
                  <Text style={styles.earnedText}>
                    Amount Earned: ₹{item.amount}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleAction("View Details", item)}
                  >
                    <Text style={styles.detailsLinkText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              )}

              {activeTab === "cancelled" && (
                <View style={styles.cancelledRow}>
                  <Text style={styles.reasonText}>
                    Reason: {item.reason || "Seeker cancelled this request."}
                  </Text>
                </View>
              )}
            </View>
          );
        }}
      />

      <ClassicAlertModal
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  tabButton: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  tabButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFFBF0",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666666",
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 14,
    color: "#999999",
    marginTop: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  row1: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "700",
    color: "#1A1A1A",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  typeBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  timeText: {
    fontSize: 12,
    color: "#666666",
  },
  dot: {
    fontSize: 12,
    color: "#999999",
  },
  durationText: {
    fontSize: 12,
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
  actionRow: {
    flexDirection: "row",
    marginTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 40,
  },
  btnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  outlineBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  outlineBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
  completedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  earnedText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2E7D32",
  },
  detailsLinkText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
  },
  cancelledRow: {
    marginTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  reasonText: {
    fontSize: 13,
    color: "#D32F2F",
    fontWeight: "600",
  },
});
