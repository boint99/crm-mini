import { lazy, Suspense } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import Loading from "@/components/ui/Loading";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Employees = lazy(() => import("@/pages/Employees"));
const Organization = lazy(() => import('@/pages/Organization'))
const Companies = lazy(() => import("@/pages/Organization/Companies"));
const Divisions = lazy(() => import("@/pages/Organization/Divisions"));
const Positions = lazy(() => import("@/pages/Organization/Positions"));

const Login = lazy(() => import("@/pages/Auth/Login"));
const Register = lazy(() => import("@/pages/Auth/Register"));

// Wrapper dùng chung
const WithSpinner = ({ children }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
);

const routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <WithSpinner>
            <Dashboard />
          </WithSpinner>
        ),
      },
      {
        path: "organization",
        element: (
          <WithSpinner>
            <Organization />
          </WithSpinner>
        ),
        children: [
          {
            path: "companies",
            element: (
              <WithSpinner>
                <Companies />
              </WithSpinner>
            ),
          },
          {
            path: "divisions",
            element: (
              <WithSpinner>
                <Divisions />
              </WithSpinner>
            ),
          },
          {
            path: "positions",
            element: (
              <WithSpinner>
                <Positions />
              </WithSpinner>
            ),
          },
          {
            path: "employees",
            element: (
              <WithSpinner>
                <Employees />
              </WithSpinner>
            ),
          },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },

  {
    path: "/auth",
    element: <Auth />,
    children: [
      {
        path: "login",
        element: (
          <WithSpinner>
            <Login />
          </WithSpinner>
        ),
      },
      {
        path: "register",
        element: (
          <WithSpinner>
            <Register />
          </WithSpinner>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
];

export default routes;
