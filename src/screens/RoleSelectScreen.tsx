import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
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

type RoleSelectScreenProps = NativeStackScreenProps<any, "RoleSelect">;

export const RoleSelectScreen: React.FC<RoleSelectScreenProps> = ({
  navigation,
}) => {
  const [selectedRole, setSelectedRole] = useState<"seeker" | "provider" | null>(
    null
  );
  const { setUserRole } = useUser();

  const handleContinue = async () => {
    if (!selectedRole) {
      alert("Please select a role");
      return;
    }
    await setUserRole(selectedRole);
    if (selectedRole === "seeker") {
      navigation.navigate("CompleteProfile", { role: "seeker" });
    } else {
      navigation.navigate("ProviderTypeSelect");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>I am a...</Text>
        <Text style={styles.subtitle}>Select your role to get started</Text>

        <View style={styles.cardsContainer}>
          {/* Seeker Card */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedRole === "seeker" && styles.cardActive,
            ]}
            onPress={() => setSelectedRole("seeker")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="person-circle-outline"
              size={70}
              color={COLORS.primary}
            />
            <Text style={styles.cardTitle}>Seeker</Text>
            <Text style={styles.cardSubtitle}>
              Get astrology, health & spiritual guidance
            </Text>
          </TouchableOpacity>

          {/* Service Provider Card */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedRole === "provider" && styles.cardActive,
            ]}
            onPress={() => setSelectedRole("provider")}
            activeOpacity={0.8}
          >
            <Ionicons name="briefcase-outline" size={70} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Service Provider</Text>
            <Text style={styles.cardSubtitle}>
              Offer your expertise as Astrologer, Doctor or Teacher
            </Text>
          </TouchableOpacity>
        </View>

        <GradientButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedRole}
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
    paddingTop: 60,
    paddingBottom: 40,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    padding: 28,
    alignItems: "center",
    backgroundColor: COLORS.white,
    width: "100%",
  },
  cardActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFFBF0",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1A1A",
    marginTop: 14,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
  continueButton: {
    marginTop: "auto",
    width: "100%",
    height: 54,
  },
});
