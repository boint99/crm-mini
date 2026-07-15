import { useState } from 'react'
import EmployeeList from './employee'
import BranchList from './branch'
import { Users, GitBranch } from 'lucide-react'

export default function ViettelOS() {
  const [activeTab, setActiveTab] = useState('employee') // "employee" or "branch"

  return (
    <div className="space-y-6">
      {/* Tab Switcher Header */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('employee')}
            className={[
              'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm cursor-pointer transition-all duration-200 focus:outline-none',
              activeTab === 'employee'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ].join(' ')}
          >
            <Users className="h-4 w-4" />
            Nhân viên Viettel
          </button>
          <button
            onClick={() => setActiveTab('branch')}
            className={[
              'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm cursor-pointer transition-all duration-200 focus:outline-none',
              activeTab === 'branch'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ].join(' ')}
          >
            <GitBranch className="h-4 w-4" />
            Chi nhánh Viettel
          </button>
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="transition-all duration-300">
        {activeTab === 'employee' ? <EmployeeList /> : <BranchList />}
      </div>
    </div>
  )
}
