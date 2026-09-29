import React from 'react';
import { createStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { selectUnreadCount } from '../store/notificationStore';
import NotificationBell from '../components/notifications/NotificationBell';
import NotificationsScreen from '../components/notifications/NotificationsScreen';
import DashboardScreen from '../screens/hospital/DashboardScreen';
import RequestsScreen from '../screens/hospital/RequestsScreen';
import RequestDetailsScreen from '../screens/hospital/RequestDetailsScreen';
import QRScannerScreen from '../screens/hospital/QRScannerScreen';
import VerificationScreen from '../screens/hospital/VerificationScreen';
import VerificationResultScreen from '../screens/hospital/VerificationResultScreen';
import UpdateStatusScreen from '../screens/hospital/UpdateStatusScreen';
import { colors, typography } from '../theme';

const Stack = createStackNavigator();

const useHeaderOptions = () => {
  const unread = useSelector(selectUnreadCount);
  return {
    headerStyle: { backgroundColor: colors.background },
    headerTitleStyle: { ...typography.h4, color: colors.text },
    headerTintColor: colors.primary,
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.background },
    headerRight: () => <NotificationBell count={unread} />,
  };
};

const HospitalNavigator = () => {
  const options = useHeaderOptions();

  return (
    <Stack.Navigator screenOptions={options}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="Requests" component={RequestsScreen} options={{ title: 'Requests' }} />
      <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} options={{ title: 'Request details' }} />
      <Stack.Screen name="UpdateStatus" component={UpdateStatusScreen} options={{ title: 'Update status' }} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ title: 'Scan donor QR' }} />
      <Stack.Screen name="Verification" component={VerificationScreen} options={{ title: 'Verify donation' }} />
      <Stack.Screen name="VerificationResult" component={VerificationResultScreen} options={{ title: 'Result' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
};

export default HospitalNavigator;
