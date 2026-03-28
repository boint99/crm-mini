
import { positionsAPI } from "@/api/positionsAPI";
import { CUSTOM_MESSAGES } from "@/utils/contants";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const getErrorMessage = (error, fallback = "Có lỗi xảy ra") => {
  return error?.response?.data?.message || error?.message || fallback;
};

// GET LIST
export const getPositions = createAsyncThunk(
  "positions/getPositions",
  async (_, { rejectWithValue }) => {
    try {
      const data = await positionsAPI.getLists();
      return data.data || [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.get.error));
    }
  }
);

// CREATE
export const createPosition = createAsyncThunk(
  "positions/createPosition",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await positionsAPI.create(payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.create.error));
    }
  }
);

// UPDATE
export const updatePosition = createAsyncThunk(
  "positions/updatePosition",
  async (payload , { rejectWithValue }) => {
    try {
      await positionsAPI.update(payload);
      return payload;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.update.error));
    }
  }
);

// DELETE
export const deletePosition = createAsyncThunk(
  "positions/deletePosition",
  async (id, { rejectWithValue }) => {
    try {
      await positionsAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.delete.error));
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  message: null,
};

const positionsSlice = createSlice({
  name: "positions",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getPositions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = CUSTOM_MESSAGES.get.pending;
      })
      .addCase(getPositions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.message = CUSTOM_MESSAGES.get.success;
      })
      .addCase(getPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload || CUSTOM_MESSAGES.get.error;
      })

      // CREATE
      .addCase(createPosition.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
        state.message = CUSTOM_MESSAGES.create.success;
      })
      .addCase(createPosition.rejected, (state, action) => {
        state.error = action.payload;
        state.message = action.payload || CUSTOM_MESSAGES.create.error;
      })

      // UPDATE
      .addCase(updatePosition.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.POSITION_ID === action.payload.POSITION_ID
        );
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload,
          };
        }
        state.message = CUSTOM_MESSAGES.update.success;
      })
      .addCase(updatePosition.rejected, (state, action) => {
        state.error = action.payload;
        state.message = action.payload || CUSTOM_MESSAGES.update.error;
      })

      // DELETE
      .addCase(deletePosition.fulfilled, (state, action) => {
          state.items = state.items.filter(
          (item) => Number(item.POSITION_ID) !== Number(action.payload)
        );
        state.message = CUSTOM_MESSAGES.delete.success;
      })
      .addCase(deletePosition.rejected, (state, action) => {
        state.error = action.payload;
        state.message = action.payload || CUSTOM_MESSAGES.delete.error;
      });
  },
});

export const selectPositions = (state) => state.positions.items || [];
export const selectLoading = (state) => state.positions.loading || false;
export const selectPositionMessage = (state) => state.positions.message || "";

export default positionsSlice.reducer;