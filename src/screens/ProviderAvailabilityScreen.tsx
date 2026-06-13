import { Feather, Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { ClassicAlertModal } from "../components/ClassicAlertModal";

type ProviderAvailabilityScreenProps = NativeStackScreenProps<any, "Availability">;

interface DaySchedule {
  day: string;
  label: string;
  isAvailable: boolean;
  start: string;
  end: string;
}

const INITIAL_SCHEDULE: DaySchedule[] = [
  { day: "mon", label: "Monday", isAvailable: true, start: "09:00 AM", end: "05:00 PM" },
  { day: "tue", label: "Tuesday", isAvailable: true, start: "09:00 AM", end: "05:00 PM" },
  { day: "wed", label: "Wednesday", isAvailable: true, start: "09:00 AM", end: "05:00 PM" },
  { day: "thu", label: "Thursday", isAvailable: true, start: "09:00 AM", end: "05:00 PM" },
  { day: "fri", label: "Friday", isAvailable: true, start: "09:00 AM", end: "05:00 PM" },
  { day: "sat", label: "Saturday", isAvailable: false, start: "10:00 AM", end: "02:00 PM" },
  { day: "sun", label: "Sunday", isAvailable: false, start: "10:00 AM", end: "02:00 PM" },
];

export const ProviderAvailabilityScreen: React.FC<ProviderAvailabilityScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const [schedule, setSchedule] = useState<DaySchedule[]>(INITIAL_SCHEDULE);
  const [selectedDuration, setSelectedDuration] = useState<number>(30); // in minutes
  const [alertVisible, setAlertVisible] = useState(false);

  const toggleDay = (day: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  const handleSave = () => {
    setAlertVisible(true);
  };

  const handleCloseAlert = () => {
    setAlertVisible(false);
    navigation.goBack();
  };

  // Generate slots for visual preview
  const generatePreviewSlots = () => {
    const slots = [];
    const activeDay = schedule.find((d) => d.isAvailable);
    if (!activeDay) return ["No active work days selected"];

    let currentHour = 9;
    let currentMin = 0;
    const endHour = 13; // Just showing a brief preview window e.g. 9 AM to 1 PM

    while (currentHour < endHour) {
      const timeStr = `${currentHour.toString().padStart(2, "0")}:${currentMin
        .toString()
        .padStart(2, "0")} AM`;
      slots.push(timeStr);

      currentMin += selectedDuration;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }
    return slots;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Banner */}
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
          <Text style={styles.headerTitle}>Availability Settings</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Slot Duration Chips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Slot Duration</Text>
          <Text style={styles.sectionSubtitle}>
            Select the standard session duration for bookings:
          </Text>
          <View style={styles.chipsRow}>
            {[15, 30, 45, 60].map((mins) => (
              <TouchableOpacity
                key={mins}
                style={[
                  styles.durationChip,
                  selectedDuration === mins && styles.durationChipActive,
                ]}
                onPress={() => setSelectedDuration(mins)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.durationChipText,
                    selectedDuration === mins && styles.durationChipTextActive,
                  ]}
                >
                  {mins} mins
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Weekly Work Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Schedule</Text>
          <Text style={styles.sectionSubtitle}>
            Toggle active days and configure work timings:
          </Text>

          {schedule.map((item) => (
            <View key={item.day} style={styles.dayRow}>
              <View style={styles.dayInfoCol}>
                <TouchableOpacity
                  style={[
                    styles.dayCheckbox,
                    item.isAvailable && styles.dayCheckboxActive,
                  ]}
                  onPress={() => toggleDay(item.day)}
                  activeOpacity={0.7}
                >
                  {item.isAvailable && (
                    <Ionicons name="checkmark" size={14} color={COLORS.white} />
                  )}
                </TouchableOpacity>
                <Text style={styles.dayLabel}>{item.label}</Text>
              </View>

              {item.isAvailable ? (
                <View style={styles.timeInputsRow}>
                  <TouchableOpacity style={styles.timeButton} activeOpacity={0.7}>
                    <Text style={styles.timeButtonText}>{item.start}</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeSeparator}>to</Text>
                  <TouchableOpacity style={styles.timeButton} activeOpacity={0.7}>
                    <Text style={styles.timeButtonText}>{item.end}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.unavailableText}>Unavailable</Text>
              )}
            </View>
          ))}
        </View>

        {/* Live Slot Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Slots Preview (Morning)</Text>
          <Text style={styles.sectionSubtitle}>
            Simulated booking slots generated based on your configs:
          </Text>
          <View style={styles.slotsGrid}>
            {generatePreviewSlots().map((slot, idx) => (
              <View key={idx} style={styles.previewSlotCard}>
                <Text style={styles.previewSlotText}>{slot}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Save Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }]}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
          <LinearGradient
            colors={COLORS.gradient}
            style={styles.saveBtnGradient}
          >
            <Text style={styles.saveBtnText}>Save Schedule</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ClassicAlertModal
        visible={alertVisible}
        type="success"
        title="Availability Saved"
        message="Your availability schedule and slot configurations have been updated."
        onClose={handleCloseAlert}
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
    textAlign: "center",
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
  },
  durationChip: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  durationChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFFBF0",
  },
  durationChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  durationChipTextActive: {
    color: COLORS.primary,
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F2F2F2",
  },
  dayInfoCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dayCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#BDBDBD",
    alignItems: "center",
    justifyContent: "center",
  },
  dayCheckboxActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  timeInputsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeButton: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  timeButtonText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  timeSeparator: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  unavailableText: {
    fontSize: 12,
    color: COLORS.textHint,
    fontWeight: "600",
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  previewSlotCard: {
    backgroundColor: "#FFF8ED",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  previewSlotText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#E0E0E0",
  },
  saveBtn: {
    width: "100%",
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  saveBtnGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
