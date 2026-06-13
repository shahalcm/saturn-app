import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useRef, useEffect } from 'react';
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER_RADIUS, COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { ClassicAlertModal } from '../components/ClassicAlertModal';

type RootStackParamList = {
  Chat: { astrologer?: any; name?: string; roomId?: string };
};

type ChatScreenProps = NativeStackScreenProps<any, 'Chat'>;

const INITIAL_MESSAGES = [
  { id: '1', text: 'Hello 👋 How can I help you today?', isMine: false },
  { id: '2', text: 'I want to know about my career growth.', isMine: true },
  { id: '3', text: 'Sure ✨ Please share your birth date and time.', isMine: false },
  { id: '4', text: '12 Aug 1998, 10:30 AM', isMine: true },
  { id: '5', text: 'Great! Let me check your planetary alignment 🔮', isMine: false },
];

export const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const { astrologer, name } = route.params || {};
  const flatListRef = useRef<FlatList>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    // Traverse up to find the parent tab navigator if it exists
    let tabParent = navigation.getParent();
    while (tabParent) {
      if (tabParent.getState()?.type === 'tab') {
        break;
      }
      tabParent = tabParent.getParent();
    }

    if (tabParent) {
      tabParent.setOptions({
        tabBarStyle: { display: 'none' }
      });
    }
    return () => {
      if (tabParent) {
        tabParent.setOptions({
          tabBarStyle: {
            position: 'absolute',
            bottom: insets.bottom > 0 ? insets.bottom : 12,
            left: 16,
            right: 16,
            backgroundColor: '#EAEAEA',
            borderRadius: 36,
            height: 70,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 6,
            borderTopWidth: 0,
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: 0,
          }
        });
      }
    };
  }, [navigation, insets]);

  const chatPartnerName = name || astrologer?.name || "User";
  const chatPartnerAvatar = astrologer?.avatar || chatPartnerName.charAt(0).toUpperCase();

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: "success" | "warning" | "error" | "info";
    title: string;
    message: string;
  }>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  const startCall = (type: "audio" | "video") => {
    setAlertConfig({
      visible: true,
      type: "success",
      title: type === "video" ? "Starting Video Call" : "Starting Voice Call",
      message: `Connecting with ${chatPartnerName}...\nPlease make sure camera and microphone permissions are granted.`,
    });
  };

  const handleSend = () => {
    if (newMessage.trim().length === 0) return;

    const newMsg = {
      id: String(messages.length + 1),
      text: newMessage,
      isMine: true,
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');

    // Simulate response
    setTimeout(() => {
      const response = {
        id: String(messages.length + 2),
        text: 'Thank you for sharing. Let me analyze your details... 🌟',
        isMine: false,
      };
      setMessages((prev) => [...prev, response]);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <LinearGradient colors={COLORS.gradient} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarText}>{chatPartnerAvatar}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.astrologerName}>{chatPartnerName}</Text>
          <Text style={styles.statusText}>Online</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => startCall("video")}>
            <Ionicons name="videocam" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => startCall("audio")}>
            <Ionicons name="call" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Messages & Input wrapped in KeyboardAvoidingView */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 70 + insets.top : insets.top}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.isMine ? styles.messageBubbleMine : styles.messageBubbleOther,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.isMine ? styles.messageTextMine : styles.messageTextOther,
                ]}
              >
                {item.text}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.messagesContent}
          scrollEnabled={true}
          inverted={false}
        />

        {/* Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: (insets.bottom > 0 && !isKeyboardVisible) ? insets.bottom : 12 }]}>
          <TouchableOpacity style={styles.emojiButton}>
            <Text style={styles.emojiIcon}>😊</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textHint}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            scrollEnabled={true}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={newMessage.trim().length === 0}
          >
            <LinearGradient
              colors={COLORS.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendButtonGradient}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <ClassicAlertModal
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: '600',
  },
  avatarSmall: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  headerInfo: {
    flex: 1,
  },
  astrologerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  icon: {
    fontSize: 20,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 16,
  },
  messageBubble: {
    marginBottom: 8,
    maxWidth: '70%',
    borderRadius: 18,
    padding: 12,
  },
  messageBubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
  },
  messageBubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
  },
  messageTextOther: {
    color: COLORS.textPrimary,
  },
  messageTextMine: {
    color: COLORS.white,
  },
  inputContainer: {
    width: '100%',
  },
  inputBar: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.borderLight,
  },
  emojiButton: {
    padding: 8,
  },
  emojiIcon: {
    fontSize: 22,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.input,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 40,
    maxHeight: 120,
    textAlignVertical: 'top',
    flexShrink: 1,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: '600',
  },
});
