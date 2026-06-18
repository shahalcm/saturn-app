import { Feather } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState, useEffect, useCallback } from "react";
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
import { EducationCard } from "../components/EducationCard";
import { BORDER_RADIUS, COLORS } from "../constants/colors";
import { useUser } from "../context/UserContext";
import { educationAPI } from "../services/api";

type RootTabParamList = {
  Education: undefined;
};

type EducationScreenProps = BottomTabScreenProps<RootTabParamList, "Education">;

type FilterLevel = "All" | "Beginner" | "Intermediate" | "Advanced";

export const EducationScreen: React.FC<EducationScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { religion } = useUser();
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<FilterLevel>("All");

  const fetchCourses = async () => {
    try {
      const [res, enrolledRes] = await Promise.all([
        educationAPI.getAll(religion),
        educationAPI.getEnrolled().catch(() => ({ data: { data: [] } })),
      ]);
      const mapped = (res.data.data || []).map((item: any) => ({
        id: item._id,
        title: item.title,
        instructor: item.providerName || 'Instructor',
        level: item.level || 'Beginner',
        students: item.enrolledStudents || 0,
        price: item.price === 0 ? 'Free' : `₹${item.price}`,
        meetLink: item.meetLink || '',
      }));
      setCourses(mapped);
      setEnrolledCourseIds(enrolledRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [religion]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCourses();
  }, [religion]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // 1. Search Query Match
      const searchMatch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Filter Level Match
      let levelMatch = true;
      if (selectedLevel !== "All") {
        levelMatch =
          course.level.toLowerCase() === selectedLevel.toLowerCase() ||
          (selectedLevel === "Beginner" &&
            course.level.toLowerCase().includes("beginner")) ||
          (selectedLevel === "Intermediate" &&
            course.level.toLowerCase().includes("intermediate")) ||
          (selectedLevel === "Advanced" &&
            course.level.toLowerCase().includes("advanced"));
      }

      return searchMatch && levelMatch;
    });
  }, [courses, searchQuery, selectedLevel]);

  const handleEnroll = async (courseId: string) => {
    try {
      await educationAPI.enroll(courseId);
      alert('Enrolled successfully!');
      fetchCourses();
    } catch (e) {
      alert('Failed to enroll or already enrolled.');
    }
  };

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
      <ActivityIndicator size="large" color="#F5A623" />
    </View>
  );

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
            <Text style={styles.headerTitle}>Education</Text>
          </View>
          <View style={{ width: 40 }} />
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
            placeholder="Search courses or instructors..."
            placeholderTextColor={COLORS.textHint}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={{ padding: 4 }}
            >
              <Feather name="x" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Level Filter Tabs */}
        <View style={{ height: 45, marginBottom: 16 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterTabs}
          >
            {(
              ["All", "Beginner", "Intermediate", "Advanced"] as FilterLevel[]
            ).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.tab,
                  selectedLevel === level && styles.tabActive,
                ]}
                onPress={() => setSelectedLevel(level)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedLevel === level && styles.tabTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Courses List */}
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EducationCard
              education={item}
              onPress={() => handleEnroll(item.id)}
              isEnrolled={enrolledCourseIds.includes(item.id)}
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
              <Text style={styles.emptyStateText}>No courses found</Text>
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
  filterTabs: {
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
