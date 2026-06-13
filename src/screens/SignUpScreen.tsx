import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Dimensions,
    ImageBackground,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientButton } from '../components/GradientButton';
import { OrangeInput } from '../components/OrangeInput';
import { WaveDivider } from '../components/WaveDivider';
import { BORDER_RADIUS, COLORS } from '../constants/colors';
import client from '../api/client';

type AuthStackParamList = {
  SignUp: undefined;
  OTP: { phone: string; type: 'login' | 'signup'; userData?: any };
};

type SignUpScreenProps = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

interface GradientTextProps {
  text: string;
  colors: readonly [string, string, ...string[]];
  style?: any;
}

const GradientText: React.FC<GradientTextProps> = ({ text, colors, style }) => {
  return (
    <MaskedView
      maskElement={<Text style={style}>{text}</Text>}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[style, { opacity: 0 }]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  );
};

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [religion, setReligion] = useState<'muslim' | 'hindu' | 'christian' | null>(null);
  const [showReligionModal, setShowReligionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const screenHeight = Dimensions.get('screen').height;

  const handleSignUp = async () => {
    if (fullName.trim().length === 0) {
      alert('Please enter your full name');
      return;
    }
    if (phone.length !== 10 || isNaN(Number(phone))) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    if (!religion) {
      alert('Please select your religion');
      return;
    }

    setLoading(true);
    try {
      const response = await client.post('/auth/send-otp', {
        phone: '+91' + phone,
        type: 'signup',
      });
      
      const responseData = response.data;
      if (responseData.success) {
        const devOtp = responseData.data?.otp;
        if (devOtp) {
          alert(`[Development Mode] OTP sent: ${devOtp}`);
        }
        navigation.navigate('OTP', {
          phone: '+91' + phone,
          type: 'signup',
          userData: {
            name: fullName,
            fullName,
            phone: '+91' + phone,
            email,
            password,
            religion,
          },
        });
      } else {
        alert(responseData.message || 'Failed to send OTP. Try again.');
      }
    } catch (error: any) {
      console.warn('Backend send-otp for signup failed, using mock fallback:', error);
      alert('Backend connection failed or is unreachable. Falling back to mock verification (OTP is any 4 digits).');
      navigation.navigate('OTP', {
        phone: '+91' + phone,
        type: 'signup',
        userData: {
          name: fullName,
          fullName,
          phone: '+91' + phone,
          email,
          password,
          religion,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={[styles.topSection, { height: screenHeight * 0.35 }]}>
            <ImageBackground
              source={require('../../assets/images/splash_background.png')}
              style={styles.backgroundImage}
              resizeMode="cover"
            >
              <View style={styles.headerContent}>
                <GradientText
                  text="Saturn"
                  colors={['#FFE79A', '#FFAE34', '#ED7E00']}
                  style={styles.headerTitle}
                />
              </View>
              <WaveDivider />
            </ImageBackground>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.header}>
              <View style={styles.line} />
              <Text style={styles.headerText}>Sign Up</Text>
              <View style={styles.line} />
            </View>

            <OrangeInput
              placeholder="Full name"
              value={fullName}
              onChangeText={setFullName}
              containerStyle={styles.inputContainer}
            />

            <View style={styles.phoneRow}>
              <TouchableOpacity style={styles.countryPicker}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={styles.countryCode}>+91</Text>
              </TouchableOpacity>
              <OrangeInput
                placeholder="Mobile number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
                containerStyle={{ flex: 1 }}
              />
            </View>

            <OrangeInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              containerStyle={styles.inputContainer}
            />

            <OrangeInput
              placeholder="Create password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              containerStyle={styles.inputContainer}
            />

            <TouchableOpacity
              style={[
                styles.religionPicker,
                religion && styles.religionPickerActive,
              ]}
              onPress={() => setShowReligionModal(true)}
            >
              <Text style={[styles.religionText, !religion && styles.placeholder]}>
                {religion ? religion.charAt(0).toUpperCase() + religion.slice(1) : 'Religion'}
              </Text>
              <Text style={styles.chevron}>⌄</Text>
            </TouchableOpacity>

            <View style={styles.spacing} />

            <GradientButton
              title="Sign Up"
              onPress={handleSignUp}
              loading={loading}
            />

            <Modal
              transparent
              visible={showReligionModal}
              onRequestClose={() => setShowReligionModal(false)}
              animationType="fade"
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Religion</Text>
                  {(['muslim', 'hindu', 'christian'] as const).map((rel) => (
                    <TouchableOpacity
                      key={rel}
                      style={styles.religionOption}
                      onPress={() => {
                        setReligion(rel);
                        setShowReligionModal(false);
                      }}
                    >
                      <Text style={styles.religionOptionText}>
                        {rel.charAt(0).toUpperCase() + rel.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Modal>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  topSection: {
    overflow: 'hidden',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#1A1A3A',
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#CCCCCC',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  inputContainer: {
    marginBottom: 12,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  countryPicker: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.input,
    paddingHorizontal: 16,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flag: {
    fontSize: 18,
  },
  countryCode: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  religionPicker: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.input,
    height: 50,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  religionPickerActive: {
    borderColor: COLORS.primary,
  },
  religionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  placeholder: {
    color: COLORS.textHint,
  },
  chevron: {
    fontSize: 14,
    color: COLORS.textHint,
  },
  spacing: {
    height: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  religionOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  religionOptionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
});
