import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../Features/auth/AuthSlice";
import {
  Mail,
  Phone,
  User,
  Lock,
  Shield,
  Store,
  FileText,
  UploadCloud,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";

import { registerRestaurant, loginRestaurant } from "../../API/restaurantApi";
import { requestForToken } from "../../config/firebase";
const RestaurantAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [restaurantData, setRestaurantData] = useState({
    restaurantName: "",
    ownerName: "",
    email: "",
    mobile: "",
    password: "",
    idType: "FSSAI",
    idNumber: "",
  });

  const [govtIdDocument, setGovtIdDocument] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setRestaurantData({ ...restaurantData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setGovtIdDocument(e.target.files[0]);
  };

  const validateForm = () => {
    const { email, password, restaurantName, ownerName, mobile, idNumber } =
      restaurantData;

    if (!email || !password) {
      toast.error("Email and Password are required");
      return false;
    }
    if (!isLogin) {
      if (!restaurantName || !ownerName || !mobile || !idNumber) {
        toast.error("Please fill all required fields, including Govt ID");
        return false;
      }
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
      if (isLogin) {
        const response = await loginRestaurant({
          email: restaurantData.email,
          password: restaurantData.password,
        });

        if (response.data.success) {
          const userData = response.data.data || response.data.restaurant;
          if (userData) {
            dispatch(loginSuccess({ user: userData }));
            if (userData.status === "pending") {
              toast.success("Login successful. Awaiting admin approval.");
              setTimeout(() => navigate("/restaurant/pending-approval"), 1500);
            } else if (userData.status === "rejected") {
              toast.error("Your application has been rejected.");
            } else {
              toast.success("Welcome back!");
              setTimeout(() => navigate("/restaurant/dashboard"));
            }
          }
        }
      } else {
        const formData = new FormData();
        formData.append("restaurantName", restaurantData.restaurantName);
        formData.append("ownerName", restaurantData.ownerName);
        formData.append("email", restaurantData.email);
        formData.append("mobile", restaurantData.mobile);
        formData.append("password", restaurantData.password);
        formData.append("idType", restaurantData.idType);
        formData.append("idNumber", restaurantData.idNumber);

        if (govtIdDocument) {
          formData.append("govtIdDocument", govtIdDocument);
        }

        const response = await registerRestaurant(formData);

        if (response.data.success) {
          toast.success(
            response.data.message ||
              "Registration successful! Pending admin approval.",
          );
          setTimeout(() => {
            setIsLogin(true);
            setRestaurantData((prev) => ({
              ...prev,
              password: "",
              idNumber: "",
            }));
            setGovtIdDocument(null);
          }, 2000);
        }
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
    setRestaurantData({
      restaurantName: "",
      ownerName: "",
      email: "",
      mobile: "",
      password: "",
      idType: "FSSAI",
      idNumber: "",
    });
    setGovtIdDocument(null);
    setShowPassword(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-100 via-white to-green-100 px-4 py-8 font-sans">
      <div className="flex flex-col lg:flex-row items-stretch bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden border border-white transition-all duration-500">
        <div className="w-full lg:w-2/5 p-8 flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-transparent">
          <img
            src="/frontpage-bgimage-removebg-min_1.png"
            alt="BhojanQR Partner"
            className="w-48 h-48 md:w-64 md:h-64 object-contain hover:scale-105 transition-transform duration-500 mb-6"
          />
          <div className="text-center max-w-sm">
            <h3 className="text-2xl font-bold text-orange-800 mb-2">
              BhojanQR Partner Portal
            </h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Grow your restaurant's reach, manage digital menus, and streamline
              your order pipeline all in one place.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <span className="flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full">
                <Store className="w-3.5 h-3.5" /> Digital Menu
              </span>
              <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
                <Shield className="w-3.5 h-3.5" /> Secure Access
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full lg:w-3/5 p-8 md:p-12 bg-white h-[650px] overflow-y-auto custom-scrollbar">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800">
              {isLogin ? "Restaurant Login" : "Partner Registration"}
            </h2>
            <p className="text-gray-500 mt-2 font-medium">
              {isLogin
                ? "Sign in to manage your restaurant"
                : "Join BhojanQR and digitize your business"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="restaurantName"
                    value={restaurantData.restaurantName}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Restaurant Name *"
                  />
                </div>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="ownerName"
                    value={restaurantData.ownerName}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Owner Full Name *"
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="mobile"
                    value={restaurantData.mobile}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Mobile Number *"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                  <div className="md:col-span-1 relative">
                    <select
                      name="idType"
                      value={restaurantData.idType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none appearance-none cursor-pointer text-gray-700 font-medium"
                    >
                      <option value="FSSAI">FSSAI</option>
                      <option value="GSTIN">GSTIN</option>
                      <option value="PAN">PAN</option>
                      <option value="Aadhar">Aadhar</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  </div>

                  <div className="md:col-span-2 relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="idNumber"
                      value={restaurantData.idNumber}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder={`${restaurantData.idType} Number *`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                    Upload Document (Optional)
                  </label>
                  <div className="relative w-full">
                    <input
                      type="file"
                      id="govtIdDocument"
                      name="govtIdDocument"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="govtIdDocument"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-orange-50 hover:border-orange-400 transition-all text-sm font-medium text-gray-600"
                    >
                      <UploadCloud className="w-5 h-5 text-orange-500" />
                      {govtIdDocument
                        ? govtIdDocument.name
                        : "Click to select file (Image/PDF)"}
                    </label>
                  </div>
                </div>
              </>
            )}

            <div className="relative border-t border-gray-100 pt-4">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 mt-2" />
              <input
                type="email"
                name="email"
                value={restaurantData.email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="Email Address *"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={restaurantData.password}
                onChange={handleChange}
                className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="Password *"
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
              className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transform transition-all mt-4 active:scale-95 ${isLoading ? "bg-gray-400 cursor-not-allowed" : isLogin ? "bg-orange-500 hover:bg-orange-600 hover:shadow-orange-200" : "bg-green-600 hover:bg-green-700 hover:shadow-green-200"}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Submit Application"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {isLogin
                ? "Want to partner with us?"
                : "Already an approved partner?"}
              <button
                onClick={toggleMode}
                className="ml-2 font-bold text-orange-600 hover:text-orange-800 underline-offset-4 hover:underline"
              >
                {isLogin ? "Register here" : "Sign in instead"}
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
      `}</style>
    </div>
  );
};

export default RestaurantAuth;
