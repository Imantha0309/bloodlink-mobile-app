import React from 'react';
import { createStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { selectUnreadCount } from '../store/notificationStore';
import NotificationBell from '../components/notifications/NotificationBell';
import NotificationsScreen from '../components/notifications/NotificationsScreen';
import HomeScreen from '../screens/recipient/HomeScreen';
import EmergencyRequestScreen from '../screens/recipient/EmergencyRequestScreen';
import BloodGroupScreen from '../screens/recipient/BloodGroupScreen';
import LocationScreen from '../screens/recipient/LocationScreen';
import MatchingDonorsScreen from '../screens/recipient/MatchingDonorsScreen';
import ReviewRequestScreen from '../screens/recipient/ReviewRequestScreen';
import RequestHistoryScreen from '../screens/recipient/RequestHistoryScreen';
import RequestStatusScreen from '../screens/recipient/RequestStatusScreen';
import ProfileScreen from '../screens/recipient/ProfileScreen';
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

const RecipientNavigator = () => {
  const options = useHeaderOptions();

  return (
    <Stack.Navigator screenOptions={options}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Bloodlink' }} />
      <Stack.Screen name="EmergencyRequest" component={EmergencyRequestScreen} options={{ title: 'New emergency request' }} />
      <Stack.Screen name="ReviewRequest" component={ReviewRequestScreen} options={{ title: 'Review request' }} />
      <Stack.Screen name="MatchingDonors" component={MatchingDonorsScreen} options={{ title: 'Matching donors' }} />
      <Stack.Screen name="RequestStatus" component={RequestStatusScreen} options={{ title: 'Request status' }} />
      <Stack.Screen name="RequestHistory" component={RequestHistoryScreen} options={{ title: 'Request history' }} />
      <Stack.Screen name="BloodGroup" component={BloodGroupScreen} options={{ title: 'Blood group' }} />
      <Stack.Screen name="Location" component={LocationScreen} options={{ title: 'Location' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
};

export default RecipientNavigator;
