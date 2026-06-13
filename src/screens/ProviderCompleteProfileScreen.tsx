import { Ionicons } from "@expo/vector-icons";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "../components/GradientButton";
import { OrangeInput } from "../components/OrangeInput";
import { BORDER_RADIUS, COLORS } from "../constants/colors";
import { useUser } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

type ProviderCompleteProfileScreenProps = NativeStackScreenProps<
  any,
  "ProviderCompleteProfile"
>;

export const ProviderCompleteProfileScreen: React.FC<
  ProviderCompleteProfileScreenProps
> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { providerType, religion, setProfile, setProviderPending } = useUser();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [languages, setLanguages] = useState<string[]>(["English"]);

  // Astrologer fields
  const [astroExp, setAstroExp] = useState("");
  const [astroPrice, setAstroPrice] = useState("");
  const [astroAbout, setAstroAbout] = useState("");
  const [astroSpecialties, setAstroSpecialties] = useState<string[]>([]);

  // Doctor fields
  const [docQual, setDocQual] = useState("");
  const [docExp, setDocExp] = useState("");
  const [docPrice, setDocPrice] = useState("");
  const [docHospital, setDocHospital] = useState("");
  const [docAbout, setDocAbout] = useState("");
  const [docSpecialties, setDocSpecialties] = useState<string[]>([]);

  // Teacher fields
  const [teachQual, setTeachQual] = useState("");
  const [teachExp, setTeachExp] = useState("");
  const [teachPrice, setTeachPrice] = useState("");
  const [teachMaxStudents, setTeachMaxStudents] = useState("");
  const [teachAbout, setTeachAbout] = useState("");
  const [teachSubjects, setTeachSubjects] = useState<string[]>([]);

  // Document upload mock
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleUploadDoc = () => {
    // Mock file upload
    setUploadedDocName("certificate_proof.pdf");
  };

  // Specialty arrays
  const astroSpecialtyList = [
    "Career",
    "Marriage",
    "Health",
    "Finance",
    "Love",
    "Vastu",
    "Numerology",
    "Spirituality",
  ];

  const docSpecialtyList = [
    "Ayurveda",
    "Yoga",
    "Nutrition",
    "Mental Health",
    "Homeopathy",
    "Naturopathy",
  ];

  // Subjects based on religion selection
  const muslimSubjects = [
    "Quran",
    "Arabic",
    "Islamic Studies",
    "Fiqh",
    "Islamic History",
  ];
  const hinduSubjects = [
    "Vedic Astrology",
    "Sanskrit",
    "Yoga",
    "Meditation",
    "Hindu Philosophy",
  ];
  const christianSubjects = [
    "Bible Study",
    "Theology",
    "Gospel Music",
    "Church History",
    "Youth Ministry",
  ];

  const getTeacherSubjectsList = () => {
    if (religion === "muslim") return muslimSubjects;
    if (religion === "hindu") return hinduSubjects;
    return christianSubjects;
  };

  const toggleAstroSpecialty = (spec: string) => {
    setAstroSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const toggleDocSpecialty = (spec: string) => {
    setDocSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const toggleTeachSubject = (subj: string) => {
    setTeachSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const handleSubmit = () => {
    if (!fullName.trim() || !phone.trim() || !email.trim() || !location.trim()) {
      alert("Please fill in all general required fields");
      return;
    }

    // Validation check per type
    if (providerType === "astrologer") {
      if (!astroExp.trim() || !astroPrice.trim() || !astroAbout.trim()) {
        alert("Please fill in all Astrologer fields");
        return;
      }
    } else if (providerType === "doctor") {
      if (!docQual.trim() || !docExp.trim() || !docPrice.trim() || !docHospital.trim() || !docAbout.trim()) {
        alert("Please fill in all Doctor fields");
        return;
      }
    } else if (providerType === "teacher") {
      if (!teachQual.trim() || !teachExp.trim() || !teachPrice.trim() || !teachMaxStudents.trim() || !teachAbout.trim()) {
        alert("Please fill in all Teacher fields");
        return;
      }
    }

    if (!uploadedDocName) {
      alert("Please upload your certificate or degree proof to proceed");
      return;
    }

    setLoading(true);

    const profileData = {
      name: fullName,
      phone,
      email,
      location,
      gender,
      languages,
      dob: "",
      tob: "",
      pob: location,
      avatar: "👨‍⚕️",
      providerType,
      religion,
      experience: providerType === "astrologer" ? astroExp : providerType === "doctor" ? docExp : teachExp,
      price: providerType === "astrologer" ? astroPrice : providerType === "doctor" ? docPrice : teachPrice,
      about: providerType === "astrologer" ? astroAbout : providerType === "doctor" ? docAbout : teachAbout,
      specialties: providerType === "astrologer" ? astroSpecialties : providerType === "doctor" ? docSpecialties : teachSubjects,
      qualification: providerType === "doctor" ? docQual : providerType === "teacher" ? teachQual : "",
      hospitalName: providerType === "doctor" ? docHospital : "",
      maxStudents: providerType === "teacher" ? teachMaxStudents : "",
      uploadedDoc: uploadedDocName,
    };

    const submitProfile = async () => {
      try {
        const response = await client.post("/providers/register", profileData);
        if (response.data.success) {
          const { token, provider } = response.data.data;
          setProfile(profileData as any);
          await setProviderPending(true);
          await login(token, provider.id, "provider");
          navigation.navigate("PendingVerification");
        } else {
          alert(response.data.message || "Registration failed");
        }
      } catch (apiError: any) {
        console.warn("Backend provider registration failed, using mock fallback:", apiError);
        setProfile(profileData as any);
        await setProviderPending(true);
        const mockToken = `prov_token_${Date.now()}`;
        const mockUserId = `prov_${Math.random().toString(36).substr(2, 9)}`;
        await login(mockToken, mockUserId, "provider");
        navigation.navigate("PendingVerification");
      } finally {
        setLoading(false);
      }
    };

    submitProfile();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" />

      {/* Header bar */}
      <LinearGradient colors={COLORS.gradient} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Your Profile</Text>
          <View style={{ width: 24 }} />
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
          {/* Avatar Section */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {providerType === "astrologer"
                  ? "🔮"
                  : providerType === "doctor"
                  ? "🩺"
                  : "🎓"}
              </Text>
              <TouchableOpacity
                style={styles.cameraIcon}
                activeOpacity={0.8}
                onPress={() => alert("Photo upload coming soon")}
              >
                <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Common fields */}
          <Text style={styles.sectionTitle}>General Details</Text>

          <Text style={styles.label}>Full Name</Text>
          <OrangeInput
            placeholder="e.g. Dr. John Doe"
            value={fullName}
            onChangeText={setFullName}
            containerStyle={styles.inputContainer}
          />

          <Text style={styles.label}>Phone Number</Text>
          <OrangeInput
            placeholder="e.g. +91 9876543210"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            containerStyle={styles.inputContainer}
          />

          <Text style={styles.label}>Email Address</Text>
          <OrangeInput
            placeholder="e.g. johndoe@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            containerStyle={styles.inputContainer}
          />

          <Text style={styles.label}>City, State</Text>
          <OrangeInput
            placeholder="e.g. Kochi, Kerala"
            value={location}
            onChangeText={setLocation}
            containerStyle={styles.inputContainer}
          />

          {/* Gender Select */}
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

          {/* Languages Prefer */}
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

          <View style={styles.divider} />

          {/* ASTROLOGER SPECIFIC FIELDS */}
          {providerType === "astrologer" && (
            <View>
              <Text style={styles.sectionTitle}>Astrologer Credentials</Text>

              <Text style={styles.label}>Years of Experience</Text>
              <OrangeInput
                placeholder="e.g. 5"
                keyboardType="numeric"
                value={astroExp}
                onChangeText={setAstroExp}
                containerStyle={styles.inputContainer}
              />

              <Text style={styles.label}>Select Specialties</Text>
              <View style={styles.chipsRow}>
                {astroSpecialtyList.map((spec) => (
                  <TouchableOpacity
                    key={spec}
                    style={[
                      styles.chip,
                      astroSpecialties.includes(spec) && styles.chipActive,
                    ]}
                    onPress={() => toggleAstroSpecialty(spec)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        astroSpecialties.includes(spec) && styles.chipTextActive,
                      ]}
                    >
                      {spec}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Consultation Price (₹/min)</Text>
              <OrangeInput
                placeholder="e.g. 30"
                keyboardType="numeric"
                value={astroPrice}
                onChangeText={setAstroPrice}
                containerStyle={styles.inputContainer}
              />

              <Text style={styles.label}>About yourself</Text>
              <OrangeInput
                placeholder="Describe your lineage, details, practices..."
                multiline
                numberOfLines={4}
                value={astroAbout}
                onChangeText={setAstroAbout}
                style={{ height: 100, textAlignVertical: "top", paddingTop: 12 }}
                containerStyle={styles.inputContainer}
              />
            </View>
          )}

          {/* DOCTOR SPECIFIC FIELDS */}
          {providerType === "doctor" && (
            <View>
              <Text style={styles.sectionTitle}>Doctor / Healer Credentials</Text>

              <Text style={styles.label}>Qualification (e.g. BAMS, MBBS)</Text>
              <OrangeInput
                placeholder="e.g. BAMS, MD Ayurveda"
                value={docQual}
                onChangeText={setDocQual}
                containerStyle={styles.inputContainer}
              />

              <Text style={styles.label}>Years of Experience</Text>
              <OrangeInput
                placeholder="e.g. 8"
                keyboardType="numeric"
                value={docExp}
                onChangeText={setDocExp}
                containerStyle={styles.inputContainer}
              />

              <Text style={styles.label}>Specialties / Focus Areas</Text>
              <View style={styles.chipsRow}>
                {docSpecialtyList.map((spec) => (
                  <TouchableOpacity
                    key={spec}
                    style={[
                      styles.chip,
                      docSpecialties.includes(spec) && styles.chipActive,
                    ]}
                    onPress={() => toggleDocSpecialty(spec)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        docSpecialties.includes(spec) && styles.chipTextActive,
                      ]}
                    >
                      {spec}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Consultation Price (₹)</Text>
              <OrangeInput
                placeholder="e.g. 500"
                keyboardType="numeric"
                value={docPrice}
                onChangeText={setDocPrice}
                containerStyle={styles.inputContainer}
              />

              <Text style={styles.label}>Hospital / Clinic Name</Text>
              <OrangeInput
                placeholder="e.g. Arya Vaidya Sala"
                value={docHospital}
                onChangeText={setDocHospital}
                containerStyle={styles.inputContainer}
              />

              <Text style={styles.label}>About yourself / practice</Text>
              <OrangeInput
                placeholder="Describe your medical background and wellness approach..."
                multiline
                numberOfLines={4}
                value={docAbout}
                onChangeText={setDocAbout}
                style={{ height: 100, textAlignVertical: "top", paddingTop: 12 }}
                containerStyle={styles.inputContainer}
              />
            </View>
          )}

          {/* TEACHER SPECIFIC FIELDS */}
          {providerType === "teacher" && (
            <View>
              <Text style={styles.sectionTitle}>Teacher / Guru Credentials</Text>

              <Text style={styles.label}>Qualification / Degree</Text>
              <OrangeInput
                placeholder="e.g. MA Sanskrit, Islamic Studies Degree"
                value={teachQual}
                onChangeText={setTeachQual}
                containerStyle={styles.inputContainer}
              />

              <Text style={styles.label}>Years of Teaching Experience</Text>
              <OrangeInput
                placeholder="e.g. 6"
                keyboardType="numeric"
                value={teachExp}
                onChangeText={setTeachExp}
                containerStyle={styles.inputContainer}
              />

              <Text style={styles.label}>Subject / Course Options</Text>
              <View style={styles.chipsRow}>
                {getTeacherSubjectsList().map((subj) => (
                  <TouchableOpacity
                    key={subj}
                    style={[
                      styles.chip,
                      teachSubjects.includes(subj) && styles.chipActive,
                    ]}
                    onPress={() => toggleTeachSubject(subj)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        teachSubjects.includes(subj) && styles.chipTextActive,
                      ]}
                    >
                      {subj}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Class Price (₹/month or Free)</Text>
              <OrangeInput
                placeholder="e.g. 1500 or Free"
                value={teachPrice}
                onChangeText={setTeachPrice}
                containerStyle={styles.inputContainer}
              />

              <Text style={styles.label}>Max students per batch</Text>
              <OrangeInput
                placeholder="e.g. 20"
                keyboardType="numeric"
                value={teachMaxStudents}
                onChangeText={setTeachMaxStudents}
                containerStyle={styles.inputContainer}
              />

              <Text style={styles.label}>About yourself / teaching style</Text>
              <OrangeInput
                placeholder="Describe your pedagogy and educational lineage..."
                multiline
                numberOfLines={4}
                value={teachAbout}
                onChangeText={setTeachAbout}
                style={{ height: 100, textAlignVertical: "top", paddingTop: 12 }}
                containerStyle={styles.inputContainer}
              />
            </View>
          )}

          {/* Document Upload */}
          <View style={{ marginTop: 8, marginBottom: 20 }}>
            <Text style={styles.label}>
              {providerType === "astrologer"
                ? "Upload Certificate / ID Proof"
                : providerType === "doctor"
                ? "Upload Medical License / Degree Certificate"
                : "Upload Teaching Certificate / Degree"}
            </Text>
            <TouchableOpacity
              style={[
                styles.uploadButton,
                uploadedDocName ? styles.uploadButtonActive : null,
              ]}
              onPress={handleUploadDoc}
              activeOpacity={0.7}
            >
              <Ionicons
                name={
                  uploadedDocName ? "checkmark-circle" : "cloud-upload-outline"
                }
                size={28}
                color={COLORS.primary}
              />
              <Text style={styles.uploadText}>
                {uploadedDocName
                  ? `Uploaded: ${uploadedDocName}`
                  : "Tap to upload (JPG, PDF)"}
              </Text>
            </TouchableOpacity>
          </View>

          <GradientButton
            title="Submit for Verification"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FFFBF0",
    borderWidth: 2.5,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarText: {
    fontSize: 40,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
    marginTop: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  genderContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  genderButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  genderButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFFBF0",
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
  },
  genderButtonTextActive: {
    color: COLORS.primary,
  },
  languageContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  languageButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  languageButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFFBF0",
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
  },
  languageButtonTextActive: {
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 12,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
  },
  chipActive: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  uploadButton: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderStyle: "dashed",
  },
  uploadButtonActive: {
    borderStyle: "solid",
    backgroundColor: "#FFFBF0",
  },
  uploadText: {
    fontSize: 13,
    color: "#666666",
    marginTop: 6,
    textAlign: "center",
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 32,
    width: "100%",
    height: 54,
  },
});
