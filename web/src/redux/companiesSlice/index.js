import { companiesAPI } from "@/api/companiesAPI";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// GET LIST
export const getCompanies = createAsyncThunk(
  "companies/getCompanies",
  async (_, { rejectWithValue }) => {
    try {
      const data = await companiesAPI.getLists();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// CREATE
export const createCompany = createAsyncThunk(
  "companies/createCompany",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await companiesAPI.create(payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// UPDATE
export const updateCompany = createAsyncThunk(
  "companies/updateCompany",
  async (payload , { rejectWithValue }) => {
    try {
      const data = await companiesAPI.update(payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// DELETE
export const deleteCompany = createAsyncThunk(
  "companies/deleteCompany",
  async (id, { rejectWithValue }) => {
    try {
      await companiesAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const companiesSlice = createSlice({
  name: "companies",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getCompanies.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE
      .addCase(createCompany.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      // UPDATE
      .addCase(updateCompany.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.COMPANY_ID === action.payload.COMPANY_ID
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // DELETE
      .addCase(deleteCompany.fulfilled, (state, action) => {
          state.items = state.items.filter(
          (item) => Number(item.COMPANY_ID) !== Number(action.payload)
        );
      });
  },
});

export const selectCompanies = (state) => state.companies.items || [];
export const selectLoading = (state) => state.companies.loading || false;

export default companiesSlice.reducer;