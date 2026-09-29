import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { restoreSession, selectRole } from '../store/authStore';
import { fetchUnreadCount } from '../store/notificationStore';
import AuthNavigator from './AuthNavigator';
import RecipientNavigator from './RecipientNavigator';
import DonorNavigator from './DonorNavigator';
import HospitalNavigator from './HospitalNavigator';
import AdminNavigator from './AdminNavigator';
import SplashScreen from '../screens/auth/SplashScreen';
import { ROLES } from '../utils/constants';
import { colors } from '../theme';

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.background, primary: colors.primary },
};

const NAVIGATORS = {
  [ROLES.RECIPIENT]: RecipientNavigator,
  [ROLES.DONOR]: DonorNavigator,
  [ROLES.HOSPITAL]: HospitalNavigator,
  [ROLES.ADMIN]: AdminNavigator,
};

const RootNavigator = () => {
  const dispatch = useDispatch();
  const role = useSelector(selectRole);
  const restoring = useSelector((state) => state.auth.restoring);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    if (role) dispatch(fetchUnreadCount());
  }, [dispatch, role]);

  if (restoring) return <SplashScreen />;

  const Navigator = NAVIGATORS[role];

  return (
    <NavigationContainer theme={navTheme}>
      {Navigator ? <Navigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
