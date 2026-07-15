import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './index.css'
import AppRouter from '@/routes/AppRoutes'
import { setNavigate } from '@/utils/navigateHelper'

// Component đăng ký navigate function vào helper để dùng ngoài React tree
function NavigateSetter() {
  const navigate = useNavigate()

  useEffect(() => {
    setNavigate(navigate)
  }, [navigate])

  return null
}

function App() {

  return (
    <>
      <NavigateSetter />
      <AppRouter />
    </>
  )
}

export default App
