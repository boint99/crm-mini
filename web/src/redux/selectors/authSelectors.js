export const selectUser = (state) => state.auth.user

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated

export const selectIsAuthLoading = (state) => state.auth.isLoading

export const selectAuthError = (state) => state.auth.error
