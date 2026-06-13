import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { PROVIDER_MESSAGES } from "../constants/mockData";

export const ProviderMessagesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const getInitials = (name: string) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleChatPress = (item: any) => {
    // Navigate to seeker ChatScreen by mapping route parameters to the expected astrologer schema
    navigation.navigate("Chat", {
      astrologer: {
        name: item.seekerName,
        avatar: getInitials(item.seekerName),
        specialties: ["Client"],
        languages: ["English"],
        rating: 5,
        experience: 0,
        pricePerMin: 0,
        isOnline: true,
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER Banner */}
      <LinearGradient
        colors={COLORS.gradient}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.headerTitle}>Messages</Text>
      </LinearGradient>

      {/* CHATS LIST */}
      <FlatList
        data={PROVIDER_MESSAGES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No messages found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => handleChatPress(item)}
            activeOpacity={0.7}
          >
            {/* Avatar block */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {getInitials(item.seekerName)}
              </Text>
            </View>

            {/* Middle Section */}
            <View style={styles.chatDetails}>
              <Text style={styles.seekerName}>{item.seekerName}</Text>
              <Text style={styles.lastMsgText} numberOfLines={1}>
                {item.lastMsg}
              </Text>
            </View>

            {/* Right details */}
            <View style={styles.rightSection}>
              <Text style={styles.timeText}>{item.time}</Text>
              {item.unread > 0 ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
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
  listContent: {
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
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF0D6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  chatDetails: {
    flex: 1,
    marginHorizontal: 12,
  },
  seekerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  lastMsgText: {
    fontSize: 13,
    color: "#666666",
    marginTop: 4,
  },
  rightSection: {
    alignItems: "flex-end",
    gap: 6,
  },
  timeText: {
    fontSize: 11,
    color: "#999999",
  },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  unreadText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
