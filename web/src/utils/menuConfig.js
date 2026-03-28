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
    id: "organization",
    label: "Tổ chức",
    icon: Building,
    children: [
      { label: "Nhân viên", icon: Users, path: "/organization/employees" },
      { label: "Chức vụ", icon: BriefcaseBusiness, path: "/organization/positions" },
      { label: "Khối", icon: Network, path: "/organization/divisions" },
      { label: "Chi nhánh", icon: Building, path: "/organization/branches" },
      { label: "Công ty", icon: Building, path: "/organization/companies" },
    ],
  },
  {
    id: "email",
    label: "Quản lý email",
    icon: Mail,
    path: "/email",
  },
  {
    id: "ips",
    label: "IPs",
    icon: Shield,
    path: "/ips",
  },
  {
    id: "vlan",
    label: "VLAN",
    icon: Network,
    path: "/vlan",
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
    id: "devices",
    label: "Tài khoản & thiết bị",
    icon: MonitorSmartphone,
    path: "/devices",
  },
];