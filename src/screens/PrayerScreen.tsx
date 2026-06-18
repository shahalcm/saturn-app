import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useMemo, useEffect } from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { PrayerCard } from '../components/PrayerCard';
import { BORDER_RADIUS, COLORS } from '../constants/colors';
import { useUser } from '../context/UserContext';
import { prayerAPI } from '../services/api';

type RootTabParamList = {
  Prayer: undefined;
};

type PrayerScreenProps = BottomTabScreenProps<RootTabParamList, 'Prayer'>;

type FilterStatus = 'All' | 'Live' | 'Upcoming';

export const PrayerScreen: React.FC<PrayerScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { religion } = useUser();
  const [prayers, setPrayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('All');

  const fetchPrayers = async () => {
    try {
      const res = await prayerAPI.getAll(religion);
      const mapped = (res.data.data || []).map((item: any) => ({
        id: item._id,
        title: item.title,
        time: `${item.scheduledTime} (${item.recurrence || 'one-time'})`,
        isLive: item.status === 'live',
        viewers: item.viewers || 0,
      }));
      setPrayers(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayers();
    const interval = setInterval(fetchPrayers, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [religion]);

  const filteredPrayers = useMemo(() => {
    return prayers.filter((prayer) => {
      // 1. Search Query Match
      const searchMatch = prayer.title.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Filter Status Match
      let statusMatch = true;
      if (selectedStatus === 'Live') {
        statusMatch = prayer.isLive;
      } else if (selectedStatus === 'Upcoming') {
        statusMatch = !prayer.isLive;
      }

      return searchMatch && statusMatch;
    });
  }, [prayers, searchQuery, selectedStatus]);

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
            <Text style={styles.headerTitle}>Live Prayers</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search prayers by title..."
            placeholderTextColor={COLORS.textHint}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <Feather name="x" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Status Tabs */}
        <View style={{ height: 45, marginBottom: 16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
            {(['All', 'Live', 'Upcoming'] as FilterStatus[]).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.tab,
                  selectedStatus === status && styles.tabActive,
                ]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedStatus === status && styles.tabTextActive,
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Prayers List */}
        <FlatList
          data={filteredPrayers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PrayerCard prayer={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="search" size={48} color={COLORS.textSecondary} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyStateText}>No prayers found</Text>
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
