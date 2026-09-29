import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import notificationService from '../services/notificationService';
import { getErrorMessage } from '../utils/helpers';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_arg, { rejectWithValue }) => {
  try {
    return await notificationService.list();
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchUnreadCount = createAsyncThunk('notifications/unreadCount', async () =>
  notificationService.unreadCount().then((d) => d.count)
);

export const markRead = createAsyncThunk('notifications/markRead', async (id) => {
  await notificationService.markRead(id);
  return id;
});

export const markAllRead = createAsyncThunk('notifications/markAll', async () => {
  await notificationService.markAllRead();
  return true;
});

const slice = createSlice({
  name: 'notifications',
  initialState: { items: [], unread: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unread = action.payload;
      })
      .addCase(markRead.fulfilled, (state, action) => {
        const item = state.items.find((n) => n.id === action.payload);
        if (item && !item.isRead) {
          item.isRead = true;
          state.unread = Math.max(0, state.unread - 1);
        }
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.items.forEach((n) => {
          n.isRead = true;
        });
        state.unread = 0;
      });
  },
});

export default slice.reducer;

export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unread;
export const selectNotificationsLoading = (state) => state.notifications.loading;
