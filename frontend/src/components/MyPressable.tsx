import React from 'react';
import { Pressable, StyleProp, ViewStyle, PressableProps, Platform } from 'react-native';

interface Props extends PressableProps {
  style?: StyleProp<ViewStyle>;
  touchOpacity?: number;
}

const MyPressable: React.FC<Props> = ({
  style,
  android_ripple = { color: 'lightgrey' },
  touchOpacity = 0.4,
  children,
  ...restOfProps
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        style,
        { opacity: Platform.OS !== 'android' && pressed ? touchOpacity : 1 },
      ]}
      android_ripple={android_ripple}
      {...restOfProps}
    >
      {children}
    </Pressable>
  );
};

export default MyPressable;
