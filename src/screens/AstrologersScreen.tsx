import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { COLORS, BORDER_RADIUS, SIZES } from '../constants/colors';
import { AstrologerCard } from '../components/AstrologerCard';
import { providerAPI } from '../services/api';

type RootTabParamList = {
  Astrologers: undefined;
};

type AstrologersScreenProps = BottomTabScreenProps<RootTabParamList, 'Astrologers'>;

export const AstrologersScreen: React.FC<AstrologersScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [providers, setProviders] = useState<any[]>([]);
  const [filteredAstrologers, setFilteredAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const languages = ['All', 'Malayalam', 'Hindi', 'English'];

  const fetchData = async () => {
    try {
      const providersRes = await providerAPI.getAll({ type: 'astrologer' });
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
        avatar: p.avatar || '🔮',
        meetLink: p.meetLink || '',
      }));
      setProviders(mapped);
    } catch (error) {
      console.error('Astrologers fetch error:', error);
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
    if (selectedLanguage !== 'All') {
      list = list.filter((astro) => astro.languages?.includes(selectedLanguage));
    }
    if (searchQuery.trim()) {
      list = list.filter((astro) =>
        astro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        astro.specialties.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    setFilteredAstrologers(list);
  }, [providers, selectedLanguage, searchQuery]);

  const handleChatPress = (astrologer: any) => {
    navigation.navigate('Chat' as any, { astrologer });
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
        style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 12 : 24 }]}
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
            <Text style={styles.headerTitle}>Astrologers</Text>
          </View>
          <View style={{ width: 40 }} /> {/* Spacer to balance the back button */}
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search astrologers, specialties..."
            placeholderTextColor={COLORS.textHint}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Language Filter Tabs */}
        <View style={{ height: 45, marginBottom: 16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.languageTabs}>
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
        </View>

        <FlatList
          data={filteredAstrologers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AstrologerCard
              astrologer={item}
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
              <Feather name="search" size={48} color={COLORS.textSecondary} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyStateText}>No astrologers found</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  languageTabs: {
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
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingBottom: 90,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
