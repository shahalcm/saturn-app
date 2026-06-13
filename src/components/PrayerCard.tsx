import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS } from '../constants/colors';

interface PrayerCardProps {
  prayer: {
    id: string;
    title: string;
    time: string;
    isLive: boolean;
    viewers: number;
  };
}

export const PrayerCard: React.FC<PrayerCardProps> = ({ prayer }) => {
  const formatViewers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Text style={styles.prayerIcon}>🙏</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{prayer.title}</Text>
        <Text style={styles.time}>{prayer.time}</Text>
      </View>
      <View style={styles.rightSection}>
        {prayer.isLive && (
          <>
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.viewers}>{formatViewers(prayer.viewers)} watching</Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  prayerIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  time: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  liveBadge: {
    backgroundColor: '#FF4444',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  viewers: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
