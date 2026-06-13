import { Feather, FontAwesome } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    useSafeAreaInsets
} from "react-native-safe-area-context";
import { AstrologerCard } from "../components/AstrologerCard";
import { BORDER_RADIUS, COLORS } from "../constants/colors";
import { ASTROLOGERS } from "../constants/mockData";
import { useUser } from "../context/UserContext";

type RootTabParamList = {
  Home: undefined;
};

type HomeScreenProps = BottomTabScreenProps<RootTabParamList, "Home">;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { religion } = useUser();

  const languages = ["All", "Malayalam", "Hindi", "English"];

  const filteredAstrologers = ASTROLOGERS.filter((astro) => {
    let languageMatch = true;
    if (selectedLanguage !== "All") {
      languageMatch = astro.languages.includes(selectedLanguage);
    }

    const searchMatch =
      astro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      astro.specialties.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    return languageMatch && searchMatch;
  });

  const handleChatPress = (astrologer: any) => {
    navigation.navigate("Chat" as any, { astrologer });
  };

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
            style={styles.menuButton}
            onPress={() => (navigation as any).openDrawer()}
          >
            <Feather name="menu" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Saturn</Text>
            <Text style={styles.headerSubtitle}>ASTROLOGY & BEYOND</Text>
          </View>
          <View style={styles.headerRightSection}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate("Search" as any)}
            >
              <Feather name="search" size={20} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate("Notifications" as any)}
            >
              <Feather name="bell" size={20} color={COLORS.white} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>AK</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScrollView}
          contentContainerStyle={styles.categoriesContainer}
        >
          {/* Live Prayer Card */}
          <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => navigation.navigate("Prayer" as any)}
          >
            <LinearGradient
              colors={["#FF9F43", "#FFB13B"]}
              style={styles.categoryCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="radio" size={32} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.categoryLabel}>Live Prayer</Text>
          </TouchableOpacity>

          {/* Astrologer Card */}
          <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => navigation.navigate("Astrologers" as any)}
          >
            <LinearGradient
              colors={["#FF9F43", "#FFB13B"]}
              style={styles.categoryCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <FontAwesome name="user" size={32} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.categoryLabel}>Astrologer</Text>
          </TouchableOpacity>

          {/* Doctors Card */}
          <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => navigation.navigate("Doctors" as any)}
          >
            <LinearGradient
              colors={["#FF9F43", "#FFB13B"]}
              style={styles.categoryCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="heart" size={32} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.categoryLabel}>Doctors</Text>
          </TouchableOpacity>

          {/* Education Card */}
          <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => navigation.navigate("Education" as any)}
          >
            <LinearGradient
              colors={["#FF9F43", "#FFB13B"]}
              style={styles.categoryCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="book" size={32} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.categoryLabel}>Education</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Language Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.languageTabs}
        >
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.tab,
                selectedLanguage === lang && styles.tabActive,
              ]}
              onPress={() => setSelectedLanguage(lang)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedLanguage === lang && styles.tabTextActive,
                ]}
              >
                {lang}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
            placeholder="Search astrologers, specialties..."
            placeholderTextColor={COLORS.textHint}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Top Astrologers Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Astrologers</Text>
          <Text style={styles.sectionCount}>
            {filteredAstrologers.length} found
          </Text>
        </View>

        {/* Astrologer Cards */}
        {filteredAstrologers.length > 0 ? (
          filteredAstrologers.map((astrologer) => (
            <AstrologerCard
              key={astrologer.id}
              astrologer={astrologer}
              onPressChat={() => handleChatPress(astrologer)}
              onPressCall={() => alert("Call feature coming soon")}
              onPressVideo={() => alert("Video feature coming soon")}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Feather
              name="search"
              size={48}
              color={COLORS.textSecondary}
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.emptyStateText}>No astrologers found</Text>
          </View>
        )}
      </ScrollView>
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
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: COLORS.white,
  },
  headerTitleContainer: {
    alignItems: "flex-start",
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1.5,
  },
  headerRightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  headerIcon: {
    fontSize: 20,
    color: COLORS.white,
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4444",
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  body: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  categoriesScrollView: {
    marginHorizontal: -16,
    marginBottom: 24,
    flexGrow: 0,
  },
  categoriesContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 16,
  },
  categoryItem: {
    alignItems: "center",
  },
  categoryCard: {
    width: 85,
    height: 85,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF9F43",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    backgroundColor: "#FF9F43",
  },
  categoryLabel: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
  },
  languageTabs: {
    marginBottom: 16,
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
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
    color: COLORS.textSecondary,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  sectionCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
});
