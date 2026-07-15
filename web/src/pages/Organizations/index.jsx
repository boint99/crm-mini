import { Outlet, Navigate, useLocation } from 'react-router-dom'

const Organizations = () => {
  const location = useLocation()

  if (location.pathname === '/organizations' || location.pathname === '/organizations/') {
    return <Navigate to="/organizations/organization" replace />
  }

  return (
    <Outlet />
  )
}
export default Organizations