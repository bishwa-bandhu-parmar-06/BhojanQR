import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../assets/BhojanQR-removebg.png';
import { useContext } from "react";
import { CartContext } from "../context/CartContext";



const Navbar = () => {
  const { cart } = useContext(CartContext);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [adminData, setAdminData] = useState({ name: '', mobile: '', image: '' });
  const [updatedData, setUpdatedData] = useState({ name: '', mobile: '', image: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpBox, setShowOtpBox] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const backendUrl = import.meta.env.VITE_BACKEND_URI || 'http://localhost:3000';

  useEffect(() => {
    const validateToken = async (token) => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/verify-token`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.data.valid;
      } catch (error) {
        console.error("Token validation failed:", error);
        return false;
      }
    };

    const checkAuthStatus = async () => {
      const token = localStorage.getItem('adminToken');
      // console.log("Retrieved token:", token);

      if (!token) {
        setIsAdminLoggedIn(false);
        return;
      }

      // First validate the token
      const isValid = await validateToken(token);
      if (!isValid) {
        localStorage.removeItem('adminToken');
        setIsAdminLoggedIn(false);
        if (location.pathname.startsWith('/admin')) {
          navigate('/admin');
        }
        return;
      }

      // If token is valid, fetch profile
      try {
        const { data } = await axios.get(`${backendUrl}/api/admin/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (data.success) {
          setIsAdminLoggedIn(true);
          setAdminData(data.admin);
          setUpdatedData(data.admin);

          if (location.pathname === '/admin') {
            navigate('/admin/dashboard');
          }
        } else {
          throw new Error(data.message || 'Failed to fetch profile');
        }
      } catch (error) {
        console.error("Profile fetch failed:", error);
        localStorage.removeItem('adminToken');
        setIsAdminLoggedIn(false);
        if (location.pathname.startsWith('/admin')) {
          navigate('/admin');
        }
      }
    };

    checkAuthStatus();
  }, [location.pathname, navigate, backendUrl]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdminLoggedIn(false);
    setShowDropdown(false);
    window.location.href = '/';
  };

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const formData = new FormData();
      formData.append('name', updatedData.name);
      formData.append('mobile', updatedData.mobile);
      if (selectedImage) formData.append('image', selectedImage);

      const response = await axios.put(`${backendUrl}/api/admin/update-profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Update local state with new data
        setAdminData(response.data.admin);
        setUpdatedData(response.data.admin);
        setSelectedImage(null);
        setShowEditModal(false);
        toast.success('Profile updated successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
  };

  const handleChangeEmail = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      if (!newEmail) {
        toast.error('Please enter a new email address');
        return;
      }

      const response = await axios.post(`${backendUrl}/api/admin/request-email-change`, 
        { newEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setShowOtpBox(true);
        toast.success('OTP has been sent to your new email address');
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Email change request error:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      if (!otp) {
        toast.error('Please enter the OTP');
        return;
      }

      const response = await axios.post(`${backendUrl}/api/admin/verify-email-change`, 
        { otp },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Email changed successfully!');
        setShowEmailModal(false);
        setShowOtpBox(false);
        setNewEmail('');
        setOtp('');
        // Refresh admin data
        const { data } = await axios.get(`${backendUrl}/api/admin/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (data.success) {
          setAdminData(data.admin);
          setUpdatedData(data.admin);
        }
      } else {
        toast.error(response.data.message || 'Failed to verify OTP');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.message || 'Failed to verify OTP');
    }
  };

  const isDashboard = location.pathname.startsWith('/admin/dashboard');

  // Navigation items
  const guestNavItems = [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Menu' },
    { path: '/cart', label: 'Cart' },
    { path: '/admin', label: 'Admin Login' }
  ];

  const adminNavItems = [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Menu' },
    { path: '/cart', label: 'Cart' }
  ];

  return (
    <>
      <div className="h-[30px] w-full bg-orange-500 animate-slide-down" />

      <nav className="sticky top-0 z-50 flex items-center justify-between h-[100px] bg-gradient-to-br from-green-100 via-white to-orange-100">
        <div className="flex pl-6 py-2 animate-slide-left opacity-0" 
          style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
          <NavLink to="/" className="flex items-center">
            <img
              src={logo}
              alt="BhojanQR Logo"
              className="h-60 w-auto object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
            />
          </NavLink>
        </div>

<ul className="flex space-x-2 ml-4 mr-4 text-lg items-center relative">
  {(isAdminLoggedIn ? adminNavItems : guestNavItems).map((item, index) => (
    <li 
      key={item.path} 
      className={`relative ${
        index % 3 === 0 ? 'animate-slide-up' : 
        index % 3 === 1 ? 'animate-slide-left' : 
        'animate-slide-right'
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {item.path === '/cart' ? (
        <NavLink
          to={item.path}
          className={({ isActive }) =>
            `relative px-4 py-2 rounded transition-colors duration-200 ${
              isActive
                ? 'text-white bg-orange-500'
                : 'text-green-600 hover:bg-orange-500 hover:text-white'
            }`
          }
        >
          Cart
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow">
              {cart.length}
            </span>
          )}
        </NavLink>
      ) : (
        <NavLink
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `px-4 py-2 rounded transition-colors duration-200 ${
              isActive
                ? 'text-white bg-orange-500'
                : 'text-green-600 hover:bg-orange-500 hover:text-white'
            }`
          }
        >
          {item.label}
        </NavLink>
      )}
    </li>
  ))}

  {isAdminLoggedIn && (
    <>
      {/* <li 
        className="relative text-green-700 animate-slide-down"
        style={{ animationDelay: `${(isAdminLoggedIn ? adminNavItems : guestNavItems).length * 0.1}s` }}
      >
        <NotificationBell/>
      </li> */}
      <li 
        className="relative animate-slide-down"
        style={{ animationDelay: `${((isAdminLoggedIn ? adminNavItems : guestNavItems).length + 1) * 0.1}s` }}
      >
        <button 
          onClick={() => setShowDropdown(!showDropdown)} 
          className="text-3xl text-green-700 hover:text-orange-500 transition-colors duration-200"
          aria-label="Admin menu"
        >
          <FaUserCircle />
        </button>
              {showDropdown && (
                <ul className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-md z-50">
                  {isDashboard ? (
                    <>
                      <li>
                        <button 
                          onClick={() => { 
                            setShowEditModal(true); 
                            setShowDropdown(false); 
                          }} 
                          className="block w-full text-left px-4 py-2 hover:bg-orange-100"
                        >
                          Edit Profile
                        </button>
                      </li>
                      <li>
                        <button 
                          onClick={() => { 
                            setShowEmailModal(true); 
                            setShowDropdown(false); 
                          }} 
                          className="block w-full text-left px-4 py-2 hover:bg-orange-100"
                        >
                          Change Email
                        </button>
                      </li>
                    </>
                  ) : (
                    <li>
                      <button
                        onClick={() => { 
                          navigate('/admin/dashboard');
                          setShowDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-orange-100"
                      >
                        Dashboard
                      </button>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-orange-100 text-red-600"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </li>
          </>
          )}
        </ul>
      </nav>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h2 className="text-xl font-semibold text-orange-500 mb-4">Edit Profile</h2>

            <label className="block mb-2">Name:</label>
            <input
              type="text"
              value={updatedData.name}
              onChange={e => setUpdatedData({ ...updatedData, name: e.target.value })}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />

            <label className="block mb-2">Mobile:</label>
            <input
              type="text"
              value={updatedData.mobile}
              onChange={e => setUpdatedData({ ...updatedData, mobile: e.target.value })}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />

            <label className="block mb-2">Profile Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full mb-4"
            />

            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowEditModal(false)} 
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleProfileUpdate} 
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h2 className="text-xl font-semibold text-orange-500 mb-4">Change Email</h2>

            <label className="block mb-2">New Email:</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />

            <button 
              onClick={handleChangeEmail} 
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded w-full mb-4"
            >
              Send OTP
            </button>

            {showOtpBox && (
              <>
                <label className="block mb-2">Enter OTP:</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full mb-4 p-2 border border-gray-300 rounded"
                />

                <button 
                  onClick={handleVerifyOtp} 
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full"
                >
                  Verify
                </button>
              </>
            )}

            <div className="flex justify-end mt-4">
              <button 
                onClick={() => {
                  setShowEmailModal(false);
                  setShowOtpBox(false);
                  setNewEmail('');
                  setOtp('');
                }} 
                className="text-sm text-gray-600 hover:text-black"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;




// import React, { useState, useEffect, useContext } from 'react';
// import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// import { FaUserCircle } from 'react-icons/fa';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import logo from '../assets/BhojanQR-removebg.png';
// import { CartContext } from "../context/CartContext";
// import NotificationBell from './NotificationBell';

// const Navbar = () => {
//   const { cart } = useContext(CartContext);
//   const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [adminData, setAdminData] = useState({ name: '', mobile: '', image: '' });
//   const [updatedData, setUpdatedData] = useState({ name: '', mobile: '', image: '' });
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [newEmail, setNewEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [showOtpBox, setShowOtpBox] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showEmailModal, setShowEmailModal] = useState(false);

//   const navigate = useNavigate();
//   const location = useLocation();
//   const backendUrl = import.meta.env.VITE_BACKEND_URI || 'http://localhost:3000';

//   const isDashboard = location.pathname.startsWith('/admin/dashboard');

//   const guestNavItems = [
//     { path: '/', label: 'Home' },
//     { path: '/menu', label: 'Menu' },
//     { path: '/cart', label: 'Cart' },
//     { path: '/admin', label: 'Admin Login' }
//   ];

//   const adminNavItems = [
//     { path: '/', label: 'Home' },
//     { path: '/menu', label: 'Menu' },
//     { path: '/cart', label: 'Cart' }
//   ];

//   useEffect(() => {
//     const validateToken = async (token) => {
//       try {
//         const response = await axios.get(`${backendUrl}/api/admin/verify-token`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         return response.data.valid;
//       } catch {
//         return false;
//       }
//     };

//     const checkAuthStatus = async () => {
//       const token = localStorage.getItem('adminToken');
//       if (!token) {
//         setIsAdminLoggedIn(false);
//         return;
//       }

//       const isValid = await validateToken(token);
//       if (!isValid) {
//         localStorage.removeItem('adminToken');
//         setIsAdminLoggedIn(false);
//         if (location.pathname.startsWith('/admin')) navigate('/admin');
//         return;
//       }

//       try {
//         const { data } = await axios.get(`${backendUrl}/api/admin/profile`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         if (data.success) {
//           setIsAdminLoggedIn(true);
//           setAdminData(data.admin);
//           setUpdatedData(data.admin);
//           if (location.pathname === '/admin') navigate('/admin/dashboard');
//         }
//       } catch {
//         localStorage.removeItem('adminToken');
//         setIsAdminLoggedIn(false);
//         if (location.pathname.startsWith('/admin')) navigate('/admin');
//       }
//     };

//     checkAuthStatus();
//   }, [location.pathname]);

//   const handleLogout = () => {
//     localStorage.removeItem('adminToken');
//     setIsAdminLoggedIn(false);
//     setShowDropdown(false);
//     navigate('/');
//   };

//   return (
//     <>
//       <div className="h-[30px] w-full bg-orange-500 animate-slide-down" />

//       <nav className="sticky top-0 z-50 flex items-center justify-between h-[100px] bg-gradient-to-br from-green-100 via-white to-orange-100">
//         <div className="flex pl-6 py-2 animate-slide-left opacity-0"
//           style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
//           <NavLink to="/" className="flex items-center">
//             <img
//               src={logo}
//               alt="BhojanQR Logo"
//               className="h-60 w-auto object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
//             />
//           </NavLink>
//         </div>

//         <ul className="flex space-x-2 ml-4 mr-4 text-lg items-center relative">
//           {(isAdminLoggedIn ? adminNavItems : guestNavItems).map((item) => (
//             <li key={item.path} className="relative">
//               {item.path === '/cart' ? (
//                 <NavLink
//                   to={item.path}
//                   className={({ isActive }) =>
//                     `relative px-4 py-2 rounded transition-colors duration-200 ${
//                       isActive
//                         ? 'text-white bg-orange-500'
//                         : 'text-green-600 hover:bg-orange-500 hover:text-white'
//                     }`
//                   }
//                 >
//                   Cart
//                   {cart.length > 0 && (
//                     <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow">
//                       {cart.length}
//                     </span>
//                   )}
//                 </NavLink>
//               ) : (
//                 <NavLink
//                   to={item.path}
//                   end={item.path === '/'}
//                   className={({ isActive }) =>
//                     `px-4 py-2 rounded transition-colors duration-200 ${
//                       isActive
//                         ? 'text-white bg-orange-500'
//                         : 'text-green-600 hover:bg-orange-500 hover:text-white'
//                     }`
//                   }
//                 >
//                   {item.label}
//                 </NavLink>
//               )}
//             </li>
//           ))}

//           {isAdminLoggedIn && (
//             <>
//               <li className="relative">
//                 <NotificationBell />
//               </li>
//               <li className="relative">
//                 <button
//                   onClick={() => setShowDropdown(!showDropdown)}
//                   className="text-3xl text-orange-500 hover:text-orange-700 transition-colors duration-200"
//                   aria-label="Admin menu"
//                 >
//                   <FaUserCircle />
//                 </button>

//                 {showDropdown && (
//                   <ul className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-md z-50">
//                     {isDashboard ? (
//                       <>
//                         <li>
//                           <button
//                             onClick={() => { setShowEditModal(true); setShowDropdown(false); }}
//                             className="block w-full text-left px-4 py-2 hover:bg-orange-100"
//                           >
//                             Edit Profile
//                           </button>
//                         </li>
//                         <li>
//                           <button
//                             onClick={() => { setShowEmailModal(true); setShowDropdown(false); }}
//                             className="block w-full text-left px-4 py-2 hover:bg-orange-100"
//                           >
//                             Change Email
//                           </button>
//                         </li>
//                       </>
//                     ) : (
//                       <li>
//                         <button
//                           onClick={() => { navigate('/admin/dashboard'); setShowDropdown(false); }}
//                           className="block w-full text-left px-4 py-2 hover:bg-orange-100"
//                         >
//                           Dashboard
//                         </button>
//                       </li>
//                     )}
//                     <li>
//                       <button
//                         onClick={handleLogout}
//                         className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
//                       >
//                         Logout
//                       </button>
//                     </li>
//                   </ul>
//                 )}
//               </li>
//             </>
//           )}
//         </ul>
//       </nav>
//     </>
//   );
// };

// export default Navbar;
