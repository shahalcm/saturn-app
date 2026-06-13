import { Feather } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";

type ProviderNotificationScreenProps = NativeStackScreenProps<any, "Notifications">;

interface NotificationItem {
  id: string;
  type: "booking" | "chat" | "review" | "payout" | "system";
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  icon: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: "booking",
    title: "New Booking Request",
    body: "Rahul Mehta requested a Chat session with you on 12 Jun at 10:30 AM.",
    time: "1 hour ago",
    isRead: false,
    icon: "📅",
  },
  {
    id: "2",
    type: "review",
    title: "New 5-Star Review",
    body: "Priya Sharma left a 5-star review: 'Highly recommended, very professional consultation!'",
    time: "5 hours ago",
    isRead: false,
    icon: "⭐",
  },
  {
    id: "3",
    type: "chat",
    title: "Message from Arjun Kumar",
    body: "Hello, I wanted to ask if you had a chance to look over my birth details...",
    time: "1 day ago",
    isRead: true,
    icon: "💬",
  },
  {
    id: "4",
    type: "payout",
    title: "Weekly Payout Processed",
    body: "Your weekly earnings of ₹3,400 have been successfully transferred to your bank account.",
    time: "3 days ago",
    isRead: true,
    icon: "💸",
  },
  {
    id: "5",
    type: "system",
    title: "Verification Successful!",
    body: "Your credentials have been successfully reviewed and verified. Welcome to Saturn App!",
    time: "4 days ago",
    isRead: true,
    icon: "✨",
  },
];

export const ProviderNotificationScreen: React.FC<
  ProviderNotificationScreenProps
> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );

  const toggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRead: !item.isRead } : item
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderItem = ({ item }: { item: NotificationItem }) => {
    return (
      <View style={[styles.card, !item.isRead && styles.cardUnread]}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => toggleReadStatus(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{item.icon}</Text>
          </View>
          <View style={styles.textSection}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, !item.isRead && styles.titleBold]}>
                {item.title}
              </Text>
              {!item.isRead ? <View style={styles.unreadDot} /> : null}
            </View>
            <Text style={styles.bodyText} numberOfLines={3}>
              {item.body}
            </Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
          activeOpacity={0.7}
        >
          <Feather name="trash-2" size={16} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={COLORS.gradient}
        style={[
          styles.header,
          { paddingTop: insets.top > 0 ? insets.top + 12 : 24 },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          {notifications.length > 0 ? (
            <View style={styles.headerActions}>
              {unreadCount > 0 ? (
                <TouchableOpacity
                  onPress={markAllAsRead}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionText}>Mark read</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity onPress={clearAll} style={styles.actionButton}>
                <Text style={styles.actionText}>Clear all</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.body}>
        {notifications.length > 0 ? (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 100 },
            ]}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.illustrationCircle}>
              <Feather name="bell" size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySubtitle}>
              You have no new notifications. We'll alert you here when new requests, weekly payout updates, or reviews are submitted.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    flex: 1,
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
  body: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: "hidden",
  },
  cardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    padding: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF0D6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 22,
  },
  textSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    flex: 1,
  },
  titleBold: {
    fontWeight: "700",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  bodyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textHint,
  },
  deleteButton: {
    width: 46,
    justifyContent: "center",
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#F0F0F0",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  illustrationCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF0D6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
});
