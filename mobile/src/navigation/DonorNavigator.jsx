import React from 'react';
import { createStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { selectUnreadCount } from '../store/notificationStore';
import NotificationBell from '../components/notifications/NotificationBell';
import NotificationsScreen from '../components/notifications/NotificationsScreen';
import HomeScreen from '../screens/donor/HomeScreen';
import AvailabilityScreen from '../screens/donor/AvailabilityScreen';
import NotificationsFeed from '../screens/donor/NotificationsScreen';
import RequestDetailsScreen from '../screens/donor/RequestDetailsScreen';
import ResponseScreen from '../screens/donor/ResponseScreen';
import ProfileScreen from '../screens/donor/ProfileScreen';
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

const DonorNavigator = () => {
  const options = useHeaderOptions();

  return (
    <Stack.Navigator screenOptions={options}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Donor home' }} />
      <Stack.Screen name="Availability" component={AvailabilityScreen} options={{ title: 'Availability' }} />
      <Stack.Screen name="Requests" component={NotificationsFeed} options={{ title: 'Requests' }} />
      <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} options={{ title: 'Request details' }} />
      <Stack.Screen name="Response" component={ResponseScreen} options={{ title: 'Respond' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
};

export default DonorNavigator;
