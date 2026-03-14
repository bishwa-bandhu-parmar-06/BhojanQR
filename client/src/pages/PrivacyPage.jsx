import React, { useEffect, useRef } from "react";
import {
  Shield,
  Lock,
  Eye,
  Database,
  Cookie,
  Mail,
  Globe,
  Smartphone,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

const PrivacyPage = () => {
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

  const lastUpdated = "February 14, 2026";

  const privacySections = [
    {
      icon: <Database className="w-6 h-6" />,
      title: "Information We Collect",
      content:
        "We collect information to provide better services to all our users. This includes:",
      points: [
        "Restaurant details (name, address, contact information, menu items)",
        "Customer information (name, email, phone number when provided)",
        "Usage data (how you interact with our platform, QR code scans)",
        "Device information (browser type, IP address, device identifiers)",
      ],
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "How We Use Your Information",
      content: "We use the information we collect to:",
      points: [
        "Provide and maintain our QR code menu services",
        "Process orders and manage restaurant operations",
        "Improve and personalize user experience",
        "Communicate updates, offers, and support information",
        "Ensure platform security and prevent fraud",
      ],
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Data Protection",
      content:
        "We implement robust security measures to protect your information:",
      points: [
        "256-bit SSL encryption for all data transmission",
        "Secure servers with firewall protection",
        "Regular security audits and penetration testing",
        "Strict access controls and authentication requirements",
      ],
    },
    {
      icon: <Cookie className="w-6 h-6" />,
      title: "Cookies & Tracking",
      content: "We use cookies and similar technologies to:",
      points: [
        "Remember your preferences and settings",
        "Understand how you use our platform",
        "Improve website functionality and performance",
        "Provide relevant content and advertisements",
      ],
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Information Sharing",
      content:
        "We do not sell your personal information. We may share information:",
      points: [
        "With restaurants to fulfill orders and provide services",
        "With service providers who assist in platform operations",
        "When required by law or to protect legal rights",
        "In aggregated, anonymized form for analytics",
      ],
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Your Rights & Choices",
      content: "You have the right to:",
      points: [
        "Access and review your personal information",
        "Request corrections or updates to your data",
        "Delete your account and associated information",
        "Opt-out of marketing communications",
        "Export your data in a portable format",
      ],
    },
  ];

  const quickFacts = [
    { icon: <Shield />, text: "256-bit SSL Encryption" },
    { icon: <Eye />, text: "No Third-Party Data Selling" },
    { icon: <Smartphone />, text: "Secure Mobile Access" },
    { icon: <FileText />, text: "GDPR Compliant" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 lg:py-36 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full opacity-20 blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-200 rounded-full opacity-20 blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-green-100 to-orange-100 rounded-full opacity-30 blur-3xl"></div>
        </div>

        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg className="w-full h-full">
            <defs>
              <pattern
                id="privacy-grid"
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
              fill="url(#privacy-grid)"
              className="text-green-800"
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center justify-center mb-6 animate-slide-down">
              <span className="bg-orange-100 text-orange-700 text-sm font-medium px-4 py-2 rounded-full inline-flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Last Updated: {lastUpdated}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-green-700 mb-6 animate-slide-up">
              Privacy{" "}
              <span className="text-orange-500 relative inline-block">
                Policy
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

            {/* Description */}
            <p
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              Your privacy matters to us. Learn how we collect, use, and protect
              your information.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Facts Strip */}
      <section className="py-8 bg-white/50 backdrop-blur-sm border-y border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickFacts.map((fact, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-3 text-gray-700"
              >
                <span className="text-green-600">{fact.icon}</span>
                <span className="text-sm font-medium">{fact.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section
        ref={(el) => (sectionRefs.current[0] = el)}
        className="py-16 md:py-20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-xl opacity-0">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-green-100 rounded-full">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-4">
                  Our Commitment to Privacy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  At BhojanQR, we are committed to protecting your privacy and
                  ensuring the security of your personal information. This
                  Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you use our QR code menu
                  platform and services. By using BhojanQR, you consent to the
                  practices described in this policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Sections Grid */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {privacySections.map((section, index) => (
              <div
                key={index}
                ref={(el) => (sectionRefs.current[index + 1] = el)}
                className="group relative bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 opacity-0 border-2 border-transparent hover:border-orange-200"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Card inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-green-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`p-3 rounded-xl ${
                        index % 2 === 0
                          ? "bg-green-100 text-green-600"
                          : "bg-orange-100 text-orange-500"
                      }`}
                    >
                      {section.icon}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-green-800">
                      {section.title}
                    </h3>
                  </div>

                  {/* Content */}
                  <p className="text-gray-700 mb-4">{section.content}</p>

                  {/* Points */}
                  <ul className="space-y-3">
                    {section.points.map((point, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-gray-600"
                      >
                        <CheckCircle
                          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            index % 2 === 0
                              ? "text-green-500"
                              : "text-orange-500"
                          }`}
                        />
                        <span className="text-sm md:text-base">{point}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Corner decoration */}
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Children's Privacy Notice */}
      <section
        ref={(el) => (sectionRefs.current[7] = el)}
        className="py-16 md:py-20 bg-white/50 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto opacity-0">
            <div className="flex items-start gap-4 p-8 bg-gradient-to-br from-green-50 to-orange-50 rounded-3xl">
              <div className="p-3 bg-green-100 rounded-full flex-shrink-0">
                <AlertCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-green-700 mb-3">
                  Children's Privacy
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  BhojanQR is not intended for individuals under the age of 13.
                  We do not knowingly collect personal information from children
                  under 13. If we become aware that a child under 13 has
                  provided us with personal information, we will take steps to
                  delete such information. If you believe we might have any
                  information from or about a child under 13, please contact us
                  immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Changes to Policy */}
      <section
        ref={(el) => (sectionRefs.current[8] = el)}
        className="py-16 md:py-20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-xl opacity-0">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <FileText className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-orange-600 mb-3">
                  Changes to This Privacy Policy
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may update our Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the "Last Updated" date at the top of
                  this policy.
                </p>
                <p className="text-gray-700">
                  You are advised to review this Privacy Policy periodically for
                  any changes. Changes to this Privacy Policy are effective when
                  they are posted on this page.
                </p>
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Last Updated: {lastUpdated}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-green-600 to-orange-500 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Have Questions About Privacy?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Our privacy team is here to help address any concerns or questions
              you may have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group inline-flex items-center justify-center gap-3 bg-white text-green-700 text-lg font-semibold px-8 py-4 rounded-full hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <Mail className="w-5 h-5" />
                <span>Contact Privacy Team</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white text-lg font-semibold px-8 py-4 rounded-full hover:bg-white/10 transform hover:scale-105 transition-all duration-300">
                <FileText className="w-5 h-5" />
                <span>Download Policy</span>
              </button>
            </div>
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

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
          animation: slide-down 0.8s ease-out forwards;
        }
        .animate-slide-up {
          opacity: 0;
          animation: slide-up 0.8s ease-out forwards;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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
            transform: translateY(-30px);
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

export default PrivacyPage;
