import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { submitContactForm } from "../API/contactApi";

const ContactForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const toastId = toast.loading("Sending your message...");

    try {
      const response = await submitContactForm(formData);

      if (response.data.success) {
        toast.success("Message sent successfully!", { id: toastId });

        setFormData({ name: "", email: "", mobile: "", message: "" });

        onClose();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Something went wrong";
      toast.error(errorMessage, { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-700">
              Contact Us
            </h2>
            <button
              className="text-gray-500 hover:text-gray-700 transition-colors"
              onClick={onClose}
            >
              <FaTimes size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="mobile"
                className="block text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base"
              >
                Mobile Number
              </label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                required
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-colors duration-300 text-sm sm:text-base"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
