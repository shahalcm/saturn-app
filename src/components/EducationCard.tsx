import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Linking, Alert } from "react-native";
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
    meetLink?: string;
  };
  onPress?: () => void;
  isEnrolled?: boolean;
}

export const EducationCard: React.FC<EducationCardProps> = ({
  education,
  onPress,
  isEnrolled = false,
}) => {
  const formatStudents = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const isPaid = education.price !== "Free";

  const handleJoinMeet = () => {
    if (!education.meetLink) return;

    let url = education.meetLink.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("Invalid Link", "The link format is not supported.");
        }
      })
      .catch(() => {
        Alert.alert("Error", "An error occurred while trying to open the link.");
      });
  };

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

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.enrollButton,
            education.meetLink ? { flex: 1, marginRight: 8 } : null,
            isEnrolled ? styles.enrolledButton : null
          ]}
          onPress={isEnrolled ? undefined : onPress}
          disabled={isEnrolled}
        >
          <Text style={[styles.enrollText, isEnrolled ? styles.enrolledText : null]}>
            {isEnrolled ? "Enrolled ✓" : "Enroll"}
          </Text>
        </TouchableOpacity>
        {education.meetLink ? (
          <TouchableOpacity
            style={[styles.meetButton, { flex: 1 }]}
            onPress={handleJoinMeet}
            activeOpacity={0.7}
          >
            <Text style={styles.meetText}>🎥 Join Meet</Text>
          </TouchableOpacity>
        ) : null}
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
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  meetButton: {
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.card,
    paddingVertical: 9.5,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  meetText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.white,
  },
  enrolledButton: {
    backgroundColor: "#E8F5E9",
    borderColor: COLORS.success,
  },
  enrolledText: {
    color: COLORS.success,
  },
});
