import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  useParams,
  useSearchParams,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Store,
  Tag,
  Plus,
  ShoppingBag,
  Filter,
  LayoutGrid,
  List,
  Smartphone,
  X,
} from "lucide-react";
import { getPublicMenu } from "../../API/menuApi";
import { getAppVersion } from "../../API/versionApi";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../Features/Cart/CartSlice";
import CallWaiterButton from "../Restaurent/CallWaiterButton";
const PublicMenu = () => {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table");
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart?.items || []);
  const cartCount = cartItems.length;

  const [allMenuItems, setAllMenuItems] = useState([]);
  const [restaurantName, setRestaurantName] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  const [visibleCount, setVisibleCount] = useState(8);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState(1000);
  const [showFilters, setShowFilters] = useState(false);

  // App Prompt State
  const [showAppPrompt, setShowAppPrompt] = useState(false);
  const [appNotFound, setAppNotFound] = useState(false);
  const [apkDownloadUrl, setApkDownloadUrl] = useState("");

  const loaderRef = useRef(null);
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      setTimeout(() => setShowAppPrompt(true), 1000);
    }
  }, []);

  useEffect(() => {
    const fetchAppUrl = async () => {
      try {
        const res = await getAppVersion();
        if (res.data?.success && res.data?.data?.updateUrl) {
          setApkDownloadUrl(res.data.data.updateUrl);
        }
      } catch (error) {
        console.log("Failed to fetch APK URL from DB", error);
      }
    };
    fetchAppUrl();
  }, []);

  const handleOpenInApp = () => {
    const deepLinkUrl = `bhojanqr://menu/${restaurantId}?table=${tableNumber || ""}`;
    window.location.href = deepLinkUrl;
    setTimeout(() => {
      if (!document.hidden) {
        console.log("App not installed. Showing download prompt.");
        setAppNotFound(true);
      }
    }, 2500);
  };

  const handleDownloadAPK = () => {
    if (apkDownloadUrl) {
      window.location.href = apkDownloadUrl;
      toast.success("Downloading BhojanQR App...");
    } else {
      toast.error("Download link is currently unavailable.");
    }
    setShowAppPrompt(false);
  };

  const handleContinueInBrowser = () => {
    setShowAppPrompt(false);
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await getPublicMenu(restaurantId);
        const items = res.data.data;
        setAllMenuItems(items);
        if (items.length > 0 && items[0].restaurant) {
          setRestaurantName(items[0].restaurant.restaurantName);
        }
      } catch (error) {
        toast.error("Failed to load menu.");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [restaurantId]);

  const filteredItems = useMemo(() => {
    return allMenuItems.filter((item) => {
      const matchCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchPrice = item.price <= (priceRange || 99999);
      return matchCategory && matchPrice;
    });
  }, [allMenuItems, selectedCategory, priceRange]);

  const categories = [
    "All",
    ...new Set(allMenuItems.map((item) => item.category)),
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredItems.length) {
          setVisibleCount((prev) => prev + 4);
        }
      },
      { threshold: 0.1 },
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filteredItems.length]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans relative overflow-hidden">
      {/* App Prompt Overlay */}
      {showAppPrompt && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
                  <Smartphone size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-800">
                    Use the App!
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">
                    For a faster, smoother ordering experience.
                  </p>
                </div>
              </div>
              <button
                onClick={handleContinueInBrowser}
                className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              {!appNotFound ? (
                <button
                  onClick={handleOpenInApp}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95"
                >
                  Open in BhojanQR App
                </button>
              ) : (
                <button
                  onClick={handleDownloadAPK}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95"
                >
                  Download APK (Android)
                </button>
              )}
              <button
                onClick={handleContinueInBrowser}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl transition-all"
              >
                Continue in Browser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. MAIN NAVBAR */}
      <header className="bg-white sticky top-0 z-[60] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 text-white rounded-lg shadow-orange-200 shadow-lg">
              <Store size={20} />
            </div>
            <h1 className="text-lg font-black text-gray-800 tracking-tight">
              {restaurantName}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
            >
              {viewMode === "grid" ? (
                <List size={20} />
              ) : (
                <LayoutGrid size={20} />
              )}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border flex items-center gap-2 transition-all ${showFilters ? "bg-orange-500 text-white border-orange-500" : "bg-gray-100 text-gray-600"}`}
            >
              <Filter size={20} />
              <span className="hidden sm:inline font-bold text-sm">
                Filters
              </span>
            </button>
          </div>
        </div>

        {/* 2. FILTER NAVBAR */}
        {showFilters && (
          <div className="bg-white border-t border-gray-100 shadow-md animate-in slide-in-from-top duration-200">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row gap-6 md:items-center justify-between">
              <div className="flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
                  Categories
                </p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? "bg-orange-500 text-white shadow-lg shadow-orange-100" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-64">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Max Price (₹)
                  </p>
                  <input
                    type="number"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-20 px-2 py-1 text-xs font-bold border rounded bg-gray-50 text-orange-600"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="10"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 3. MENU CONTENT */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "max-w-3xl mx-auto space-y-4"
          }
        >
          {filteredItems.slice(0, visibleCount).map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex transition-shadow hover:shadow-lg ${viewMode === "list" ? "flex-row h-40" : "flex-col"}`}
            >
              <div
                className={`relative bg-gray-100 overflow-hidden group ${viewMode === "list" ? "w-40" : "h-44 w-full"}`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full font-extrabold text-gray-900 shadow-sm text-sm border border-gray-100">
                  ₹{item.price}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1.5">
                  <Tag size={12} strokeWidth={3} /> {item.category}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 leading-tight line-clamp-2">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 flex-1 mb-4">
                  {item.description || "Freshly prepared for you."}
                </p>

                <button
                  onClick={() => {
                    dispatch(addToCart(item));
                    toast.success(`${item.name} added!`);
                  }}
                  className="w-full mt-auto bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white border border-orange-200 hover:border-orange-500 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Plus size={18} strokeWidth={2.5} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        <div
          ref={loaderRef}
          className="h-20 flex items-center justify-center mt-8"
        >
          {visibleCount < filteredItems.length && (
            <div className="w-8 h-8 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
          )}
        </div>
      </main>

      {/* 4. FIXED VIEW ORDER BUTTON */}  
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-max">
          <button
            onClick={() =>
              navigate(`/menu/${restaurantId}/cart${location.search}`)
            }
            className="bg-orange-600 text-white h-14 px-6 rounded-full shadow-[0_15px_30px_rgba(234,88,12,0.4)] flex items-center justify-center gap-3 hover:bg-orange-700 hover:scale-105 transition-all active:scale-95"
          >
            <div className="relative">
              <ShoppingBag size={22} />
              <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-orange-600 shadow-sm">
                {cartCount}
              </span>
            </div>

            <span className="font-bold tracking-tight text-sm">View Order</span>

            <div className="h-4 w-[1px] bg-orange-400/50 mx-1"></div>

            <span className="font-black text-white">
              ₹
              {cartItems.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0,
              )}
            </span>
          </button>
        </div>
      )}
      <CallWaiterButton restaurantId={restaurantId} tableNumber={tableNumber} />
    </div>
  );
};

export default PublicMenu;
