import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

const logo = require('../../assets/logo.png');

type Props = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function Logo({ size = 140, style }: Props) {
  return (
    <Image
      source={logo}
      resizeMode="contain"
      style={[{ width: size, height: size, marginBottom: 12 }, style]}
    />
  );
}
