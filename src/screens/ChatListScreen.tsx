import { Feather } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BORDER_RADIUS, COLORS } from "../constants/colors";
import { chatAPI } from "../services/api";

type RootTabParamList = {
  ChatList: undefined;
};

type ChatListScreenProps = BottomTabScreenProps<RootTabParamList, "ChatList">;

type FilterType = "All" | "Unread" | "Astrologers" | "Doctors";

export const ChatListScreen: React.FC<ChatListScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [conversations, setConversations] = useState<any[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await chatAPI.getConversations();
      setConversations(res.data.data || []);
    } catch (e) {
      console.error('Error fetching conversations:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
  }, []);

  useEffect(() => {
    let list = [...conversations];
    
    // Search query filter
    if (searchQuery.trim()) {
      list = list.filter((item) => {
        const providerName = item.provider?.name || item.lastMessage?.senderName || '';
        const lastMsg = item.lastMessage?.content || '';
        return providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               lastMsg.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Tab category filter
    if (activeFilter === "Unread") {
      list = list.filter((c) => c.unreadCount > 0);
    } else if (activeFilter === "Astrologers") {
      list = list.filter((c) => c.provider?.providerType === "astrologer");
    } else if (activeFilter === "Doctors") {
      list = list.filter((c) => c.provider?.providerType === "doctor");
    }

    setFilteredConversations(list);
  }, [conversations, searchQuery, activeFilter]);

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatTime = (date?: string) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) {
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 172800000) {
      return 'Yesterday';
    }
    return d.toLocaleDateString('en-IN', { weekday: 'short' });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color="#F5A623" />
      </View>
    );
  }

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
        data={filteredConversations}
        keyExtractor={(item, index) => item._id || index.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F5A623']} />}
        renderItem={({ item }) => {
          const providerName = item.provider?.name || item.lastMessage?.senderName || 'Provider';
          return (
            <TouchableOpacity
              style={styles.chatItem}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate("Chat" as any, {
                  astrologer: {
                    _id: item.provider?._id || item._id,
                    name: providerName,
                    avatar: item.provider?.avatar || '👤',
                  },
                  sessionId: item._id || item.lastMessage?.sessionId,
                })
              }
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(providerName)}
                </Text>
                {item.provider?.isOnline ? <View style={styles.onlineBadge} /> : null}
              </View>
              <View style={styles.chatInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.chatName}>{providerName}</Text>
                  {item.provider?.providerType ? (
                    <View
                      style={[
                        styles.roleTag,
                        { backgroundColor: item.provider.providerType === 'doctor' ? '#E8D5F2' : '#FFF0D6' }
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleTagText,
                          { color: item.provider.providerType === 'doctor' ? COLORS.purple : COLORS.primaryDark }
                        ]}
                      >
                        {item.provider.providerType === 'doctor' ? 'Doctor' : 'Astro'}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.lastMessage?.content || 'No messages yet'}
                </Text>
              </View>
              <View style={styles.rightSection}>
                <Text style={styles.time}>
                  {formatTime(item.lastMessage?.createdAt)}
                </Text>
                {item.unreadCount > 0 ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unreadCount}</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        }}
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
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
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
