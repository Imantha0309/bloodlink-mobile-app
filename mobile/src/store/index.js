import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authStore';
import recipientReducer from './recipientStore';
import donorReducer from './donorStore';
import notificationReducer from './notificationStore';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipient: recipientReducer,
    donor: donorReducer,
    notifications: notificationReducer,
  },
});

export default store;
