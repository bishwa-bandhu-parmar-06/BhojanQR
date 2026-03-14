import React, { useEffect, useRef, useState } from "react";
import {
  HelpCircle,
  Search,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Video,
  BookOpen,
  Users,
  QrCode,
  Smartphone,
  UtensilsCrossed,
  CreditCard,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  ExternalLink,
  Facebook,
  Twitter,
  Youtube,
  Send,
} from "lucide-react";

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
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

  const helpCategories = [
    { id: "all", name: "All Help", icon: <HelpCircle />, count: 24 },
    {
      id: "getting-started",
      name: "Getting Started",
      icon: <BookOpen />,
      count: 6,
    },
    {
      id: "for-restaurants",
      name: "For Restaurants",
      icon: <UtensilsCrossed />,
      count: 8,
    },
    { id: "for-customers", name: "For Customers", icon: <Users />, count: 5 },
    { id: "qr-codes", name: "QR Codes", icon: <QrCode />, count: 4 },
    {
      id: "billing",
      name: "Billing & Payments",
      icon: <CreditCard />,
      count: 3,
    },
  ];

  const faqs = [
    {
      id: 1,
      category: "getting-started",
      question: "How do I register my restaurant on BhojanQR?",
      answer:
        "To register your restaurant, click on 'Admin Login' and select 'Register New Restaurant'. Fill in your restaurant details, upload your menu, and complete the verification process. Once approved, you'll receive access to your dashboard where you can generate QR codes and manage orders.",
    },
    {
      id: 2,
      category: "getting-started",
      question: "How long does verification take?",
      answer:
        "Restaurant verification typically takes 24-48 hours. We'll notify you via email once your account is verified and ready to use.",
    },
    {
      id: 3,
      category: "for-restaurants",
      question: "How do I generate QR codes for my tables?",
      answer:
        "After logging into your dashboard, go to the 'QR Codes' section. Click 'Generate New QR Code', enter the table number, and download the unique QR code. You can print and place these codes on respective tables.",
    },
    {
      id: 4,
      category: "for-restaurants",
      question: "Can I update my menu in real-time?",
      answer:
        "Yes! You can update your menu anytime from the dashboard. Changes reflect instantly - add new items, update prices, mark items out of stock, or rearrange categories.",
    },
    {
      id: 5,
      category: "for-customers",
      question: "How do I scan the QR code?",
      answer:
        "Use your smartphone camera or any QR code scanner app. Point it at the QR code on your table, and you'll be automatically redirected to the restaurant's digital menu.",
    },
    {
      id: 6,
      category: "for-customers",
      question: "Can I order for multiple people?",
      answer:
        "Yes! Everyone at the table can scan the same QR code and place their own orders. The restaurant receives all orders together for your table.",
    },
    {
      id: 7,
      category: "qr-codes",
      question: "What if I lose my QR code?",
      answer:
        "Don't worry! You can regenerate QR codes from your dashboard at any time. Simply go to the QR Codes section and click 'Regenerate' for the specific table.",
    },
    {
      id: 8,
      category: "billing",
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit/debit cards, UPI, net banking, and popular digital wallets. Restaurants can choose to accept online payments or cash on delivery.",
    },
  ];

  const filteredFaqs =
    activeCategory === "all"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  const popularGuides = [
    {
      title: "Complete Guide for Restaurant Owners",
      icon: <UtensilsCrossed />,
      readTime: "8 min read",
      level: "Beginner",
    },
    {
      title: "How Customers Can Order via QR",
      icon: <Smartphone />,
      readTime: "5 min read",
      level: "Beginner",
    },
    {
      title: "Managing Multiple Tables & Orders",
      icon: <Users />,
      readTime: "10 min read",
      level: "Intermediate",
    },
    {
      title: "Troubleshooting QR Code Issues",
      icon: <QrCode />,
      readTime: "6 min read",
      level: "Advanced",
    },
  ];

  const supportOptions = [
    {
      icon: <MessageCircle />,
      title: "Live Chat",
      description: "Chat with our support team",
      availability: "24/7",
      action: "Start Chat",
      color: "green",
    },
    {
      icon: <Phone />,
      title: "Phone Support",
      description: "Speak with a representative",
      availability: "Mon-Fri, 9AM-6PM",
      action: "Call Now",
      color: "orange",
    },
    {
      icon: <Mail />,
      title: "Email Support",
      description: "Get help in your inbox",
      availability: "24hr response",
      action: "Send Email",
      color: "green",
    },
    {
      icon: <Video />,
      title: "Video Tutorials",
      description: "Watch step-by-step guides",
      availability: "On-demand",
      action: "Watch Now",
      color: "orange",
    },
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
                id="help-grid"
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
              fill="url(#help-grid)"
              className="text-green-800"
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center justify-center mb-6 animate-slide-down">
              <span className="bg-orange-100 text-orange-700 text-sm font-medium px-4 py-2 rounded-full inline-flex items-center">
                <HelpCircle className="w-4 h-4 mr-2" />
                24/7 Support Available
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-green-700 mb-6 animate-slide-up">
              How Can We{" "}
              <span className="text-orange-500 relative inline-block">
                Help?
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

            {/* Search Bar */}
            <div
              className="max-w-2xl mx-auto mt-8 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for help articles, FAQs, guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Help Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {helpCategories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`group relative p-4 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                  activeCategory === category.id
                    ? "bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-xl"
                    : "bg-white/90 backdrop-blur-sm hover:shadow-lg text-gray-700"
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 mb-2 ${
                      activeCategory === category.id
                        ? "text-white"
                        : "text-green-600"
                    }`}
                  >
                    {category.icon}
                  </div>
                  <span className="text-xs font-medium">{category.name}</span>
                  <span
                    className={`text-xs mt-1 ${
                      activeCategory === category.id
                        ? "text-white/80"
                        : "text-gray-400"
                    }`}
                  >
                    {category.count} articles
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-green-700 mb-4">
                Frequently Asked{" "}
                <span className="text-orange-500">Questions</span>
              </h2>
              <p className="text-gray-600">Quick answers to common questions</p>
            </div>

            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={faq.id}
                  ref={(el) => (sectionRefs.current[index] = el)}
                  className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 opacity-0"
                >
                  <button
                    onClick={() =>
                      setActiveFaq(activeFaq === faq.id ? null : faq.id)
                    }
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <span className="font-semibold text-gray-800">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-green-600 transition-transform duration-300 ${
                        activeFaq === faq.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`px-6 overflow-hidden transition-all duration-300 ${
                      activeFaq === faq.id ? "pb-4 max-h-40" : "max-h-0"
                    }`}
                  >
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Guides */}
      <section className="py-16 md:py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-green-700 mb-4">
              Popular <span className="text-orange-500">Guides</span>
            </h2>
            <p className="text-gray-600">
              Step-by-step tutorials to help you get started
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularGuides.map((guide, index) => (
              <div
                key={index}
                ref={(el) => (sectionRefs.current[index + 5] = el)}
                className="group relative bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 opacity-0 border-2 border-transparent hover:border-orange-200"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-green-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="w-12 h-12 mb-4 text-green-600">
                    {guide.icon}
                  </div>
                  <h3 className="font-bold text-green-800 mb-2">
                    {guide.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {guide.readTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {guide.level}
                    </span>
                  </div>
                  <button className="text-orange-600 font-medium inline-flex items-center gap-2 text-sm group/btn">
                    Read Guide
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-green-700 mb-4">
              Get in <span className="text-orange-500">Touch</span>
            </h2>
            <p className="text-gray-600">
              Choose how you'd like to connect with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportOptions.map((option, index) => (
              <div
                key={index}
                ref={(el) => (sectionRefs.current[index + 9] = el)}
                className="group relative bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 opacity-0 text-center"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div
                  className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    option.color === "green"
                      ? "bg-gradient-to-br from-green-50/50 to-transparent"
                      : "bg-gradient-to-br from-orange-50/50 to-transparent"
                  }`}
                ></div>

                <div className="relative z-10">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      option.color === "green"
                        ? "bg-green-100 text-green-600"
                        : "bg-orange-100 text-orange-500"
                    }`}
                  >
                    {option.icon}
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    {option.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {option.description}
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    {option.availability}
                  </p>
                  <button
                    className={`font-medium inline-flex items-center gap-2 text-sm ${
                      option.color === "green"
                        ? "text-green-600"
                        : "text-orange-500"
                    } group/btn`}
                  >
                    {option.action}
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community & Resources */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-green-600 to-orange-500 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Join Our Community
              </h2>
              <p className="text-xl opacity-90 mb-6">
                Connect with other restaurant owners and share experiences
              </p>
              <div className="flex gap-4">
                <button className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-all">
                  <Facebook className="w-6 h-6" />
                </button>
                <button className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-all">
                  <Twitter className="w-6 h-6" />
                </button>
                <button className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-all">
                  <Youtube className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl">
              <h3 className="text-2xl font-bold mb-4">Subscribe for Updates</h3>
              <p className="mb-6 opacity-90">
                Get the latest features and tips straight to your inbox
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white"
                />
                <button className="p-3 bg-white rounded-full text-green-600 hover:bg-opacity-90 transition-all">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <AlertCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-4">
              Still Need Help?
            </h2>
            <p className="text-gray-600 mb-8">
              Can't find what you're looking for? Our support team is here to
              help you 24/7.
            </p>
            <button className="group inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-green-500 text-white text-lg font-semibold px-8 py-4 rounded-full hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <MessageCircle className="w-5 h-5" />
              <span>Contact Support</span>
              <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
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

export default HelpPage;
