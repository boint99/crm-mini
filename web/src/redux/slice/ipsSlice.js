import { ipsAPI } from "@/api/ipsAPI";
import { CUSTOM_MESSAGES } from "@/utils/contants";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const getErrorMessage = (error, fallback = "Có lỗi xảy ra") => {
  return error?.response?.data?.message || error?.message || fallback;
};

export const getIps = createAsyncThunk(
  "ips/getIps",
  async (_, { rejectWithValue }) => {
    try {
      const data = await ipsAPI.getLists();
      return data.data || [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.get.error));
    }
  }
);

export const createIp = createAsyncThunk(
  "ips/createIp",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await ipsAPI.create(payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.create.error));
    }
  }
);

export const updateIp = createAsyncThunk(
  "ips/updateIp",
  async (payload, { rejectWithValue }) => {
    try {
      await ipsAPI.update(payload);
      return payload;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.update.error));
    }
  }
);

export const deleteIp = createAsyncThunk(
  "ips/deleteIp",
  async (id, { rejectWithValue }) => {
    try {
      await ipsAPI.delete(id);
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

const ipsSlice = createSlice({
  name: "ips",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getIps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIps.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getIps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createIp.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(createIp.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateIp.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (ip) => ip.IP_ID === action.payload.IP_ID
        );
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
      })
      .addCase(updateIp.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteIp.fulfilled, (state, action) => {
        state.items = state.items.filter((ip) => ip.IP_ID !== action.payload);
      })
      .addCase(deleteIp.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const selectIps = (state) => state.ips.items;
export const selectIpsLoading = (state) => state.ips.loading;
export default ipsSlice.reducer;
