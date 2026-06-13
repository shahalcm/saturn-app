import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BORDER_RADIUS, COLORS } from "../constants/colors";

interface EducationCardProps {
  education: {
    id: string;
    title: string;
    instructor: string;
    level: string;
    students: number;
    price: string;
    icon: string;
  };
  onPress?: () => void;
}

export const EducationCard: React.FC<EducationCardProps> = ({
  education,
  onPress,
}) => {
  const formatStudents = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const isPaid = education.price !== "Free";

  return (
    <View style={styles.card}>
      <View style={styles.topSection}>
        <View>
          <Text style={styles.title}>{education.title}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{education.level}</Text>
          </View>
        </View>
      </View>

      <View style={styles.instructorRow}>
        <Text style={styles.instructorLabel}>👨‍🏫</Text>
        <Text style={styles.instructor}>{education.instructor}</Text>
      </View>

      <View style={styles.footerSection}>
        <Text style={styles.students}>
          {formatStudents(education.students)} students
        </Text>
        <View
          style={[
            styles.priceBadge,
            { backgroundColor: isPaid ? COLORS.primary : COLORS.success },
          ]}
        >
          <Text style={styles.priceText}>{education.price}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.enrollButton} onPress={onPress}>
        <Text style={styles.enrollText}>Enroll</Text>
      </TouchableOpacity>
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
  topSection: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: "#FFF0D6",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  instructorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  instructorLabel: {
    fontSize: 16,
  },
  instructor: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  footerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  students: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  priceBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  priceText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white,
  },
  enrollButton: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.card,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  enrollText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },
});
