// Helper to use navigate outside of React components (e.g., in axios interceptors)
// Usage: import { navigateTo } from '@/utils/navigateHelper'

let navigateRef = null

export const setNavigate = (navigateFn) => {
  navigateRef = navigateFn
}

export const navigateTo = (path, options) => {
  if (navigateRef) {
    navigateRef(path, options)
  } else {
    // Fallback nếu chưa set navigate (không nên xảy ra)
    console.warn('navigateRef chưa được set, fallback về window.location')
    window.location.href = path
  }
}
