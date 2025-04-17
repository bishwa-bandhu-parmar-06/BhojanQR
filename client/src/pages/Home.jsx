


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
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

const Home = () => {
  const navigate = useNavigate();
  const backendUrl =
    import.meta.env.VITE_BACKEND_URI;
  // Refs and state
  const glowRef = useRef(null);
  const featureCardsRef = useRef([]);
  const stepCardsRef = useRef([]);
  const scannerRef = useRef(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    message: "",
  });

  // Cursor glow effect
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

  // Floating scanner animation - Disabled on mobile
  useEffect(() => {
    if (!scannerRef.current || window.innerWidth < 768) return;

    let posX = 100;
    let posY = 100;
    let velX = 0.5;
    let velY = 0.3;
    let isDragging = false;
    let startX, startY;

    const updatePosition = () => {
      if (!scannerRef.current) return;

      if (!isDragging) {
        posX += velX;
        posY += velY;

        const rect = scannerRef.current.getBoundingClientRect();
        if (posX + rect.width > window.innerWidth - 20 || posX < 20) {
          velX *= -1;
        }
        if (posY + rect.height > window.innerHeight - 20 || posY < 20) {
          velY *= -1;
        }
      }

      scannerRef.current.style.transform = `translate(${posX}px, ${posY}px)`;
      requestAnimationFrame(updatePosition);
    };

    const handleMouseDown = (e) => {
      if (!scannerRef.current) return;
      isDragging = true;
      startX = e.clientX - posX;
      startY = e.clientY - posY;
      scannerRef.current.style.cursor = "grabbing";
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      posX = e.clientX - startX;
      posY = e.clientY - startY;
    };

    const handleMouseUp = () => {
      if (!scannerRef.current) return;
      isDragging = false;
      scannerRef.current.style.cursor = "grab";
      velX = (Math.random() - 0.5) * 2;
      velY = (Math.random() - 0.5) * 2;
    };

    scannerRef.current.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Scroll animations
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
      { threshold: 0.1 }
    );

    featureCardsRef.current.forEach((card) => card && observer.observe(card));
    stepCardsRef.current.forEach((card) => card && observer.observe(card));

    return () => observer.disconnect();
  }, []);

  // Contact form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${backendUrl}/api/contact/submit`,
        formData
      );

      if (response.data.success) {
        toast.success(
          "Message sent successfully! We will get back to you soon."
        );
        setShowContactForm(false);
        setFormData({ name: "", email: "", mobile: "", message: "" });
      } else {
        toast.error(response.data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };

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
      text: "info@bhojanqr.com",
      action: () =>
        (window.location.href =
          "mailto:info@bhojanqr.com?subject=Inquiry%20about%20BhojanQR"),
    },
    {
      icon: <FaPhone size={20} />,
      text: "+1234567890",
      action: () => (window.location.href = "tel:+1234567890"),
    },
    {
      icon: <FaInfoCircle size={20} />,
      text: "About",
      action: () => {}, // Add navigation to about page
    },
    {
      icon: <FaShieldAlt size={20} />,
      text: "Privacy Policy",
      action: () => {}, // Add navigation to privacy policy
    },
    {
      icon: <FaQuestionCircle size={20} />,
      text: "Help",
      action: () => {}, // Add navigation to help page
    },
  ];

  return (
    <div className="overflow-hidden">
      <Toaster position="top-right" />
      {/* Floating QR Scanner - Hidden on mobile */}
      <div
        ref={scannerRef}
        className="hidden md:block fixed w-16 h-16 lg:w-24 lg:h-24 z-50 cursor-grab"
        style={{
          backgroundImage: "url('/scan-removebg.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          filter: "drop-shadow(0 0 10px rgba(74, 222, 128, 0.7))",
          willChange: "transform",
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-green-100 via-white to-orange-100 overflow-hidden px-4 sm:px-6">
        <div
          ref={glowRef}
          className="pointer-events-none fixed w-48 h-48 md:w-72 md:h-72 bg-green-300 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 z-0"
        ></div>

        <div className="flex flex-col lg:flex-row items-center justify-between pt-20 lg:pt-10 relative z-10">
          <div className="flex flex-col space-y-4 sm:space-y-6 w-full lg:w-3/5 text-center lg:text-left lg:ml-10 xl:ml-40">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-green-700 animate-slide-left"
              style={{ animationDelay: "1s", animationFillMode: "forwards" }}
            >
              Order Food <br className="hidden sm:block" /> With QR Code
            </h1>
            <h3
              className="text-lg sm:text-xl font-semibold text-green-800 animate-slide-up"
              style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
            >
              Scan the QR code to view menu <br className="hidden sm:block" /> and place your order.
            </h3>
            {/* Buttons side by side */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
              <button
                className="bg-orange-500 text-white text-base sm:text-lg w-full sm:w-[150px] h-[50px] py-2 rounded-full hover:bg-orange-600 transition duration-300 animate-pop-in"
                style={{
                  animationDelay: "0.9s",
                  animationFillMode: "forwards",
                }}
                onClick={() => navigate("/menu")}
              >
                Get Started
              </button>
              <button
                className="bg-orange-500 text-white text-base sm:text-lg w-full sm:w-[150px] h-[50px] py-2 rounded-full hover:bg-orange-600 transition duration-300 animate-pop-in"
                style={{
                  animationDelay: "0.9s",
                  animationFillMode: "forwards",
                }}
                onClick={() => navigate("/track-order")}
              >
                Track Order
              </button>
            </div>
          </div>

          <div
            className="w-full lg:w-2/5 h-full flex items-center justify-center mt-10 lg:mt-0 lg:mr-10 xl:mr-20 animate-slide-right opacity-0"
            style={{ animationDelay: "1.2s", animationFillMode: "forwards" }}
          >
            <img
              src="/scan-removebg.png"
              alt="Scan QR Code"
              className="h-64 sm:h-80 md:h-96 lg:h-full w-auto object-contain animate-float-up-down"
              style={{ animationDelay: "2s" }}
            />
          </div>
        </div>
      </section>

      {/* Why BhojanQR Section */}
      <section className="relative py-12 md:py-16 bg-gradient-to-br from-green-100 via-white to-orange-100 px-4 sm:px-6">
        <div className="container mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-700 text-center mb-8 sm:mb-16">
            Why <span className="text-orange-500">BhojanQR?</span>
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                ref={(el) => (featureCardsRef.current[index] = el)}
                className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 opacity-0 translate-y-10"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-100 rounded-full text-green-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-green-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-12 md:py-16 bg-gradient-to-br from-green-100 via-white to-orange-100 px-4 sm:px-6">
        <div className="container mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-700 text-center mb-8 sm:mb-16">
            How It <span className="text-orange-500">Works</span>
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                ref={(el) => (stepCardsRef.current[index] = el)}
                className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 opacity-0 translate-y-10"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-100 rounded-full text-green-600">
                    {step.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-green-800">
                    {step.title}
                  </h3>
                  <p className="text-lg sm:text-xl font-semibold text-orange-500 mt-2">
                    {step.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-12 md:py-16 bg-gradient-to-br from-green-100 via-white to-orange-100 px-4 sm:px-6">
        <div className="container mx-auto lg:ml-0 xl:ml-[100px]">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-700 mb-6 sm:mb-8">Contact</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-orange-500 mb-4 sm:mb-6">
                Quick Links
              </h2>
              <ul className="space-y-3 sm:space-y-4">
                {contactLinks.map((link, index) => (
                  <li
                    key={index}
                    className="flex items-center space-x-3 text-base sm:text-lg text-gray-700 hover:text-green-600 transition-colors cursor-pointer"
                    onClick={link.action}
                  >
                    <span className="text-green-500">{link.icon}</span>
                    <span>{link.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-orange-500 mb-4 sm:mb-6">
                Connect With Us
              </h2>
              <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">
                Have questions or feedback? We'd love to hear from you!
              </p>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-colors duration-300 text-base sm:text-lg"
                onClick={() => setShowContactForm(true)}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-green-700">
                  Contact Us
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowContactForm(false)}
                >
                  <FaTimes size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
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
                    <label htmlFor="email" className="block text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
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
                  <label htmlFor="mobile" className="block text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
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
                  <label htmlFor="message" className="block text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
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
      )}
    </div>
  );
};

export default Home;