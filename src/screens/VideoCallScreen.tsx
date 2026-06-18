import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useAgora from '../hooks/useAgora';
import { useAuth } from '../context/AuthContext';

let RtcSurfaceView: any;
let VideoSourceType: any;
let isAgoraSupported = false;

try {
  const Agora = require('react-native-agora');
  RtcSurfaceView = Agora.RtcSurfaceView;
  VideoSourceType = Agora.VideoSourceType;
  isAgoraSupported = true;
} catch (e) {
  console.log('Agora native module is not available in Expo Go. Stubbing views.');
  RtcSurfaceView = (props: any) => (
    <View style={props.style || { flex: 1, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name="videocam" size={32} color="#F5A623" />
      <Text style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', fontSize: 11, marginTop: 4, textAlign: 'center' }}>Expo Go Simulator</Text>
    </View>
  );
  VideoSourceType = {
    VideoSourceCamera: 0,
    VideoSourceRemote: 1,
  };
}

const { width, height } = Dimensions.get('window');

export default function VideoCallScreen({ route, navigation }: any) {
  const { astrologer, sessionId, isProvider } = route.params || {};
  const { token: authToken } = useAuth();
  const insets = useSafeAreaInsets();

  const uid = isProvider ? 2 : 1;
  const channelName = `saturn_video_${sessionId || astrologer?.id}`;

  const {
    isJoined,
    remoteUid,
    isMuted,
    isCameraOff,
    isSpeakerOn,
    isConnecting,
    callDuration,
    error,
    toggleMute,
    toggleCamera,
    toggleSpeaker,
    switchCamera,
    leaveChannel,
    formatDuration,
  } = useAgora({ channelName, uid, callType: 'video', token: authToken || '' });

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

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="videocam-off" size={60} color="#FF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* REMOTE VIDEO — Full screen background */}
      {remoteUid !== null ? (
        <RtcSurfaceView
          style={styles.remoteVideo}
          canvas={{
            uid: remoteUid,
            sourceType: VideoSourceType.VideoSourceRemote,
          }}
        />
      ) : (
        <View style={styles.waitingContainer}>
          {/* Avatar placeholder while waiting */}
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {astrologer?.name?.charAt(0)?.toUpperCase() || 'A'}
            </Text>
          </View>
          <Text style={styles.providerName}>{astrologer?.name || 'Practitioner'}</Text>
          <Text style={styles.waitingText}>
            {isConnecting ? 'Connecting...' : 'Waiting for other person to join...'}
          </Text>
          {isConnecting && (
            <View style={styles.connectingDots}>
              <Text style={styles.dotsText}>●  ●  ●</Text>
            </View>
          )}
        </View>
      )}

      {/* LOCAL VIDEO — Small picture-in-picture top right */}
      {isJoined && !isCameraOff && (
        <View style={[styles.localVideoContainer, { top: insets.top + 16 }]}>
          <RtcSurfaceView
            style={styles.localVideo}
            canvas={{
              uid,
              sourceType: VideoSourceType.VideoSourceCamera,
            }}
          />
          <TouchableOpacity
            style={styles.switchCameraBtn}
            onPress={switchCamera}
          >
            <Ionicons name="camera-reverse-outline" size={18} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* LOCAL VIDEO OFF placeholder */}
      {isJoined && isCameraOff && (
        <View style={[styles.localVideoContainer, styles.cameraOffBox, { top: insets.top + 16 }]}>
          <Ionicons name="videocam-off" size={24} color="rgba(255,255,255,0.6)" />
          <Text style={styles.cameraOffText}>Camera Off</Text>
        </View>
      )}

      {/* TOP BAR — Name + Duration */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={handleEndCall} style={styles.backButton}>
          <Ionicons name="chevron-down" size={28} color="white" />
        </TouchableOpacity>
        <View style={styles.callInfoCenter}>
          <Text style={styles.calleeName} numberOfLines={1}>
            {astrologer?.name || 'Video Call'}
          </Text>
          <View style={styles.durationRow}>
            {isConnecting ? (
              <Text style={styles.durationText}>Connecting...</Text>
            ) : (
              <>
                <View style={styles.liveDot} />
                <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
              </>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.speakerButton} onPress={toggleSpeaker}>
          <Ionicons
            name={isSpeakerOn ? 'volume-high' : 'volume-mute'}
            size={22}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {/* BOTTOM CONTROLS */}
      <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 24 }]}>

        {/* Mute button */}
        <View style={styles.controlItem}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={toggleMute}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={26}
              color="white"
            />
          </TouchableOpacity>
          <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
        </View>

        {/* End call button */}
        <View style={styles.controlItem}>
          <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
            <Ionicons name="call" size={30} color="white" />
          </TouchableOpacity>
          <Text style={styles.controlLabel}>End</Text>
        </View>

        {/* Camera toggle */}
        <View style={styles.controlItem}>
          <TouchableOpacity
            style={[styles.controlButton, isCameraOff && styles.controlButtonActive]}
            onPress={toggleCamera}
          >
            <Ionicons
              name={isCameraOff ? 'videocam-off' : 'videocam'}
              size={26}
              color="white"
            />
          </TouchableOpacity>
          <Text style={styles.controlLabel}>{isCameraOff ? 'Show' : 'Hide'}</Text>
        </View>

        {/* Switch camera */}
        <View style={styles.controlItem}>
          <TouchableOpacity style={styles.controlButton} onPress={switchCamera}>
            <Ionicons name="camera-reverse" size={26} color="white" />
          </TouchableOpacity>
          <Text style={styles.controlLabel}>Flip</Text>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  remoteVideo: {
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  waitingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D1B2A',
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarInitials: {
    fontSize: 40,
    fontWeight: '800',
    color: 'white',
  },
  providerName: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  waitingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  connectingDots: {
    marginTop: 16,
  },
  dotsText: {
    color: '#F5A623',
    fontSize: 18,
    letterSpacing: 4,
  },
  localVideoContainer: {
    position: 'absolute',
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 10,
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  cameraOffBox: {
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOffText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 4,
  },
  switchCameraBtn: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callInfoCenter: {
    flex: 1,
    alignItems: 'center',
  },
  calleeName: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#4CAF50',
  },
  durationText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  speakerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    paddingTop: 24,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 5,
  },
  controlItem: {
    alignItems: 'center',
    gap: 6,
  },
  controlButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#F5A623',
  },
  endCallButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '135deg' }],
  },
  controlLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  errorButton: {
    marginTop: 24,
    backgroundColor: '#F5A623',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  errorButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
});
