import React, { ReactNode } from 'react';
import { Platform, StatusBar, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../outils/Theme';

type ScreenContainerProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Uses useSafeAreaInsets (with a manual fallback) instead of relying only on
 * <SafeAreaView>, because SafeAreaView silently becomes a no-op if the app
 * root isn't wrapped in <SafeAreaProvider> — which produces exactly the
 * "content glued to the status bar / notch" overlap seen on device.
 *
 * IMPORTANT: this still requires <SafeAreaProvider> to wrap the app root
 * (usually in App.tsx / index.js) for insets.top to be accurate. Without it,
 * insets.top defaults to 0 and this falls back to StatusBar.currentHeight
 * (Android) or a fixed value (iOS) as a best-effort patch.
 */
const ScreenContainer = ({ children, style }: ScreenContainerProps) => {
  const insets = useSafeAreaInsets();

  const fallbackTop = Platform.select({
    android: StatusBar.currentHeight ?? 24,
    ios: 47, // approximate notch/Dynamic Island height when insets aren't available
    default: 24,
  });

  const topPadding = insets.top > 0 ? insets.top : fallbackTop;

  return (
    <View style={[styles.container, style, { paddingTop: topPadding, paddingBottom: Math.max(insets.bottom, 16) }]}>
      <StatusBar
        barStyle="dark-content"
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
});

export default ScreenContainer;