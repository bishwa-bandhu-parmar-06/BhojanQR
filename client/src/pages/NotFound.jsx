import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, AlertCircle, UtensilsCrossed } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-green-50 via-white to-orange-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center relative overflow-hidden border border-gray-100">
        {/* Top Gradient Accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 to-green-500"></div>

        {/* Icon / Illustration */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="p-6 bg-orange-50 rounded-full">
              <UtensilsCrossed
                className="w-20 h-20 text-orange-400"
                strokeWidth={1.5}
              />
            </div>
            <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-sm">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Error Text */}
        <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 mb-2 drop-shadow-sm">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-gray-500 mb-8 font-medium">
          Looks like this dish is off the menu! The page you are looking for
          doesn't exist, has been moved, or the link is broken.
        </p>

        {/* Action Button */}
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
