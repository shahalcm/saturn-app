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

type ProviderReligionSelectScreenProps = NativeStackScreenProps<
  any,
  "ProviderReligionSelect"
>;

export const ProviderReligionSelectScreen: React.FC<
  ProviderReligionSelectScreenProps
> = ({ navigation }) => {
  const [selectedReligion, setSelectedReligion] = useState<
    "muslim" | "hindu" | "christian" | null
  >(null);
  const { setReligion } = useUser();

  const handleContinue = async () => {
    if (!selectedReligion) {
      alert("Please select a religion");
      return;
    }
    await setReligion(selectedReligion);
    navigation.navigate("ProviderCompleteProfile");
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

        <Text style={styles.title}>Your religious background</Text>
        <Text style={styles.subtitle}>
          This helps match you with the right seekers
        </Text>

        <View style={styles.cardsContainer}>
          {/* Muslim Card */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedReligion === "muslim" && styles.cardActive,
            ]}
            onPress={() => setSelectedReligion("muslim")}
            activeOpacity={0.8}
          >
            <Text style={styles.cardIcon}>🕌</Text>
            <View style={styles.cardDetails}>
              <Text style={styles.cardLabel}>Muslim</Text>
              <Text style={styles.cardDescription}>
                Islamic prayers, astrology & education
              </Text>
            </View>
            {selectedReligion === "muslim" && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={COLORS.primary}
              />
            )}
          </TouchableOpacity>

          {/* Hindu Card */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedReligion === "hindu" && styles.cardActive,
            ]}
            onPress={() => setSelectedReligion("hindu")}
            activeOpacity={0.8}
          >
            <Text style={styles.cardIcon}>🕉️</Text>
            <View style={styles.cardDetails}>
              <Text style={styles.cardLabel}>Hindu</Text>
              <Text style={styles.cardDescription}>
                Hindu prayers, astrology & education
              </Text>
            </View>
            {selectedReligion === "hindu" && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={COLORS.primary}
              />
            )}
          </TouchableOpacity>

          {/* Christian Card */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedReligion === "christian" && styles.cardActive,
            ]}
            onPress={() => setSelectedReligion("christian")}
            activeOpacity={0.8}
          >
            <Text style={styles.cardIcon}>✝️</Text>
            <View style={styles.cardDetails}>
              <Text style={styles.cardLabel}>Christian</Text>
              <Text style={styles.cardDescription}>
                Christian prayers & education
              </Text>
            </View>
            {selectedReligion === "christian" && (
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
          disabled={!selectedReligion}
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
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  cardsContainer: {
    gap: 14,
    marginBottom: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    padding: 20,
    backgroundColor: COLORS.white,
    width: "100%",
    gap: 16,
  },
  cardActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFFBF0",
  },
  cardIcon: {
    fontSize: 36,
  },
  cardDetails: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  cardDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
  },
  continueButton: {
    marginTop: "auto",
    width: "100%",
    height: 54,
  },
});
