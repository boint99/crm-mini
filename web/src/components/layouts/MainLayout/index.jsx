import Header from '../header'
import Sidebar from '../sidebar'
import Footer from '../Footer'
import { Outlet } from 'react-router-dom'

function MainLayout() {
  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <main className="min-h-full">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default MainLayout
