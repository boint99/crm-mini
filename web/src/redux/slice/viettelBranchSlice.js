import { ViettelBranchAPI } from '@/api/ViettelBranchAPI'
import { CUSTOM_MESSAGES } from '@/utils/contants'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const getErrorMessage = (error, fallback = 'Có lỗi xảy ra') => {
  return error?.response?.data?.message || error?.message || fallback
}

// GET LIST
export const getBranches = createAsyncThunk(
  'viettelBranch/getBranches',
  async (_, { rejectWithValue }) => {
    try {
      const data = await ViettelBranchAPI.getLists()
      return data.data || []
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.get.error))
    }
  }
)

// CREATE
export const createBranch = createAsyncThunk(
  'viettelBranch/createBranch',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await ViettelBranchAPI.create(payload)
      return data.data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.create.error))
    }
  }
)

// UPDATE
export const updateBranch = createAsyncThunk(
  'viettelBranch/updateBranch',
  async (payload, { rejectWithValue }) => {
    try {
      const id = payload.id || payload.BRANCH_ID || payload.branchId
      await ViettelBranchAPI.update(id, payload)
      return payload
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, CUSTOM_MESSAGES.update.error))
    }
  }
)

// DELETE
export const deleteBranch = createAsyncThunk(
  'viettelBranch/deleteBranch',
  async (id, { rejectWithValue }) => {
    try {
      await ViettelBranchAPI.delete(id)
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

const viettelBranchSlice = createSlice({
  name: 'viettelBranch',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getBranches.pending, (state) => {
        state.loading = true
        state.error = null
        state.message = CUSTOM_MESSAGES.get.pending
      })
      .addCase(getBranches.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.message = CUSTOM_MESSAGES.get.success
      })
      .addCase(getBranches.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.message = action.payload || CUSTOM_MESSAGES.get.error
      })

      // CREATE
      .addCase(createBranch.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload)
        }
        state.message = CUSTOM_MESSAGES.create.success
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.error = action.payload
        state.message = action.payload || CUSTOM_MESSAGES.create.error
      })

      // UPDATE
      .addCase(updateBranch.fulfilled, (state, action) => {
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
      .addCase(updateBranch.rejected, (state, action) => {
        state.error = action.payload
        state.message = action.payload || CUSTOM_MESSAGES.update.error
      })

      // DELETE
      .addCase(deleteBranch.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.id !== action.payload
        )
        state.message = CUSTOM_MESSAGES.delete.success
      })
      .addCase(deleteBranch.rejected, (state, action) => {
        state.error = action.payload
        state.message = action.payload || CUSTOM_MESSAGES.delete.error
      })
  }
})

export const selectViettelBranches = (state) => state.viettelBranch.items || []
export const selectLoadingViettelBranch = (state) => state.viettelBranch.loading || false
export const selectViettelBranchMessage = (state) => state.viettelBranch.message || ''

export default viettelBranchSlice.reducer
