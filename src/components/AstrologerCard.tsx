import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Linking, Alert } from "react-native";
import { BORDER_RADIUS, COLORS } from "../constants/colors";
import { GradientButton } from "./GradientButton";

interface Astrologer {
  id: string;
  name: string;
  rating: number;
  experience: number;
  pricePerMin: number;
  isOnline: boolean;
  languages: string[];
  specialties: string[];
  avatar: string;
  meetLink?: string;
}

interface AstrologerCardProps {
  astrologer: Astrologer;
  onPressChat: () => void;
  onPressCall: () => void;
  onPressVideo: () => void;
}

export const AstrologerCard: React.FC<AstrologerCardProps> = ({
  astrologer,
  onPressChat,
  onPressCall,
  onPressVideo,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{astrologer.avatar}</Text>
          </View>
          <View style={styles.infoSection}>
            <Text style={styles.name}>{astrologer.name}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.rating}>{astrologer.rating}</Text>
              <Text style={styles.experience}>{astrologer.experience} yrs</Text>
            </View>
            <Text style={styles.price}>₹{astrologer.pricePerMin}/min</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: astrologer.isOnline ? "#E8F5E9" : "#FFFFFF" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: astrologer.isOnline
                  ? COLORS.success
                  : COLORS.textSecondary,
              },
            ]}
          >
            {astrologer.isOnline ? "ONLINE" : "OFFLINE"}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <GradientButton
          title="Chat"
          onPress={onPressChat}
          style={styles.chatButton}
          textStyle={styles.buttonText}
          containerStyle={{ flex: 1 }}
        />
        <TouchableOpacity style={styles.outlineButton} onPress={onPressCall}>
          <Text style={styles.outlineButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineButton} onPress={onPressVideo}>
          <Text style={styles.outlineButtonText}>Video</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF0D6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
  },
  infoSection: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  star: {
    fontSize: 12,
  },
  rating: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  experience: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.success,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  chatButton: {
    flex: 1,
    height: 40,
  },
  buttonText: {
    fontSize: 14,
  },
  outlineButton: {
    flex: 1,
    height: 40,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.button,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.purple,
  },
  meetButton: {
    backgroundColor: COLORS.success || "#4CAF50",
    borderRadius: BORDER_RADIUS.button,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  meetText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.white || "#FFFFFF",
  },
});
