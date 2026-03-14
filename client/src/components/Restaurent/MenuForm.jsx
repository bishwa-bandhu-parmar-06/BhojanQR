import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Utensils,
  IndianRupee,
  Tag,
  AlignLeft,
  ImagePlus,
  Save,
  X,
  UploadCloud,
  ChevronDown,
} from "lucide-react";
import { addMenuItem, updateMenuItem } from "../../API/menuApi";

const MenuForm = ({ menuItem, onCancel, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Main Course",
    description: "",
    image: null,
    available: true,
  });

  // Prefill form when editing
  useEffect(() => {
    if (menuItem) {
      setFormData({
        name: menuItem.name || "",
        price: menuItem.price || "",
        category: menuItem.category || "Main Course",
        description: menuItem.description || "",
        image: null,
        available: menuItem.available ?? true,
      });
      if (menuItem.imageUrl) {
        setImagePreview(menuItem.imageUrl);
      }
    }
  }, [menuItem]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      const file = files[0];
      setFormData({ ...formData, [name]: file });

      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Prevent multiple submissions if already loading
    if (isSubmitting) return;

    // Basic Validation before submitting
    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!menuItem && !formData.image) {
      toast.error("Please upload an image for the new item.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("name", formData.name);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("available", formData.available);

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      let response;

      if (menuItem) {
        response = await updateMenuItem(menuItem._id, formDataToSend);
        toast.success("Menu item updated successfully!");
      } else {
        response = await addMenuItem(formDataToSend);
        toast.success("Menu item added successfully!");
      }

      onSuccess(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------------------------------------------
  // KEYBOARD SUBMISSION LOGIC (Press Enter to Save)
  // ------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if Enter was pressed
      if (e.key === "Enter") {
        // Prevent form submission if the user is typing in the description textarea
        if (e.target.tagName.toLowerCase() === "textarea") {
          return;
        }

        e.preventDefault();
        handleSubmit();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [formData, menuItem, isSubmitting]);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col h-full overflow-hidden"
    >
      {/* Top Gradient Accent Line (Orange Only) */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 to-orange-600"></div>

      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600 rounded-xl shadow-inner">
          <Utensils size={28} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            {menuItem ? "Edit Menu Item" : "Add New Item"}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5 font-medium">
            {menuItem
              ? "Update the details of your dish below."
              : "Craft a new delicious addition to your menu."}
          </p>
        </div>
      </div>

      {/* Form Body */}
      <div className="p-8 space-y-7 flex-1 bg-gray-50/30">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Item Name <span className="text-orange-500">*</span>
          </label>
          <div className="relative group">
            <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              name="name"
              placeholder="e.g. Paneer Butter Masala"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all shadow-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {/* Price */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Price <span className="text-orange-500">*</span>
            </label>
            <div className="relative group">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="number"
                name="price"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all shadow-sm"
                required
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Category <span className="text-orange-500">*</span>
            </label>
            <div className="relative group">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors z-10" />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all shadow-sm appearance-none cursor-pointer text-gray-700 font-medium relative"
              >
                <option value="Main Course">Main Course</option>
                <option value="Starter">Starter</option>
                <option value="Dessert">Dessert</option>
                <option value="Beverage">Beverage</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Description
          </label>
          <div className="relative group">
            <AlignLeft className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
            <textarea
              name="description"
              rows="3"
              placeholder="Briefly describe the ingredients and taste..."
              value={formData.description}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all resize-none shadow-sm"
            />
          </div>
        </div>

        {/* Image Upload Area */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Item Image{" "}
            {menuItem ? "" : <span className="text-orange-500">*</span>}
          </label>

          <div className="relative group flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-300 rounded-2xl bg-white hover:bg-orange-50/50 hover:border-orange-400 transition-all overflow-hidden shadow-sm">
            {imagePreview ? (
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-40 transition-opacity duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-sm">
                  <span className="text-white font-bold flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg border border-white/30">
                    <UploadCloud size={20} /> Change Image
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 transform group-hover:-translate-y-1 transition-transform duration-300">
                <div className="p-3 bg-orange-50 text-orange-500 rounded-full mb-3">
                  <ImagePlus className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-gray-700">
                  Click or drag image to upload
                </p>
                <p className="text-xs text-gray-400 mt-1 font-medium">
                  PNG, JPG up to 5MB
                </p>
              </div>
            )}

            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              required={!menuItem}
            />
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <p className="font-bold text-gray-800 text-sm">Item Availability</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Hide this item from the menu if it's out of stock.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="available"
              className="sr-only peer"
              checked={formData.available}
              onChange={handleChange}
            />
            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-orange-600 shadow-inner"></div>
          </label>
        </div>
      </div>

      {/* Footer / Buttons */}
      <div className="px-8 py-5 bg-white border-t border-gray-100 flex gap-4 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center gap-2 disabled:opacity-70"
        >
          <X size={18} strokeWidth={2.5} /> Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-7 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save size={18} strokeWidth={2.5} />{" "}
              {menuItem ? "Save Changes" : "Add Menu Item"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default MenuForm;
