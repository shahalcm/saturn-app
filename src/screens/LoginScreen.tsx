import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Dimensions,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
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
  Login: undefined;
  SignUp: undefined;
  OTP: { phone: string; type: 'login' | 'signup'; userData?: any };
};

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

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

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [whatsappNotif, setWhatsappNotif] = useState(true);
  const [loading, setLoading] = useState(false);
  const screenHeight = Dimensions.get('screen').height;

  const handleGetOTP = async () => {
    if (phone.length !== 10 || isNaN(Number(phone))) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await client.post('/auth/send-otp', {
        phone: '+91' + phone,
        type: 'login',
      });
      
      const responseData = response.data;
      if (responseData.success) {
        const devOtp = responseData.data?.otp;
        if (devOtp) {
          alert(`[Development Mode] OTP sent: ${devOtp}`);
        }
        navigation.navigate('OTP', {
          phone: '+91' + phone,
          type: 'login',
        });
      } else {
        alert(responseData.message || 'Failed to send OTP. Try again.');
      }
    } catch (error: any) {
      console.warn('Backend send-otp failed, using mock fallback:', error);
      alert('Backend connection failed or is unreachable. Falling back to mock verification (OTP is any 4 digits).');
      navigation.navigate('OTP', {
        phone: '+91' + phone,
        type: 'login',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={[styles.topSection, { height: screenHeight * 0.45 }]}>
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
              <Text style={styles.headerText}>Login or Sign Up</Text>
              <View style={styles.line} />
            </View>

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

            <View style={styles.spacing} />

            <GradientButton
              title="Get OTP"
              onPress={handleGetOTP}
              loading={loading}
            />

            <View style={styles.whatsappRow}>
              <Switch
                value={whatsappNotif}
                onValueChange={setWhatsappNotif}
                trackColor={{ true: COLORS.primary }}
              />
              <Text style={styles.whatsappText}>Get updates on WhatsApp</Text>
            </View>

            <View style={styles.bottomText}>
              <Text style={styles.signupQuestion}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 30,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
  phoneRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
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
  spacing: {
    height: 12,
  },
  whatsappRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  whatsappText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  bottomText: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingBottom: 10,
  },
  signupQuestion: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
