import React from "react";
import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin, Store } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-white border-t border-gray-100 pt-16 pb-8 font-sans overflow-hidden">
      {/* Top Gradient Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 via-green-500 to-orange-400"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="p-2 bg-orange-50 text-orange-500 rounded-xl group-hover:scale-110 transition-transform">
                <Store size={24} />
              </div>
              <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-600">
                BhojanQR
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Revolutionizing the dining experience with smart, contactless
              digital menus and seamless ordering for restaurants and customers
              alike.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-gray-500 hover:text-orange-500 text-sm font-medium transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-200 group-hover:bg-orange-500 transition-colors"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/track-order"
                  className="text-gray-500 hover:text-orange-500 text-sm font-medium transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-200 group-hover:bg-orange-500 transition-colors"></span>
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  to="/restaurant/auth"
                  className="text-gray-500 hover:text-orange-500 text-sm font-medium transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-200 group-hover:bg-orange-500 transition-colors"></span>
                  Partner with Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              Support & Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-gray-500 hover:text-green-600 text-sm font-medium transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-200 group-hover:bg-green-500 transition-colors"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/help"
                  className="text-gray-500 hover:text-green-600 text-sm font-medium transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-200 group-hover:bg-green-500 transition-colors"></span>
                  Help & FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy&policy"
                  className="text-gray-500 hover:text-green-600 text-sm font-medium transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-200 group-hover:bg-green-500 transition-colors"></span>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-500">
                <Mail className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <a
                  href="mailto:support@bhojanqr.com"
                  className="hover:text-orange-500 transition-colors"
                >
                  bhojanqr@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-500">
                <Phone className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span>+91 91423 64660</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-500">
                <MapPin className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <span>Gaya, Bihar, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 font-medium text-center md:text-left">
            © {new Date().getFullYear()}{" "}
            <span className="font-bold text-gray-700">BhojanQR</span>. All
            rights reserved.
          </div>

          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <span>by</span>
            <span className="text-orange-600 font-bold hover:text-orange-700 transition-colors cursor-pointer">
              Bishwa Bandhu Parmar
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
