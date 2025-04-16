
import React, { useState, useEffect, useContext } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaTimes, FaBars, FaTachometerAlt } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import logo from "../assets/BhojanQR-removebg.png";
import { CartContext } from "../context/CartContext";

const Navbar = () => {
  const { cart } = useContext(CartContext);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminData, setAdminData] = useState({ 
    name: "", 
    mobile: "", 
    image: "",
    email: "" 
  });
  const [updatedData, setUpdatedData] = useState({
    name: "",
    mobile: "",
    image: null, // Changed from "" to null
    imagePreview: ""
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpBox, setShowOtpBox] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const backendUrl = import.meta.env.VITE_BACKEND_URI;

  // Authentication check
  useEffect(() => {
    const validateToken = async (token) => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/verify-token`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.valid;
      } catch (error) {
        console.error("Token validation failed:", error);
        return false;
      }
    };

    const checkAuthStatus = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setIsAdminLoggedIn(false);
        return;
      }

      const isValid = await validateToken(token);
      if (!isValid) {
        localStorage.removeItem("adminToken");
        setIsAdminLoggedIn(false);
        if (location.pathname.startsWith("/admin")) {
          navigate("/admin");
        }
        return;
      }

      try {
        const { data } = await axios.get(`${backendUrl}/api/admin/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (data.success) {
          setIsAdminLoggedIn(true);
          setAdminData(data.admin);
          setUpdatedData({
            name: data.admin.name,
            mobile: data.admin.mobile,
            image: null, // Keep null initially
            imagePreview: data.admin.profilePhoto ? `${backendUrl}${data.admin.profilePhoto}` : "" // Set initial preview
          });
          if (location.pathname === "/admin") {
            navigate("/admin/dashboard");
          }
        }
      } catch (error) {
        localStorage.removeItem("adminToken");
        setIsAdminLoggedIn(false);
        if (location.pathname.startsWith("/admin")) {
          navigate("/admin");
        }
      }
    };

    checkAuthStatus();
  }, [location.pathname, navigate, backendUrl]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAdminLoggedIn(false);
    setShowDropdown(false);
    navigate("/");
  };

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const formData = new FormData();
      formData.append("name", updatedData.name);
      formData.append("mobile", updatedData.mobile);
      if (selectedImage) formData.append("image", selectedImage);

      const response = await axios.put(
        `${backendUrl}/api/admin/update-profile`,
        formData,
        { headers: { 
          "Content-Type": "multipart/form-data", 
          Authorization: `Bearer ${token}` 
        }}
      );

      if (response.data.success) {
        setAdminData(response.data.admin);
        setUpdatedData({
          ...response.data.admin,
          imagePreview: response.data.admin.image
        });
        setSelectedImage(null);
        setShowEditModal(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setUpdatedData(prev => ({
          ...prev,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Rest of your handlers (handleChangeEmail, handleVerifyOtp) remain the same...

  const handleChangeEmail = async () => {
        try {
          const token = localStorage.getItem("adminToken");
          if (!token) {
            toast.error("Authentication required");
            return;
          }
    
          if (!newEmail) {
            toast.error("Please enter a new email address");
            return;
          }
    
          const response = await axios.post(
            `${backendUrl}/api/admin/request-email-change`,
            { newEmail },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
    
          if (response.data.success) {
            setShowOtpBox(true);
            toast.success("OTP has been sent to your new email address");
          } else {
            toast.error(response.data.message || "Failed to send OTP");
          }
        } catch (error) {
          console.error("Email change request error:", error);
          toast.error(error.response?.data?.message || "Failed to send OTP");
        }
      };
    
      const handleVerifyOtp = async () => {
        try {
          const token = localStorage.getItem("adminToken");
          if (!token) {
            toast.error("Authentication required");
            return;
          }
    
          if (!otp) {
            toast.error("Please enter the OTP");
            return;
          }
    
          const response = await axios.post(
            `${backendUrl}/api/admin/verify-email-change`,
            { otp },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
    
          if (response.data.success) {
            toast.success("Email changed successfully!");
            setShowEmailModal(false);
            setShowOtpBox(false);
            setNewEmail("");
            setOtp("");
            // Refresh admin data
            const { data } = await axios.get(`${backendUrl}/api/admin/profile`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (data.success) {
              setAdminData(data.admin);
              setUpdatedData(data.admin);
            }
          } else {
            toast.error(response.data.message || "Failed to verify OTP");
          }
        } catch (error) {
          console.error("OTP verification error:", error);
          toast.error(error.response?.data?.message || "Failed to verify OTP");
        }
      };

  const isDashboard = location.pathname.startsWith("/admin/dashboard");

  // Navigation items
  const navItems = [
    { path: "/", label: "Home" },
    { path: "/track-order", label: "Track Order" },
    { path: "/menu", label: "Menu" },
    { path: "/cart", label: "Cart" },
    ...(isAdminLoggedIn ? [] : [{ path: "/admin", label: "Admin Login" }]),
  ];

  return (
    <>
      {/* Top accent bar */}
      <div className="h-2 w-full bg-gradient-to-r from-orange-500 to-green-500" />

      {/* Main navbar */}
      <nav className=" sticky top-0 z-50 bg-white shadow-md font-sans">
        <div className="container mx-auto px-4 bg-gradient-to-r from-orange-100 to-green-100">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <NavLink to="/" className="flex items-center">
                <img
                  src="/BhojanQR-removebg.png"
                  alt="BhojanQR Logo"
                  className="h-40 w-auto object-contain transition-transform duration-300 hover:scale-105"
                />
                
              </NavLink>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <ul className="flex space-x-1">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.path === "/"}
                      className={({ isActive }) =>
                        `px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
                          isActive
                            ? "bg-orange-500 text-white"
                            : "text-gray-700 hover:bg-orange-100 hover:text-orange-700"
                        }`
                      }
                    >
                      {item.path === "/cart" && cart.length > 0 && (
                        <span className="mr-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cart.length}
                        </span>
                      )}
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>

              {/* Admin dropdown */}
              {isAdminLoggedIn && (
                <div className="relative ml-2">
                  <div className="flex items-center space-x-2">
                    {!isDashboard && (
                      <button
                        onClick={() => navigate("/admin/dashboard")}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                        title="Dashboard"
                      >
                        <FaTachometerAlt className="mr-1" />
                        Dashboard
                      </button>
                    )}
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="p-2 text-gray-700 hover:text-orange-500 focus:outline-none transition-colors duration-200 flex items-center"
                      aria-label="Admin menu"
                    >
                      <FaUserCircle className="text-2xl" />
                      <span className="ml-1 text-sm font-medium hidden lg:inline">
                        {adminData.name || "Admin"}
                      </span>
                    </button>
                  </div>
                  
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {adminData.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {adminData.email}
                        </p>
                      </div>
                      {isDashboard ? (
                        <>
                          <button
                            onClick={() => {
                              setShowEditModal(true);
                              setShowDropdown(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                          >
                            Edit Profile
                          </button>
                          <button
                            onClick={() => {
                              setShowEmailModal(true);
                              setShowDropdown(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                          >
                            Change Email
                          </button>
                        </>
                      ) : null}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-orange-500 focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <ul className="px-2 py-3 space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-base font-medium ${
                        isActive
                          ? "bg-orange-500 text-white"
                          : "text-gray-700 hover:bg-orange-100 hover:text-orange-700"
                      }`
                    }
                  >
                    {item.path === "/cart" && cart.length > 0 ? (
                      <span className="flex items-center">
                        <span className="mr-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cart.length}
                        </span>
                        {item.label}
                      </span>
                    ) : (
                      item.label
                    )}
                  </NavLink>
                </li>
              ))}
              
              {isAdminLoggedIn && (
                <>
                  <li>
                    <button
                      onClick={() => {
                        navigate("/admin/dashboard");
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-orange-100 hover:text-orange-700"
                    >
                      <FaTachometerAlt className="mr-2" />
                      Dashboard
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setShowEditModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-orange-100 hover:text-orange-700"
                    >
                      Edit Profile
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setShowEmailModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-orange-100 hover:text-orange-700"
                    >
                      Change Email
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-100"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </nav>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Profile Image Preview */}
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-orange-200 mb-4">
                  <img
                    src={updatedData.imagePreview || adminData.image || "https://via.placeholder.com/150?text=No+Image"}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                </div>
                
                <label className="cursor-pointer bg-orange-100 text-orange-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-200 transition-colors">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={updatedData.name}
                  onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <input
                  type="text"
                  value={updatedData.mobile}
                  onChange={(e) => setUpdatedData({ ...updatedData, mobile: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProfileUpdate}
                className="px-4 py-2 bg-orange-600 rounded-md text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Change Email</h2>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setShowOtpBox(false);
                  setNewEmail("");
                  setOtp("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {showOtpBox ? "New Email (OTP Sent)" : "New Email"}
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  disabled={showOtpBox}
                />
              </div>

              {showOtpBox && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter 6-digit OTP"
                  />
                </div>
              )}
            </div>

            <div className="mt-6">
              {!showOtpBox ? (
                <button
                  onClick={handleChangeEmail}
                  className="w-full px-4 py-2 bg-orange-600 rounded-md text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Send OTP
                </button>
              ) : (
                <button
                  onClick={handleVerifyOtp}
                  className="w-full px-4 py-2 bg-green-600 rounded-md text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Verify OTP
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;