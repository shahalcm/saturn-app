import { Feather, Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { useUser } from "../context/UserContext";

type ProviderPatientsStudentsScreenProps = NativeStackScreenProps<
  any,
  "Clients"
>;

interface ClientItem {
  id: string;
  name: string;
  avatarText: string;
  infoLabel: string;
  infoValue: string;
  sessionType?: string;
  lastSessionDate: string;
}

const MOCK_DATA_MAP = {
  astrologer: [
    {
      id: "1",
      name: "Rahul Mehta",
      avatarText: "RM",
      infoLabel: "Specialty",
      infoValue: "Kundli Matching",
      sessionType: "Chat",
      lastSessionDate: "12 Jun",
    },
    {
      id: "2",
      name: "Priya Sharma",
      avatarText: "PS",
      infoLabel: "Specialty",
      infoValue: "Career Advice",
      sessionType: "Call",
      lastSessionDate: "10 Jun",
    },
    {
      id: "3",
      name: "Arjun Kumar",
      avatarText: "AK",
      infoLabel: "Specialty",
      infoValue: "Gemstone Advice",
      sessionType: "Video",
      lastSessionDate: "09 Jun",
    },
  ],
  doctor: [
    {
      id: "1",
      name: "Amit Patel",
      avatarText: "AP",
      infoLabel: "Diagnosis",
      infoValue: "Hypertension Control",
      lastSessionDate: "11 Jun",
    },
    {
      id: "2",
      name: "Neha Roy",
      avatarText: "NR",
      infoLabel: "Diagnosis",
      infoValue: "Seasonal Allergy",
      lastSessionDate: "08 Jun",
    },
    {
      id: "3",
      name: "Rajesh Koothrappali",
      avatarText: "RK",
      infoLabel: "Diagnosis",
      infoValue: "Migraine Mgmt",
      lastSessionDate: "05 Jun",
    },
  ],
  teacher: [
    {
      id: "1",
      name: "Sameer Khan",
      avatarText: "SK",
      infoLabel: "Course",
      infoValue: "Quran Tajweed Basics",
      lastSessionDate: "06 Jun",
    },
    {
      id: "2",
      name: "Pooja Dixit",
      avatarText: "PD",
      infoLabel: "Course",
      infoValue: "Gita Sloka Chanting",
      lastSessionDate: "04 Jun",
    },
    {
      id: "3",
      name: "Sarah Thomas",
      avatarText: "ST",
      infoLabel: "Course",
      infoValue: "Bible Study",
      lastSessionDate: "02 Jun",
    },
  ],
};

export const ProviderPatientsStudentsScreen: React.FC<
  ProviderPatientsStudentsScreenProps
> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { providerType } = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  const getRoleLabels = () => {
    switch (providerType) {
      case "doctor":
        return { title: "My Patients", searchPlaceholder: "Search patient name..." };
      case "teacher":
        return { title: "My Students", searchPlaceholder: "Search student name..." };
      default:
        return { title: "My Clients", searchPlaceholder: "Search client name..." };
    }
  };

  const labels = getRoleLabels();
  const initialData = MOCK_DATA_MAP[providerType || "astrologer"] || [];

  const filteredData = initialData.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMessage = (item: ClientItem) => {
    navigation.navigate("Chat", {
      roomId: item.id,
      name: item.name,
    });
  };

  const renderItem = ({ item }: { item: ClientItem }) => {
    return (
      <View style={styles.card}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{item.avatarText}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.subText}>
            {item.infoLabel}: <Text style={styles.boldText}>{item.infoValue}</Text>
          </Text>
          <Text style={styles.dateText}>Last Active: {item.lastSessionDate}</Text>
        </View>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => handleMessage(item)}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    );
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
          <Text style={styles.headerTitle}>{labels.title}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <Feather name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={labels.searchPlaceholder}
            placeholderTextColor={COLORS.textHint}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Clients List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No matches found</Text>
          </View>
        }
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
  searchContainer: {
    padding: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    elevation: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textPrimary,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFF0D6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primary,
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  subText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  boldText: {
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textHint,
    marginTop: 4,
  },
  messageButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFBF0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textHint,
    marginTop: 10,
  },
});
