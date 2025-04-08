import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MenuForm from "./MenuForm";
import MenuList from "./MenuList";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const navigate = useNavigate();
  const backendUri = import.meta.env.VITE_BACKEND_URI || "http://localhost:3000";

  // ✅ Fetch admin profile and menu items
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await axios.get(`${backendUri}/api/admin/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAdmin(response.data.admin);
      } catch (error) {
        console.error("Error fetching admin profile:", error);
        navigate("/admin");
      }
    };

    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(`${backendUri}/api/menu`);
        setMenuItems(response.data.menuItems || []);
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setMenuItems([]);
      }
    };

    fetchAdminProfile();
    fetchMenuItems();
  }, [navigate, backendUri]);

  // ✅ Fetch notifications every 30 seconds
  

  

  // ✅ Logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(`${backendUri}/api/admin/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.removeItem("adminToken");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // ✅ Handle adding new menu item
  const handleMenuAdd = (newItem) => {
    try {
      setMenuItems(prevItems => Array.isArray(prevItems) ? [...prevItems, newItem] : [newItem]);
      toast.success("✅ Item added successfully!");
    } catch (error) {
      toast.error("❌ Error adding item.");
      console.error("Error in handleMenuAdd:", error);
    }
    setIsAdding(false);
  };

  
  if (!admin) {
    return (
      <div className="h-screen flex items-center justify-center text-xl text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-orange-100 to-green-50 p-6">
      <ToastContainer />
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-orange-500 mb-6">
          Admin Dashboard
        </h1>

        {/* Admin Profile Info */}
        <div className="flex items-center space-x-4 mb-6">
          {admin.profilePhoto ? (
            <img
              src={`${backendUri}${admin.profilePhoto}`}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-orange-500"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-orange-500">
              <span className="text-4xl text-gray-500">👤</span>
            </div>
          )}
          <div>
            <p className="text-lg font-semibold">Welcome, {admin.name}!</p>
            <p>Email: {admin.email}</p>
            <p>Mobile: {admin.mobile}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setIsAdding(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
          >
            ➕ Add Menu Item
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            🚪 Logout
          </button>
        </div>

      

        {/* Menu Form */}
        {isAdding && (
          <MenuForm
            backendUri={backendUri}
            onCancel={() => setIsAdding(false)}
            onSuccess={handleMenuAdd}
          />
        )}

        {/* Menu List */}
        {Array.isArray(menuItems) && (
          <MenuList
            backendUri={backendUri}
            menuItems={menuItems}
            setMenuItems={setMenuItems}
          />
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setShowOrderModal(false)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default AdminDashboard;



// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import MenuForm from "./MenuForm";
// import MenuList from "./MenuList";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import OrderDetailsModal from '../components/OrderDetailsModal';


// const AdminDashboard = () => {

//   // Add to your AdminDashboard component
// const [notifications, setNotifications] = useState([]);
// const [unreadCount, setUnreadCount] = useState(0);
//   const [admin, setAdmin] = useState(null);
//   const [menuItems, setMenuItems] = useState([]);
//   const [isAdding, setIsAdding] = useState(false);
//   const navigate = useNavigate();
//   const backendUri = import.meta.env.VITE_BACKEND_URI;

//   useEffect(() => {
//     const fetchAdminProfile = async () => {
//       try {
//         const token = localStorage.getItem("adminToken");
//         const response = await axios.get(`${backendUri}/api/admin/profile`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setAdmin(response.data.admin);
//       } catch (error) {
//         console.error("Error fetching admin profile:", error);
//         navigate("/admin");
//       }
//     };
// // Add this useEffect
// useEffect(() => {
//   const fetchNotifications = async () => {
//     try {
//       const token = localStorage.getItem("adminToken");
//       const response = await axios.get(`${backendUri}/api/admin/notifications`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setNotifications(response.data.notifications);
//       setUnreadCount(response.data.unreadCount);
//     } catch (error) {
//       console.error("Error fetching notifications:", error);
//     }
//   };

//   fetchNotifications();
//   const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
//   return () => clearInterval(interval);
// }, [backendUri]);

//     const fetchMenuItems = async () => {
//       try {
//         const response = await axios.get(`${backendUri}/api/menu`);
//         setMenuItems(response.data.menuItems || []);
//       } catch (error) {
//         console.error("Error fetching menu items:", error);
//         setMenuItems([]);
//       }
//     };

//     fetchAdminProfile();
//     fetchMenuItems();
//   }, [navigate, backendUri]);

//   const handleLogout = async () => {
//     try {
//       const token = localStorage.getItem("adminToken");
//       await axios.post(`${backendUri}/api/admin/logout`, {}, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       localStorage.removeItem("adminToken");
//       navigate("/");
//     } catch (error) {
//       console.error("Error logging out:", error);
//     }
//   };

//   const handleMenuAdd = (newItem) => {
//     try {
//       setMenuItems(prevItems => Array.isArray(prevItems) ? [...prevItems, newItem] : [newItem]);
//       toast.success("✅ Item added successfully!");
//     } catch (error) {
//       toast.error("❌ Error adding item.");
//       console.error("Error in handleMenuAdd:", error);
//     }
//     setIsAdding(false);
//   };


//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [showOrderModal, setShowOrderModal] = useState(false);
//   const backendUrl = import.meta.env.VITE_BACKEND_URI || 'http://localhost:3000';

//   const handleStatusUpdate = async (orderId, newStatus) => {
//     try {
//       const token = localStorage.getItem('adminToken');
//       await axios.put(
//         `${backendUrl}/api/orders/${orderId}/status`,
//         { status: newStatus },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       // Update your orders list or refetch data
//       toast.success(`Order status updated to ${newStatus}`);
//     } catch (error) {
//       console.error("Error updating order status:", error);
//       toast.error("Failed to update order status");
//     }
//   };
//   if (!admin) return <div className="h-screen flex items-center justify-center text-xl text-gray-600">Loading...</div>;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-100 via-orange-100 to-green-50 p-6">
//       <ToastContainer />
//       <div className="max-w-5xl mx-auto p-6">
//         <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-orange-500 mb-6">
//           Admin Dashboard
//         </h1>
  
//         {/* Profile Info */}
//         <div className="flex items-center space-x-4 mb-6">
//           {admin.profilePhoto ? (
//             <img
//               src={`${backendUri}${admin.profilePhoto}`}
//               alt="Profile"
//               className="w-24 h-24 rounded-full object-cover border-2 border-orange-500"
//             />
//           ) : (
//             <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-orange-500">
//               <span className="text-4xl text-gray-500">👤</span>
//             </div>
//           )}
//           <div>
//             <p className="text-lg font-semibold">Welcome, {admin.name}!</p>
//             <p>Email: {admin.email}</p>
//             <p>Mobile: {admin.mobile}</p>
//           </div>
//         </div>
  
//         {/* Action Buttons */}
//         <div className="flex items-center gap-4 mb-6">
//           <button
//             onClick={() => setIsAdding(true)}
//             className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
//           >
//             ➕ Add Menu Item
//           </button>
  
//           <button
//             onClick={handleLogout}
//             className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
//           >
//             🚪 Logout
//           </button>
//         </div>
//         // Add this section to your AdminDashboard return statement
// <div className="mb-8">
//   <h2 className="text-xl font-bold mb-4">Notifications ({unreadCount})</h2>
//   <div className="bg-white rounded-lg shadow p-4 max-h-64 overflow-y-auto">
//     {notifications.length === 0 ? (
//       <p className="text-gray-500">No notifications</p>
//     ) : (
//       notifications.map((notification) => (
//         <div 
//           key={notification._id} 
//           className={`p-3 border-b ${!notification.read ? 'bg-blue-50' : ''}`}
//         >
//           <p className="font-semibold">{notification.title}</p>
//           <p className="text-sm">{notification.message}</p>
//           <p className="text-xs text-gray-500">
//             {new Date(notification.createdAt).toLocaleString()}
//           </p>
//         </div>
//       ))
//     )}
//   </div>
// </div>
//         {/* MenuForm Component */}
//         {isAdding && (
//           <MenuForm
//             backendUri={backendUri}
//             onCancel={() => setIsAdding(false)}
//             onSuccess={handleMenuAdd}
//           />
//         )}
  
//         {/* MenuList Component */}
//         {Array.isArray(menuItems) && (
//           <MenuList
//             backendUri={backendUri}
//             menuItems={menuItems}
//             setMenuItems={setMenuItems}
//           />
//         )}
//       </div>

//       {showOrderModal && selectedOrder && (
//         <OrderDetailsModal
//           order={selectedOrder}
//           onClose={() => setShowOrderModal(false)}
//           onStatusUpdate={handleStatusUpdate}
//         />
//       )}
//     </div>
//   );
  
// };

// export default AdminDashboard;
