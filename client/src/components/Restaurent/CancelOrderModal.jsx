import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

const CancelOrderModal = ({ isOpen, onClose, onConfirm, orderId }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reason.trim() === "") {
      setError("Cancellation reason is required.");
      return;
    }
    onConfirm(orderId, reason);
    setReason("");
    setError("");
    onClose();
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-red-50 p-5 border-b border-red-100 flex justify-between items-center">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-xl font-bold">Cancel Order</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-red-400 hover:bg-red-100 hover:text-red-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4 font-medium">
            Are you sure you want to cancel this order? If the payment is
            already done, it will initiate a refund. Please provide a reason
            below.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Reason for Cancellation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError(""); // Clear error when typing
                }}
                placeholder="e.g., Item out of stock, Customer requested, etc."
                className={`w-full p-3 rounded-xl border ${error ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"} focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-800 text-sm h-24 resize-none`}
              />
              {error && (
                <p className="text-red-500 text-xs font-bold mt-1.5">{error}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Go Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-colors"
              >
                Confirm Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
