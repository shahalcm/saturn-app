import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, ActivityIndicator,
  TouchableOpacity, RefreshControl, StyleSheet, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';
import { prayerAPI } from '../services/api';
import { COLORS } from '../constants/colors';

interface PrayerScreenProps {
  navigation: any;
}

export const PrayerScreen: React.FC<PrayerScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { religion } = useUser();
  const [prayers, setPrayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const religionEmoji: { [key: string]: string } = {
    muslim: '🕌',
    hindu: '🕉️',
    christian: '✝️',
  };

  const fetchPrayers = async () => {
    try {
      const res = await prayerAPI.getAll(religion);
      const data = res.data.data || [];
      // Sort: live first, then scheduled
      const sorted = data.sort((a: any, b: any) => {
        if (a.status === 'live') return -1;
        if (b.status === 'live') return 1;
        return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      });
      setPrayers(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrayers();
    const interval = setInterval(fetchPrayers, 30000);
    return () => clearInterval(interval);
  }, [religion]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short',
    });
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#F5A623" />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E8841A" />
      <LinearGradient
        colors={['#F5A623', '#E8841A']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {religion ? religionEmoji[religion] : '🙏'} Live Prayer
          </Text>
          <Text style={styles.headerSubtitle}>
            {prayers.filter(p => p.status === 'live').length} live now
          </Text>
        </View>
      </LinearGradient>

      <FlatList
        data={prayers}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); fetchPrayers(); }} 
            colors={['#F5A623']} 
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 40 }}>{religion ? religionEmoji[religion] : '🙏'}</Text>
            <Text style={styles.emptyText}>
              No prayers available
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('LivePrayer', { prayer: item })}
            style={styles.card}
          >
            {/* Live indicator */}
            {item.status === 'live' && (
              <LinearGradient
                colors={['#FF4444', '#CC0000']}
                style={styles.liveBadge}
              >
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </LinearGradient>
            )}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              {/* YouTube thumbnail/Icon placeholder */}
              <View style={[
                styles.thumbnailContainer, 
                { backgroundColor: item.status === 'live' ? '#FFEBEB' : '#F5F5F5' }
              ]}>
                {item.youtubeVideoId ? (
                  <Ionicons name="logo-youtube" size={32} color="#FF0000" />
                ) : (
                  <Text style={{ fontSize: 30 }}>
                    {religion === 'muslim' ? '🕌' : religion === 'hindu' ? '🕉️' : religion === 'christian' ? '✝️' : '🙏'}
                  </Text>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.cardText}>
                  👤 {item.host}
                </Text>
                <Text style={styles.cardText}>
                  📅 {formatDate(item.scheduledDate)} • {item.scheduledTime}
                </Text>

                {item.status === 'live' && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                    <View style={styles.infoRow}>
                      <Ionicons name="eye-outline" size={13} color="#666" />
                      <Text style={styles.infoText}>
                        {(item.viewers || 0).toLocaleString('en-IN')} watching
                      </Text>
                    </View>
                    {item.charityEnabled && (
                      <View style={styles.infoRow}>
                        <Text style={{ fontSize: 12 }}>💚</Text>
                        <Text style={[styles.infoText, { color: '#4CAF50', fontWeight: '600' }]}>
                          Charity Active
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {item.status === 'scheduled' && (
                  <View style={[styles.infoRow, { marginTop: 6 }]}>
                    <Ionicons name="time-outline" size={13} color="#F5A623" />
                    <Text style={[styles.infoText, { color: '#F5A623', fontWeight: '600' }]}>
                      Scheduled
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {item.status === 'live' && (
              <LinearGradient
                colors={['#F5A623', '#E8841A']}
                style={styles.joinButton}
              >
                <Ionicons name="play-circle" size={18} color="white" />
                <Text style={styles.joinButtonText}>
                  Join Live Prayer
                </Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default PrayerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#999',
    marginTop: 12,
    fontSize: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  liveBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'white',
  },
  thumbnailContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cardText: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  joinButton: {
    marginTop: 12,
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
});
