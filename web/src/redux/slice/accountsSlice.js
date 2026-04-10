import { accountsAPI } from "@/api/accountsAPI";
import { CUSTOM_MESSAGES } from "@/utils/contants";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const getErrorMessage = (error, fallback = "Có lỗi xảy ra") => {
  return error?.response?.data?.message || error?.message || fallback;
};

// GET LIST
export const getAccounts = createAsyncThunk(
  "accounts/getAccounts",
  async (_, { rejectWithValue }) => {
    try {
      const data = await accountsAPI.getLists();
      return data.data || [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.get.error));
    }
  }
);

// CREATE
export const createAccount = createAsyncThunk(
  "accounts/createAccount",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await accountsAPI.create(payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.create.error));
    }
  }
);

// UPDATE
export const updateAccount = createAsyncThunk(
  "accounts/updateAccount",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await accountsAPI.update(payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.update.error));
    }
  }
);

// RESET PASSWORD
export const resetAccountPassword = createAsyncThunk(
  "accounts/resetPassword",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await accountsAPI.resetPassword(payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.update.error));
    }
  }
);

// DELETE
export const deleteAccount = createAsyncThunk(
  "accounts/deleteAccount",
  async (id, { rejectWithValue }) => {
    try {
      await accountsAPI.delete(id);
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
};

const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE
      .addCase(createAccount.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })

      // UPDATE
      .addCase(updateAccount.fulfilled, (state, action) => {
        if (!action.payload) return;
        const index = state.items.findIndex(
          (item) => item.ACCOUNT_ID === action.payload.ACCOUNT_ID
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // RESET PASSWORD - partial update
      .addCase(resetAccountPassword.fulfilled, (state, action) => {
        if (!action.payload) return;
        const index = state.items.findIndex(
          (item) => item.ACCOUNT_ID === action.payload.ACCOUNT_ID
        );
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })

      // DELETE
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => Number(item.ACCOUNT_ID) !== Number(action.payload)
        );
      });
  },
});

export const selectAccounts = (state) => state.accounts.items || [];
export const selectAccountsLoading = (state) => state.accounts.loading || false;

export default accountsSlice.reducer;
