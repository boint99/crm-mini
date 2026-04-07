import {
  LayoutDashboard,
  Users,
  Mail,
  Network,
  BriefcaseBusiness,
  KeyRound,
  Building,
  CreditCard,
  BookOpen,
  List,
  AlignJustify,
  Pencil,
  Calendar,
  MessageCircle,
  Folder,
  CheckSquare,
  Shield,
} from "lucide-react";

export const NAV_GROUPS = [
  {
    group: "DASHBOARDS",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
      { id: "banking",   label: "Banking",    icon: CreditCard,       path: "/banking" },
    ],
  },
  {
    group: "APPS",
    items: [
      {
        id: "blog", label: "Blog", icon: BookOpen,
        children: [
          { id: "blog-list",   label: "List",   icon: List,          path: "/blog/list" },
          { id: "blog-detail", label: "Detail", icon: AlignJustify,  path: "/blog/detail" },
          { id: "blog-edit",   label: "Edit",   icon: Pencil,        path: "/blog/edit" },
        ],
      },
      { id: "calendar",  label: "Calendar",  icon: Calendar,       path: "/calendar" },
      { id: "chat",      label: "Chat",       icon: MessageCircle,  path: "/chat" },
      { id: "files",     label: "Files",      icon: Folder,         path: "/files" },
      {
        id: "mail", label: "Mail", icon: Mail,
        children: [
          { id: "mail-inbox",  label: "Inbox",  icon: Mail,         path: "/mail/inbox" },
          { id: "mail-sent",   label: "Sent",   icon: Mail,         path: "/mail/sent" },
        ],
      },
      { id: "tasklist",  label: "Task List",  icon: CheckSquare,    path: "/tasklist" },
    ],
  },
  {
    group: "ORGANIZATION",
    items: [
      {
        id: "organization", label: "Organization", icon: Building,
        children: [
          { id: "employees",  label: "Employees", icon: Users,             path: "/organization/employees" },
          { id: "positions",  label: "Positions",   icon: BriefcaseBusiness, path: "/organization/positions" },
          { id: "divisions",  label: "Divisions",      icon: Network,           path: "/organization/divisions" },
          { id: "branches",   label: "Branches", icon: Building,          path: "/organization/branches" },
          { id: "companies",  label: "Companies",   icon: Building,          path: "/organization/companies" },
        ],
      },
      { id: "network",   label: "Networks", icon: Network,           path: "/network-management" },
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
