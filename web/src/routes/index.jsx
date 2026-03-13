import MainLayout from '@/components/layouts/MainLayout'
import { Navigate } from 'react-router-dom'

import Dashboard from '@/pages/Dashboard'
import Employees from '@/pages/Employees'
import NotFound from '@/pages/NotFound'

import Auth from '@/pages/Auth'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'

const routes = [
    {
        path: '/not-found',
        element: <NotFound />,
    },
    {
        path: '/',
        element: <MainLayout />,
        children: [
            { index: true, element: <Dashboard /> },
            { path: 'employees', element: <Employees /> },
            { path: '*', element: <Navigate to="/not-found" replace /> },
        ],
    },
    {
        path: '/auth',
        element: <Auth />,
        children: [
            { path: 'login', element: <Login /> },
            { path: 'register', element: <Register /> },
            { path: '*', element: <Navigate to="/not-found" replace /> },
        ],
    },
]

export default routes