import { employeesAPI } from "@/api/employeesAPI";
import { employeeMessages } from "@/utils/employeeMessages";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const getErrorMessage = (error, fallback = "Có lỗi xảy ra") => {
  return error?.response?.data?.message || error?.message || fallback;
};

// GET LIST
export const getEmployees = createAsyncThunk(
  "employees/getEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const data = await employeesAPI.getLists();
      return data.data || [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, employeeMessages.get.error));
    }
  }
);

// CREATE
export const createEmployee = createAsyncThunk(
  "employees/createEmployee",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await employeesAPI.create(payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, employeeMessages.create.error));
    }
  }
);

// UPDATE
export const updateEmployee = createAsyncThunk(
  "employees/updateEmployee",
  async (payload , { rejectWithValue }) => {
    try {
      await employeesAPI.update(payload);
      return payload;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, employeeMessages.update.error));
    }
  }
);

// DELETE
export const deleteEmployee = createAsyncThunk(
  "employees/deleteEmployee",
  async (id, { rejectWithValue }) => {
    try {
      await employeesAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, employeeMessages.delete.error));
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  message: null,
};

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = employeeMessages.get.pending;
      })
      .addCase(getEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.message = employeeMessages.get.success;
      })
      .addCase(getEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload || employeeMessages.get.error;
      })

      // CREATE
      .addCase(createEmployee.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
        state.message = employeeMessages.create.success;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.error = action.payload;
        state.message = action.payload || employeeMessages.create.error;
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
        state.message = employeeMessages.update.success;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.error = action.payload;
        state.message = action.payload || employeeMessages.update.error;
      })

      // DELETE
      .addCase(deleteEmployee.fulfilled, (state, action) => {
          state.items = state.items.filter(
          (item) => Number(item.EMPLOYEE_ID) !== Number(action.payload)
        );
        state.message = employeeMessages.delete.success;
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.error = action.payload;
        state.message = action.payload || employeeMessages.delete.error;
      });
  },
});

export const selectEmployees = (state) => state.employees.items || [];
export const selectLoading = (state) => state.employees.loading || false;
export const selectEmployeeMessage = (state) => state.employees.message || "";

export default employeesSlice.reducer;