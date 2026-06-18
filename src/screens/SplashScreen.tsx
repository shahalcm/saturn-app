import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import {
    ImageBackground,
    StatusBar,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

type AuthStackParamList = {
  Splash: undefined;
};

type SplashScreenProps = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

interface GradientTextProps {
  text: string;
  colors: readonly [string, string, ...string[]];
  style?: any;
}

const GradientText: React.FC<GradientTextProps> = ({ text, colors, style }) => {
  return (
    <MaskedView
      style={style}
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

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { height, width } = useWindowDimensions();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login' as any);
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground
        source={require('../../assets/images/splash_background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.content}>
          <View style={[styles.topSection, { paddingTop: height * 0.18 }]}>
            <GradientText
              text="Saturn"
              colors={['#FFE79A', '#FFAE34', '#ED7E00']}
              style={styles.appTitle}
            />
          </View>

          <View style={[styles.bottomSection, { paddingHorizontal: width * 0.08, paddingBottom: height * 0.16 }]}>
            <GradientText
              text="Welcome to"
              colors={['#7EE5B9', '#FFA2B2', '#FFA99B']}
              style={styles.welcomeText}
            />
            <GradientText
              text="Saturn"
              colors={['#FFE79A', '#FFAE34', '#ED7E00']}
              style={styles.saturnText}
            />
            <Text style={styles.tagline}>
              Instant astrology.{'\n'}
              Real astrologers.{'\n'}
              Live chat guidance, anytime.
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0C1B',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 50,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  bottomSection: {
    justifyContent: 'flex-end',
  },
  welcomeText: {
    fontSize: 46,
    fontWeight: '800',
    textAlign: 'left',
    letterSpacing: -0.5,
    marginBottom: -4,
  },
  saturnText: {
    fontSize: 46,
    fontWeight: '800',
    textAlign: 'left',
    letterSpacing: -0.5,
    marginBottom: 18,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 30,
    textAlign: 'left',
    letterSpacing: 0.2,
  },
});
