import React from "react";
import { Pencil, Trash2, Tag } from "lucide-react";

const MenuItemCard = ({ item, onEdit, onDelete, onToggleAvailable }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
      {/* 1. Image & Badge Section */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-50">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm shadow-sm px-3 py-1 rounded-full font-extrabold text-orange-600 border border-orange-100">
          ₹{item.price}
        </div>

        {/* Out of Stock Overlay */}
        {!item.available && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-red-500 text-white px-4 py-1.5 rounded-full font-bold text-sm tracking-wide shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* 2. Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Category */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">
          <Tag size={12} strokeWidth={3} /> {item.category}
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-bold text-gray-800 mb-1 truncate">
          {item.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 flex-1 mb-4">
          {item.description || "No description provided."}
        </p>

        {/* 3. Footer Controls */}
        <div className="pt-4 border-t border-gray-100 mt-auto space-y-4">
          {/* Availability Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700">
              Availability
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={item.available}
                onChange={() => onToggleAvailable(item._id, !item.available)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-orange-600 shadow-inner"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onEdit(item)}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 border border-gray-200 hover:border-orange-200 font-bold py-2.5 px-3 rounded-xl transition-colors text-sm"
            >
              <Pencil size={16} strokeWidth={2.5} /> Edit
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-200 font-bold py-2.5 px-3 rounded-xl transition-colors text-sm"
            >
              <Trash2 size={16} strokeWidth={2.5} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
