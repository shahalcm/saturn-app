import { Feather, FontAwesome } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect, useCallback } from "react";
import {
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
import { AstrologerCard } from "../components/AstrologerCard";
import { BORDER_RADIUS, COLORS } from "../constants/colors";
import { useUser } from "../context/UserContext";
import { providerAPI, advertisementAPI } from "../services/api";

type RootTabParamList = {
  Home: undefined;
};

type HomeScreenProps = BottomTabScreenProps<RootTabParamList, "Home">;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { religion, profile } = useUser();

  const [providers, setProviders] = useState<any[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const languages = ["All", "Malayalam", "Hindi", "English"];

  const fetchData = async () => {
    try {
      const [providersRes, adsRes] = await Promise.all([
        providerAPI.getAll({ type: 'astrologer' }),
        advertisementAPI.getActive(religion, 'home_banner').catch(() => ({ data: { data: [] } })),
      ]);
      
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
        avatar: p.avatar || '👤',
        meetLink: p.meetLink || '',
      }));

      setProviders(mapped);
      setBanners(adsRes.data.data || []);
    } catch (error) {
      console.error('Home fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [religion]);

  useEffect(() => {
    let list = [...providers];
    if (selectedLanguage !== "All") {
      list = list.filter((p) => p.languages?.includes(selectedLanguage));
    }
    if (searchQuery.trim()) {
      list = list.filter((p) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.specialties?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    setFilteredProviders(list);
  }, [providers, selectedLanguage, searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [religion]);

  const handleChatPress = (astrologer: any) => {
    navigation.navigate("Chat" as any, { astrologer });
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
        <ActivityIndicator size="large" color="#F5A623" />
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
              <Text style={styles.avatarText}>
                {getInitials(profile?.name || 'User')}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F5A623']} />}
      >
        {/* ADVERTISEMENT BANNER */}
        {banners.length > 0 && (
          <TouchableOpacity
            style={{ marginBottom: 16, borderRadius: 16, overflow: 'hidden', height: 100 }}
            onPress={() => advertisementAPI.trackClick(banners[0]._id)}
          >
            <LinearGradient
              colors={['#F5A623', '#E8841A']}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}
            >
              <Text style={{ fontSize: 18, fontWeight: '800', color: 'white', textAlign: 'center' }}>
                {banners[0].title}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

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
            {filteredProviders.length} found
          </Text>
        </View>

        {/* Astrologer Cards */}
        {filteredProviders.length > 0 ? (
          <View style={styles.astrologerList}>
            {filteredProviders.map((astrologer) => (
              <AstrologerCard
                key={astrologer.id}
                astrologer={astrologer}
                onPressChat={() => handleChatPress(astrologer)}
                onPressCall={() => navigation.navigate('AudioCall' as any, {
                  astrologer: astrologer,
                  sessionId: `${astrologer.id}_${Date.now()}`,
                  isProvider: false,
                })}
                onPressVideo={() => navigation.navigate('VideoCall' as any, {
                  astrologer: astrologer,
                  sessionId: `${astrologer.id}_${Date.now()}`,
                  isProvider: false,
                })}
              />
            ))}
          </View>
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
    paddingBottom: 130,
  },
  astrologerList: {
    paddingBottom: 24,
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
