import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

// Initial state
const initialState = {
  gigs: [],
  loading: false,
  error: null,
  total: 0,
  creating: false,
  createError: null,
};

// Async thunks
export const fetchOpenGigs = createAsyncThunk(
  'gigs/fetchOpenGigs',
  async (searchQuery = '', { rejectWithValue }) => {
    try {
      const params = searchQuery ? { search: searchQuery } : {};
      const response = await axiosInstance.get('/api/gigs', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to fetch gigs. Please try again.'
      );
    }
  }
);

export const createGig = createAsyncThunk(
  'gigs/createGig',
  async ({ title, description, budget }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/gigs', {
        title,
        description,
        budget,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to create gig. Please try again.'
      );
    }
  }
);

// Slice
const gigsSlice = createSlice({
  name: 'gigs',
  initialState,
  reducers: {
    clearGigsError: (state) => {
      state.error = null;
      state.createError = null;
    },
    addGig: (state, action) => {
      state.gigs.unshift(action.payload);
      state.total += 1;
    },
    updateGig: (state, action) => {
      const index = state.gigs.findIndex(
        (gig) => gig._id === action.payload._id
      );
      if (index !== -1) {
        state.gigs[index] = action.payload;
      }
    },
    removeGig: (state, action) => {
      state.gigs = state.gigs.filter((gig) => gig._id !== action.payload);
      state.total -= 1;
    },
  },
  extraReducers: (builder) => {
    // Fetch Open Gigs
    builder
      .addCase(fetchOpenGigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOpenGigs.fulfilled, (state, action) => {
        state.loading = false;
        state.gigs = action.payload.gigs || [];
        state.total = action.payload.total || 0;
        state.error = null;
      })
      .addCase(fetchOpenGigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Gig
    builder
      .addCase(createGig.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.creating = false;
        state.gigs.unshift(action.payload.gig);
        state.total += 1;
        state.createError = null;
      })
      .addCase(createGig.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload;
      });
  },
});

export const { clearGigsError, addGig, updateGig, removeGig } = gigsSlice.actions;
export default gigsSlice.reducer;
