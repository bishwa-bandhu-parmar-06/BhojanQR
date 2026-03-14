import React from "react";
import { Store, User, Phone, MapPin, FileText, Edit2 } from "lucide-react";

// Sub-component for rendering profile data fields
const ProfileField = ({ label, value, icon: Icon }) => (
  <div>
    <p className="text-xs text-gray-400 font-semibold uppercase flex items-center gap-1 mb-1">
      <Icon size={14} /> {label}
    </p>
    <p className="font-medium text-gray-800 text-lg">{value}</p>
  </div>
);

const ProfileDetails = ({ restaurant, setActiveTab }) => {
  if (!restaurant) return null;

  const addressString =
    restaurant.address && restaurant.address.length > 0
      ? `${restaurant.address[0].street || ""}, ${restaurant.address[0].city || ""}`.replace(
          /^, |, $/g,
          "",
        )
      : "No address added yet";

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Profile Details</h2>
        <button
          onClick={() => setActiveTab("settings")}
          className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-all"
        >
          <Edit2 size={16} /> Edit Settings
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row gap-8 items-start">
        <div className="w-32 h-32 rounded-full bg-orange-50 flex items-center justify-center border-4 border-white shadow-md shrink-0">
          <Store className="w-12 h-12 text-orange-500" />
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <ProfileField
            label="Restaurant Name"
            value={restaurant.restaurantName}
            icon={Store}
          />
          <ProfileField
            label="Owner Name"
            value={restaurant.ownerName}
            icon={User}
          />
          <ProfileField
            label="Mobile Number"
            value={restaurant.mobile}
            icon={Phone}
          />
          <ProfileField
            label="Primary Address"
            value={addressString}
            icon={MapPin}
          />
          <ProfileField
            label="Govt ID"
            value={restaurant.govtIdDetails?.idNumber || "N/A"}
            icon={FileText}
          />
          <div className="col-span-1 md:col-span-2">
            <span
              className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${
                restaurant.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              Status: {restaurant.status?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
