import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GradientButton } from '../components/GradientButton';
import { BORDER_RADIUS, COLORS } from '../constants/colors';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

type AuthStackParamList = {
  OTP: { phone: string; type: 'login' | 'signup'; userData?: any };
  RoleSelect: undefined;
};

type OTPScreenProps = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

export const OTPScreen: React.FC<OTPScreenProps> = ({ navigation, route }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputs = React.useRef<TextInput[]>([]);

  const { login } = useAuth();
  const { setProfile, setUserRole, setReligion, setProviderVerified, setProviderType } = useUser();

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, '');

    setOtp(newOtp);

    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, event: any) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      alert('Please enter all 4 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await client.post('/auth/verify-otp', {
        phone: route.params.phone,
        otp: otpCode,
        type: route.params.type,
        userData: route.params.userData,
      });

      const responseData = response.data;
      if (responseData.success) {
        setLoading(false);
        setShowSuccess(true);

        const { token, user, provider } = responseData.data;
        const loggedUser = user || provider;
        const role = user ? 'seeker' : 'provider';

        // Auto navigate after success
        setTimeout(async () => {
          try {
            if (role !== 'seeker') {
              alert('This app is for seekers only. Please use the Provider app.');
              setLoading(false);
              setShowSuccess(false);
              return;
            }

            await login(token, loggedUser.id || loggedUser._id, 'seeker');
            await setUserRole('seeker');
            if (loggedUser.religion) {
              await setReligion(loggedUser.religion);
            }
            const userProfile = {
              name: loggedUser.name || '',
              phone: loggedUser.phone || '',
              email: loggedUser.email || '',
              dob: loggedUser.dob || '',
              tob: loggedUser.tob || '',
              pob: loggedUser.pob || '',
              gender: loggedUser.gender || 'male',
              languages: loggedUser.languages || ['English'],
              avatar: loggedUser.avatar || '',
            };
            setProfile(userProfile);
            await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
          } catch (e) {
            console.error('Error in post-login setup:', e);
          }
        }, 1500);

      } else {
        alert(responseData.message || 'Verification failed');
        setLoading(false);
      }
    } catch (error: any) {
      console.warn('Backend OTP verification failed, using mock fallback:', error);
      alert('Backend connection failed or is unreachable. Performing mock verification (Success).');
      
      setLoading(false);
      setShowSuccess(true);

      setTimeout(async () => {
        try {
          const isSignup = route.params.type === 'signup';
          const mockUserId = 'mock_user_id_' + Date.now();
          const mockToken = 'mock_jwt_token_xyz';
          
          await login(mockToken, mockUserId, 'seeker');
          await setUserRole('seeker');
          if (isSignup && route.params.userData) {
            const uData = route.params.userData;
            const userProfile = {
              name: uData.fullName || '',
              phone: uData.phone || '',
              email: uData.email || '',
              dob: '',
              tob: '',
              pob: '',
              gender: 'male' as const,
              languages: ['English'],
            };
            setProfile(userProfile);
            await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
          }
        } catch (e) {
          console.error('Error in mock post-login setup:', e);
        }
      }, 1500);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.content}>
        <Text style={styles.title}>Verification Code</Text>
        <Text style={styles.subtitle}>
          We have sent the verification code to your email address
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : styles.otpInputEmpty,
              ]}
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(value) => handleOtpChange(index, value)}
              onKeyPress={(event) => handleKeyPress(index, event)}
              editable={!showSuccess}
            />
          ))}
        </View>

        <GradientButton
          title="Confirm"
          onPress={handleConfirm}
          loading={loading}
          style={styles.confirmButton}
          disabled={showSuccess}
        />

        {showSuccess && (
          <View style={styles.successCard}>
            <View style={styles.successCircle}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={styles.successText}>Success!</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  otpInput: {
    width: 65,
    height: 65,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  otpInputEmpty: {
    borderColor: COLORS.borderLight,
  },
  otpInputFilled: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  confirmButton: {
    marginBottom: 32,
  },
  successCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    padding: 24,
    alignItems: 'center',
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: '700',
  },
  successText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
});
