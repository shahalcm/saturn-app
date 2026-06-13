import DateTimePicker from "@react-native-community/datetimepicker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GradientButton } from "../components/GradientButton";
import { OrangeInput } from "../components/OrangeInput";
import { BORDER_RADIUS, COLORS } from "../constants/colors";
import { useUser } from "../context/UserContext";

type AuthStackParamList = {
  CompleteProfile: { role: "seeker" | "astrologer" };
  ReligionSelect: undefined;
};

type CompleteProfileScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  "CompleteProfile"
>;

export const CompleteProfileScreen: React.FC<CompleteProfileScreenProps> = ({
  navigation,
  route,
}) => {
  const { setProfile } = useUser();
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState(new Date());
  const [tob, setTob] = useState(new Date());
  const [pob, setPob] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showTobPicker, setShowTobPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDobChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDobPicker(false);
    }
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const handleTobChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowTobPicker(false);
    }
    if (selectedDate) {
      setTob(selectedDate);
    }
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  };

  const handleSave = () => {
    if (!fullName.trim() || !pob.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    const profileData = {
      name: fullName,
      phone: "", // Will be filled from auth context
      email: "",
      dob: dob.toISOString().split("T")[0],
      tob: `${tob.getHours()}:${String(tob.getMinutes()).padStart(2, "0")}`,
      pob,
      gender,
      languages,
    };

    setTimeout(() => {
      setLoading(false);
      setProfile(profileData);
      navigation.replace("ReligionSelect");
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.primary} />

      <LinearGradient colors={COLORS.gradient} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Complete Profile</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
              <TouchableOpacity style={styles.cameraIcon}>
                <Text style={styles.cameraText}>📷</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <OrangeInput
            placeholder="Full name"
            value={fullName}
            onChangeText={setFullName}
            containerStyle={styles.inputContainer}
          />

          {/* Date of Birth */}
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDobPicker(true)}
          >
            <Text style={styles.datePickerText}>{dob.toDateString()}</Text>
          </TouchableOpacity>
          {showDobPicker && (
            <DateTimePicker
              value={dob}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDobChange}
            />
          )}

          {/* Time of Birth */}
          <Text style={styles.label}>Time of Birth</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowTobPicker(true)}
          >
            <Text style={styles.datePickerText}>
              {tob.getHours()}:{String(tob.getMinutes()).padStart(2, "0")}
            </Text>
          </TouchableOpacity>
          {showTobPicker && (
            <DateTimePicker
              value={tob}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleTobChange}
            />
          )}

          {/* Place of Birth */}
          <Text style={styles.label}>Place of Birth</Text>
          <OrangeInput
            placeholder="City, State"
            value={pob}
            onChangeText={setPob}
            containerStyle={styles.inputContainer}
          />

          {/* Gender */}
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderContainer}>
            {(["male", "female", "other"] as const).map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.genderButton,
                  gender === g && styles.genderButtonActive,
                ]}
                onPress={() => setGender(g)}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === g && styles.genderButtonTextActive,
                  ]}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Language */}
          <Text style={styles.label}>Language Preference</Text>
          <View style={styles.languageContainer}>
            {["Malayalam", "Hindi", "English"].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageButton,
                  languages.includes(lang) && styles.languageButtonActive,
                ]}
                onPress={() => toggleLanguage(lang)}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    languages.includes(lang) && styles.languageButtonTextActive,
                  ]}
                >
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Save Button */}
          <GradientButton
            title="Save & Continue"
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FFF0D6",
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 36,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraText: {
    fontSize: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  datePickerButton: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.input,
    height: 50,
    paddingHorizontal: 18,
    justifyContent: "center",
    marginBottom: 16,
  },
  datePickerText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  genderContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.tab,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    alignItems: "center",
  },
  genderButtonActive: {
    backgroundColor: COLORS.primary,
  },
  genderButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },
  genderButtonTextActive: {
    color: COLORS.white,
  },
  languageContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  languageButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.tab,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  languageButtonActive: {
    backgroundColor: COLORS.primary,
  },
  languageButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },
  languageButtonTextActive: {
    color: COLORS.white,
  },
  saveButton: {
    marginTop: 16,
  },
});
