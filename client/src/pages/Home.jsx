import React, { useEffect, useRef, useState } from "react";
import {
  FaQrcode,
  FaUtensils,
  FaListAlt,
  FaConciergeBell,
  FaClock,
  FaWifi,
  FaMoneyBillWave,
  FaUsers,
  FaEnvelope,
  FaPhone,
  FaInfoCircle,
  FaShieldAlt,
  FaQuestionCircle,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { submitContactForm } from "../API/contactApi";
import ContactForm from "../components/ContactForm";
import BhojanSupportBot from "../components/BhojanSupportBot";
const Home = () => {
  const navigate = useNavigate();
  const glowRef = useRef(null);
  const featureCardsRef = useRef([]);
  const stepCardsRef = useRef([]);
  const [showContactForm, setShowContactForm] = useState(false);

  const scannerRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    message: "",
  });

  useEffect(() => {
    const moveGlow = (e) => {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener("mousemove", moveGlow);
    return () => window.removeEventListener("mousemove", moveGlow);
  }, []);

  const getStepDescription = (index) => {
    const descriptions = [
      "Find the QR code on your table",
      "Browse our digital menu instantly",
      "Select your favorite dishes",
      "Get fresh food delivered to your table",
    ];
    return descriptions[index];
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-up");
          } else {
            entry.target.classList.remove("animate-fade-up");
          }
        });
      },
      { threshold: 0.1 },
    );

    featureCardsRef.current.forEach((card) => card && observer.observe(card));
    stepCardsRef.current.forEach((card) => card && observer.observe(card));

    return () => observer.disconnect();
  }, []);

  // Data
  const steps = [
    { icon: <FaQrcode size={50} />, title: "Scan", subtitle: "QR" },
    { icon: <FaListAlt size={50} />, title: "Browse", subtitle: "Menu" },
    { icon: <FaConciergeBell size={50} />, title: "Place", subtitle: "Order" },
    { icon: <FaUtensils size={50} />, title: "Food", subtitle: "Served" },
  ];

  const features = [
    {
      icon: <FaUsers size={40} />,
      title: "No queue",
      description: "Order from your table",
    },
    {
      icon: <FaMoneyBillWave size={40} />,
      title: "Easy & safe",
      description: "Cashless ordering",
    },
    {
      icon: <FaClock size={40} />,
      title: "Realtime updates",
      description: "Track your order",
    },
    {
      icon: <FaWifi size={40} />,
      title: "Offline-ready",
      description: "Works without internet",
    },
  ];

  const contactLinks = [
    {
      icon: <FaEnvelope size={20} />,
      text: "bhojanqr@gmail.com",
      action: () =>
        (window.location.href =
          "mailto:bhojanqr@gmail.com?subject=Inquiry%20about%20BhojanQR"),
    },
    {
      icon: <FaPhone size={20} />,
      text: "+91 - 9142364660",
      action: () => (window.location.href = "tel:+9142364660"),
    },
    {
      icon: <FaInfoCircle size={20} />,
      text: "About",
      action: () => navigate("/about"),
    },
    {
      icon: <FaShieldAlt size={20} />,
      text: "Privacy Policy",
      action: () => navigate("/privacy&policy"),
    },
    {
      icon: <FaQuestionCircle size={20} />,
      text: "Help",
      action: () => navigate("/help"),
    },
  ];

  return (
    <div className="overflow-hidden">
      <section className="relative min-h-screen bg-gradient-to-br from-green-100 via-white to-orange-100 overflow-hidden px-4 sm:px-6 lg:px-8">
        <div
          ref={glowRef}
          className="pointer-events-none fixed w-48 h-48 md:w-72 md:h-72 lg:w-96 lg:h-96 bg-green-300 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 z-0 animate-pulse-slow"
        ></div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full opacity-20 blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full opacity-20 blur-3xl animate-float-delayed"></div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen pt-20 lg:pt-0 relative z-10 max-w-7xl mx-auto">
          {/* Left Content */}
          <div className="flex flex-col space-y-6 sm:space-y-8 w-full lg:w-3/5 text-center lg:text-left lg:pr-8 xl:pr-12">
            {/* Badge */}
            <div
              className="inline-flex items-center justify-center lg:justify-start animate-slide-down"
              style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
            >
              <span className="bg-orange-100 text-orange-700 text-sm font-medium px-4 py-2 rounded-full inline-flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                🎉 New: Contactless Dining Experience
              </span>
            </div>

            {/* Main Heading */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-green-700 animate-slide-left leading-tight"
              style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
            >
              Order Food <br className="hidden sm:block" />
              <span className="text-orange-500 relative inline-block">
                With QR Code
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 200 8"
                  fill="none"
                >
                  <path
                    d="M1 3.5C50 7 150 7 199 3.5"
                    stroke="#f97316"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Description */}
            <h3
              className="text-lg sm:text-xl md:text-2xl text-gray-600 font-medium animate-slide-up max-w-2xl mx-auto lg:mx-0"
              style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}
            >
              Scan the QR code to view our digital menu and place your order
              instantly.
              <span className="block mt-2 text-base text-gray-500">
                No app download required • Contactless • Secure
              </span>
            </h3>

            {/* Stats Section */}
            <div
              className="grid grid-cols-3 gap-4 sm:gap-6 max-w-md mx-auto lg:mx-0 animate-slide-up"
              style={{ animationDelay: "1s", animationFillMode: "forwards" }}
            >
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-green-700">
                  500+
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Happy Customers
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-green-700">
                  50+
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Menu Items
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-green-700">
                  4.8
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  ⭐ Rating
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-pop-in"
              style={{ animationDelay: "1.2s", animationFillMode: "forwards" }}
            >
              <button
                className="group relative bg-orange-500 text-white text-base sm:text-lg px-8 py-4 rounded-full hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl overflow-hidden"
                onClick={() => navigate("/restaurant/auth")}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Get Started
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
                <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
              </button>

              <button
                className="group bg-transparent border-2 border-orange-500 text-orange-500 text-base sm:text-lg px-8 py-4 rounded-full hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2"
                onClick={() => navigate("/track-order")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Track Order
              </button>
            </div>

            {/* Trust badges */}
            <div
              className="flex items-center gap-6 justify-center lg:justify-start text-gray-400 text-sm animate-fade-in"
              style={{ animationDelay: "1.4s", animationFillMode: "forwards" }}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span>10k+ Users</span>
              </div>
            </div>
          </div>

          {/* Right Content - Image with floating elements */}
          <div
            className="w-full lg:w-2/5 h-full flex items-center justify-center mt-10 lg:mt-0 relative animate-slide-right"
            style={{ animationDelay: "1.5s", animationFillMode: "forwards" }}
          >
            {/* Floating cards */}
            <div className="absolute -top-10 -left-10 bg-white p-3 rounded-lg shadow-xl animate-float z-20 hidden lg:block">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold">Fast Delivery</div>
                  <div className="text-xs text-gray-500">30-40 min</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-10 -right-10 bg-white p-3 rounded-lg shadow-xl animate-float-delayed z-20 hidden lg:block">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold">Quality Food</div>
                  <div className="text-xs text-gray-500">100% Fresh</div>
                </div>
              </div>
            </div>

            {/* Main image */}
            <div className="relative group">
              <img
                src="/scan-removebg.png"
                alt="Scan QR Code"
                className="h-64 sm:h-80 md:h-96 lg:h-[500px] w-auto object-contain animate-float-up-down relative z-10 drop-shadow-2xl"
                style={{ animationDelay: "2s" }}
              />

              {/* QR code scanner animation */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-32 h-32 border-2 border-orange-500 rounded-lg relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-orange-500"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-orange-500"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-orange-500"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-orange-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-orange-500 animate-scan"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-orange-500 rounded-full mt-2 animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* Why BhojanQR Section */}
      <section className="relative py-16 md:py-24 lg:py-32 bg-gradient-to-br from-green-100 via-white to-orange-100 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-72 h-72 bg-green-200 rounded-full opacity-20 blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-200 rounded-full opacity-20 blur-3xl animate-float-delayed"></div>

          {/* Connection lines between features */}
          <svg
            className="absolute top-1/2 left-0 w-full h-32 hidden lg:block pointer-events-none"
            style={{ transform: "translateY(-50%)" }}
          >
            <defs>
              <linearGradient
                id="lineGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#f97316" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <line
              x1="15%"
              y1="50%"
              x2="85%"
              y2="50%"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              strokeDasharray="8 8"
            />
          </svg>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            {/* Badge */}
            <div className="inline-flex items-center justify-center mb-4 animate-slide-down">
              <span className="bg-orange-100 text-orange-700 text-sm font-medium px-4 py-2 rounded-full inline-flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Why BhojanQR
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-green-700 mb-4 animate-slide-up">
              Why{" "}
              <span className="text-orange-500 relative inline-block">
                BhojanQR?
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 200 8"
                  fill="none"
                >
                  <path
                    d="M1 3.5C50 7 150 7 199 3.5"
                    stroke="#f97316"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Subheading */}
            <p
              className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              Discover what makes us the preferred choice for modern dining
            </p>
          </div>

          {/* Features Grid - Now styled like How It Works */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10 relative">
            {features.map((feature, index) => (
              <div
                key={index}
                ref={(el) => (featureCardsRef.current[index] = el)}
                className="group relative bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 opacity-0 translate-y-10 border-2 border-transparent hover:border-orange-200"
                style={{
                  transitionDelay: `${index * 100}ms`,
                  animationFillMode: "forwards",
                }}
              >
                {/* Feature Number Badge - alternating colors like How It Works */}
                <div
                  className={`absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 z-20 ${
                    index % 2 === 0 ? "bg-green-600" : "bg-orange-500"
                  } text-white`}
                >
                  {index + 1}
                </div>

                {/* Card inner glow on hover */}
                <div
                  className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    index % 2 === 0
                      ? "bg-gradient-to-br from-green-50/50 to-transparent"
                      : "bg-gradient-to-br from-orange-50/50 to-transparent"
                  }`}
                ></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Icon container with alternating colors */}
                  <div
                    className={`mb-6 p-5 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative ${
                      index % 2 === 0
                        ? "bg-gradient-to-br from-green-100 to-green-50 text-green-600"
                        : "bg-gradient-to-br from-orange-100 to-orange-50 text-orange-500"
                    }`}
                  >
                    {/* Glow effect on hover */}
                    <div
                      className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${
                        index % 2 === 0 ? "bg-green-400" : "bg-orange-400"
                      }`}
                    ></div>

                    {/* Icon */}
                    <div className="relative z-10 text-4xl md:text-5xl transform group-hover:scale-110 transition-transform duration-500">
                      {feature.icon}
                    </div>
                  </div>

                  {/* Title with alternating colors */}
                  <h3
                    className={`text-xl md:text-2xl lg:text-3xl font-bold mb-3 transition-colors duration-300 ${
                      index % 2 === 0
                        ? "text-green-800 group-hover:text-green-700"
                        : "text-orange-800 group-hover:text-orange-700"
                    }`}
                  >
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* Feature highlight - appears on hover (like subtitle in How It Works) */}
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span
                      className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold ${
                        index % 2 === 0
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      ✓ Key Benefit
                    </span>
                  </div>

                  {/* Connecting line between features */}
                  {index < features.length - 1 && (
                    <div className="hidden lg:block absolute -right-6 top-1/2 transform -translate-y-1/2 z-30">
                      <svg
                        className={`w-8 h-8 animate-pulse ${
                          index % 2 === 0 ? "text-green-400" : "text-orange-400"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Corner decorations - alternating colors */}
                <div
                  className={`absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 rounded-tl-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    index % 2 === 0 ? "border-green-200" : "border-orange-200"
                  }`}
                ></div>
                <div
                  className={`absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 rounded-br-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    index % 2 === 0 ? "border-green-200" : "border-orange-200"
                  }`}
                ></div>
              </div>
            ))}
          </div>

          {/* Bottom CTA with ORANGE explore button (as requested) */}
          <div
            className="text-center mt-12 md:mt-16 lg:mt-20 animate-fade-in"
            style={{ animationDelay: "1s" }}
          >
            <button
              onClick={() => navigate("/restaurant/auth")}
              className="group relative inline-flex items-center gap-3 bg-orange-500 text-white text-lg font-semibold px-8 py-4 rounded-full hover:bg-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Explore Features</span>
              <svg
                className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            </button>
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="relative py-16 md:py-24 lg:py-32 bg-gradient-to-br from-green-100 via-white to-orange-100 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-72 h-72 bg-green-200 rounded-full opacity-20 blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-200 rounded-full opacity-20 blur-3xl animate-float-delayed"></div>

          {/* Connection lines between steps - alternating colors */}
          <svg
            className="absolute top-1/2 left-0 w-full h-32 hidden lg:block pointer-events-none"
            style={{ transform: "translateY(-50%)" }}
          >
            <defs>
              <linearGradient
                id="lineGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#f97316" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <line
              x1="15%"
              y1="50%"
              x2="85%"
              y2="50%"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              strokeDasharray="8 8"
            />
          </svg>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            {/* Badge with orange accent */}
            <div className="inline-flex items-center justify-center mb-4 animate-slide-down">
              <span className="bg-orange-100 text-orange-700 text-sm font-medium px-4 py-2 rounded-full inline-flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Simple 4-Step Process
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-green-700 mb-4 animate-slide-up">
              How It{" "}
              <span className="text-orange-500 relative inline-block">
                Works
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 200 8"
                  fill="none"
                >
                  <path
                    d="M1 3.5C50 7 150 7 199 3.5"
                    stroke="#f97316"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Subheading */}
            <p
              className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              Get your favorite food in just four simple steps
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10 relative">
            {steps.map((step, index) => (
              <div
                key={index}
                ref={(el) => (stepCardsRef.current[index] = el)}
                className="group relative bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 opacity-0 translate-y-10 border-2 border-transparent hover:border-orange-200"
                style={{
                  transitionDelay: `${index * 100}ms`,
                  animationFillMode: "forwards",
                }}
              >
                {/* Step Number Badge - alternating colors */}
                <div
                  className={`absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 z-20 ${
                    index % 2 === 0 ? "bg-green-600" : "bg-orange-500"
                  } text-white`}
                >
                  {index + 1}
                </div>

                {/* Card inner glow on hover */}
                <div
                  className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    index % 2 === 0
                      ? "bg-gradient-to-br from-green-50/50 to-transparent"
                      : "bg-gradient-to-br from-orange-50/50 to-transparent"
                  }`}
                ></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Icon container with alternating colors */}
                  <div
                    className={`mb-6 p-5 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative ${
                      index % 2 === 0
                        ? "bg-gradient-to-br from-green-100 to-green-50 text-green-600"
                        : "bg-gradient-to-br from-orange-100 to-orange-50 text-orange-500"
                    }`}
                  >
                    {/* Glow effect on hover */}
                    <div
                      className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${
                        index % 2 === 0 ? "bg-green-400" : "bg-orange-400"
                      }`}
                    ></div>

                    {/* Icon */}
                    <div className="relative z-10 text-4xl md:text-5xl transform group-hover:scale-110 transition-transform duration-500">
                      {step.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-xl md:text-2xl lg:text-3xl font-bold mb-3 transition-colors duration-300 ${
                      index % 2 === 0
                        ? "text-green-800 group-hover:text-green-700"
                        : "text-orange-800 group-hover:text-orange-700"
                    }`}
                  >
                    {step.title}
                  </h3>

                  {/* Subtitle - alternating button colors */}
                  <div className="mt-3 mb-2">
                    <span
                      className={`inline-block px-6 py-2.5 rounded-full text-sm md:text-base font-semibold shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105 ${
                        index % 2 === 0
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-orange-500 text-white hover:bg-orange-600"
                      }`}
                    >
                      {step.subtitle}
                    </span>
                  </div>

                  {/* Optional description */}
                  <p className="text-sm text-gray-500 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {getStepDescription(index)}
                  </p>

                  {/* Connecting line between steps - alternating colors */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-6 top-1/2 transform -translate-y-1/2 z-30">
                      <svg
                        className={`w-8 h-8 animate-pulse ${
                          index % 2 === 0 ? "text-green-400" : "text-orange-400"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Corner decorations - alternating colors */}
                <div
                  className={`absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 rounded-tl-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    index % 2 === 0 ? "border-green-200" : "border-orange-200"
                  }`}
                ></div>
                <div
                  className={`absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 rounded-br-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    index % 2 === 0 ? "border-green-200" : "border-orange-200"
                  }`}
                ></div>
              </div>
            ))}
          </div>

          {/* Bottom CTA with balanced colors */}
          <div
            className="text-center mt-12 md:mt-16 lg:mt-20 animate-fade-in"
            style={{ animationDelay: "1s" }}
          >
            <button
              onClick={() => navigate("/restaurant/auth")}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-orange-500 text-white text-lg font-semibold px-8 py-4 rounded-full hover:from-green-700 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Start Your Order Now</span>
              <svg
                className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            </button>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section className="relative py-16 md:py-24 lg:py-32 bg-gradient-to-br from-green-100 via-white to-orange-100 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-green-200 rounded-full opacity-20 blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-orange-200 rounded-full opacity-20 blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-green-100 to-orange-100 rounded-full opacity-30 blur-3xl"></div>
        </div>

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="contact-grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#contact-grid)"
              className="text-green-800"
            />
          </svg>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Section Header */}
          <div className="text-center md:text-left mb-12 md:mb-16 lg:mb-20">
            {/* Badge */}
            <div className="inline-flex items-center justify-center md:justify-start mb-4 animate-slide-down">
              <span className="bg-orange-100 text-orange-700 text-sm font-medium px-4 py-2 rounded-full inline-flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Get In Touch
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-green-700 mb-4 animate-slide-up">
              Contact{" "}
              <span className="text-orange-500 relative inline-block">
                Us
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 200 8"
                  fill="none"
                >
                  <path
                    d="M1 3.5C50 7 150 7 199 3.5"
                    stroke="#f97316"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Subheading */}
            <p
              className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto md:mx-0 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              We're here to help! Reach out to us anytime
            </p>
          </div>

          {/* Contact Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
            {/* Quick Links Column */}
            <div
              className="group relative bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-orange-200 animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              {/* Card inner glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-green-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-orange-500 mb-6 flex items-center gap-3">
                  <span className="w-1 h-8 bg-gradient-to-b from-orange-500 to-green-500 rounded-full"></span>
                  Quick Links
                </h2>

                <ul className="space-y-4">
                  {contactLinks.map((link, index) => (
                    <li
                      key={index}
                      className="flex items-center space-x-4 text-base sm:text-lg text-gray-700 hover:text-green-600 transition-all duration-300 cursor-pointer group/item transform hover:translate-x-2"
                      onClick={link.action}
                      style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                    >
                      <span className="text-green-500 bg-green-100 p-2 rounded-full group-hover/item:bg-green-200 group-hover/item:scale-110 transition-all duration-300">
                        {link.icon}
                      </span>
                      <span className="font-medium">{link.text}</span>
                      <svg
                        className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-opacity ml-auto text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </li>
                  ))}
                </ul>

                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-100 to-green-100 rounded-full opacity-30 blur-2xl"></div>
              </div>
            </div>

            {/* Connect With Us Column */}
            <div
              className="group relative bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-green-200 animate-slide-up"
              style={{ animationDelay: "0.5s" }}
            >
              {/* Card inner glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-orange-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-6 flex items-center gap-3">
                  <span className="w-1 h-8 bg-gradient-to-b from-green-500 to-orange-500 rounded-full"></span>
                  Connect With Us
                </h2>

                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Have questions or feedback? We'd love to hear from you! Our
                  team typically responds within 24 hours.
                </p>

                {/* Contact features */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">
                      24/7
                    </div>
                    <div className="text-xs text-gray-500">Support</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-xl">
                    <div className="text-2xl font-bold text-orange-600">
                      &lt;4h
                    </div>
                    <div className="text-xs text-gray-500">Response</div>
                  </div>
                </div>

                {/* Message button */}
                <button
                  className="group/btn relative inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-green-500 text-white text-lg font-semibold px-8 py-4 rounded-full hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden w-full sm:w-auto justify-center"
                  onClick={() => setShowContactForm(true)}
                >
                  <span className="relative z-10">Send Message</span>
                  <svg
                    className="relative z-10 w-5 h-5 group-hover/btn:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                  <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300"></span>
                </button>

                {/* Alternative contact info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Or email us directly at:{" "}
                    <a
                      href="mailto:support@bhojanqr.com"
                      className="text-orange-600 hover:underline font-medium"
                    >
                      support@bhojanqr.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom decoration */}
          <div
            className="mt-12 text-center animate-fade-in"
            style={{ animationDelay: "0.7s" }}
          >
            <p className="text-gray-500 text-sm">
              ⚡ We typically respond within 24 hours on business days
            </p>
          </div>
        </div>

        {/* Add custom animations */}
      </section>

      {showContactForm && (
        <ContactForm onClose={() => setShowContactForm(false)} />
      )}

      {/* 🚀 SALES & SUPPORT BOT ADDED HERE */}
      <BhojanSupportBot />
    </div>
  );
};

export default Home;
