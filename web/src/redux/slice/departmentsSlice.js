import { departmentsAPI } from '@/api/departmentsAPI'
import { CUSTOM_MESSAGES } from '@/utils/contants'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const getErrorMessage = (error, fallback = 'Có lỗi xảy ra') => {
  return error?.response?.data?.message || error?.message || fallback
}

// GET LIST
export const getDepartments = createAsyncThunk(
  'departments/getDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const data = await departmentsAPI.getLists()
      return data.data || []
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.get.error))
    }
  }
)

// CREATE
export const createDepartment = createAsyncThunk(
  'departments/createDepartment',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await departmentsAPI.create(payload)
      return data.data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.create.error))
    }
  }
)

// UPDATE
export const updateDepartment = createAsyncThunk(
  'departments/updateDepartment',
  async (payload, { rejectWithValue }) => {
    try {
      await departmentsAPI.update(payload)
      return payload
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.update.error))
    }
  }
)

// DELETE
export const deleteDepartment = createAsyncThunk(
  'departments/deleteDepartment',
  async (id, { rejectWithValue }) => {
    try {
      await departmentsAPI.delete(id)
      return id
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.delete.error))
    }
  }
)

const initialState = {
  items: [],
  loading: false,
  error: null,
  message: null
}

const departmentsSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getDepartments.pending, (state) => {
        state.loading = true
        state.error = null
        state.message = CUSTOM_MESSAGES.get.pending
      })
      .addCase(getDepartments.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.message = CUSTOM_MESSAGES.get.success
      })
      .addCase(getDepartments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.message = action.payload || CUSTOM_MESSAGES.get.error
      })

      // CREATE
      .addCase(createDepartment.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload)
        }
        state.message = CUSTOM_MESSAGES.create.success
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.error = action.payload
        state.message = action.payload || CUSTOM_MESSAGES.create.error
      })

      // UPDATE
      .addCase(updateDepartment.fulfilled, (state, action) => {
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
      .addCase(updateDepartment.rejected, (state, action) => {
        state.error = action.payload
        state.message = action.payload || CUSTOM_MESSAGES.update.error
      })

      // DELETE
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.id !== action.payload
        )
        state.message = CUSTOM_MESSAGES.delete.success
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.error = action.payload
        state.message = action.payload || CUSTOM_MESSAGES.delete.error
      })
  }
})

export const selectDepartments = (state) => state.departments.items || []
export const selectLoadingDepartments = (state) => state.departments.loading || false
export const selectDepartmentMessage = (state) => state.departments.message || ''

export default departmentsSlice.reducer
