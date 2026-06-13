import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { BORDER_RADIUS, COLORS, SIZES } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

type RootTabParamList = {
  Profile: undefined;
};

type ProfileScreenProps = BottomTabScreenProps<RootTabParamList, 'Profile'>;

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { religion, profile, setReligion } = useUser();
  const [religionModalVisible, setReligionModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [supportText, setSupportText] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by AppNavigator
    } catch (error) {
      alert('Logout failed');
    }
  };

  const religionLabel =
    religion === 'muslim'
      ? 'Muslim'
      : religion === 'hindu'
        ? 'Hindu'
        : religion === 'christian'
          ? 'Christian'
          : 'Not Selected';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header with Profile */}
      <LinearGradient 
        colors={COLORS.gradient} 
        style={[styles.headerGradient, { paddingTop: insets.top > 0 ? insets.top + 12 : 24 }]}
      >
        <View style={styles.profileSection}>
          <View style={styles.largeAvatar}>
            <Text style={styles.largeAvatarText}>👤</Text>
          </View>
          <Text style={styles.profileName}>{profile?.name || 'User Profile'}</Text>
          <View style={styles.religionTag}>
            <Text style={styles.religionTagText}>{religionLabel}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📱 Phone</Text>
            <Text style={styles.infoValue}>{profile?.phone || 'Not provided'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>✉️ Email</Text>
            <Text style={styles.infoValue}>{profile?.email || 'Not provided'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🎂 Date of Birth</Text>
            <Text style={styles.infoValue}>{profile?.dob || 'Not provided'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🕐 Time of Birth</Text>
            <Text style={styles.infoValue}>{profile?.tob || 'Not provided'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📍 Place of Birth</Text>
            <Text style={styles.infoValue}>{profile?.pob || 'Not provided'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>👥 Gender</Text>
            <Text style={styles.infoValue}>
              {profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'Not provided'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🗣️ Languages</Text>
            <Text style={styles.infoValue}>
              {profile?.languages?.join(', ') || 'Not provided'}
            </Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.settingItem} onPress={() => setReligionModalVisible(true)}>
            <Text style={styles.settingLabel}>🏛️ Change Religion</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Notifications' as any)}>
            <Text style={styles.settingLabel}>🔔 Notifications</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => setPrivacyModalVisible(true)}>
            <Text style={styles.settingLabel}>🔒 Privacy Policy</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => setHelpModalVisible(true)}>
            <Text style={styles.settingLabel}>❓ Help & Support</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 1. Change Religion Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={religionModalVisible}
        onRequestClose={() => setReligionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Religion</Text>
              <TouchableOpacity onPress={() => setReligionModalVisible(false)}>
                <Feather name="x" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>This will personalize prayers and education classes.</Text>
            {(['muslim', 'hindu', 'christian'] as const).map((r) => {
              const label = r.charAt(0).toUpperCase() + r.slice(1);
              const emoji = r === 'muslim' ? '🕌' : r === 'hindu' ? '🕉️' : '✝️';
              const isSelected = religion === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.modalOptionRow, isSelected && styles.modalOptionSelected]}
                  onPress={async () => {
                    await setReligion(r);
                    setReligionModalVisible(false);
                    Alert.alert('Success', `Religion updated to ${label}!`);
                  }}
                >
                  <Text style={styles.modalOptionEmoji}>{emoji}</Text>
                  <Text style={[styles.modalOptionLabel, isSelected && styles.modalOptionTextSelected]}>
                    {label}
                  </Text>
                  {isSelected ? <Feather name="check" size={18} color={COLORS.primary} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* 2. Privacy Policy Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={privacyModalVisible}
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <TouchableOpacity onPress={() => setPrivacyModalVisible(false)}>
                <Feather name="x" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.privacyHeading}>1. Dynamic Personalization</Text>
              <Text style={styles.privacyText}>
                We collect spiritual profiles, including date/place of birth and religion preference, to calculate precise astrological charts and live prayer timetables.
              </Text>
              <Text style={styles.privacyHeading}>2. Encryption & Anonymity</Text>
              <Text style={styles.privacyText}>
                Consultations, calls, and chat rooms with certified practitioners are fully secure and end-to-end encrypted. We never store recordings without your explicit consent.
              </Text>
              <Text style={styles.privacyHeading}>3. Location Permissions</Text>
              <Text style={styles.privacyText}>
                Saturn requests background location details solely to align astronomical calculations with local coordinate system standards.
              </Text>
              <Text style={styles.privacyHeading}>4. Personal Information Sales</Text>
              <Text style={styles.privacyText}>
                We maintain an absolute zero-sharing policy. Your birth, spiritual, or health metrics are never sold to data aggregators.
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setPrivacyModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 3. Help & Support Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={helpModalVisible}
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help & Support</Text>
              <TouchableOpacity onPress={() => setHelpModalVisible(false)}>
                <Feather name="x" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.supportLabel}>FAQs</Text>
              <View style={styles.faqCard}>
                <Text style={styles.faqQuestion}>Q: How do I book an astrologer or doctor?</Text>
                <Text style={styles.faqAnswer}>
                  A: Go to the home tab, click either the Astrologers or Doctors category, find the practitioner you want, and click the Chat button to launch a conversation.
                </Text>
              </View>
              <View style={styles.faqCard}>
                <Text style={styles.faqQuestion}>Q: Are payments secure?</Text>
                <Text style={styles.faqAnswer}>
                  A: Yes, all billing is integrated using industry-standard digital wallets and secure payment gateways. Saturn does not hold credit credentials.
                </Text>
              </View>

              <Text style={styles.supportLabel}>Submit a Support Ticket</Text>
              <TextInput
                style={styles.supportInput}
                placeholder="Describe your issue or question here..."
                placeholderTextColor={COLORS.textHint}
                multiline
                numberOfLines={4}
                value={supportText}
                onChangeText={setSupportText}
              />
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => {
                  if (!supportText.trim()) {
                    Alert.alert('Error', 'Please enter details about your issue.');
                    return;
                  }
                  setSupportText('');
                  setHelpModalVisible(false);
                  Alert.alert('Ticket Submitted', 'Thank you! Your ticket was created. A support specialist will contact you shortly.');
                }}
              >
                <Text style={styles.modalButtonTextSecondary}>Submit Ticket</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerGradient: {
    paddingBottom: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  profileSection: {
    alignItems: 'center',
  },
  largeAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  largeAvatarText: {
    fontSize: 48,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  religionTag: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  religionTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 130,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.borderLight,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.borderLight,
  },
  settingLabel: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  settingArrow: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    backgroundColor: '#FFE8E8',
    borderRadius: BORDER_RADIUS.button,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF4444',
  },
  // Spacer height replaced by scrollContent paddingBottom
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalContentLarge: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  modalOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    marginBottom: 10,
  },
  modalOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF8EC',
  },
  modalOptionEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  modalOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  modalOptionTextSelected: {
    color: COLORS.primaryDark,
  },
  modalScrollBody: {
    marginBottom: 16,
  },
  privacyHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 14,
    marginBottom: 6,
  },
  privacyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.button,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  supportLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 10,
    marginBottom: 10,
  },
  faqCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  supportInput: {
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.lightGray,
    textAlignVertical: 'top',
    height: 100,
    marginBottom: 16,
  },
  modalButtonSecondary: {
    backgroundColor: COLORS.purple,
    borderRadius: BORDER_RADIUS.button,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonTextSecondary: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});
