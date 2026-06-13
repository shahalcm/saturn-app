import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BORDER_RADIUS, COLORS } from "../constants/colors";
import { GradientButton } from "./GradientButton";

interface Doctor {
  id: string;
  name: string;
  rating: number;
  experience: number;
  pricePerMin: number;
  isOnline: boolean;
  languages: string[];
  specialties: string[];
  avatar: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  onPressChat: () => void;
  onPressCall: () => void;
  onPressVideo: () => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onPressChat,
  onPressCall,
  onPressVideo,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{doctor.avatar}</Text>
          </View>
          <View style={styles.infoSection}>
            <Text style={styles.name}>{doctor.name}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.rating}>{doctor.rating}</Text>
              <Text style={styles.experience}>{doctor.experience} yrs exp</Text>
            </View>
            <Text style={styles.price}>₹{doctor.pricePerMin}/min</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: doctor.isOnline ? "#E8F5E9" : "#FFFFFF" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: doctor.isOnline ? COLORS.success : COLORS.textSecondary,
              },
            ]}
          >
            {doctor.isOnline ? "ONLINE" : "OFFLINE"}
          </Text>
        </View>
      </View>

      {/* Specialties & Languages */}
      <View style={styles.tagsContainer}>
        <View style={styles.specialties}>
          {doctor.specialties.map((s) => (
            <View key={s} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{s}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.languagesText} numberOfLines={1}>
          🗣️ {doctor.languages.join(", ")}
        </Text>
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
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EAEAEA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
  },
  infoSection: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  star: {
    fontSize: 14,
  },
  rating: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  experience: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E2E2",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  tagsContainer: {
    marginTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.borderLight,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  specialties: {
    flexDirection: "row",
    gap: 6,
    flex: 1,
  },
  specialtyTag: {
    backgroundColor: "#FAF0E6",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  specialtyText: {
    fontSize: 11,
    color: COLORS.primaryDark,
    fontWeight: "600",
  },
  languagesText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    maxWidth: 120,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 16,
    gap: 8,
    alignItems: "center",
  },
  chatButton: {
    height: 38,
    borderRadius: 19,
    paddingVertical: 0,
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  outlineButton: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  outlineButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },
});
