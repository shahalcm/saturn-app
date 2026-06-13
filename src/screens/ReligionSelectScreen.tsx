import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientButton } from '../components/GradientButton';
import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import client from '../api/client';

type AuthStackParamList = {
  ReligionSelect: undefined;
};

type ReligionSelectScreenProps = NativeStackScreenProps<any, 'ReligionSelect'>;

export const ReligionSelectScreen: React.FC<ReligionSelectScreenProps> = ({ navigation }) => {
  const [selectedReligion, setSelectedReligion] = useState<'muslim' | 'hindu' | 'christian' | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { setReligion, setUserRole, profile } = useUser();

  const handleContinue = async () => {
    if (!selectedReligion) {
      alert('Please select a religion');
      return;
    }

    setLoading(true);

    try {
      // Set religion in context and storage
      await setReligion(selectedReligion);

      // Submit entire seeker profile to backend
      const profileData = {
        name: profile.name,
        religion: selectedReligion,
        gender: profile.gender,
        languages: profile.languages,
        dateOfBirth: profile.dob,
        timeOfBirth: profile.tob,
        placeOfBirth: profile.pob,
      };

      try {
        const response = await client.put('/users/profile', profileData);
        if (response.data.success) {
          await setUserRole('seeker');
        } else {
          alert(response.data.message || 'Failed to save profile');
        }
      } catch (apiError: any) {
        console.warn('Backend profile update failed, using mock fallback:', apiError);
        // Fallback for dev mode
        await setUserRole('seeker');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Select your religion</Text>
        <Text style={styles.subtitle}>This personalizes your entire experience</Text>

        <View style={styles.cardsContainer}>
          {/* Muslim Card */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedReligion === 'muslim' && styles.cardActive,
            ]}
            onPress={() => setSelectedReligion('muslim')}
          >
            <Text style={styles.cardIcon}>🕌</Text>
            <Text style={styles.cardLabel}>Muslim</Text>
          </TouchableOpacity>

          {/* Hindu Card */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedReligion === 'hindu' && styles.cardActive,
            ]}
            onPress={() => setSelectedReligion('hindu')}
          >
            <Text style={styles.cardIcon}>🕉️</Text>
            <Text style={styles.cardLabel}>Hindu</Text>
          </TouchableOpacity>

          {/* Christian Card */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedReligion === 'christian' && styles.cardActive,
            ]}
            onPress={() => setSelectedReligion('christian')}
          >
            <Text style={styles.cardIcon}>✝️</Text>
            <Text style={styles.cardLabel}>Christian</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          disabled={!selectedReligion}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: COLORS.white,
    gap: 16,
  },
  cardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF8EC',
  },
  cardIcon: {
    fontSize: 32,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
});
