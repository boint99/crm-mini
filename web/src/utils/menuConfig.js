import {
  LayoutDashboard,
  Users,
  Network,
  BriefcaseBusiness,
  KeyRound,
  Folder,
  Shield,
  Building2,
  MapPinned,
  ExternalLink,
  FileCode
} from 'lucide-react'

export const NAV_GROUPS = [
  {
    group: 'DASHBOARDS',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' }
    ]
  },
  {
    group: 'NETWORKS',
    items: [
      { id: 'network',   label: 'Networks', icon: Network, path: '/network-management' }
    ]
  },
  {
    group: 'Organizations',
    items: [

      {
        id: 'employees',
        label: 'Employees',
        icon: Users,
        path: '/organizations/employees'
      },

      {
        id: 'positions',
        label: 'Positions',
        icon: BriefcaseBusiness,
        path: '/organizations/positions'
      },
      {
        id: 'departments',
        label: 'Departments',
        icon: Folder,
        path: '/organizations/departments'
      },
      {
        id: 'branches',
        label: 'Branches',
        icon: MapPinned,
        path: '/organizations/branches'
      },

      {
        id: 'companies',
        label: 'Companies',
        icon: Building2,
        path: '/organizations/companies'
      }
    ]
  },
  {
    group: 'VIETTEL',
    items: [
      { id: 'employee',   label: 'Employee',   icon: Users, path: '/viettel-employees' },
      { id: 'branch',   label: 'Branch',   icon: MapPinned, path: '/viettel-branches' }
    ]
  },
  {
    group: 'Hosting',
    items: [
      { id: 'vienthongacts', label: 'VIENTHONGACT', icon: ExternalLink, path: '/hosting/vienthongact', externalUrl: 'https://cpanel.vienthongact.vn' },
      { id: 'actes',         label: 'ACTES',        icon: ExternalLink, path: '/hosting/actes',        externalUrl: 'https://cpanel.actes.vn' },
      { id: 'actids',        label: 'ACTIDS',       icon: ExternalLink, path: '/hosting/actids',       externalUrl: 'https://cpanel.actids.vn' }
    ]
  },
  {
    group: 'MANAGEMENT',
    items: [
      { id: 'accounts',    label: 'Accounts',    icon: KeyRound, path: '/accounts' },
      { id: 'permissions', label: 'Permissions', icon: Shield,   path: '/permissions' },
      { id: 'api-docs',    label: 'API Docs',    icon: FileCode, path: '/api-docs' }
    ]
  }
]
