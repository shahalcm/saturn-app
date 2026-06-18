import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function IncomingCallScreen({ route, navigation }: any) {
  const { caller, channelName, callType, sessionId } = route.params || {};
  const insets = useSafeAreaInsets();

  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Vibrate on incoming call
    Vibration.vibrate([500, 1000, 500, 1000], true);

    // Double pulse animation
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim1, {
            toValue: 1.4,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim1, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(pulseAnim2, {
            toValue: 1.4,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim2, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulse.start();

    // Auto reject after 30 seconds
    const autoReject = setTimeout(() => {
      handleReject();
    }, 30000);

    return () => {
      Vibration.cancel();
      pulse.stop();
      clearTimeout(autoReject);
    };
  }, []);

  const handleAccept = () => {
    Vibration.cancel();
    navigation.replace(
      callType === 'video' ? 'VideoCall' : 'AudioCall',
      {
        astrologer: caller,
        sessionId,
        isProvider: true,
      }
    );
  };

  const handleReject = () => {
    Vibration.cancel();
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={['#0D1B2A', '#1A3A5C', '#0D1B2A']}
      style={styles.container}
    >
      {/* Call type indicator */}
      <View style={[styles.topSection, { paddingTop: insets.top + 24 }]}>
        <View style={styles.callTypeBadge}>
          <Ionicons
            name={callType === 'video' ? 'videocam' : 'call'}
            size={14}
            color="#F5A623"
          />
          <Text style={styles.callTypeText}>
            Incoming {callType === 'video' ? 'Video' : 'Voice'} Call
          </Text>
        </View>
        <Text style={styles.saturnLabel}>Saturn</Text>
      </View>

      {/* Center — Avatar */}
      <View style={styles.centerSection}>
        <Animated.View
          style={[styles.pulseRing1, { transform: [{ scale: pulseAnim1 }] }]}
        />
        <Animated.View
          style={[styles.pulseRing2, { transform: [{ scale: pulseAnim2 }] }]}
        />
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>
            {caller?.name?.charAt(0)?.toUpperCase() || 'S'}
          </Text>
        </View>

        <Text style={styles.callerName}>{caller?.name || 'Seeker'}</Text>
        <Text style={styles.callerSubtitle}>
          wants to {callType === 'video' ? 'video call' : 'voice call'} you
        </Text>
      </View>

      {/* Bottom — Accept / Reject */}
      <View style={[styles.actionRow, { paddingBottom: insets.bottom + 48 }]}>

        {/* Reject */}
        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
            <Ionicons
              name="call"
              size={32}
              color="white"
              style={{ transform: [{ rotate: '135deg' }] }}
            />
          </TouchableOpacity>
          <Text style={styles.actionLabel}>Decline</Text>
        </View>

        {/* Accept */}
        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
            <Ionicons name="call" size={32} color="white" />
          </TouchableOpacity>
          <Text style={styles.actionLabel}>Accept</Text>
        </View>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    alignItems: 'center',
    gap: 8,
  },
  callTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.3)',
  },
  callTypeText: {
    fontSize: 13,
    color: '#F5A623',
    fontWeight: '600',
  },
  saturnLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    fontWeight: '600',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1.5,
    borderColor: 'rgba(245,166,35,0.2)',
    backgroundColor: 'rgba(245,166,35,0.05)',
  },
  pulseRing2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: 'rgba(245,166,35,0.3)',
    backgroundColor: 'rgba(245,166,35,0.08)',
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 20,
  },
  avatarInitials: {
    fontSize: 44,
    fontWeight: '800',
    color: 'white',
  },
  callerName: {
    fontSize: 26,
    fontWeight: '800',
    color: 'white',
  },
  callerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    paddingHorizontal: 40,
    paddingTop: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  actionItem: {
    alignItems: 'center',
    gap: 10,
  },
  rejectBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  acceptBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  actionLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
});
