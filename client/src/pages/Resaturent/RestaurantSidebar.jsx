import React from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  User,
  Settings,
  LogOut,
  Store,
  QrCode,
  ShoppingBag,
} from "lucide-react";

// Sub-component specifically for the Sidebar
const SidebarItem = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
      isActive
        ? "bg-orange-50 text-orange-600"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`}
  >
    <Icon
      size={20}
      className={isActive ? "text-orange-600" : "text-gray-400"}
    />
    {label}
  </button>
);

const RestaurantSidebar = ({
  restaurantName,
  activeTab,
  setActiveTab,
  handleLogout,
}) => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
          <Store size={24} />
        </div>
        <div>
          <h1 className="font-bold text-gray-800 text-lg leading-tight truncate">
            {restaurantName || "Restaurant"}
          </h1>
          <p className="text-xs text-gray-500">Restaurant Panel</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <SidebarItem
          icon={LayoutDashboard}
          label="Overview"
          isActive={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
        />
        <SidebarItem
          icon={ShoppingBag}
          label="Live Orders"
          isActive={activeTab === "orders"}
          onClick={() => setActiveTab("orders")}
        />
        <SidebarItem
          icon={UtensilsCrossed}
          label="Manage Menu"
          isActive={activeTab === "menu"}
          onClick={() => setActiveTab("menu")}
        />
        <SidebarItem
          icon={QrCode}
          label="Table QR Codes"
          isActive={activeTab === "qr"}
          onClick={() => setActiveTab("qr")}
        />
        <SidebarItem
          icon={User}
          label="Profile Details"
          isActive={activeTab === "profile"}
          onClick={() => setActiveTab("profile")}
        />
        <SidebarItem
          icon={Settings}
          label="Settings"
          isActive={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
        />
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default RestaurantSidebar;
