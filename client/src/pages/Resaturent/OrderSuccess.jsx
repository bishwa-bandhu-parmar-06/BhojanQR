import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import bhojanLogo from "/BhojanQR-removebg.png";
import {
  FiCopy,
  FiImage,
  FiFileText,
  FiCheckCircle,
  FiHome,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

import { getPublicRestaurantDetails } from "../../API/restaurantApi";
import { getPublicAdminContact } from "../../API/adminApi";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const billRef = useRef();

  const {
    customerName = "Guest",
    tableNumber = "N/A",
    cart = [],
    total = 0,
    paymentId = "N/A",
    date = new Date().toISOString(),
  } = location.state || {};

  const [restaurantEmail, setRestaurantEmail] = useState("Loading email...");
  const [restaurantName, setRestaurantName] = useState(
    location.state?.restaurantName || "Loading...",
  );
  const [adminEmail, setAdminEmail] = useState("Loading support email...");

  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    if (!location.state) {
      navigate("/");
      return;
    }

    const fetchPublicDetails = async () => {
      try {
        const [adminRes, restRes] = await Promise.all([
          getPublicAdminContact().catch((e) => ({ data: { success: false } })),
          getPublicRestaurantDetails(restaurantId).catch((e) => ({
            data: { success: false },
          })),
        ]);

        if (adminRes.data?.success && adminRes.data?.data?.email) {
          setAdminEmail(adminRes.data.data.email);
        } else {
          setAdminEmail("support@bhojanqr.com");
        }

        if (restRes.data?.success && restRes.data?.data) {
          const restInfo = restRes.data.data;
          setRestaurantName(
            restInfo.restaurantName || location.state?.restaurantName,
          );
          setRestaurantEmail(restInfo.email || "contact@restaurant.com");
        } else {
          setRestaurantEmail("contact@restaurant.com");
        }
      } catch (error) {
        console.error("Failed to fetch public details", error);
        setAdminEmail("support@bhojanqr.com");
        setRestaurantEmail("contact@restaurant.com");
      }
    };

    if (restaurantId) {
      fetchPublicDetails();
    }
  }, [location, navigate, restaurantId]);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(paymentId);
    toast.success("Token is copied to clipboard!");
  };

  const handleDownloadImage = async () => {
    const element = billRef.current;
    if (element) {
      const canvas = await html2canvas(element, { scale: 2 });
      const link = document.createElement("a");
      link.download = `Receipt_${paymentId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Image downloaded successfully!");
    }
  };

  const handleDownloadPDF = async () => {
    const element = billRef.current;
    if (element) {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a5");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt_${paymentId}.pdf`);
      toast.success("PDF downloaded successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans">
      {/* SUCCESS BANNER */}
      <div className="text-center mb-6">
        <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
          Payment Successful!
        </h1>
        <p className="text-gray-500 font-medium">Thank you for your order.</p>
      </div>

      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl overflow-hidden mb-6 border border-gray-100">
        <div ref={billRef} className="p-6 sm:p-8 bg-white">
          <div className="text-center border-b border-dashed border-gray-300 pb-5 mb-5 relative">
            <img
              src={bhojanLogo}
              alt="Bhojan QR Logo"
              className="h-48 mx-auto object-contain -mt-8 -mb-10 relative z-10"
            />
            <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide relative z-20">
              {restaurantName}
            </h2>
            <p className="text-xs text-gray-500 mt-1 relative z-20">
              Contact: {restaurantEmail}
            </p>
          </div>

          <div className="flex justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-dashed border-gray-300 font-medium">
            <span>Date: {formattedDate}</span>
            <span>Time: {formattedTime}</span>
          </div>

          {/* CUSTOMER INFO */}
          <div className="space-y-2 mb-6 text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-500">Customer:</span>
              <span className="font-bold">{customerName}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="font-semibold text-gray-500">Table No:</span>
              <span className="font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded text-lg">
                {tableNumber}
              </span>
            </div>

            {/* Token Block */}
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mt-3 border border-gray-100">
              <span className="font-semibold text-gray-500 text-xs">
                Token:
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-gray-800 truncate w-32">
                  {paymentId}
                </span>
                <button
                  onClick={handleCopyToken}
                  className="text-gray-400 hover:text-green-600 transition-colors p-1"
                  title="Copy Token"
                >
                  <FiCopy size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* ORDER ITEMS */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-3 text-sm uppercase tracking-wide">
              Order Summary
            </h3>
            <ul className="space-y-3">
              {cart.map((item) => (
                <li key={item._id} className="flex justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-700">
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {item.quantity} x ₹{item.price}
                    </span>
                  </div>
                  <span className="font-bold text-gray-800">
                    ₹{item.quantity * item.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* TOTAL */}
          <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-6 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-600">Total Paid</span>
            <span className="text-2xl font-black text-green-600">₹{total}</span>
          </div>

          {/* FOOTER: Admin Contact */}
          <div className="text-center text-[10px] text-gray-400 mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <p>Need help with this transaction?</p>
            <p>
              Admin Email:{" "}
              <span className="font-bold text-gray-600">{adminEmail}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="w-full max-w-md flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadImage}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-orange-500 text-orange-600 font-bold py-3 px-4 rounded-xl hover:bg-orange-50 transition-colors shadow-sm"
          >
            <FiImage size={18} /> Save Image
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-shadow"
          >
            <FiFileText size={18} /> Download PDF
          </button>
        </div>

        <button
          onClick={() => navigate(`/menu/${restaurantId}?table=${tableNumber}`)}
          className="w-full mt-2 flex items-center justify-center gap-2 text-gray-500 hover:text-orange-600 font-semibold transition-colors py-2"
        >
          <FiHome size={16} /> Return to Menu
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
