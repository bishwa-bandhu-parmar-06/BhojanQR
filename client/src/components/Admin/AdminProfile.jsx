import React, { useState } from "react";
import { Edit2, Save, X, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { updateUser } from "../../Features/auth/AuthSlice";
import { updateAdminProfile } from "../../API/adminApi";

const AdminProfile = ({ admin, setAdmin }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: admin?.name || "",
    mobile: admin?.mobile || "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const dispatch = useDispatch();

  // Toggle edit mode and reset data if cancelling
  const toggleEdit = () => {
    if (!isEditing) {
      setEditFormData({
        name: admin?.name || "",
        mobile: admin?.mobile || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editFormData.name || !editFormData.mobile) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await updateAdminProfile(editFormData);
      if (response.data.success) {
        const updatedAdmin = response.data.admin || response.data.data;

        // Update states globally and locally
        setAdmin(updatedAdmin);
        dispatch(
          updateUser({
            name: updatedAdmin.name,
            mobile: updatedAdmin.mobile,
          }),
        );

        toast.success("Profile updated successfully!");
        setIsEditing(false); // Close edit mode automatically
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 relative transition-all duration-300">
        {/* Toggle Edit/Cancel Button */}
        <button
          type="button"
          onClick={toggleEdit}
          className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
            isEditing
              ? "bg-red-50 text-red-500 hover:bg-red-100"
              : "bg-slate-50 text-slate-400 hover:text-orange-500 hover:bg-orange-50"
          }`}
          title={isEditing ? "Cancel Editing" : "Edit Profile"}
        >
          {isEditing ? <X size={18} /> : <Edit2 size={18} />}
        </button>

        {/* Profile Form / View */}
        <form
          onSubmit={handleUpdateProfile}
          className="flex flex-col items-center text-center"
        >
          <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-4xl border-4 border-orange-100 shadow-inner mb-6 transition-transform duration-300 hover:scale-105">
            👤
          </div>

          {/* Name Field */}
          {isEditing ? (
            <div className="w-full max-w-xs mb-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 block text-left">
                Full Name
              </label>
              <input
                type="text"
                autoFocus
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-800 text-center transition-all"
                placeholder="Enter full name"
              />
            </div>
          ) : (
            <h2 className="text-2xl font-black text-slate-800 mb-1">
              {admin?.name}
            </h2>
          )}

          {/* Email (Always Read-only) */}
          <p className="text-sm font-medium text-slate-500 mb-8 px-4 py-1.5 bg-slate-100 rounded-full inline-block">
            {admin?.email}
          </p>

          <div className="w-full pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 text-left">
            {/* Role Field */}
            <div className="bg-slate-50 p-4 rounded-xl flex flex-col justify-center">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                Role
              </p>
              <p className="font-bold text-slate-700 capitalize">
                {admin?.role || "Admin"}
              </p>
            </div>

            {/* Mobile Field */}
            <div className="bg-slate-50 p-4 rounded-xl flex flex-col justify-center">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                Mobile
              </p>
              {isEditing ? (
                <input
                  type="tel"
                  value={editFormData.mobile}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, mobile: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-800 transition-all text-sm mt-0.5"
                  placeholder="Enter mobile number"
                />
              ) : (
                <p className="font-bold text-slate-700">{admin?.mobile}</p>
              )}
            </div>
          </div>

          {/* Save Button (Appears only in Edit Mode) */}
          {isEditing && (
            <div className="w-full mt-8 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full sm:w-2/3 mx-auto bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
              >
                {isUpdating ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
