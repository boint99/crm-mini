import { vlansAPI } from "@/api/vlansAPI";
import { CUSTOM_MESSAGES } from "@/utils/contants";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const getErrorMessage = (error, fallback = "Có lỗi xảy ra") => {
  return error?.response?.data?.message || error?.message || fallback;
};

export const getVlans = createAsyncThunk(
  "vlans/getVlans",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await vlansAPI.getLists(params);
      return data.data || [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.get.error));
    }
  }
);

export const createVlan = createAsyncThunk(
  "vlans/createVlan",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await vlansAPI.create(payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.create.error));
    }
  }
);

export const updateVlan = createAsyncThunk(
  "vlans/updateVlan",
  async (payload, { rejectWithValue }) => {
    try {
      await vlansAPI.update(payload);
      return payload;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.update.error));
    }
  }
);

export const deleteVlan = createAsyncThunk(
  "vlans/deleteVlan",
  async (id, { rejectWithValue }) => {
    try {
      await vlansAPI.delete(id);
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

const vlansSlice = createSlice({
  name: "vlans",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getVlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVlans.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getVlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createVlan.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(createVlan.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateVlan.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (v) => v.VLAN_ID === action.payload.VLAN_ID
        );
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
      })
      .addCase(updateVlan.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteVlan.fulfilled, (state, action) => {
        state.items = state.items.filter((v) => v.VLAN_ID !== action.payload);
      })
      .addCase(deleteVlan.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const selectVlans = (state) => state.vlans.items;
export const selectVlansLoading = (state) => state.vlans.loading;
export default vlansSlice.reducer;
