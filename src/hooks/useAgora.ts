import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import axios from 'axios';
import { API_URL, AGORA_APP_ID } from '../constants/api';

let createAgoraRtcEngine: any;
let ChannelProfileType: any;
let ClientRoleType: any;
let AudioScenarioType: any;
let isAgoraSupported = false;

try {
  const Agora = require('react-native-agora');
  createAgoraRtcEngine = Agora.createAgoraRtcEngine;
  ChannelProfileType = Agora.ChannelProfileType;
  ClientRoleType = Agora.ClientRoleType;
  AudioScenarioType = Agora.AudioScenarioType;
  isAgoraSupported = true;
} catch (e) {
  console.log('Agora RTC Engine not available in this environment. Simulating calling hook.');
}

interface UseAgoraProps {
  channelName: string;
  uid: number;
  callType?: 'video' | 'audio';
  token: string;
}

export const useAgora = ({ channelName, uid, callType = 'video', token: authToken }: UseAgoraProps) => {
  const engineRef = useRef<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<any>(null);
  
  const simJoinTimeoutRef = useRef<any>(null);
  const simRemoteTimeoutRef = useRef<any>(null);

  useEffect(() => {
    initAgora();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isJoined) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isJoined]);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }
  };

  const getAgoraToken = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/agora/token`,
        { channelName, uid, role: 'publisher' },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      return response.data.data.token;
    } catch (err) {
      console.error('Token fetch error:', err);
      throw new Error('Failed to get Agora token');
    }
  };

  const initAgora = async () => {
    if (!isAgoraSupported) {
      console.log('Simulating call connection in Expo Go...');
      setIsConnecting(true);
      simJoinTimeoutRef.current = setTimeout(() => {
        setIsJoined(true);
        setIsConnecting(false);
        simRemoteTimeoutRef.current = setTimeout(() => {
          setRemoteUid(888);
        }, 2000);
      }, 1500);
      return;
    }

    try {
      setIsConnecting(true);
      await requestPermissions();

      const token = await getAgoraToken();

      engineRef.current = createAgoraRtcEngine();
      const engine = engineRef.current;

      engine.initialize({
        appId: AGORA_APP_ID,
        audioScenario: AudioScenarioType.AudioScenarioDefault,
      });

      if (callType === 'video') {
        engine.enableVideo();
        engine.startPreview();
      } else {
        engine.disableVideo();
        engine.enableAudio();
      }

      engine.setEnableSpeakerphone(true);

      // Event listeners
      engine.registerEventHandler({
        onJoinChannelSuccess: (connection: any, elapsed: any) => {
          console.log('Joined channel successfully:', connection.channelId);
          setIsJoined(true);
          setIsConnecting(false);
        },
        onUserJoined: (connection: any, rUid: any, elapsed: any) => {
          console.log('Remote user joined:', rUid);
          setRemoteUid(rUid);
          setIsConnecting(false);
        },
        onUserOffline: (connection: any, rUid: any, reason: any) => {
          console.log('Remote user left offline:', rUid);
          setRemoteUid(null);
        },
        onError: (err: any, msg: any) => {
          console.error('Agora engine error code:', err, msg);
          setError(`Call error: ${msg}`);
        },
        onConnectionStateChanged: (connection: any, state: any, reason: any) => {
          console.log('Connection state status:', state);
          if (state === 1) {
            setIsConnecting(true);
          }
        }
      });

      // Join channel
      engine.joinChannel(token, channelName, uid, {
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        publishMicrophoneTrack: true,
        publishCameraTrack: callType === 'video',
        autoSubscribeAudio: true,
        autoSubscribeVideo: callType === 'video',
      });
    } catch (err: any) {
      console.error('Init error:', err);
      setError(err.message);
      setIsConnecting(false);
    }
  };

  const cleanup = useCallback(async () => {
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      if (simJoinTimeoutRef.current) clearTimeout(simJoinTimeoutRef.current);
      if (simRemoteTimeoutRef.current) clearTimeout(simRemoteTimeoutRef.current);
      
      if (isAgoraSupported && engineRef.current) {
        engineRef.current.stopPreview();
        engineRef.current.leaveChannel();
        engineRef.current.unregisterEventHandler({});
        engineRef.current.release();
        engineRef.current = null;
      }
    } catch (err) {
      console.error('Cleanup error:', err);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (isAgoraSupported && engineRef.current) {
      engineRef.current.muteLocalAudioStream(!isMuted);
    }
    setIsMuted(prev => !prev);
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    if (isAgoraSupported && engineRef.current) {
      engineRef.current.muteLocalVideoStream(!isCameraOff);
    }
    setIsCameraOff(prev => !prev);
  }, [isCameraOff]);

  const toggleSpeaker = useCallback(() => {
    if (isAgoraSupported && engineRef.current) {
      engineRef.current.setEnableSpeakerphone(!isSpeakerOn);
    }
    setIsSpeakerOn(prev => !prev);
  }, [isSpeakerOn]);

  const switchCamera = useCallback(() => {
    if (isAgoraSupported && engineRef.current) {
      engineRef.current.switchCamera();
    }
  }, []);

  const leaveChannel = useCallback(async () => {
    await cleanup();
  }, [cleanup]);

  const formatDuration = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  }, []);

  return {
    engineRef,
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
  };
};

export default useAgora;
