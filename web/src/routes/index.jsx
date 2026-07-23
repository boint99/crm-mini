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
const ApiDocs = lazy(() => import('@/pages/ApiDocs'))

const Login = lazy(() => import('@/pages/Auth/Login'))
const Register = lazy(() => import('@/pages/Auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/Auth/ForgotPassword'))

// Helper Suspense wrapper
const withSuspense = (children) => (
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
        element: withSuspense(<Dashboard />)
      },
      {
        path: 'organizations',
        element: withSuspense(<Organizations />),
        children: [
          {
            path: 'companies',
            element: withSuspense(<Companies />)
          },
          {
            path: 'positions',
            element: withSuspense(<Positions />)
          },
          {
            path: 'employees',
            element: withSuspense(<Employees />)
          },
          {
            path: 'branches',
            element: withSuspense(<Branches />)
          },
          {
            path: 'organization',
            element: withSuspense(<Organization />)
          },
          {
            path: 'departments',
            element: withSuspense(<Departments />)
          }
        ]
      },
      {
        path: 'viettel-employees',
        element: withSuspense(<ViettelEmployee />)
      },
      {
        path: 'viettel-branches',
        element: withSuspense(<ViettelBranch />)
      },
      {
        path: 'network-management',
        element: withSuspense(<Networks />)
      },
      {
        path: 'accounts',
        element: withSuspense(<Accounts />)
      },
      {
        path: 'permissions',
        element: withSuspense(<Permissions />)
      },
      {
        path: 'profile',
        element: withSuspense(<Profile />)
      },
      {
        path: 'not-permission',
        element: withSuspense(<NotPermistion />)
      },
      {
        path: 'hosting/vienthongact',
        element: withSuspense(<HostingVienThongACT />)
      },
      {
        path: 'hosting/actes',
        element: withSuspense(<HostingACTES />)
      },
      {
        path: 'hosting/actids',
        element: withSuspense(<HostingACTIDS />)
      },
      {
        path: 'api-docs',
        element: withSuspense(<ApiDocs />)
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
        element: withSuspense(<Login />)
      },
      {
        path: 'register',
        element: withSuspense(<Register />)
      },
      {
        path: 'forgot-password',
        element: withSuspense(<ForgotPassword />)
      },
      { path: '*', element: <NotFound /> }
    ]
  }
]

export default routes
