import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { requestForToken } from "../../config/firebase";
import {
  Mail,
  Phone,
  User,
  Lock,
  Shield,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";

import { useDispatch } from "react-redux";
import { loginSuccess } from "../../Features/auth/AuthSlice";

import { registerAdmin, loginAdmin } from "../../API/adminApi";

const AdminAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { email, password, name, mobile } = adminData;
    if (!email || !password) {
      toast.error("Email and Password are required");
      return false;
    }
    if (!isLogin && (!name || !mobile)) {
      toast.error("Please fill all fields for registration");
      return false;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let response;
      if (isLogin) {
        response = await loginAdmin({
          email: adminData.email,
          password: adminData.password,
        });
      } else {
        response = await registerAdmin(adminData);
      }

      const { data } = response;

      if (data.success) {
        if (data.token) {
          localStorage.setItem("adminToken", data.token);
        }

        const userData = data.admin || data.user || data.data;
        if (userData) {
          dispatch(loginSuccess({ user: userData }));
        }

        toast.success(
          isLogin ? "Welcome back!" : "Account created successfully!",
        );

        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1500);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Authentication failed";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setAdminData({ name: "", email: "", mobile: "", password: "" });
    setShowPassword(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-100 via-white to-orange-100 px-4 py-8 font-sans">
      <div className="flex flex-col lg:flex-row items-center bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden border border-white">
        <div className="w-full lg:w-1/2 p-8 flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-transparent">
          <img
            src="/frontpage-bgimage-removebg-min_1.png"
            alt="BhojanQR Admin"
            className="w-64 h-64 md:w-80 md:h-80 object-contain hover:scale-105 transition-transform duration-500 mb-6"
          />

          <div className="text-center lg:text-left max-w-sm">
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              BhojanQR Control Center
            </h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Your centralized hub for managing menus, kitchen operations, and
              restaurant growth.
            </p>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
                <Shield className="w-3.5 h-3.5" /> Enterprise Secure
              </span>
              <span className="flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5" /> Real-time Sync
              </span>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-3xl rotate-12 mb-4">
              {isLogin ? (
                <Lock className="w-10 h-10 text-green-600 -rotate-12" />
              ) : (
                <User className="w-10 h-10 text-orange-500 -rotate-12" />
              )}
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-500 mt-2 font-medium">
              {isLogin
                ? "Please sign in to continue"
                : "Start managing your restaurant today"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={adminData.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition-all outline-none"
                    placeholder="Full Name"
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="mobile"
                    value={adminData.mobile}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition-all outline-none"
                    placeholder="Mobile Number"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={adminData.email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition-all outline-none"
                placeholder="Email Address"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={adminData.password}
                onChange={handleChange}
                className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition-all outline-none"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transform transition-all active:scale-95 ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : isLogin
                    ? "bg-green-600 hover:bg-green-700 hover:shadow-green-200"
                    : "bg-orange-500 hover:bg-orange-600 hover:shadow-orange-200"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Register Now"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already registered?"}
              <button
                onClick={toggleMode}
                className="ml-2 font-bold text-green-700 hover:text-green-800 underline-offset-4 hover:underline"
              >
                {isLogin ? "Create one here" : "Sign in instead"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
