import { lazy, Suspense } from 'react'
import MainLayout from '@/components/layouts/MainLayout'
import Auth from '@/pages/Auth'
import NotFound from '@/pages/NotFound'
import Loading from '@/components/ui/Loading'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Employees = lazy(() => import('@/pages/Organizations/Employees'))
const Organizations = lazy(() => import('@/pages/Organizations'))
const Organization = lazy(() => import('@/pages/Organizations/Organization'))
const Companies = lazy(() => import('@/pages/Organizations/Companies'))
const Positions = lazy(() => import('@/pages/Organizations/Positions'))
const Branches = lazy(() => import('@/pages/Organizations/Branches'))
const Departments = lazy(() => import('@/pages/Organizations/Departments'))
const Networks = lazy(() => import('@/pages/Networks'))
const Accounts = lazy(() => import('@/pages/Accounts'))
const ViettelEmployee = lazy(() => import('@/pages/Viettel/employee'))
const ViettelBranch = lazy(() => import('@/pages/Viettel/branch'))
const Permissions = lazy(() => import('@/pages/Permissions'))
const NotPermistion = lazy(() => import('@/pages/NotPermistion'))
const Profile = lazy(() => import('@/pages/Profile'))
const HostingVienThongACT = lazy(() => import('@/pages/Hosting/VienThongACT'))
const HostingACTES = lazy(() => import('@/pages/Hosting/ACTES'))
const HostingACTIDS = lazy(() => import('@/pages/Hosting/ACTIDS'))

const Login = lazy(() => import('@/pages/Auth/Login'))
const Register = lazy(() => import('@/pages/Auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/Auth/ForgotPassword'))

// Wrapper dùng chung
const WithSpinner = ({ children }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
)

const routes = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <WithSpinner>
            <Dashboard />
          </WithSpinner>
        )
      },
      {
        path: 'organizations',
        element: (
          <WithSpinner>
            <Organizations />
          </WithSpinner>
        ),
        children: [
          {
            path: 'companies',
            element: (
              <WithSpinner>
                <Companies />
              </WithSpinner>
            )
          },
          {
            path: 'positions',
            element: (
              <WithSpinner>
                <Positions />
              </WithSpinner>
            )
          },
          {
            path: 'employees',
            element: (
              <WithSpinner>
                <Employees />
              </WithSpinner>
            )
          },
          {
            path: 'branches',
            element: (
              <WithSpinner>
                <Branches />
              </WithSpinner>
            )
          },
          {
            path: 'organization',
            element: (
              <WithSpinner>
                <Organization />
              </WithSpinner>
            )
          },
          {
            path: 'departments',
            element: (
              <WithSpinner>
                <Departments />
              </WithSpinner>
            )
          }
        ]
      },
      {
        path: 'viettel-employees',
        element: (
          <WithSpinner>
            <ViettelEmployee />
          </WithSpinner>
        )
      },
      {
        path: 'viettel-branches',
        element: (
          <WithSpinner>
            <ViettelBranch />
          </WithSpinner>
        )
      },
      {
        path: 'network-management',
        element: (
          <WithSpinner>
            <Networks />
          </WithSpinner>
        )
      },
      {
        path: 'accounts',
        element: (
          <WithSpinner>
            <Accounts />
          </WithSpinner>
        )
      },
      {
        path: 'permissions',
        element: (
          <WithSpinner>
            <Permissions />
          </WithSpinner>
        )
      },
      {
        path: 'profile',
        element: (
          <WithSpinner>
            <Profile />
          </WithSpinner>
        )
      },
      {
        path: 'not-permission',
        element: (
          <WithSpinner>
            <NotPermistion />
          </WithSpinner>
        )
      },
      {
        path: 'hosting/vienthongact',
        element: (
          <WithSpinner>
            <HostingVienThongACT />
          </WithSpinner>
        )
      },
      {
        path: 'hosting/actes',
        element: (
          <WithSpinner>
            <HostingACTES />
          </WithSpinner>
        )
      },
      {
        path: 'hosting/actids',
        element: (
          <WithSpinner>
            <HostingACTIDS />
          </WithSpinner>
        )
      },

      { path: '*', element: <NotFound /> }
    ]
  },

  {
    path: '/auth',
    element: <Auth />,
    children: [
      {
        path: 'login',
        element: (
          <WithSpinner>
            <Login />
          </WithSpinner>
        )
      },
      {
        path: 'register',
        element: (
          <WithSpinner>
            <Register />
          </WithSpinner>
        )
      },
      {
        path: 'forgot-password',
        element: (
          <WithSpinner>
            <ForgotPassword />
          </WithSpinner>
        )
      },
      { path: '*', element: <NotFound /> }
    ]
  }
]

export default routes
