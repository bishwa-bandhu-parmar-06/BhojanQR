
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useContext } from "react";
import { CartContext } from "../context/CartContext"; // adjust path
import toast from "react-hot-toast";


const Menu = () => {
  const { addToCart } = useContext(CartContext);

  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(1000);
  const backendUri = import.meta.env.VITE_BACKEND_URI;

  const fetchAvailableItems = useCallback(async () => {
    try {
      const response = await axios.get(`${backendUri}/api/menu`);
      const availableItems = response.data.items.filter(
        (item) => item.available
      );
      setMenuItems(availableItems);
      setFilteredItems(availableItems);
      const uniqueCategories = [
        "All",
        ...new Set(availableItems.map((item) => item.category)),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Failed to fetch available menu items:", error);
      toast.error("Failed to load menu. Please try again later.");
    }
  }, [backendUri]);

  useEffect(() => {
    fetchAvailableItems();
  }, [fetchAvailableItems]);

  useEffect(() => {
    let items = [...menuItems];
    if (selectedCategory !== "All") {
      items = items.filter((item) => item.category === selectedCategory);
    }
    items = items.filter((item) => item.price <= maxPrice);
    setFilteredItems(items);
  }, [selectedCategory, maxPrice, menuItems]);

  return (
    <div className="p-4 bg-gradient-to-br from-green-100 via-white to-orange-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-green-800 drop-shadow text-center md:text-left">
        Our Menu
      </h1>

      {/* Category Carousel */}
      <div className="flex gap-2 overflow-x-auto pb-3">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm md:text-base
              ${
                selectedCategory === cat
                  ? "bg-orange-500 text-white"
                  : "bg-green-100 text-green-700 hover:bg-green-300"
              } font-medium shadow`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Price Filter */}
      <div className="mt-4">
        <label className="text-green-800 font-semibold mb-2 block text-sm md:text-base">
          Max Price:
        </label>

        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-xs md:text-sm text-gray-600">₹10</span>

          {/* Slider */}
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-green-700"
          />

          <span className="text-xs md:text-sm text-gray-600">₹1000</span>

          {/* Input box */}
          <input
            type="number"
            min="10"
            max="1000"
            value={maxPrice}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 10 && value <= 1000) setMaxPrice(value);
            }}
            className="w-20 md:w-24 px-2 py-1 border border-gray-300 rounded shadow-sm text-xs md:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
        <div className="flex justify-between text-[0.7rem] md:text-xs text-gray-500 px-1 mt-1">
          {[10, 250, 500, 750, 1000].map((val) => (
            <span key={val}>₹{val}</span>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center mt-20 flex flex-col items-center justify-center gap-4 text-red-600">
          <img
            src="/nomenu.png"
            alt="No Orders"
            className="w-64 h-64 sm:w-80 sm:h-80 object-contain animate-bounce opacity-80"
          />
          <p className="text-lg sm:text-xl font-semibold">
            🚫 Emergency status: No items found under this filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-white/80 drop-shadow rounded-xl overflow-hidden transition-transform hover:scale-[1.02] duration-300 flex flex-col"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-32 sm:h-40 object-cover"
              />
              <div className="p-3 flex flex-col justify-between flex-grow"> {/* Use flex-grow */}
                <div>
                  <h2 className="text-lg font-semibold text-green-700">
                    {item.name}
                  </h2>
                  <p className="text-orange-500 font-bold text-sm md:text-base">₹{item.price}</p>
                  <p className="text-sm text-green-800 italic">{item.category}</p>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
                <button
                  onClick={() => {
                    addToCart(item);
                    toast.success(`${item.name} added to cart!`);
                  }}
                  className="mt-3 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded shadow text-sm self-start"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;