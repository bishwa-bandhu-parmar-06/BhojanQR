import React, { useEffect, useRef } from "react";
import {
  QrCode,
  UtensilsCrossed,
  Smartphone,
  Users,
  ChefHat,
  Zap,
  Award,
  Clock,
  Shield,
  Globe,
  Heart,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";

const AboutPage = () => {
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-slide-up");
            entry.target.style.opacity = "1";
          }
        });
      },
      { threshold: 0.1 },
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <QrCode className="w-8 h-8" />,
      title: "QR Code Generation",
      description:
        "Generate unique QR codes for each table, making ordering instant and contactless",
    },
    {
      icon: <UtensilsCrossed className="w-8 h-8" />,
      title: "Digital Menu",
      description:
        "Upload and manage your restaurant menu digitally with real-time updates",
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Scan & Order",
      description:
        "Customers scan QR code and order directly from their smartphones",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Table Management",
      description:
        "Efficiently manage multiple tables and track orders in real-time",
    },
  ];

  const stats = [
    { icon: <Award />, value: "50+", label: "Restaurants" },
    { icon: <Users />, value: "10k+", label: "Happy Customers" },
    { icon: <Clock />, value: "24/7", label: "Support" },
    { icon: <Shield />, value: "100%", label: "Secure" },
  ];

  const milestones = [
    {
      year: "2023",
      event: "BhojanQR Founded",
      description: "Started with a vision to revolutionize dining",
    },
    {
      year: "2024",
      event: "First 10 Restaurants",
      description: "Reached milestone of 10 restaurant partners",
    },
    {
      year: "2025",
      event: "10K Customers",
      description: "Served over 10,000 happy customers",
    },
    {
      year: "2026",
      event: "Pan-India Expansion",
      description: "Expanded services across major cities",
    },
  ];

  const values = [
    {
      icon: <Heart />,
      title: "Customer First",
      description: "We prioritize customer satisfaction in everything we do",
    },
    {
      icon: <TrendingUp />,
      title: "Innovation",
      description: "Constantly evolving to bring the best technology",
    },
    {
      icon: <Shield />,
      title: "Trust & Security",
      description: "Your data security is our top priority",
    },
    {
      icon: <Globe />,
      title: "Accessibility",
      description: "Making dining accessible for everyone",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full opacity-20 blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-200 rounded-full opacity-20 blur-3xl animate-float-delayed"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center mb-6 animate-slide-down">
              <span className="bg-orange-100 text-orange-700 text-sm font-medium px-4 py-2 rounded-full inline-flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                About BhojanQR
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-green-700 mb-6 animate-slide-up">
              Revolutionizing{" "}
              <span className="text-orange-500 relative inline-block">
                Dining
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 200 8"
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

            <p
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              A digital solution that connects restaurants with customers
              through QR code technology
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement - Full Width Banner */}
      <section
        ref={(el) => (sectionRefs.current[0] = el)}
        className="py-16 md:py-20 bg-gradient-to-r from-green-600 to-orange-500 text-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center opacity-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg md:text-xl leading-relaxed opacity-90">
              To transform the traditional dining experience by providing
              restaurants with a seamless digital platform that enhances
              customer convenience and streamlines operations.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section - Minimal Cards */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                ref={(el) => (sectionRefs.current[index + 1] = el)}
                className="relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 opacity-0 text-center border-b-4 border-green-500"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-green-600 w-10 h-10 mx-auto mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-green-700 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values - Elegant Cards */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-green-700 mb-4">
              Our Core <span className="text-orange-500">Values</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                ref={(el) => (sectionRefs.current[index + 5] = el)}
                className="group relative bg-gradient-to-br from-green-50 to-orange-50 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-scale-105 opacity-0 overflow-hidden"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-200 to-orange-200 rounded-full opacity-50 transform translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-500"></div>

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline - Vertical Style */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-green-50 via-white to-orange-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-green-700 mb-4">
              Our <span className="text-orange-500">Journey</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The milestones that shaped BhojanQR
            </p>
          </div>

          <div className="max-w-4xl mx-auto relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 to-orange-400"></div>

            {milestones.map((item, index) => (
              <div
                key={index}
                ref={(el) => (sectionRefs.current[index + 9] = el)}
                className={`relative flex items-start gap-6 mb-12 opacity-0 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Timeline dot */}
                <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-white border-4 border-green-500 rounded-full z-10"></div>

                {/* Content */}
                <div
                  className={`ml-16 md:ml-0 md:w-1/2 ${
                    index % 2 === 0 ? "md:pr-12" : "md:pl-12 md:ml-auto"
                  }`}
                >
                  <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-3">
                      {item.year}
                    </span>
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      {item.event}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How BhojanQR Works - Split Cards */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-green-700 mb-4">
              How <span className="text-orange-500">BhojanQR</span> Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple two-step process for restaurants and customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* For Restaurants */}
            <div
              ref={(el) => (sectionRefs.current[13] = el)}
              className="group relative bg-gradient-to-br from-green-600 to-green-700 p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 opacity-0 overflow-hidden"
            >
              {/* Decorative pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <ChefHat className="w-8 h-8 text-white" />
                  </div>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 font-bold text-xl">
                    1
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">
                  For Restaurants
                </h3>

                <ul className="space-y-3">
                  {[
                    "Register your restaurant on BhojanQR",
                    "Upload and list your complete menu",
                    "Generate unique QR codes for each table",
                    "Receive and manage orders in real-time",
                  ].map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-white/90"
                    >
                      <span className="text-white mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* For Customers */}
            <div
              ref={(el) => (sectionRefs.current[14] = el)}
              className="group relative bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 opacity-0 overflow-hidden"
              style={{ animationDelay: "0.2s" }}
            >
              {/* Decorative pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold text-xl">
                    2
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">
                  For Customers
                </h3>

                <ul className="space-y-3">
                  {[
                    "Scan the QR code on your table",
                    "Browse the digital menu instantly",
                    "Select dishes and place your order",
                    "Order directly from your table",
                  ].map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-white/90"
                    >
                      <span className="text-white mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Modern Cards */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-green-50 via-white to-orange-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-green-700 mb-4">
              Why Choose <span className="text-orange-500">BhojanQR?</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features that make dining seamless
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                ref={(el) => (sectionRefs.current[index + 15] = el)}
                className="group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 overflow-hidden"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Hover background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-orange-100 rounded-xl flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-green-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Corner accent */}
                <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-green-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info - Clean Footer Style */}
      {/* <section className="py-12 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-green-700 font-bold text-xl">BhojanQR</span>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-600">
                © 2026 All rights reserved
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-green-600" />
                <span>Bangalore</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-orange-500" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-green-600" />
                <span>hello@bhojanqr.com</span>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 bg-gray-100 rounded-full hover:bg-green-100 transition-colors"
              >
                <Facebook className="w-4 h-4 text-green-600" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-100 rounded-full hover:bg-orange-100 transition-colors"
              >
                <Twitter className="w-4 h-4 text-orange-500" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-100 rounded-full hover:bg-green-100 transition-colors"
              >
                <Instagram className="w-4 h-4 text-green-600" />
              </a>
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section - Compact */}
      <section className="py-12 bg-gradient-to-r from-green-600 to-orange-500 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to get started?</h3>
              <p className="opacity-90">
                Join BhojanQR today and transform your restaurant
              </p>
            </div>
            <button className="group flex items-center gap-2 bg-white text-green-700 font-semibold px-8 py-4 rounded-full hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <span>Get Started Now</span>
              <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(2deg);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(-2deg);
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
        .animate-slide-down {
          opacity: 0;
          animation: slide-down 0.6s ease-out forwards;
        }
        .animate-slide-up {
          opacity: 0;
          animation: slide-up 0.6s ease-out forwards;
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
