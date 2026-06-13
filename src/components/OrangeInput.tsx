import React from 'react';
import { TextInput, View, ViewStyle, TextInputProps } from 'react-native';
import { COLORS, BORDER_RADIUS } from '../constants/colors';

interface OrangeInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
}

export const OrangeInput: React.FC<OrangeInputProps> = ({ containerStyle, ...props }) => {
  return (
    <View style={containerStyle}>
      <TextInput
        placeholderTextColor={COLORS.textHint}
        {...props}
        style={[
          {
            borderWidth: 1.5,
            borderColor: COLORS.border,
            borderRadius: BORDER_RADIUS.input,
            height: 50,
            paddingHorizontal: 18,
            backgroundColor: COLORS.white,
            fontSize: 15,
            color: COLORS.textPrimary,
          },
          props.style,
        ]}
      />
    </View>
  );
};
