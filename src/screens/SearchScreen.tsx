import { Feather } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AstrologerCard } from "../components/AstrologerCard";
import { DoctorCard } from "../components/DoctorCard";
import { EducationCard } from "../components/EducationCard";
import { PrayerCard } from "../components/PrayerCard";
import { BORDER_RADIUS, COLORS } from "../constants/colors";
import {
    EDUCATION_DATA,
    PRAYERS_DATA,
} from "../constants/mockData";
import { useUser } from "../context/UserContext";
import { providerAPI, educationAPI } from "../services/api";

type AuthStackParamList = {
  Search: undefined;
  Chat: { astrologer: any };
};

type SearchScreenProps = NativeStackScreenProps<AuthStackParamList, "Search">;

type TabCategory = "All" | "Astrologers" | "Doctors" | "Prayers" | "Courses";

const SUGGESTIONS = [
  "Vedic",
  "Psychology",
  "Ayurveda",
  "Career",
  "Marriage",
  "Hanuman Chalisa",
  "Quran Recitation",
  "Bible Study",
];

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { religion } = useUser();
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<TabCategory>("All");
  const [providers, setProviders] = useState<any[]>([]);
  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  const activeReligion = religion || "hindu";
  const prayers = PRAYERS_DATA[activeReligion] || [];

  useEffect(() => {
    // Auto focus the search input on mount
    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    // Fetch providers from backend for dynamic search
    const fetchProviders = async () => {
      try {
        const res = await providerAPI.getAll();
        setProviders(res.data.data.providers || []);
      } catch (err) {
        console.error("Search fetch error:", err);
      }
    };
    // Fetch courses from backend for dynamic search
    const fetchCourses = async () => {
      try {
        const [res, enrolledRes] = await Promise.all([
          educationAPI.getAll(),
          educationAPI.getEnrolled().catch(() => ({ data: { data: [] } })),
        ]);
        setDbCourses(res.data.data || []);
        setEnrolledCourseIds(enrolledRes.data.data || []);
      } catch (err) {
        console.error("Search courses fetch error:", err);
      }
    };
    fetchProviders();
    fetchCourses();
  }, []);

  const handleEnroll = async (courseId: string) => {
    try {
      await educationAPI.enroll(courseId);
      alert('Enrolled successfully!');
      // Refresh courses
      const [res, enrolledRes] = await Promise.all([
        educationAPI.getAll(),
        educationAPI.getEnrolled().catch(() => ({ data: { data: [] } })),
      ]);
      setDbCourses(res.data.data || []);
      setEnrolledCourseIds(enrolledRes.data.data || []);
    } catch (e) {
      alert('Failed to enroll or already enrolled.');
    }
  };

  const handleSearchSuggestion = (term: string) => {
    setQuery(term);
  };

  const clearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  // Filter Data
  const getFilteredResults = () => {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    const mappedProviders = providers.map((p: any) => ({
      id: p._id,
      name: p.name,
      rating: p.rating || 0,
      experience: p.experience || 0,
      pricePerMin: p.pricePerMin || 0,
      isOnline: p.isOnline || false,
      languages: p.languages || [],
      specialties: p.specialties || [],
      avatar: p.avatar || (p.providerType === 'doctor' ? '🩺' : '🔮'),
      providerType: p.providerType,
      meetLink: p.meetLink || '',
    }));

    const filteredAstrologers = mappedProviders.filter(
      (astro) =>
        astro.providerType === 'astrologer' &&
        (astro.name.toLowerCase().includes(term) ||
         astro.specialties.some((s: string) => s.toLowerCase().includes(term)) ||
         astro.languages.some((l: string) => l.toLowerCase().includes(term)))
    ).map((item) => ({ ...item, type: "astrologer" as const }));

    const filteredDoctors = mappedProviders.filter(
      (doc) =>
        doc.providerType === 'doctor' &&
        (doc.name.toLowerCase().includes(term) ||
         doc.specialties.some((s: string) => s.toLowerCase().includes(term)) ||
         doc.languages.some((l: string) => l.toLowerCase().includes(term)))
    ).map((item) => ({ ...item, type: "doctor" as const }));

    const filteredPrayers = prayers
      .filter((p) => p.title.toLowerCase().includes(term))
      .map((item) => ({ ...item, type: "prayer" as const }));

    const filteredCourses = dbCourses
      .filter(
        (c) =>
          (c.title || "").toLowerCase().includes(term) ||
          (c.providerName || "").toLowerCase().includes(term) ||
          (c.level || "").toLowerCase().includes(term),
      )
      .map((item) => ({
        id: item._id,
        title: item.title,
        instructor: item.providerName || 'Instructor',
        level: item.level || 'Beginner',
        students: item.enrolledStudents || 0,
        price: item.price === 0 ? "Free" : `₹${item.price}`,
        meetLink: item.meetLink || '',
        type: "course" as const,
      }));

    // Combine and Filter based on active tab
    if (selectedTab === "Astrologers") return filteredAstrologers;
    if (selectedTab === "Doctors") return filteredDoctors;
    if (selectedTab === "Prayers") return filteredPrayers;
    if (selectedTab === "Courses") return filteredCourses;

    return [
      ...filteredAstrologers,
      ...filteredDoctors,
      ...filteredPrayers,
      ...filteredCourses,
    ];
  };

  const results = getFilteredResults();

  const renderItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case "astrologer":
        return (
          <AstrologerCard
            astrologer={item}
            onPressChat={() =>
              navigation.navigate("Chat", { astrologer: item })
            }
            onPressCall={() => alert("Call feature coming soon")}
            onPressVideo={() => alert("Video feature coming soon")}
          />
        );
      case "doctor":
        return (
          <DoctorCard
            doctor={item}
            onPressChat={() =>
              navigation.navigate("Chat", { astrologer: item })
            }
            onPressCall={() => alert("Call feature coming soon")}
            onPressVideo={() => alert("Video feature coming soon")}
          />
        );
      case "prayer":
        return <PrayerCard prayer={item} />;
      case "course":
        return (
          <EducationCard
            education={item}
            onPress={() => handleEnroll(item.id)}
            isEnrolled={enrolledCourseIds.includes(item.id)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Dynamic Gradient Header with Search Input */}
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
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("Home" as any);
              }
            }}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Feather
              name="search"
              size={18}
              color={COLORS.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Search services, professionals..."
              placeholderTextColor={COLORS.textHint}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
            />
            {query.length > 0 ? (
              <TouchableOpacity onPress={clearQuery} style={styles.clearButton}>
                <Feather name="x" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      {query.trim().length > 0 ? (
        <View style={styles.tabsContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={
              [
                "All",
                "Astrologers",
                "Doctors",
                "Prayers",
                "Courses",
              ] as TabCategory[]
            }
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.tab, selectedTab === item && styles.tabActive]}
                onPress={() => setSelectedTab(item)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === item && styles.tabTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.tabsListContent}
          />
        </View>
      ) : null}

      {/* Body */}
      <View style={styles.body}>
        {query.trim().length === 0 ? (
          // Suggestions/Initial View
          <View style={styles.initialContainer}>
            <Text style={styles.suggestionTitle}>Popular Searches</Text>
            <View style={styles.chipsContainer}>
              {SUGGESTIONS.map((term) => (
                <TouchableOpacity
                  key={term}
                  style={styles.chip}
                  onPress={() => handleSearchSuggestion(term)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.placeholderContainer}>
              <View style={styles.illustrationCircle}>
                <Feather name="search" size={48} color={COLORS.primary} />
              </View>
              <Text style={styles.placeholderTitle}>Find What You Need</Text>
              <Text style={styles.placeholderSubtitle}>
                Search for certified astrologers, counselors, live prayers, and
                spiritual development courses.
              </Text>
            </View>
          </View>
        ) : results.length > 0 ? (
          // Results list
          <FlatList
            data={results}
            keyExtractor={(item) => `${item.type}_${item.id}`}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          // No results view
          <View style={styles.placeholderContainer}>
            <View style={styles.illustrationCircle}>
              <Feather name="info" size={48} color={COLORS.textSecondary} />
            </View>
            <Text style={styles.placeholderTitle}>No Results Found</Text>
            <Text style={styles.placeholderSubtitle}>
              We couldn't find anything matching "{query}". Try checking the
              spelling or use another keyword.
            </Text>
          </View>
        )}
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.input,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  tabsContainer: {
    height: 48,
    backgroundColor: COLORS.white,
    elevation: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tabsListContent: {
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.tab,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
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
  body: {
    flex: 1,
    paddingHorizontal: 16,
  },
  initialContainer: {
    flex: 1,
    paddingTop: 20,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  illustrationCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF0D6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  placeholderSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
});
