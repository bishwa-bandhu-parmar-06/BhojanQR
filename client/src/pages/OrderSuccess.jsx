

import React, { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import bhojanLogo from "/BhojanQR-removebg.png";
import { FiCopy } from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrderSuccess = () => {
  const location = useLocation();
  const billRef = useRef();
  const { customerName, tableNumber, cart, total, paymentId } = location.state;

  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("adminEmail");
    if (storedEmail) {
      setAdminEmail(storedEmail);
    }
  }, []);

  const handleScreenshot = async () => {
    const element = billRef.current;
    if (element) {
      const canvas = await html2canvas(element);
      const link = document.createElement("a");
      link.download = `invoice_${paymentId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-md sm:max-w-xl mx-auto bg-white shadow rounded-lg">
      <div
        ref={billRef}
        className="p-4 border border-gray-300 rounded-lg bg-white"
      >
        <div className="flex justify-center mb-4">
          <img src={bhojanLogo} alt="Bhojan QR Logo" className="h-32 sm:h-40" />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-green-700 mb-3 sm:mb-4 text-center">
          🎉 Payment Successful!
        </h1>
        <p className="text-sm sm:text-base mb-1">
          <strong>Customer:</strong> {customerName}
        </p>
        <p className="text-sm sm:text-base mb-1">
          <strong>Table:</strong> {tableNumber}
        </p>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm sm:text-base">
            <strong>Order ID (Token):</strong> {paymentId}
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(paymentId);
              toast.success("Copied to clipboard ✅");
            }}
            className="text-green-700 hover:text-orange-500 text-lg sm:text-xl"
            title="Copy Order ID"
          >
            <FiCopy />
          </button>
        </div>

        <div className="mt-3 sm:mt-4">
          <h3 className="font-semibold text-base sm:text-lg mb-2">Order Summary:</h3>
          <ul className="list-disc ml-5 sm:ml-6 text-sm sm:text-base">
            {cart.map((item) => (
              <li key={item._id}>
                {item.name} x {item.quantity} = ₹{item.quantity * item.price}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-3 sm:mt-4 text-lg sm:text-xl font-bold text-green-800">
          Total: ₹{total}
        </p>

        {/* ✅ Admin Email */}
        {adminEmail && (
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-600 text-center italic">
            For queries, contact: <strong>{adminEmail}</strong>
          </p>
        )}
      </div>

      <button
        onClick={handleScreenshot}
        className="mt-4 sm:mt-6 bg-orange-500 text-white px-3 py-2 rounded-md hover:bg-orange-600 text-sm sm:text-base w-full"
      >
        📸 Take Screenshot of Invoice
      </button>
    </div>
  );
};

export default OrderSuccess;