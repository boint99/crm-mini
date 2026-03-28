
import { divisionsAPI } from "@/api/divisionsAPI";
import { CUSTOM_MESSAGES } from "@/utils/contants";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const getErrorMessage = (error, fallback = "Có lỗi xảy ra") => {
  return error?.response?.data?.message || error?.message || fallback;
};

// GET LIST
export const getDivisions = createAsyncThunk(
  "divisions/getDivisions",
  async (_, { rejectWithValue }) => {
    try {
      const data = await divisionsAPI.getLists();
      return data.data || [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.get.error));
    }
  }
);

// CREATE
export const createDivision = createAsyncThunk(
  "divisions/createDivision",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await divisionsAPI.create(payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.create.error));
    }
  }
);

// UPDATE
export const updateDivision = createAsyncThunk(
  "divisions/updateDivision",
  async (payload , { rejectWithValue }) => {
    try {
      await divisionsAPI.update(payload);
      return payload;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.update.error));
    }
  }
);

// DELETE
export const deleteDivision = createAsyncThunk(
  "divisions/deleteDivision",
  async (id, { rejectWithValue }) => {
    try {
      await divisionsAPI.delete(id);
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

const divisionsSlice = createSlice({
  name: "divisions",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getDivisions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = CUSTOM_MESSAGES.get.pending;
      })
      .addCase(getDivisions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.message = CUSTOM_MESSAGES.get.success;
      })
      .addCase(getDivisions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload || CUSTOM_MESSAGES.get.error;
      })

      // CREATE
      .addCase(createDivision.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
        state.message = CUSTOM_MESSAGES.create.success;
      })
      .addCase(createDivision.rejected, (state, action) => {
        state.error = action.payload;
        state.message = action.payload || CUSTOM_MESSAGES.create.error;
      })

      // UPDATE
      .addCase(updateDivision.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.DIVISION_ID === action.payload.DIVISION_ID
        );
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload,
          };
        }
        state.message = CUSTOM_MESSAGES.update.success;
      })
      .addCase(updateDivision.rejected, (state, action) => {
        state.error = action.payload;
        state.message = action.payload || CUSTOM_MESSAGES.update.error;
      })

      // DELETE
      .addCase(deleteDivision.fulfilled, (state, action) => {
          state.items = state.items.filter(
          (item) => Number(item.DIVISION_ID) !== Number(action.payload)
        );
        state.message = CUSTOM_MESSAGES.delete.success;
      })
      .addCase(deleteDivision.rejected, (state, action) => {
        state.error = action.payload;
        state.message = action.payload || CUSTOM_MESSAGES.delete.error;
      });
  },
});

export const selectDivisions = (state) => state.divisions.items || [];
export const selectLoading = (state) => state.divisions.loading || false;
export const selectDivisionMessage = (state) => state.divisions.message || "";

export default divisionsSlice.reducer;