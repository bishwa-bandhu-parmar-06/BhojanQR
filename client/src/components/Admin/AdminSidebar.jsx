import React from "react";
import { Store, User, LogOut, X, ShieldAlert, Settings } from "lucide-react";

const AdminSidebar = ({
  activeView,
  setActiveView,
  handleLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const menuItems = [
    { id: "restaurants", label: "Restaurants", icon: <Store size={20} /> },
    { id: "profile", label: "My Profile", icon: <User size={20} /> },
    { id: "app-config", label: "App Settings", icon: <Settings size={20} /> },
  ];

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white text-gray-700 transform transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0 lg:static lg:h-screen flex flex-col shadow-2xl lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-gray-100 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* COMPACT Header / Logo Section */}
        <div className="relative flex items-center justify-center py-4 px-4 bg-white border-b border-gray-100">
          <div className="flex flex-col items-center justify-center w-full text-center">
            {/* Reduced Logo Height */}
            {/* Logo Image */}
            <img
              src="/BhojanQR-removebg.png"
              alt="BhojanQR Logo"
              // YAHAN CHANGE KIYA HAI: h-10 se h-16 aur md:h-20 kar diya hai
              className="h-16 md:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <h1 className="hidden text-xl font-black text-gray-800 tracking-tight">
              Bhojan<span className="text-orange-500">QR</span>
            </h1>

            {/* Compact Admin Badge */}
            <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full tracking-widest uppercase flex items-center justify-center gap-1 border border-orange-100 mt-1.5 mx-auto">
              <ShieldAlert size={10} /> Admin Panel
            </span>
          </div>

          <button
            className="lg:hidden absolute right-3 top-3 p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                activeView === item.id
                  ? "bg-orange-500 text-white shadow-md shadow-orange-200 border border-orange-400"
                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-transparent"
              }`}
            >
              <div
                className={`transition-transform duration-300 ${activeView !== item.id && "group-hover:scale-110"}`}
              >
                {item.icon}
              </div>
              <span
                className={`text-sm transition-transform duration-300 tracking-wide ${activeView !== item.id && "group-hover:translate-x-1"}`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={handleLogout}
            className="group w-full flex items-center justify-center gap-2.5 px-4 py-3 text-red-600 bg-red-50 hover:bg-red-500 border border-red-100 hover:border-red-500 hover:text-white rounded-xl font-bold transition-all duration-300 text-sm"
          >
            <LogOut
              size={18}
              className="group-hover:-translate-x-1 transition-transform duration-300"
            />
            <span>Logout Account</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
