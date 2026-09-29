import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import donorService from '../services/donorService';
import { getErrorMessage } from '../utils/helpers';

export const fetchDonorProfile = createAsyncThunk('donor/fetchProfile', async (_arg, { rejectWithValue }) => {
  try {
    return await donorService.getProfile();
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const setAvailability = createAsyncThunk('donor/setAvailability', async (isAvailable, { rejectWithValue }) => {
  try {
    return await donorService.setAvailability(isAvailable);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchMatchedRequests = createAsyncThunk('donor/fetchRequests', async (_arg, { rejectWithValue }) => {
  try {
    return await donorService.listMatchedRequests();
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const respondToRequest = createAsyncThunk('donor/respond', async ({ id, response }, { rejectWithValue }) => {
  try {
    return await donorService.respond(id, response);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const slice = createSlice({
  name: 'donor',
  initialState: {
    profile: null,
    requests: [],
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDonorProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(setAvailability.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(fetchMatchedRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatchedRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchMatchedRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(respondToRequest.pending, (state) => {
        state.submitting = true;
      })
      .addCase(respondToRequest.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.requests.findIndex((r) => r.requestId === action.payload.requestId);
        if (index !== -1) state.requests[index] = { ...state.requests[index], ...action.payload };
      })
      .addCase(respondToRequest.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = slice.actions;
export default slice.reducer;

export const selectDonorProfile = (state) => state.donor.profile;
export const selectIsAvailable = (state) => Boolean(state.donor.profile?.isAvailable);
export const selectMatchedRequests = (state) => state.donor.requests;
export const selectDonorLoading = (state) => state.donor.loading;
export const selectDonorSubmitting = (state) => state.donor.submitting;
export const selectDonorError = (state) => state.donor.error;
