
import { branchesAPI } from "@/api/branchesAPI";
import { CUSTOM_MESSAGES } from "@/utils/contants";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const getErrorMessage = (error, fallback = "Có lỗi xảy ra") => {
  return error?.response?.data?.message || error?.message || fallback;
};

// GET LIST
export const getBranches = createAsyncThunk(
  "branches/getBranches",
  async (_, { rejectWithValue }) => {
    try {
      const data = await branchesAPI.getLists();
      return data.data || [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.get.error));
    }
  }
);

// CREATE
export const createBranch = createAsyncThunk(
  "branches/createBranch",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await branchesAPI.create(payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.create.error));
    }
  }
);

// UPDATE
export const updateBranch = createAsyncThunk(
  "branches/updateBranch",
  async (payload , { rejectWithValue }) => {
    try {
      await branchesAPI.update(payload);
      return payload;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.update.error));
    }
  }
);

// DELETE
export const deleteBranch = createAsyncThunk(
  "branches/deleteBranch",
  async (id, { rejectWithValue }) => {
    try {
      await branchesAPI.delete(id);
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

const branchesSlice = createSlice({
  name: "branches",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = CUSTOM_MESSAGES.get.pending;
      })
      .addCase(getBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.message = CUSTOM_MESSAGES.get.success;
      })
      .addCase(getBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload || CUSTOM_MESSAGES.get.error;
      })

      // CREATE
      .addCase(createBranch.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
        state.message = CUSTOM_MESSAGES.create.success;
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.error = action.payload;
        state.message = action.payload || CUSTOM_MESSAGES.create.error;
      })

      // UPDATE
      .addCase(updateBranch.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.BRANCH_ID === action.payload.BRANCH_ID
        );
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload,
          };
        }
        state.message = CUSTOM_MESSAGES.update.success;
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.error = action.payload;
        state.message = action.payload || CUSTOM_MESSAGES.update.error;
      })

      // DELETE
      .addCase(deleteBranch.fulfilled, (state, action) => {
          state.items = state.items.filter(
          (item) => Number(item.BRANCH_ID) !== Number(action.payload)
        );
        state.message = CUSTOM_MESSAGES.delete.success;
      })
      .addCase(deleteBranch.rejected, (state, action) => {
        state.error = action.payload;
        state.message = action.payload || CUSTOM_MESSAGES.delete.error;
      });
  },
});

export const selectBranches = (state) => state.branches.items || [];
export const selectLoading = (state) => state.branches.loading || false;
export const selectBranchMessage = (state) => state.branches.message || "";

export default branchesSlice.reducer;