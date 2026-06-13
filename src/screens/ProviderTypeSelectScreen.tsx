import { Ionicons } from "@expo/vector-icons";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { GradientButton } from "../components/GradientButton";
import { COLORS } from "../constants/colors";
import { useUser } from "../context/UserContext";

type ProviderTypeSelectScreenProps = NativeStackScreenProps<any, "ProviderTypeSelect">;

export const ProviderTypeSelectScreen: React.FC<ProviderTypeSelectScreenProps> = ({
  navigation,
}) => {
  const [selectedType, setSelectedType] = useState<
    "astrologer" | "doctor" | "teacher" | null
  >(null);
  const { setProviderType } = useUser();

  const handleContinue = async () => {
    if (!selectedType) {
      alert("Please select a service type");
      return;
    }
    await setProviderType(selectedType);
    navigation.navigate("ProviderReligionSelect");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <Text style={styles.title}>I am a...</Text>
        <Text style={styles.subtitle}>Select your service type</Text>

        <View style={styles.cardsContainer}>
          {/* Astrologer Card */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedType === "astrologer" && styles.cardActive,
            ]}
            onPress={() => setSelectedType("astrologer")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={COLORS.gradient}
              style={styles.emojiCircle}
            >
              <Text style={styles.emojiText}>🔮</Text>
            </LinearGradient>
            <View style={styles.cardDetails}>
              <Text style={styles.cardTitle}>Astrologer</Text>
              <Text style={styles.cardSubtitle}>
                Provide vedic astrology consultations
              </Text>
            </View>
            {selectedType === "astrologer" && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={COLORS.primary}
              />
            )}
          </TouchableOpacity>

          {/* Doctor Card */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedType === "doctor" && styles.cardActive,
            ]}
            onPress={() => setSelectedType("doctor")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={COLORS.gradient}
              style={styles.emojiCircle}
            >
              <Text style={styles.emojiText}>🩺</Text>
            </LinearGradient>
            <View style={styles.cardDetails}>
              <Text style={styles.cardTitle}>Doctor / Healer</Text>
              <Text style={styles.cardSubtitle}>
                Offer Ayurvedic, wellness or health consultations
              </Text>
            </View>
            {selectedType === "doctor" && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={COLORS.primary}
              />
            )}
          </TouchableOpacity>

          {/* Teacher Card */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedType === "teacher" && styles.cardActive,
            ]}
            onPress={() => setSelectedType("teacher")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={COLORS.gradient}
              style={styles.emojiCircle}
            >
              <Text style={styles.emojiText}>🎓</Text>
            </LinearGradient>
            <View style={styles.cardDetails}>
              <Text style={styles.cardTitle}>Teacher / Guru</Text>
              <Text style={styles.cardSubtitle}>
                Conduct spiritual, religious or educational classes
              </Text>
            </View>
            {selectedType === "teacher" && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={COLORS.primary}
              />
            )}
          </TouchableOpacity>
        </View>

        <GradientButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedType}
          style={styles.continueButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  backButton: {
    marginBottom: 32,
    alignSelf: "flex-start",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    marginBottom: 32,
  },
  cardsContainer: {
    gap: 14,
    marginBottom: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    width: "100%",
    gap: 16,
  },
  cardActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFFBF0",
  },
  emojiCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiText: {
    fontSize: 30,
  },
  cardDetails: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 3,
  },
  continueButton: {
    marginTop: "auto",
    width: "100%",
    height: 54,
  },
});
