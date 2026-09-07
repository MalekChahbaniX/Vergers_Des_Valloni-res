import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store/AuthContext';
import AuthNavigator from './AuthNavigator';
import DashboardScreen from '../screens/DashboardScreen';
import StockListScreen from '../screens/StockListScreen';
import StockDetailScreen from '../screens/StockDetailScreen';
import ReceptionScreen from '../screens/ReceptionScreen';
import SearchScreen from '../screens/SearchScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../outils/Theme';
import LocationDetailScreen from '../screens/Locationdetailscreen';
import AppMenuHeader from '../components/AppMenuHeader';

const Stack = createNativeStackNavigator();

const isAdmin = (role?: string) => (role ?? '').toLowerCase() === 'admin';

const AppStack = ({ role }: { role?: string }) => {
  const admin = isAdmin(role);

  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        header: AppMenuHeader,
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="StockList" component={StockListScreen} />
      <Stack.Screen name="StockDetail" component={StockDetailScreen} />
      <Stack.Screen name="LocationDetail" component={LocationDetailScreen} />
      <Stack.Screen name="Reception" component={ReceptionScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      {admin && <Stack.Screen name="Statistics" component={StatisticsScreen} />}
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

const SplashLoader = () => (
  <View style={styles.splash}>
    <ActivityIndicator size="large" color={colors.accent} />
  </View>
);

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Restoring a persisted session from SecureStore — avoid flashing the login screen.
    return <SplashLoader />;
  }

  if (!user) {
    return <AuthNavigator key="unauthenticated" />;
  }

  return <AppStack key={`authenticated-${user.role ?? 'default'}`} role={user.role} />;
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <AppContent />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});

export default AppNavigator;