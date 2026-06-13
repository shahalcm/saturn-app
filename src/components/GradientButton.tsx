import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, BORDER_RADIUS } from '../constants/colors';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  containerStyle,
}) => {
  if (disabled) {
    return (
      <TouchableOpacity
        disabled={true}
        style={[
          {
            height: 54,
            borderRadius: BORDER_RADIUS.button,
            backgroundColor: '#CCCCCC',
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
          containerStyle,
        ]}
      >
        <Text
          style={[
            {
              fontSize: 16,
              fontWeight: '600',
              color: COLORS.white,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
      style={containerStyle}
    >
      <LinearGradient
        colors={COLORS.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          {
            height: 54,
            borderRadius: BORDER_RADIUS.button,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text
            style={[
              {
                fontSize: 16,
                fontWeight: '600',
                color: COLORS.white,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};
