import React from 'react';
import { View, ViewStyle } from 'react-native';
import { COLORS } from '../constants/colors';

interface WaveDividerProps {
  style?: ViewStyle;
}

export const WaveDivider: React.FC<WaveDividerProps> = ({ style }) => {
  return (
    <View
      style={[
        {
          backgroundColor: COLORS.white,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          height: 30,
          position: 'absolute',
          bottom: -1,
          left: 0,
          right: 0,
        },
        style,
      ]}
    />
  );
};
