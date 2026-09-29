import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';
import { tokenStore } from '../services/api';
import { STORAGE_KEYS } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';

export const restoreSession = createAsyncThunk('auth/restore', async () => {
  const token = await tokenStore.get();
  if (!token) return null;
  try {
    return await authService.me();
  } catch {
    await tokenStore.clear();
    return null;
  }
});

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const data = await authService.login(payload);
    await tokenStore.set(data.token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    return data.user;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Could not sign in'));
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const data = await authService.register(payload);
    await tokenStore.set(data.token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    return data.user;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Could not create the account'));
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await tokenStore.clear();
  await AsyncStorage.removeItem(STORAGE_KEYS.USER);
});

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: false, restoring: true, error: null },
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.restoring = false;
        state.user = action.payload?.user ?? null;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.restoring = false;
        state.user = null;
      });
    [login, register].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.loading = false;
          state.user = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    });
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
      });
  },
});

export const { clearError } = slice.actions;
export default slice.reducer;

export const selectUser = (state) => state.auth.user;
export const selectRole = (state) => state.auth.user?.role ?? null;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
