import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    mobile: "",
    otp: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const backendUrl =
    import.meta.env.VITE_BACKEND_URI;

  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!adminData.email) {
      toast.error("Please enter your email");
      return false;
    }
    if (!isLogin && !otpSent && (!adminData.name || !adminData.mobile)) {
      toast.error("Please fill all fields");
      return false;
    }
    if (otpSent && !adminData.otp) {
      toast.error("Please enter OTP");
      return false;
    }
    return true;
  };

  const handleOtpRequest = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const endpoint = isLogin ? "/api/admin/login" : "/api/admin/register";
      const { data } = await axios.post(`${backendUrl}${endpoint}`, {
        email: adminData.email,
        ...(!isLogin && { name: adminData.name, mobile: adminData.mobile }),
      });

      if (data.success) {
        toast.success("OTP sent to your email");
        setOtpSent(true);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error sending OTP";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const endpoint = isLogin
        ? "/api/admin/verify-login"
        : "/api/admin/verify-register";
      const { data } = await axios.post(`${backendUrl}${endpoint}`, {
        email: adminData.email,
        enteredOTP: adminData.otp,
      });

      if (data.success && data.token) {
        localStorage.setItem("adminEmail", adminData.email);
        localStorage.setItem("adminToken", data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

        toast.success(isLogin ? "Login successful" : "Registration successful");
        navigate("/admin/dashboard");
      } else {
        toast.error(data.message || "Verification failed");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Verification error";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsLogin(!isLogin);
    setOtpSent(false);
    setAdminData({ name: "", email: "", mobile: "", otp: "" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-100 via-white to-orange-100 px-4">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="flex flex-col lg:flex-row items-center bg-transparent rounded-xl  w-full max-w-5xl overflow-hidden ">
        {/* Image Section with Animation */}
        <div className="w-full lg:w-1/2 p-4 flex justify-center items-center from-orange-100 to-green-100">
          <img
            src="/frontpage-bgimage-removebg-min_1.png"
            alt="Illustration"
            className="w-200 h-200 object-contain transition-transform duration-500 ease-in-out transform hover:scale-105 animate-float"
          />
        </div>

        {/* Form Section */}
        <div className="w-full lg:w-1/2 p-10">
          <h2 className="text-3xl font-semibold text-green-700 text-center mb-8">
            {isLogin ? "Admin Login" : "Admin Registration"}
          </h2>

          <form onSubmit={otpSent ? handleOtpVerification : handleOtpRequest}>
            {!isLogin && !otpSent && (
              <>
                <input
                  type="text"
                  name="name"
                  value={adminData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Full Name"
                />
                <input
                  type="tel"
                  name="mobile"
                  value={adminData.mobile}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Mobile Number"
                />
              </>
            )}

            <input
              type="email"
              name="email"
              value={adminData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Email"
              disabled={otpSent}
            />

            {otpSent && (
              <input
                type="text"
                name="otp"
                value={adminData.otp}
                onChange={handleChange}
                required
                maxLength="6"
                className="w-full px-4 py-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter OTP"
              />
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded font-semibold text-white shadow-md transition-all duration-300 ${
                otpSent
                  ? "bg-green-700 hover:bg-green-800"
                  : "bg-orange-500 hover:bg-orange-600"
              } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {otpSent ? "Verifying..." : "Sending..."}
                </span>
              ) : otpSent ? (
                "Verify OTP"
              ) : (
                "Send OTP"
              )}
            </button>
          </form>

          <div className="text-center text-gray-600 mt-6">
            <button
              onClick={resetForm}
              className="text-orange-500 hover:underline font-medium"
              disabled={isLoading}
            >
              {isLogin ? "Need to register?" : "Already registered? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
