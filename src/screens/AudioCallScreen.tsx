import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useAgora from '../hooks/useAgora';
import { useAuth } from '../context/AuthContext';

export default function AudioCallScreen({ route, navigation }: any) {
  const { astrologer, sessionId, isProvider } = route.params || {};
  const { token: authToken } = useAuth();
  const insets = useSafeAreaInsets();

  const uid = isProvider ? 2 : 1;
  const channelName = `saturn_audio_${sessionId || astrologer?.id}`;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const {
    isJoined,
    remoteUid,
    isMuted,
    isSpeakerOn,
    isConnecting,
    callDuration,
    error,
    toggleMute,
    toggleSpeaker,
    leaveChannel,
    formatDuration,
  } = useAgora({ channelName, uid, callType: 'audio', token: authToken || '' });

  const handleEndCall = async () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this call?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: async () => {
            await leaveChannel();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getCallStatus = () => {
    if (error) return 'Call failed';
    if (isConnecting) return 'Connecting...';
    if (!isJoined) return 'Joining...';
    if (remoteUid === null) return 'Waiting for other person...';
    return formatDuration(callDuration);
  };

  return (
    <LinearGradient
      colors={['#0D1B2A', '#1A3A5C', '#0D1B2A']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />

      {/* TOP — Back + call type label */}
      <View style={[styles.topRow, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={handleEndCall} style={styles.backBtn}>
          <Ionicons name="chevron-down" size={28} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <View style={styles.callTypeBadge}>
          <Ionicons name="call" size={13} color="#F5A623" />
          <Text style={styles.callTypeText}>Voice Call</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* CENTER — Avatar with pulse animation */}
      <View style={styles.centerSection}>

        {/* Outer pulse ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            { transform: [{ scale: pulseAnim }] },
          ]}
        />

        {/* Avatar circle */}
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>
            {astrologer?.name?.charAt(0)?.toUpperCase() || 'A'}
          </Text>
        </View>

        {/* Name */}
        <Text style={styles.calleeName}>{astrologer?.name || 'Practitioner'}</Text>

        {/* Type + Religion */}
        <Text style={styles.calleeSubtitle}>
          {astrologer?.providerType === 'astrologer' ? '🔮 Astrologer' :
           astrologer?.providerType === 'doctor' ? '🩺 Doctor' : '🎓 Teacher'}
        </Text>

        {/* Status / Duration */}
        <View style={styles.statusRow}>
          {!isConnecting && isJoined && remoteUid !== null && (
            <View style={styles.activeDot} />
          )}
          <Text style={[
            styles.statusText,
            !isConnecting && isJoined && remoteUid !== null && styles.statusTextActive
          ]}>
            {getCallStatus()}
          </Text>
        </View>

        {/* Price warning */}
        <View style={styles.priceBadge}>
          <Ionicons name="wallet-outline" size={13} color="#F5A623" />
          <Text style={styles.priceText}>
            ₹{astrologer?.pricePerMin || 25}/min will be deducted
          </Text>
        </View>
      </View>

      {/* BOTTOM CONTROLS */}
      <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 32 }]}>

        {/* Speaker */}
        <View style={styles.controlItem}>
          <TouchableOpacity
            style={[styles.controlBtn, isSpeakerOn && styles.controlBtnActive]}
            onPress={toggleSpeaker}
          >
            <Ionicons
              name={isSpeakerOn ? 'volume-high' : 'volume-mute'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <Text style={styles.controlLabel}>
            {isSpeakerOn ? 'Speaker' : 'Earpiece'}
          </Text>
        </View>

        {/* End Call */}
        <View style={styles.controlItem}>
          <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
            <Ionicons
              name="call"
              size={32}
              color="white"
              style={{ transform: [{ rotate: '135deg' }] }}
            />
          </TouchableOpacity>
          <Text style={[styles.controlLabel, { color: '#FF3B30' }]}>End Call</Text>
        </View>

        {/* Mute */}
        <View style={styles.controlItem}>
          <TouchableOpacity
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
            onPress={toggleMute}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
        </View>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(245,166,35,0.25)',
    backgroundColor: 'rgba(245,166,35,0.08)',
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 8,
  },
  avatarInitials: {
    fontSize: 48,
    fontWeight: '800',
    color: 'white',
  },
  calleeName: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  calleeSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  statusTextActive: {
    color: '#4CAF50',
    fontWeight: '700',
    fontSize: 20,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginTop: 12,
  },
  priceText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    paddingTop: 24,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  controlItem: {
    alignItems: 'center',
    gap: 8,
  },
  controlBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnActive: {
    backgroundColor: '#F5A623',
  },
  endCallBtn: {
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
  controlLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
});
