import { EmployeeViettelAPI } from "@/api/EmployeeViettelAPI";
import { CUSTOM_MESSAGES } from "@/utils/contants";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const getErrorMessage = (error, fallback = "Có lỗi xảy ra") => {
  return error?.response?.data?.message || error?.message || fallback;
};

// GET LIST
export const getEmployees = createAsyncThunk(
  "employeesViettel/getEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const data = await EmployeeViettelAPI.getLists();
      return data.data || [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.get.error));
    }
  }
);

// CREATE
export const createEmployee = createAsyncThunk(
  "employeesViettel/createEmployee",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await EmployeeViettelAPI.create(payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.create.error));
    }
  }
);

// UPDATE
export const updateEmployee = createAsyncThunk(
  "employeesViettel/updateEmployee",
  async (payload , { rejectWithValue }) => {
    try {
      await EmployeeViettelAPI.update(payload);
      return payload;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.update.error));
    }
  }
);

// DELETE
export const deleteEmployee = createAsyncThunk(
  "employeesViettel/deleteEmployee",
  async (id, { rejectWithValue }) => {
    try {
      await EmployeeViettelAPI.delete(id);
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

const employeesViettelSlice = createSlice({
  name: "employeesViettel",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = CUSTOM_MESSAGES.get.pending;
      })
      .addCase(getEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.message = CUSTOM_MESSAGES.get.success;
      })
      .addCase(getEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload || CUSTOM_MESSAGES.get.error;
      })

      // CREATE
      .addCase(createEmployee.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
        state.message = CUSTOM_MESSAGES.create.success;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.error = action.payload;
        state.message = action.payload || CUSTOM_MESSAGES.create.error;
      })

      // UPDATE
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.EMPLOYEE_ID === action.payload.EMPLOYEE_ID
        );
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload,
          };
        }
        state.message = CUSTOM_MESSAGES.update.success;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.error = action.payload;
        state.message = action.payload || CUSTOM_MESSAGES.update.error;
      })

      // DELETE
      .addCase(deleteEmployee.fulfilled, (state, action) => {
          state.items = state.items.filter(
          (item) => Number(item.EMPLOYEE_ID) !== Number(action.payload)
        );
        state.message = CUSTOM_MESSAGES.delete.success;
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.error = action.payload;
        state.message = action.payload || CUSTOM_MESSAGES.delete.error;
      });
  },
});

export const selectEmployeesViettel = (state) => state.employeesViettel.items || [];
export const selectLoadingViettel = (state) => state.employeesViettel.loading || false;
export const selectEmployeeViettelMessage = (state) => state.employeesViettel.message || "";

export default employeesViettelSlice.reducer;