import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, Modal,
  Image, Linking, Animated, Dimensions,
  ActivityIndicator, StyleSheet
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';
import { getSocket } from '../services/socketService';
import api from '../services/api';

const { height } = Dimensions.get('window');

interface LivePrayerScreenProps {
  route: any;
  navigation: any;
}

export default function LivePrayerScreen({ route, navigation }: LivePrayerScreenProps) {
  const { prayer: initialPrayer } = route.params;
  const insets = useSafeAreaInsets();
  const { profile } = useUser();

  const [prayer, setPrayer] = useState(initialPrayer);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [upiTxnId, setUpiTxnId] = useState('');
  const [submittingDonation, setSubmittingDonation] = useState(false);
  const [totalDonated, setTotalDonated] = useState(prayer.charityCollectedAmount || 0);
  const [newDonationAlert, setNewDonationAlert] = useState<any>(null);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(initialPrayer.viewers || 0);

  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<any>(null);
  const donationAlertAnim = useRef(new Animated.Value(0)).current;

  const quickAmounts = [11, 21, 51, 101, 501];

  useEffect(() => {
    fetchComments();
    setupSocket();
    updateViewers(viewerCount + 1);

    return () => {
      updateViewers(Math.max(0, viewerCount - 1));
      if (socketRef.current) {
        socketRef.current.emit('leavePrayer', prayer._id);
      }
    };
  }, []);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/api/prayers/${prayer._id}/comments`);
      setComments(res.data.data.comments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setCommentsLoading(false);
    }
  };

  const setupSocket = () => {
    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    socket.emit('joinPrayer', prayer._id);

    socket.on('newComment', (comment: any) => {
      setComments(prev => [comment, ...prev]);
    });

    socket.on('commentHidden', ({ commentId }: { commentId: string }) => {
      setComments(prev => prev.filter(c => c._id !== commentId));
    });

    socket.on('viewerCount', ({ viewers }: { viewers: number }) => {
      setViewerCount(viewers);
    });

    socket.on('prayerEnded', () => {
      Alert.alert(
        'Prayer Ended',
        'This prayer session has ended. Thank you for joining!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    });

    socket.on('prayerUpdated', (updatedPrayer: any) => {
      setPrayer(updatedPrayer);
    });

    socket.on('youtubeUpdated', ({ youtubeUrl, youtubeVideoId }: { youtubeUrl: string, youtubeVideoId: string }) => {
      setPrayer((prev: any) => ({ ...prev, youtubeUrl, youtubeVideoId }));
    });

    socket.on('commentsToggled', ({ commentsEnabled }: { commentsEnabled: boolean }) => {
      setPrayer((prev: any) => ({ ...prev, commentsEnabled }));
    });

    socket.on('newDonation', ({ userName, amount, message }: { userName: string, amount: number, message: string }) => {
      setTotalDonated((prev: number) => prev + amount);
      showDonationAlert({ userName, amount, message });
    });

    return () => {
      socket.off('newComment');
      socket.off('commentHidden');
      socket.off('viewerCount');
      socket.off('prayerEnded');
      socket.off('prayerUpdated');
      socket.off('youtubeUpdated');
      socket.off('commentsToggled');
      socket.off('newDonation');
    };
  };

  const updateViewers = async (count: number) => {
    try {
      await api.put(`/api/prayers/${prayer._id}/viewers`, { viewers: count });
    } catch (e) {}
  };

  const showDonationAlert = (donation: any) => {
    setNewDonationAlert(donation);
    donationAlertAnim.setValue(0);
    Animated.sequence([
      Animated.timing(donationAlertAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(donationAlertAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => setNewDonationAlert(null));
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || sending) return;
    if (!prayer.commentsEnabled) {
      Alert.alert('Comments Disabled', 'Comments are currently disabled for this prayer.');
      return;
    }

    setSending(true);
    const text = commentText.trim();
    setCommentText('');

    try {
      await api.post(`/api/prayers/${prayer._id}/comments`, {
        text,
        userName: profile?.name || 'Anonymous',
        userType: 'seeker',
      });
    } catch (e) {
      setCommentText(text);
      Alert.alert('Error', 'Failed to send comment');
    } finally {
      setSending(false);
    }
  };

  const handleDonate = async () => {
    if (!donationAmount || Number(donationAmount) < 1) {
      Alert.alert('Invalid Amount', 'Please enter a valid donation amount');
      return;
    }

    setSubmittingDonation(true);
    try {
      await api.post(`/api/prayers/${prayer._id}/donate`, {
        amount: Number(donationAmount),
        upiTransactionId: upiTxnId.trim(),
        message: donationMessage.trim(),
        userName: profile?.name || 'Anonymous',
      });

      setShowDonation(false);
      setDonationAmount('');
      setDonationMessage('');
      setUpiTxnId('');
      Alert.alert('🙏 Thank You!', 'Your donation has been recorded. May God bless you!');
    } catch (e) {
      Alert.alert('Error', 'Failed to record donation');
    } finally {
      setSubmittingDonation(false);
    }
  };

  const openGooglePay = () => {
    if (prayer.googlePayUpiId) {
      const amount = donationAmount || '';
      const upiUrl = `upi://pay?pa=${prayer.googlePayUpiId}&pn=${encodeURIComponent(prayer.googlePayName || 'Charity')}&am=${amount}&cu=INR&tn=${encodeURIComponent('Prayer Charity Donation')}`;
      Linking.openURL(upiUrl).catch(() => {
        Linking.openURL('https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user');
      });
    }
  };

  const getInitials = (name: string) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'A';

  const formatTime = (date: any) => new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });

  const bgColors = ['#FFF0D6', '#E0D7F7', '#D7F0E0', '#F0E8FF', '#FFE4E4'];

  // YouTube embed URL
  const youtubeEmbedUrl = prayer.youtubeVideoId
    ? `https://www.youtube.com/embed/${prayer.youtubeVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
    : null;

  return (
    <View style={styles.mainContainer}>

      {/* VIDEO PLAYER */}
      <View style={styles.videoPlayerContainer}>
        {youtubeEmbedUrl ? (
          <WebView
            source={{ uri: youtubeEmbedUrl }}
            style={{ flex: 1 }}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => (
              <View style={styles.playerOverlayContainer}>
                <ActivityIndicator color="#F5A623" size="large" />
                <Text style={styles.overlayText}>Loading stream...</Text>
              </View>
            )}
          />
        ) : (
          <View style={styles.playerOverlayContainer}>
            <Ionicons name="logo-youtube" size={60} color="#FF0000" />
            <Text style={{ color: 'white', marginTop: 12, fontSize: 15 }}>
              Stream not yet available
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 6, fontSize: 12 }}>
              Prayer starts at {prayer.scheduledTime}
            </Text>
          </View>
        )}

        {/* Top overlay */}
        <View style={[styles.topOverlay, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.circleOverlayButton}
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {/* LIVE badge */}
            {prayer.status === 'live' && (
              <View style={styles.redLiveBadge}>
                <View style={styles.liveBadgeDot} />
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            )}

            {/* Viewer count */}
            <View style={styles.viewerBadge}>
              <Ionicons name="eye-outline" size={13} color="white" />
              <Text style={styles.viewerText}>
                {viewerCount.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* PRAYER INFO BAR */}
      <View style={styles.infoBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle} numberOfLines={1}>
            {prayer.title}
          </Text>
          <Text style={styles.infoHost}>
            👤 {prayer.host}
          </Text>
        </View>

        {/* Charity button */}
        {prayer.charityEnabled && (
          <TouchableOpacity
            onPress={() => setShowDonation(true)}
            style={{ marginLeft: 12 }}
          >
            <LinearGradient
              colors={['#4CAF50', '#388E3C']}
              style={styles.donateButton}
            >
              <Text style={{ fontSize: 14 }}>💚</Text>
              <Text style={styles.donateButtonText}>
                Donate
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* CHARITY PROGRESS (if charity enabled) */}
      {prayer.charityEnabled && prayer.charityGoalAmount > 0 && (
        <View style={styles.progressBarContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.progressText}>
              {prayer.charityTitle || 'Charity Goal'} • ₹{totalDonated.toLocaleString('en-IN')} / ₹{prayer.charityGoalAmount.toLocaleString('en-IN')}
            </Text>
            <View style={styles.progressTrack}>
              <View style={[
                styles.progressBar,
                { width: `${Math.min(100, (totalDonated / prayer.charityGoalAmount) * 100)}%` }
              ]} />
            </View>
          </View>
          <Text style={styles.percentText}>
            {Math.round((totalDonated / prayer.charityGoalAmount) * 100)}%
          </Text>
        </View>
      )}

      {/* NEW DONATION ALERT */}
      {newDonationAlert && (
        <Animated.View style={[
          styles.donationAlertToast,
          { top: height * 0.30 + 80, opacity: donationAlertAnim }
        ]}>
          <Text style={{ fontSize: 22 }}>💚</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>
              {newDonationAlert.userName} donated ₹{newDonationAlert.amount}
            </Text>
            {newDonationAlert.message && (
              <Text style={styles.alertMessage}>
                "{newDonationAlert.message}"
              </Text>
            )}
          </View>
        </Animated.View>
      )}

      {/* COMMENTS SECTION */}
      <View style={styles.commentsWrapper}>
        {/* Comments header */}
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsHeaderTitle}>
            💬 Live Comments
          </Text>
          {!prayer.commentsEnabled && (
            <Text style={styles.commentsDisabledText}>Comments Disabled</Text>
          )}
        </View>

        {/* Comments list */}
        {commentsLoading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator color="#F5A623" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={comments}
            keyExtractor={item => item._id || Math.random().toString()}
            contentContainerStyle={styles.commentsListContent}
            inverted
            ListEmptyComponent={
              <View style={styles.emptyCommentsContainer}>
                <Text style={styles.emptyCommentsText}>
                  No comments yet. Be the first!
                </Text>
              </View>
            }
            renderItem={({ item, index }) => (
              <View style={styles.commentItem}>
                {/* Avatar */}
                <View style={[
                  styles.commentAvatar,
                  { backgroundColor: bgColors[index % bgColors.length] }
                ]}>
                  <Text style={styles.commentAvatarText}>
                    {getInitials(item.userName)}
                  </Text>
                </View>

                {/* Comment bubble */}
                <View style={[
                  styles.commentBubble,
                  {
                    backgroundColor: item.isPinned ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.07)',
                    borderLeftWidth: item.isPinned ? 2 : 0,
                  }
                ]}>
                  <View style={styles.commentMetaRow}>
                    <Text style={styles.commentUserName}>
                      {item.userName}
                    </Text>
                    {item.isPinned && (
                      <View style={styles.pinnedBadge}>
                        <Text style={styles.pinnedText}>📌 PINNED</Text>
                      </View>
                    )}
                    <Text style={styles.commentTime}>
                      {formatTime(item.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.commentBodyText}>
                    {item.text}
                  </Text>
                  {item.likes?.length > 0 && (
                    <Text style={styles.commentLikesText}>
                      ❤️ {item.likes.length}
                    </Text>
                  )}
                </View>
              </View>
            )}
          />
        )}

        {/* Comment input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.commentInputRow, { paddingBottom: insets.bottom + 10 }]}>
            <View style={styles.inputAvatar}>
              <Text style={styles.inputAvatarText}>
                {getInitials(profile?.name || 'Anonymous')}
              </Text>
            </View>
            <TextInput
              style={styles.commentTextInput}
              placeholder={prayer.commentsEnabled ? "Say something..." : "Comments are disabled"}
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={commentText}
              onChangeText={setCommentText}
              editable={prayer.commentsEnabled && !sending}
            />
            <TouchableOpacity 
              onPress={handleSendComment}
              disabled={!commentText.trim() || sending || !prayer.commentsEnabled}
              style={{ padding: 4 }}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#F5A623" />
              ) : (
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={commentText.trim() && prayer.commentsEnabled ? '#F5A623' : 'rgba(255,255,255,0.3)'} 
                />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* DONATION MODAL */}
      <Modal
        visible={showDonation}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDonation(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                💚 Make a Donation
              </Text>
              <TouchableOpacity onPress={() => setShowDonation(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form */}
            <FlatList
              data={[]}
              renderItem={null}
              style={{ width: '100%' }}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={(
                <View style={styles.modalForm}>
                  {/* Title & Description */}
                  <View>
                    <Text style={styles.modalFormCharityTitle}>
                      {prayer.charityTitle || 'Charity Donation'}
                    </Text>
                    <Text style={styles.modalFormCharityDescription}>
                      {prayer.charityDescription || 'Support this divine cause. Your contribution goes directly to the temple/charity foundation.'}
                    </Text>
                  </View>

                  {/* QR Code section */}
                  {prayer.googlePayQrCode && (
                    <View style={styles.qrCodeWrapper}>
                      <Image 
                        source={{ uri: prayer.googlePayQrCode }} 
                        style={styles.qrImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.qrScanText}>
                        Scan to Pay with any UPI App
                      </Text>
                    </View>
                  )}

                  {/* Google Pay details */}
                  <View style={styles.upiDetailsWrapper}>
                    <Text style={styles.upiLabel}>UPI ID</Text>
                    <Text style={styles.upiValue}>{prayer.googlePayUpiId}</Text>
                    <Text style={styles.upiLabel}>Merchant Name</Text>
                    <Text style={styles.upiValue}>{prayer.googlePayName || 'Temple Charity'}</Text>
                  </View>

                  {/* Amount input */}
                  <View>
                    <Text style={styles.formInputLabel}>
                      Donation Amount (₹)
                    </Text>
                    <TextInput
                      style={styles.formTextInputAmount}
                      placeholder="Enter amount"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      keyboardType="numeric"
                      value={donationAmount}
                      onChangeText={setDonationAmount}
                    />
                  </View>

                  {/* Quick Amounts */}
                  <View style={styles.quickAmountsWrapper}>
                    {quickAmounts.map((amt) => (
                      <TouchableOpacity
                        key={amt}
                        onPress={() => setDonationAmount(amt.toString())}
                        style={[
                          styles.quickAmountBtn,
                          { backgroundColor: donationAmount === amt.toString() ? '#4CAF50' : 'rgba(255,255,255,0.08)' }
                        ]}
                      >
                        <Text style={styles.quickAmountText}>+₹{amt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Google Pay CTA */}
                  {prayer.googlePayUpiId && (
                    <TouchableOpacity
                      onPress={openGooglePay}
                      style={styles.upiPayButton}
                    >
                      <Ionicons name="wallet-outline" size={18} color="white" />
                      <Text style={styles.upiPayButtonText}>
                        Pay via UPI / GPay
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Message input */}
                  <View>
                    <Text style={styles.formInputLabel}>
                      Blessing Message (Optional)
                    </Text>
                    <TextInput
                      style={styles.formTextInputRegular}
                      placeholder="E.g., Prayers for family health"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={donationMessage}
                      onChangeText={setDonationMessage}
                    />
                  </View>

                  {/* Transaction ID input */}
                  <View>
                    <Text style={styles.formInputLabel}>
                      UPI Transaction ID / Ref No.
                    </Text>
                    <TextInput
                      style={styles.formTextInputRegular}
                      placeholder="Enter 12-digit transaction ID"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={upiTxnId}
                      onChangeText={setUpiTxnId}
                    />
                  </View>

                  {/* Confirm Submission */}
                  <TouchableOpacity
                    onPress={handleDonate}
                    disabled={submittingDonation}
                    style={styles.confirmDonationBtn}
                  >
                    {submittingDonation ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.confirmDonationText}>
                        Confirm Donation Submission
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  videoPlayerContainer: {
    width: '100%',
    height: height * 0.30,
    backgroundColor: '#000',
  },
  playerOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  overlayText: {
    color: 'white',
    marginTop: 8,
    fontSize: 13,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleOverlayButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 6,
  },
  redLiveBadge: {
    backgroundColor: '#FF4444',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'white',
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'white',
  },
  viewerBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewerText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  infoBar: {
    backgroundColor: '#0D1B2A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  infoHost: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 1,
  },
  donateButton: {
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  donateButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  progressBarContainer: {
    backgroundColor: '#0A2A0A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  percentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4CAF50',
  },
  donationAlertToast: {
    position: 'absolute',
    left: 14,
    right: 14,
    backgroundColor: 'rgba(76,175,80,0.95)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 999,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
  },
  alertMessage: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  commentsWrapper: {
    flex: 1,
    backgroundColor: '#111B2B',
  },
  commentsHeader: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  commentsHeaderTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  commentsDisabledText: {
    fontSize: 11,
    color: '#FF4444',
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsListContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingBottom: 20,
  },
  emptyCommentsContainer: {
    alignItems: 'center',
    paddingTop: 30,
  },
  emptyCommentsText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  commentAvatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F5A623',
  },
  commentBubble: {
    flex: 1,
    borderRadius: 12,
    padding: 8,
    borderLeftColor: '#F5A623',
  },
  commentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  commentUserName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F5A623',
  },
  pinnedBadge: {
    backgroundColor: '#F5A623',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  pinnedText: {
    fontSize: 9,
    color: 'white',
    fontWeight: '700',
  },
  commentTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    marginLeft: 'auto',
  },
  commentBodyText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  commentLikesText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  commentInputRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#0D1B2A',
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputAvatarText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 11,
  },
  commentTextInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: 'white',
    fontSize: 14,
    maxHeight: 80,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E2D3D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  modalForm: {
    gap: 16,
  },
  modalFormCharityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  modalFormCharityDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  qrCodeWrapper: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 16,
    alignSelf: 'center',
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  qrScanText: {
    fontSize: 11,
    color: '#333',
    marginTop: 4,
    fontWeight: '600',
  },
  upiDetailsWrapper: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  upiLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  upiValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  formInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  formTextInputAmount: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 12,
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  quickAmountsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAmountBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  quickAmountText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },
  upiPayButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  upiPayButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  formTextInputRegular: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 12,
    color: 'white',
    fontSize: 14,
  },
  confirmDonationBtn: {
    backgroundColor: '#F5A623',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmDonationText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
});
