import React, { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import bhojanLogo from "../assets/BhojanQR-removebg.png";
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
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <div
        ref={billRef}
        className="p-4 border border-gray-300 rounded bg-white"
      >
        <div className="flex justify-center">
          <img src={bhojanLogo} alt="Bhojan QR Logo" className="h-40" />
        </div>

        <h1 className="text-2xl font-bold text-green-700 mb-4">
          🎉 Payment Successful!
        </h1>
        <p>
          <strong>Customer:</strong> {customerName}
        </p>
        <p>
          <strong>Table:</strong> {tableNumber}
        </p>
        <div className="flex items-center gap-2">
          <p>
            <strong>Order ID (Token):</strong> {paymentId}
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(paymentId);
              toast.success("Copied to clipboard ✅");
            }}
            className="text-green-700 hover:text-orange-500 text-xl"
            title="Copy Order ID"
          >
            <FiCopy />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-lg">Order Summary:</h3>
          <ul className="list-disc ml-6">
            {cart.map((item) => (
              <li key={item._id}>
                {item.name} x {item.quantity} = ₹{item.quantity * item.price}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-xl font-bold text-green-800">Total: ₹{total}</p>

        {/* ✅ Admin Email */}
        {adminEmail && (
          <p className="mt-6 text-sm text-gray-600 text-center italic">
            For queries, contact: <strong>{adminEmail}</strong>
          </p>
        )}
      </div>

      <button
        onClick={handleScreenshot}
        className="mt-6 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
      >
        📸 Take Screenshot of Invoice
      </button>
    </div>
  );
};

export default OrderSuccess;
