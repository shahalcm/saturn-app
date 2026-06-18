import { Feather } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect, useCallback } from "react";
import {
    FlatList,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import {
    useSafeAreaInsets
} from "react-native-safe-area-context";
import { DoctorCard } from "../components/DoctorCard";
import { BORDER_RADIUS, COLORS } from "../constants/colors";
import { providerAPI } from "../services/api";

type RootTabParamList = {
  Doctors: undefined;
};

type DoctorsScreenProps = BottomTabScreenProps<RootTabParamList, "Doctors">;

export const DoctorsScreen: React.FC<DoctorsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [providers, setProviders] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const specialties = ["All", "Psychology", "General", "Ayurveda", "Nutrition"];

  const fetchData = async () => {
    try {
      const providersRes = await providerAPI.getAll({ type: 'doctor' });
      const backendProviders = providersRes.data.data.providers || [];
      const mapped = backendProviders.map((p: any) => ({
        id: p._id,
        name: p.name,
        rating: p.rating || 0,
        experience: p.experience || 0,
        pricePerMin: p.pricePerMin || 0,
        isOnline: p.isOnline || false,
        languages: p.languages || [],
        specialties: p.specialties || [],
        avatar: p.avatar || '🩺',
        meetLink: p.meetLink || '',
      }));
      setProviders(mapped);
    } catch (error) {
      console.error('Doctors fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  useEffect(() => {
    let list = [...providers];
    if (selectedSpecialty !== "All") {
      list = list.filter((doc) => doc.specialties?.includes(selectedSpecialty));
    }
    if (searchQuery.trim()) {
      list = list.filter((doc) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialties?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    setFilteredDoctors(list);
  }, [providers, selectedSpecialty, searchQuery]);

  const handleChatPress = (doctor: any) => {
    navigation.navigate("Chat" as any, { astrologer: doctor });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.lightGray }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <LinearGradient
        colors={COLORS.gradient}
        style={[
          styles.header,
          { paddingTop: insets.top > 0 ? insets.top + 12 : 24 },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("Home" as any);
              }
            }}
          >
            <Feather name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Doctors</Text>
          </View>
          <View style={{ width: 40 }} />
          {/* Spacer to balance the back button */}
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather
            name="search"
            size={20}
            color={COLORS.textSecondary}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors, specialties..."
            placeholderTextColor={COLORS.textHint}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Specialty Filter Tabs */}
        <View style={{ height: 45, marginBottom: 16 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.specialtyTabs}
          >
            {specialties.map((spec) => (
              <TouchableOpacity
                key={spec}
                style={[
                  styles.tab,
                  selectedSpecialty === spec && styles.tabActive,
                ]}
                onPress={() => setSelectedSpecialty(spec)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedSpecialty === spec && styles.tabTextActive,
                  ]}
                >
                  {spec}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DoctorCard
              doctor={item}
              onPressChat={() => handleChatPress(item)}
              onPressCall={() => navigation.navigate('AudioCall' as any, {
                astrologer: item,
                sessionId: `${item.id}_${Date.now()}`,
                isProvider: false,
              })}
              onPressVideo={() => navigation.navigate('VideoCall' as any, {
                astrologer: item,
                sessionId: `${item.id}_${Date.now()}`,
                isProvider: false,
              })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather
                name="search"
                size={48}
                color={COLORS.textSecondary}
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.emptyStateText}>No doctors found</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
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
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBar: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.input,
    paddingHorizontal: 16,
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  specialtyTabs: {
    flexGrow: 0,
  },
  tab: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.tab,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    height: 38,
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingBottom: 90,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
});
