import React from 'react';
import { createStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { selectUnreadCount } from '../store/notificationStore';
import NotificationBell from '../components/notifications/NotificationBell';
import NotificationsScreen from '../components/notifications/NotificationsScreen';
import DashboardScreen from '../screens/admin/DashboardScreen';
import UsersScreen from '../screens/admin/UsersScreen';
import DonorsScreen from '../screens/admin/DonorsScreen';
import RecipientsScreen from '../screens/admin/RecipientsScreen';
import HospitalsScreen from '../screens/admin/HospitalsScreen';
import BloodRequestsScreen from '../screens/admin/BloodRequestsScreen';
import VerificationScreen from '../screens/admin/VerificationScreen';
import AppSettingsScreen from '../screens/admin/AppSettingsScreen';
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

const AdminNavigator = () => {
  const options = useHeaderOptions();

  return (
    <Stack.Navigator screenOptions={options}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Admin' }} />
      <Stack.Screen name="Users" component={UsersScreen} options={{ title: 'Users' }} />
      <Stack.Screen name="Donors" component={DonorsScreen} options={{ title: 'Donors' }} />
      <Stack.Screen name="Recipients" component={RecipientsScreen} options={{ title: 'Recipients' }} />
      <Stack.Screen name="Hospitals" component={HospitalsScreen} options={{ title: 'Hospitals' }} />
      <Stack.Screen name="BloodRequests" component={BloodRequestsScreen} options={{ title: 'Blood requests' }} />
      <Stack.Screen name="Verification" component={VerificationScreen} options={{ title: 'Verifications' }} />
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} options={{ title: 'App settings' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
