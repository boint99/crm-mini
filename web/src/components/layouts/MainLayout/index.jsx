import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import Header from "../Header";
import Footer from "../Footer";

function MainLayout() {
  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <main className="p-4">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
