import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Store,
  User,
  Phone,
  MapPin,
  Map,
  Navigation,
  Save,
  Plus,
  Pencil,
  Trash2,
  X,
  Building,
} from "lucide-react";

import { useDispatch } from "react-redux";
import { updateUser } from "../../Features/auth/AuthSlice";

import {
  getRestaurantProfile,
  updateRestaurantProfile,
  addRestaurantAddress,
  updateRestaurantAddress,
  deleteRestaurantAddress,
} from "../../API/restaurantApi";

const SettingsManager = () => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    restaurantName: "",
    ownerName: "",
    mobile: "",
  });

  // States for Addresses
  const [addresses, setAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const initialAddressForm = {
    street: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  };
  const [addressForm, setAddressForm] = useState(initialAddressForm);

  // Load Data on Mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getRestaurantProfile();
        const data = res.data.data;

        setProfileData({
          restaurantName: data.restaurantName || "",
          ownerName: data.ownerName || "",
          mobile: data.mobile || "",
        });

        if (!data.address) {
          setAddresses([]);
        } else if (!Array.isArray(data.address)) {
          setAddresses([data.address]);
        } else {
          setAddresses(data.address);
        }
      } catch (error) {
        toast.error("Failed to load settings data");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // --- Profile Handlers ---
  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      // 1. Update the database
      await updateRestaurantProfile(profileData);

      // 2. INSTANTLY UPDATE REDUX STATE
      dispatch(
        updateUser({
          restaurantName: profileData.restaurantName,
          ownerName: profileData.ownerName,
          mobile: profileData.mobile,
          name: profileData.restaurantName,
        }),
      );

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // address handlers
  const handleAddressChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm(initialAddressForm);
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (address) => {
    setEditingAddressId(address._id);
    setAddressForm({
      street: address.street || "",
      area: address.area || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
    });
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await deleteRestaurantAddress(addressId);
      setAddresses((prev) => prev.filter((addr) => addr._id !== addressId));
      toast.success("Address deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete address");
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      let res;
      if (editingAddressId) {
        res = await updateRestaurantAddress(editingAddressId, addressForm);
        toast.success("Address updated successfully!");
      } else {
        res = await addRestaurantAddress(addressForm);
        toast.success("Address added successfully!");
      }

      if (res.data.data) {
        setAddresses(res.data.data);
      }
      setIsAddressModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Restaurant Settings
        </h2>
        <p className="text-gray-500 mt-1 font-medium">
          Manage your public profile and branch locations.
        </p>
      </div>

      <div className="space-y-8">
        {/* SECTION 1: BASIC INFORMATION */}
        <form
          onSubmit={handleProfileSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Store className="text-orange-500 w-5 h-5" /> Basic Details
            </h3>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Restaurant Name
                </label>
                <div className="relative group">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="text"
                    name="restaurantName"
                    value={profileData.restaurantName}
                    onChange={handleProfileChange}
                    required
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Owner Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="text"
                    name="ownerName"
                    value={profileData.ownerName}
                    onChange={handleProfileChange}
                    required
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="tel"
                    name="mobile"
                    value={profileData.mobile}
                    onChange={handleProfileChange}
                    required
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-70"
              >
                {savingProfile ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} /> Update Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* SECTION 2: ADDRESS MANAGEMENT */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="text-orange-500 w-5 h-5" /> Manage Locations
            </h3>
            <button
              onClick={openAddAddressModal}
              className="bg-orange-50 text-orange-600 hover:bg-orange-100 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all text-sm border border-orange-200"
            >
              <Plus size={16} /> Add Address
            </button>
          </div>

          <div className="p-6 md:p-8">
            {addresses.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                <Building className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">
                  No locations added yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {addresses.map((addr, index) => (
                  <div
                    key={addr._id || index}
                    className="border border-gray-200 rounded-xl p-5 hover:border-orange-300 transition-colors flex flex-col h-full bg-white shadow-sm"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-md">
                          Location {index + 1}
                        </span>
                      </div>
                      <p className="font-bold text-gray-800 text-lg mb-1">
                        {addr.street}
                      </p>
                      {addr.area && (
                        <p className="text-gray-600 text-sm">{addr.area}</p>
                      )}
                      {addr.landmark && (
                        <p className="text-gray-500 text-sm italic mt-1">
                          Landmark: {addr.landmark}
                        </p>
                      )}
                      <p className="text-gray-600 font-medium text-sm mt-2">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                      <button
                        onClick={() => openEditAddressModal(addr)}
                        className="flex-1 bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 border border-gray-200 hover:border-orange-200 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all text-sm"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="flex-1 bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-200 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all text-sm"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADD / EDIT ADDRESS MODAL */}

      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="text-orange-500" />{" "}
                {editingAddressId ? "Edit Address" : "Add New Address"}
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 bg-white rounded-full shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Street Address <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={addressForm.street}
                    onChange={handleAddressChange}
                    placeholder="Shop No, Building, Street Name"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Area / Locality
                  </label>
                  <div className="relative group">
                    <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="area"
                      value={addressForm.area}
                      onChange={handleAddressChange}
                      placeholder="e.g. Connaught Place"
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Nearby Landmark
                  </label>
                  <div className="relative group">
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="landmark"
                      value={addressForm.landmark}
                      onChange={handleAddressChange}
                      placeholder="e.g. Near Metro Station"
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    City <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={addressForm.city}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      State <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={addressForm.state}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/50 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Pincode <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      value={addressForm.pincode}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/50 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-2 disabled:opacity-70 transition-colors"
                >
                  {savingAddress ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {editingAddressId ? "Save Changes" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsManager;
