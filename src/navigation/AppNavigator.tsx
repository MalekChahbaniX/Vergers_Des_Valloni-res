import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store/AuthContext';
import AuthNavigator from './AuthNavigator';
import DashboardScreen from '../screens/DashboardScreen';
// import StockListScreen from '../screens/StockListScreen';
// import StockDetailScreen from '../screens/StockDetailScreen';
// import ReceptionScreen from '../screens/ReceptionScreen';
// import SearchScreen from '../screens/SearchScreen';
// import StatisticsScreen from '../screens/StatisticsScreen';
// import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      {/* <Stack.Screen name="StockList" component={StockListScreen} /> */}
      {/* <Stack.Screen name="StockDetail" component={StockDetailScreen} /> */}
      {/* <Stack.Screen name="Reception" component={ReceptionScreen} /> */}
      {/* <Stack.Screen name="Search" component={SearchScreen} /> */}
      {/* <Stack.Screen name="Statistics" component={StatisticsScreen} /> */}
      {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
    </Stack.Navigator>
  );
};

const AppContent = () => {
  const { user } = useAuth();

  return user ? <AppStack /> : <AuthNavigator />;
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <AppContent />
    </NavigationContainer>
  );
};

export default AppNavigator;
