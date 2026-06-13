import { Feather, Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { ClassicAlertModal } from "../components/ClassicAlertModal";

type ProviderLiveClassScreenProps = NativeStackScreenProps<any, "LiveClass">;

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  isSystem?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "1", user: "System", text: "Class started. Waiting for students...", isSystem: true },
  { id: "2", user: "Sameer", text: "Joined the class" },
  { id: "3", user: "Pooja", text: "Pranam Guruji! Ready for the session." },
];

export const ProviderLiveClassScreen: React.FC<ProviderLiveClassScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [participantsCount, setParticipantsCount] = useState(3);
  const [alertVisible, setAlertVisible] = useState(false);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulated student additions
  useEffect(() => {
    const chatIntervals = [
      {
        delay: 5000,
        action: () => {
          setMessages((prev) => [
            ...prev,
            { id: "4", user: "Sarah", text: "Joined the class" },
          ]);
          setParticipantsCount((prev) => prev + 1);
        },
      },
      {
        delay: 10000,
        action: () => {
          setMessages((prev) => [
            ...prev,
            { id: "5", user: "Sameer", text: "Sir, can you explain the 3rd verse again?" },
          ]);
        },
      },
      {
        delay: 15000,
        action: () => {
          setMessages((prev) => [
            ...prev,
            { id: "6", user: "Pooja", text: "Yes, that was slightly fast." },
          ]);
        },
      },
      {
        delay: 20000,
        action: () => {
          setMessages((prev) => [
            ...prev,
            { id: "7", user: "Arjun", text: "Joined the class" },
          ]);
          setParticipantsCount((prev) => prev + 1);
        },
      },
    ];

    const timers = chatIntervals.map((item) =>
      setTimeout(item.action, item.delay)
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleEndClass = () => {
    setAlertVisible(true);
  };

  const handleConfirmEnd = () => {
    setAlertVisible(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Video Preview Camera frame (Simulated using gradients and icons) */}
      <View style={styles.videoWindow}>
        {isVideoOff ? (
          <View style={styles.cameraOffContainer}>
            <View style={styles.avatarPill}>
              <Feather name="video-off" size={48} color="#9E9E9E" />
            </View>
            <Text style={styles.cameraOffText}>Your Camera is Disabled</Text>
          </View>
        ) : (
          <LinearGradient
            colors={["#2C3E50", "#000000"]}
            style={styles.cameraOnGradient}
          >
            <Ionicons name="videocam" size={60} color="rgba(255, 255, 255, 0.15)" />
            <Text style={styles.cameraOnText}>🎥 Simulated Camera Stream Active</Text>
          </LinearGradient>
        )}
      </View>

      {/* Header Overlay */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top + 10 }]}>
        <View style={styles.liveBadge}>
          <View style={styles.redDot} />
          <Text style={styles.liveLabel}>LIVE</Text>
          <Text style={styles.liveTimer}>{formatTime(seconds)}</Text>
        </View>

        <View style={styles.participantsBadge}>
          <Ionicons name="people" size={14} color={COLORS.white} />
          <Text style={styles.participantsCount}>{participantsCount}</Text>
        </View>

        <TouchableOpacity style={styles.closeBtn} onPress={handleEndClass}>
          <Feather name="x" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Bottom Floating Area: Chats & Actions */}
      <View style={[styles.bottomControlArea, { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }]}>
        {/* Chat log visual overlay */}
        <View style={styles.chatContainer}>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.chatBubble, item.isSystem && styles.systemBubble]}>
                <Text style={[styles.chatUser, item.isSystem && styles.systemText]}>
                  {item.user}
                </Text>
                <Text style={[styles.chatText, item.isSystem && styles.systemText]}>
                  {item.text}
                </Text>
              </View>
            )}
            style={styles.chatList}
            contentContainerStyle={styles.chatListContent}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Buttons Row */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.controlCircle, isMuted && styles.controlCircleActive]}
            onPress={() => setIsMuted(!isMuted)}
            activeOpacity={0.8}
          >
            <Feather
              name={isMuted ? "mic-off" : "mic"}
              size={20}
              color={isMuted ? COLORS.white : COLORS.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlCircle, isVideoOff && styles.controlCircleActive]}
            onPress={() => setIsVideoOff(!isVideoOff)}
            activeOpacity={0.8}
          >
            <Feather
              name={isVideoOff ? "video-off" : "video"}
              size={20}
              color={isVideoOff ? COLORS.white : COLORS.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.endClassCircle}
            onPress={handleEndClass}
            activeOpacity={0.8}
          >
            <Feather name="phone-off" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ClassicAlertModal
        visible={alertVisible}
        type="warning"
        title="End Class"
        message="Are you sure you want to end this live session for all participants?"
        onClose={() => setAlertVisible(false)}
        onConfirm={handleConfirmEnd}
        confirmText="End Session"
        cancelText="Cancel"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  videoWindow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cameraOffContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
  },
  avatarPill: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cameraOffText: {
    color: "#AEAEB2",
    fontSize: 14,
    fontWeight: "600",
  },
  cameraOnGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraOnText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 12,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 6,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
  },
  liveLabel: {
    color: "#FF3B30",
    fontSize: 11,
    fontWeight: "900",
  },
  liveTimer: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  participantsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 6,
  },
  participantsCount: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },
  closeBtn: {
    marginLeft: "auto",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomControlArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  chatContainer: {
    height: 160,
    marginBottom: 16,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 16,
    overflow: "hidden",
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    padding: 10,
  },
  chatBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 6,
    alignSelf: "flex-start",
    maxWidth: "85%",
  },
  systemBubble: {
    backgroundColor: "rgba(255, 179, 0, 0.2)",
    alignSelf: "center",
  },
  chatUser: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 2,
  },
  chatText: {
    color: COLORS.white,
    fontSize: 12,
    lineHeight: 16,
  },
  systemText: {
    color: "#FFB300",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginBottom: 8,
  },
  controlCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  controlCircleActive: {
    backgroundColor: "#FF3B30",
  },
  endClassCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
