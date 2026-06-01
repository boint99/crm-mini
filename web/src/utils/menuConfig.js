import {
  LayoutDashboard,
  Users,
  Mail,
  Network,
  BriefcaseBusiness,
  KeyRound,
  MessageCircle,
  Folder,
  CheckSquare,
  Shield,
  Group,
  Building2,
  MapPinned,
  GitBranch,
  FolderTree,
} from "lucide-react";

export const NAV_GROUPS = [
  {
    group: "DASHBOARDS",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
    ],
  },
  {
    group: "HOME",
    items: [
      { id: "tasklist", label: "Task List", icon: CheckSquare, path: "/tasklist" },
      { id: "chat", label: "Chat", icon: MessageCircle, path: "/chat" },
      { id: "files", label: "Files", icon: Folder, path: "/files" },
      { id: "group", label: "Group Mail", icon: Group, path: "/group" },
      {
        id: "mail", label: "Mail", icon: Mail,
        children: [
          { id: "mail-inbox", label: "Inbox", icon: Mail, path: "/mail/inbox" },
          { id: "mail-sent", label: "Sent", icon: Mail, path: "/mail/sent" },
        ],
      },
    ],
  },
  {
    group: "NETWORKS",
    items: [
      { id: "network",   label: "Networks", icon: Network, path: "/network-management" },
    ],
  },
  {
    group: "Organizations",
items: [
  {
    id: "organizations",
    label: "Organization",
    icon: FolderTree,
    path: "/organizations/organization",
  },

  {
    id: "employees",
    label: "Employees",
    icon: Users,
    path: "/organizations/employees",
  },

  {
    id: "positions",
    label: "Positions",
    icon: BriefcaseBusiness,
    path: "/organizations/positions",
  },

  {
    id: "branches",
    label: "Branches",
    icon: MapPinned,
    path: "/organizations/branches",
  },

  {
    id: "companies",
    label: "Companies",
    icon: Building2,
    path: "/organizations/companies",
  },
]
  },
  {
    group: "Outsource",
    items: [
      { id: "viettel",   label: "Viettel OS",   icon: BriefcaseBusiness, path: "/viettel-employees" },
    ],
  },
  {
    group: "MANAGEMENT",
    items: [
      { id: "accounts",    label: "Accounts",   icon: KeyRound, path: "/accounts" },
      { id: "permissions", label: "Permissions",  icon: Shield,   path: "/permissions" },
    ],
  },
];
