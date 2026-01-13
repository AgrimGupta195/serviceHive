import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

// Initial state
const initialState = {
  bids: {},
  loading: false,
  error: null,
  submitting: false,
  submitError: null,
  hiring: false,
  hireError: null,
};

// Async thunks
export const fetchBidsForGig = createAsyncThunk(
  'bids/fetchBidsForGig',
  async (gigId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/bids/${gigId}`);
      return { gigId, bids: response.data.bids || [] };
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to fetch bids. Please try again.'
      );
    }
  }
);

export const submitBid = createAsyncThunk(
  'bids/submitBid',
  async ({ price, message, gigId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/bids', {
        price,
        message,
        gigId,
      });
      return { gigId, bid: response.data.bid };
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to submit bid. Please try again.'
      );
    }
  }
);

export const hireBid = createAsyncThunk(
  'bids/hireBid',
  async (bidId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/api/bids/${bidId}/hire`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to hire bid. Please try again.'
      );
    }
  }
);

// Slice
const bidsSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    clearBidsError: (state) => {
      state.error = null;
      state.submitError = null;
      state.hireError = null;
    },
    addBidToGig: (state, action) => {
      const { gigId, bid } = action.payload;
      if (!state.bids[gigId]) {
        state.bids[gigId] = [];
      }
      state.bids[gigId].unshift(bid);
    },
    updateBid: (state, action) => {
      const { gigId, bid } = action.payload;
      if (state.bids[gigId]) {
        const index = state.bids[gigId].findIndex((b) => b._id === bid._id);
        if (index !== -1) {
          state.bids[gigId][index] = bid;
        }
      }
    },
    clearBidsForGig: (state, action) => {
      delete state.bids[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBidsForGig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBidsForGig.fulfilled, (state, action) => {
        state.loading = false;
        const { gigId, bids } = action.payload;
        state.bids[gigId] = bids;
        state.error = null;
      })
      .addCase(fetchBidsForGig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Submit Bid
    builder
      .addCase(submitBid.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(submitBid.fulfilled, (state, action) => {
        state.submitting = false;
        const { gigId, bid } = action.payload;
        if (!state.bids[gigId]) {
          state.bids[gigId] = [];
        }
        state.bids[gigId].unshift(bid);
        state.submitError = null;
      })
      .addCase(submitBid.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      });

    // Hire Bid
    builder
      .addCase(hireBid.pending, (state) => {
        state.hiring = true;
        state.hireError = null;
      })
      .addCase(hireBid.fulfilled, (state, action) => {
        state.hiring = false;
        const { bid, gig } = action.payload;
        const gigId = gig._id || bid.gigId;
        
        // Update the bid status
        if (state.bids[gigId]) {
          const bidIndex = state.bids[gigId].findIndex((b) => b._id === bid._id);
          if (bidIndex !== -1) {
            state.bids[gigId][bidIndex] = bid;
          }
          
          // Update other bids to rejected
          state.bids[gigId] = state.bids[gigId].map((b) =>
            b._id !== bid._id ? { ...b, status: 'rejected' } : b
          );
        }
        
        state.hireError = null;
      })
      .addCase(hireBid.rejected, (state, action) => {
        state.hiring = false;
        state.hireError = action.payload;
      });
  },
});

export const { clearBidsError, addBidToGig, updateBid, clearBidsForGig } =
  bidsSlice.actions;
export default bidsSlice.reducer;
