import React from "react";

const Footer = () => {
  return (
    <footer className="w-full py-6 px-4 bg-gradient-to-r from-green-100 via-white to-orange-100 text-gray-800">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center md:justify-around gap-2 text-center md:text-left">
        <div className="text-base md:text-lg font-semibold tracking-wide">
          © {new Date().getFullYear()}{" "}
          <span className="text-green-600 font-bold">BhojanQR</span>. All rights
          reserved.
        </div>

        <div className="text-sm md:text-base font-medium text-gray-700">
          Made with <span className="text-red-500 text-lg">❤️</span> by{" "}
          <span className="text-orange-600 font-semibold hover:underline hover:text-orange-500 transition-all duration-300 cursor-pointer">
            Bishwa Bandhu Parmar
          </span>
        </div>
      </div>

      {/* Cursor and glow effect */}
      <style>
        {`
          footer:hover {
            cursor: url('https://www.cursor.cc/cursor3d/23384.png'), auto;
          }

          footer span:hover {
            text-shadow: 0 0 8px rgba(255, 128, 0, 0.6);
          }
        `}
      </style>
    </footer>
  );
};

export default Footer;
