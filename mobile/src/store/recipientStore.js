import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import recipientService from '../services/recipientService';
import { getErrorMessage } from '../utils/helpers';

export const fetchRequests = createAsyncThunk('recipient/fetchRequests', async (_arg, { rejectWithValue }) => {
  try {
    const res = await recipientService.listRequests();
    return res;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const createRequest = createAsyncThunk('recipient/createRequest', async (payload, { rejectWithValue }) => {
  try {
    return await recipientService.createRequest(payload);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchRequestDetail = createAsyncThunk('recipient/fetchDetail', async (id, { rejectWithValue }) => {
  try {
    const { request, acceptedDonors } = await recipientService.getRequestStatus(id);
    return { request, acceptedDonors };
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const cancelRequest = createAsyncThunk('recipient/cancel', async (id, { rejectWithValue }) => {
  try {
    return await recipientService.cancelRequest(id);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const slice = createSlice({
  name: 'recipient',
  initialState: { requests: [], total: 0, current: null, acceptedDonors: [], loading: false, submitting: false, error: null },
  reducers: {
    clearCurrent(state) {
      state.current = null;
      state.acceptedDonors = [];
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.data;
        state.total = action.payload.meta.total;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createRequest.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.submitting = false;
        state.requests.unshift(action.payload.request);
        state.total += 1;
      })
      .addCase(createRequest.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(fetchRequestDetail.fulfilled, (state, action) => {
        state.current = action.payload.request;
        state.acceptedDonors = action.payload.acceptedDonors;
      })
      .addCase(cancelRequest.fulfilled, (state, action) => {
        const index = state.requests.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) state.requests[index] = action.payload;
        if (state.current?.id === action.payload.id) state.current = action.payload;
      });
  },
});

export const { clearCurrent, clearError } = slice.actions;
export default slice.reducer;

export const selectRequests = (state) => state.recipient.requests;
export const selectCurrentRequest = (state) => state.recipient.current;
export const selectAcceptedDonors = (state) => state.recipient.acceptedDonors;
export const selectRecipientLoading = (state) => state.recipient.loading;
export const selectRecipientSubmitting = (state) => state.recipient.submitting;
export const selectRecipientError = (state) => state.recipient.error;
