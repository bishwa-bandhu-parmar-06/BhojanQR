import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  X,
  Menu as MenuIcon,
  Home,
  MapPin,
  Store,
  UserCircle,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  ShoppingCart,
} from "lucide-react";

import { useSelector, useDispatch } from "react-redux";
import { logoutAdmin } from "../API/adminApi";
import { logoutRestaurant } from "../API/restaurantApi";
import { logout } from "../Features/auth/AuthSlice";
import { clearCart } from "../Features/Cart/CartSlice";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartQuantity = useSelector((state) => state.cart?.totalQuantity || 0);

  const displayName = user?.restaurantName || user?.name || "Profile";
  const firstName =
    displayName !== "Profile" ? displayName.split(" ")[0] : "Profile";

  const isPublicMenu =
    location.pathname.startsWith("/menu/") && location.pathname.length > 6;
  const isCartPage = location.pathname.endsWith("/cart");

  useEffect(() => {
    if (!location.pathname.startsWith("/menu/")) {
      if (cartQuantity > 0) {
        dispatch(clearCart());
      }
    }
  }, [location.pathname, dispatch, cartQuantity]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setShowDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".user-dropdown")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const getDashboardRoute = () => {
    if (!user || !user.role) return "/";
    switch (user.role) {
      case "admin":
        return "/admin/dashboard";
      case "restaurant":
        return user.status === "pending" 
          ? "/restaurant/pending-approval" 
          : "/restaurant/dashboard";
      default:
        return "/";
    }
  };

  const isPendingRestaurant = user?.role === "restaurant" && user?.status === "pending";


  const handleLogoutClick = async () => {
    try {
      if (user?.role === "admin") await logoutAdmin();
      if (user?.role === "restaurant") await logoutRestaurant();
    } catch (error) {
      console.error("Logout failed on backend", error);
    }
    dispatch(logout());
    setShowDropdown(false);
    navigate("/");
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/track-order", label: "Track Order", icon: MapPin },
    ...(isAuthenticated
      ? []
      : [{ path: "/restaurant/auth", label: "Restaurant", icon: Store }]),
  ];

  return (
    <>
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-green-500 to-orange-500 bg-[length:200%_100%] animate-gradient" />

      <nav
        className={`sticky w-full top-0 z-50 font-sans transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-white shadow-md"
        }`}
      >
        <div className="w-full bg-gradient-to-r from-orange-50/90 to-green-50/90 backdrop-blur-sm">
          <div className="flex items-center justify-between h-16 md:h-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Logo */}
            <div className="flex-shrink-0">
              <NavLink to="/" className="flex items-center group">
                <img
                  src="/BhojanQR-removebg.png"
                  alt="BhojanQR Logo"
                  className="h-24 md:h-32 lg:h-40 w-auto object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-2"
                />
              </NavLink>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <ul className="flex space-x-1 lg:space-x-2 items-center">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        end={item.path === "/"}
                        className={({ isActive }) =>
                          `relative px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center group overflow-hidden ${
                            isActive
                              ? "text-white"
                              : "text-gray-700 hover:text-orange-700"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={`absolute inset-0 transition-all duration-300 rounded-lg ${
                                isActive
                                  ? "bg-gradient-to-r from-orange-500 to-green-500 scale-100"
                                  : "bg-orange-100 scale-0 group-hover:scale-100"
                              }`}
                            />
                            <span className="relative flex items-center z-10">
                              <Icon
                                className={`w-4 h-4 mr-1.5 transition-transform duration-300 ${
                                  isActive
                                    ? "text-white"
                                    : "group-hover:rotate-6"
                                }`}
                              />
                              <span className="relative">
                                {item.label}
                                <span
                                  className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform scale-x-0 transition-transform duration-300 ${
                                    isActive ? "scale-x-100" : ""
                                  }`}
                                />
                              </span>
                            </span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                })}

                {/* Dynamic Cart Icon (Desktop) */}
                {isPublicMenu && (
                  <li className="ml-2">
                    <button
                      onClick={() => {
                        if (!isCartPage) {
                          navigate(
                            `${location.pathname}/cart${location.search}`,
                          );
                        }
                      }}
                      className={`relative px-3 py-2 rounded-lg transition-all duration-300 focus:outline-none flex items-center justify-center ${
                        isCartPage
                          ? "bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-md"
                          : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {cartQuantity > 0 && (
                        <span
                          className={`absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold border-2 rounded-full -translate-y-1/4 translate-x-1/4 ${
                            isCartPage
                              ? "bg-white text-orange-600 border-orange-500"
                              : "bg-orange-600 text-white border-white"
                          }`}
                        >
                          {cartQuantity}
                        </span>
                      )}
                    </button>
                  </li>
                )}

                {/* Logged-in User Profile Dropdown */}
                {isAuthenticated && user && (
                  <li className="relative ml-2 user-dropdown">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 focus:outline-none"
                    >
                      <UserCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{firstName}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          showDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 transition-all duration-300 origin-top-right ${
                        showDropdown
                          ? "opacity-100 scale-100 visible"
                          : "opacity-0 scale-95 invisible"
                      }`}
                    >
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          navigate(getDashboardRoute());
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" /> 
                        {isPendingRestaurant ? "Approval Status" : "Dashboard"}
                      </button>

                      <button
                        onClick={handleLogoutClick}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Mobile menu button and Cart */}
            <div className="flex md:hidden items-center gap-2">
              {/* Dynamic Cart Icon (Mobile Header) */}
              {isPublicMenu && (
                <button
                  onClick={() => {
                    if (!isCartPage) {
                      navigate(`${location.pathname}/cart${location.search}`);
                    }
                  }}
                  className={`relative p-2 rounded-lg transition-colors mr-2 ${
                    isCartPage
                      ? "bg-orange-100 text-orange-600"
                      : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartQuantity > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-orange-600 border-2 border-white rounded-full -translate-y-1/4 translate-x-1/4">
                      {cartQuantity}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-orange-600 focus:outline-none transition-all duration-300 hover:bg-orange-50 rounded-lg"
              >
                {mobileMenuOpen ? (
                  <X size={24} className="animate-spin-once" />
                ) : (
                  <MenuIcon size={24} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden bg-white border-t border-gray-200 transition-all duration-300 overflow-hidden ${
            mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 transform ${
                        isActive
                          ? "bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-md translate-x-1"
                          : "text-gray-700 hover:bg-orange-50 hover:text-orange-700 hover:translate-x-1"
                      }`
                    }
                  >
                    <span className="flex items-center">
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </span>
                  </NavLink>
                </li>
              );
            })}

            {isAuthenticated && user && (
              <>
                <li>
                  <button
                    onClick={() => {
                      navigate(getDashboardRoute());
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all hover:translate-x-1"
                  >
                    <LayoutDashboard className="w-5 h-5 mr-3" /> 
                    {isPendingRestaurant ? "Approval Status" : "Dashboard"}
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center w-full px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-all hover:translate-x-1"
                  >
                    <LogOut className="w-5 h-5 mr-3" /> Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient { animation: gradient 3s ease infinite; }
        @keyframes spin-once {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(180deg); }
        }
        .animate-spin-once { animation: spin-once 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default Navbar;
