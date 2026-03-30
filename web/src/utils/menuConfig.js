import {
  LayoutDashboard,
  Users,
  Mail,
  Shield,
  Network,
  BriefcaseBusiness,
  KeyRound,
  MonitorSmartphone,
  Building,
} from "lucide-react";
export const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    id: "email",
    label: "Quản lý email",
    icon: Mail,
    path: "/email",
  },
  {
    id: "network-management",
    label: "Quản lý mạng",
    icon: Network,
    path: "/network-management",
  },
  {
    id: "os",
    label: "Nhân viên OS",
    icon: BriefcaseBusiness,
    path: "/os",
  },
  {
    id: "accounts",
    label: "Tài khoản",
    icon: KeyRound,
    path: "/accounts",
  },
   {
    id: "organization",
    label: "Tổ chức",
    icon: Building,
    children: [
      { label: "Nhân viên", icon: Users, path: "/organization/employees" },
      { label: "Chức vụ", icon: BriefcaseBusiness, path: "/organization/positions" },
      { label: "Khối", icon: Network, path: "/organization/divisions" },
      { label: "Chi nhánh", icon: Building, path: "/organization/branches" },
      { label: "Công ty", icon: Building, paath: "/organization/companies" },
    ],
  },
];