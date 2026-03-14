import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, X, Layers } from "lucide-react";
import {
  getMyMenu,
  deleteMenuItem,
  updateMenuAvailability,
} from "../../API/menuApi";
import MenuList from "../../components/Restaurent/MenuList";
import MenuForm from "../../components/Restaurent/MenuForm";
import BulkMenuForm from "../../components/Restaurent/BulkMenuForm";

const MenuManager = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Bulk Form State
  const [showBulkForm, setShowBulkForm] = useState(false);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await getMyMenu();
      const items = response?.data?.menuItems || response?.data?.data || [];
      setMenuItems(items);
    } catch (error) {
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleAddClick = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchMenuItems();
  };

  const handleDelete = async (id) => {
    try {
      await deleteMenuItem(id);
      toast.success("Item deleted successfully!");
      fetchMenuItems();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const handleToggleAvailable = async (id, newStatus) => {
    try {
      await updateMenuAvailability(id);
      toast.success(
        `Item marked as ${newStatus ? "Available" : "Unavailable"}`,
      );
      fetchMenuItems();
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Menu</h2>
          <p className="text-sm text-gray-500">
            View, add, edit, and organize your dishes.
          </p>
        </div>
        
        {/* Hide buttons if Bulk Form is active to keep UI clean */}
        {!showBulkForm && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowBulkForm(true)}
              className="bg-white border-2 border-orange-500 text-orange-600 px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-orange-50 transition-all shadow-sm"
            >
              <Layers size={20} /> Bulk Add
            </button>
            <button
              onClick={handleAddClick}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus size={20} /> Add New Item
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        {showBulkForm ? (
          /*  Render Bulk Form */
          <div className="h-full pb-8">
             <BulkMenuForm 
               onCancel={() => setShowBulkForm(false)} 
               onSuccess={() => {
                 setShowBulkForm(false);
                 fetchMenuItems(); // Refresh list after bulk upload
               }} 
             />
          </div>
        ) : (
          /* Render Normal Menu List */
          <MenuList
            items={menuItems}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onToggleAvailable={handleToggleAvailable}
          />
        )}
      </div>

      {/* The Pop-up Modal for Add/Edit SINGLE Menu Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="p-6">
              <MenuForm
                menuItem={editingItem}
                onCancel={() => setIsModalOpen(false)}
                onSuccess={handleFormSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;