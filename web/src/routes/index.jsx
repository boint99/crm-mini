import MainLayout from "@/components/layouts/MainLayout";

import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import NotFound from "@/pages/NotFound";

import Auth from "@/pages/Auth";
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";

const routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "employees", element: <Employees /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "/auth",
    element: <Auth />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];

export default routes;
