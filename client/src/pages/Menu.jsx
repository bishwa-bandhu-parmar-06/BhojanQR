import React, { useEffect, useRef, useState, useCallback } from "react";
import { getAllMenuItems } from "../API/menuApi";
import toast from "react-hot-toast";
import { Store, Tag } from "lucide-react"; // Removed ShoppingBag since button is removed

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef();

  const fetchMenu = async (pageNumber) => {
    try {
      setLoading(true);
      const res = await getAllMenuItems(pageNumber, 8);
      const newItems = res.data.data;

      if (newItems.length === 0) {
        setHasMore(false);
        return;
      }

      setMenuItems((prev) => {
        const existingIds = new Set(prev.map((item) => item._id));
        const filteredItems = newItems.filter(
          (item) => !existingIds.has(item._id),
        );
        return [...prev, ...filteredItems];
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu(page);
  }, [page]);

  const lastItemRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  if (loading && menuItems.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-4 border-orange-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-t-4 border-orange-300 animate-spin opacity-50"></div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">
          Discovering delicious food...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Explore{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
              Menus
            </span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Discover top dishes from restaurants around you.
          </p>
        </div>

        {/* Updated Grid for Medium Sized Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {menuItems.map((item, index) => {
            const isLastElement = menuItems.length === index + 1;
            return (
              <div ref={isLastElement ? lastItemRef : null} key={item._id}>
                <MenuCard item={item} />
              </div>
            );
          })}
        </div>

        {loading && menuItems.length > 0 && (
          <div className="flex justify-center mt-12 mb-6">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        )}

        {!hasMore && menuItems.length > 0 && (
          <div className="text-center mt-12 mb-6">
            <p className="text-gray-400 font-medium">
              You've seen all the dishes! 🍽️
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const MenuCard = ({ item }) => {
  return (
    <div className="relative group flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* 1. Image Container (Reduced height to h-44 for medium size) */}
      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
        <img
          src={item.imageUrl}
          alt={item.name}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
            !item.available ? "grayscale opacity-80" : ""
          }`}
        />

        {/* Floating Price Badge (Scaled down slightly) */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md shadow-sm px-2.5 py-1 rounded-full font-extrabold text-orange-600 border border-orange-100 z-10 text-sm">
          ₹{item.price}
        </div>

        {/* Out of Stock Overlay */}
        {!item.available && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-red-500 text-white px-4 py-1.5 rounded-full font-bold text-xs tracking-wider shadow-xl transform -rotate-6 border-2 border-white/20">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* 2. Content Container (Reduced padding to p-4) */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Category */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1.5">
          <Tag size={12} strokeWidth={3} /> {item.category}
        </div>

        {/* Dish Name (Reduced to text-lg) */}
        <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
          {item.name}
        </h3>

        {/* Restaurant Name */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-2.5 bg-gray-50 w-fit px-2 py-1 rounded-md border border-gray-100">
          <Store size={12} className="text-orange-400" />
          <span className="truncate max-w-[150px]">
            {item.restaurant?.restaurantName || "Independent Kitchen"}
          </span>
        </div>

        {/* Description (Reduced to text-xs) */}
        <p className="text-xs text-gray-500 line-clamp-2 flex-1">
          {item.description || "A delicious treat prepared fresh for you."}
        </p>
      </div>
    </div>
  );
};

export default Menu;
