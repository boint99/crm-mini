import { employeesAPI } from '@/api/employeesAPI'
import { CUSTOM_MESSAGES } from '@/utils/contants'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const getErrorMessage = (error, fallback = 'Có lỗi xảy ra') => {
  return error?.response?.data?.message || error?.message || fallback
}

// GET LIST
export const getEmployees = createAsyncThunk(
  'employees/getEmployees',
  async (params, { rejectWithValue }) => {
    try {
      const data = await employeesAPI.getLists(params)
      return data.data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.get.error))
    }
  }
)

// CREATE
export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await employeesAPI.create(payload)
      return data.data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.create.error))
    }
  }
)

// UPDATE
export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async (payload , { rejectWithValue }) => {
    try {
      const id = payload.id || payload.EMPLOYEE_ID || payload.employeeId
      await employeesAPI.update(id, payload)
      return payload
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.update.error))
    }
  }
)

// DELETE
export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (id, { rejectWithValue }) => {
    try {
      await employeesAPI.delete(id)
      return id
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.delete.error))
    }
  }
)

const initialState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  message: null
}

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getEmployees.pending, (state) => {
        state.loading = true
        state.error = null
        state.message = CUSTOM_MESSAGES.get.pending
      })
      .addCase(getEmployees.fulfilled, (state, action) => {
        state.loading = false
        const resData = action.payload
        if (Array.isArray(resData)) {
          state.items = resData
          state.total = resData.length
        } else {
          state.items = resData?.list || []
          state.total = resData?.total || 0
        }
        state.message = CUSTOM_MESSAGES.get.success
      })
      .addCase(getEmployees.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.message = action.payload || CUSTOM_MESSAGES.get.error
      })

      // CREATE
      .addCase(createEmployee.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload)
        }
        state.message = CUSTOM_MESSAGES.create.success
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.error = action.payload
        state.message = action.payload || CUSTOM_MESSAGES.create.error
      })

      // UPDATE
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        )
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload
          }
        }
        state.message = CUSTOM_MESSAGES.update.success
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.error = action.payload
        state.message = action.payload || CUSTOM_MESSAGES.update.error
      })

      // DELETE
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.id !== action.payload
        )
        state.message = CUSTOM_MESSAGES.delete.success
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.error = action.payload
        state.message = action.payload || CUSTOM_MESSAGES.delete.error
      })
  }
})

export const selectEmployees = (state) => state.employees.items || []
export const selectEmployeesTotal = (state) => state.employees.total || 0
export const selectLoading = (state) => state.employees.loading || false
export const selectEmployeeMessage = (state) => state.employees.message || ''

export default employeesSlice.reducer