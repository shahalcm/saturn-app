import { Feather } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useSafeAreaInsets
} from "react-native-safe-area-context";
import { BORDER_RADIUS, COLORS } from "../constants/colors";
import { ASTROLOGERS, DOCTORS } from "../constants/mockData";

type RootTabParamList = {
  ChatList: undefined;
};

type ChatListScreenProps = BottomTabScreenProps<RootTabParamList, "ChatList">;

// Generate more classic recent chats incorporating both astrologers and doctors
const RECENT_CHATS = [
  ...ASTROLOGERS.slice(0, 3).map((astro, index) => ({
    ...astro,
    type: "astrologer",
    lastMessage:
      index === 0
        ? "Thank you for consulting me. Have a blessed day!"
        : index === 1
          ? "Your remedies are aligned with your planetary charts."
          : "We will schedule the Shiva Puja for next Monday.",
    time: index === 0 ? "2h ago" : index === 1 ? "4h ago" : "1d ago",
    unread: index === 0 ? 2 : 0,
  })),
  ...DOCTORS.slice(0, 3).map((doc, index) => ({
    ...doc,
    type: "doctor",
    lastMessage:
      index === 0
        ? "Please follow the prescription and update me in a week."
        : index === 1
          ? "Let me know if the symptoms improve by tomorrow."
          : "The health parameters you sent look good.",
    time: index === 0 ? "1h ago" : index === 1 ? "5h ago" : "2d ago",
    unread: index === 0 ? 1 : 0,
  })),
].sort((a, b) => {
  // Sort by time: 1h ago, 2h ago, 4h ago, 5h ago, 1d ago, 2d ago
  const getTimeWeight = (t: string) => {
    if (t.includes("h ago")) return parseInt(t) * 60;
    if (t.includes("d ago")) return parseInt(t) * 24 * 60;
    return 9999;
  };
  return getTimeWeight(a.time) - getTimeWeight(b.time);
});

type FilterType = "All" | "Unread" | "Astrologers" | "Doctors";

export const ChatListScreen: React.FC<ChatListScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");

  const filteredChats = RECENT_CHATS.filter((chat) => {
    // Search query match
    const matchesSearch =
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Filter type match
    if (activeFilter === "Unread") return chat.unread > 0;
    if (activeFilter === "Astrologers") return chat.type === "astrologer";
    if (activeFilter === "Doctors") return chat.type === "doctor";
    return true;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <LinearGradient
        colors={COLORS.gradient}
        style={[
          styles.header,
          { paddingTop: insets.top > 0 ? insets.top + 12 : 24 },
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>

        {/* Premium Search Bar */}
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={18}
            color={COLORS.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={COLORS.textHint}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Feather name="x" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>

      {/* Category Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsListContent}
        >
          {(["All", "Unread", "Astrologers", "Doctors"] as FilterType[]).map(
            (filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.tab,
                  activeFilter === filter && styles.tabActive,
                ]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeFilter === filter && styles.tabTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </ScrollView>
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate("Chat" as any, { astrologer: item })
            }
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.avatar}</Text>
              {item.isOnline ? <View style={styles.onlineBadge} /> : null}
            </View>
            <View style={styles.chatInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.chatName}>{item.name}</Text>
                {item.type === "doctor" ? (
                  <View style={styles.roleTag}>
                    <Text style={styles.roleTagText}>Doctor</Text>
                  </View>
                ) : (
                  <View
                    style={[styles.roleTag, { backgroundColor: "#FFF0D6" }]}
                  >
                    <Text
                      style={[
                        styles.roleTagText,
                        { color: COLORS.primaryDark },
                      ]}
                    >
                      Astro
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            <View style={styles.rightSection}>
              <Text style={styles.time}>{item.time}</Text>
              {item.unread > 0 ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>💬</Text>
            <Text style={styles.emptyStateText}>No messages found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try another search term or filter category.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  headerContent: {
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.input,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  tabsContainer: {
    height: 54,
    backgroundColor: COLORS.white,
    elevation: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    justifyContent: "center",
  },
  tabsListContent: {
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.tab,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: 0,
    paddingBottom: 120, // Avoid overlap with floating bottom bar
  },
  chatItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.borderLight,
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF0D6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    position: "relative",
  },
  avatarText: {
    fontSize: 24,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  chatInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chatName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  roleTag: {
    backgroundColor: "#E8D5F2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.purple,
  },
  lastMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  rightSection: {
    alignItems: "flex-end",
    gap: 8,
  },
  time: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "700",
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 6,
  },
});
