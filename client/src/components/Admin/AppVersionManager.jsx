import React, { useState, useEffect } from "react";
import { Link, Save, RefreshCw, Smartphone } from "lucide-react";
import { toast } from "react-hot-toast";
import { getAppVersion, updateAppVersion } from "../../API/versionApi"; // Adjust path if needed

const AppVersionManager = () => {
  const [formData, setFormData] = useState({
    updateUrl: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCurrentVersion();
  }, []);

  const fetchCurrentVersion = async () => {
    setIsLoading(true);
    try {
      const res = await getAppVersion();
      if (res.data?.success && res.data?.data) {
        setFormData({
          updateUrl: res.data.data.updateUrl || "",
        });
      }
    } catch (error) {
      toast.error("Failed to fetch app settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.updateUrl.trim()) {
      toast.error("APK Download Link is required.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateAppVersion({ updateUrl: formData.updateUrl });
      if (res.data?.success) {
        toast.success("App Download Link updated globally!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update link.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
            <Smartphone size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">
              App Download Settings
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Manage the BhojanQR Android APK link shown to customers.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-orange-500">
              <RefreshCw className="animate-spin" size={28} />
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Link size={16} className="text-slate-400" /> Current APK URL
                </label>
                <input
                  type="url"
                  value={formData.updateUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, updateUrl: e.target.value })
                  }
                  placeholder="e.g. https://your-server.com/app/bhojanqr.apk"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-700 transition-all"
                />
                <p className="text-xs font-medium text-slate-500">
                  This link will be triggered when users click "Download APK" on
                  the public menu.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-slate-300"
                >
                  {isSaving ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Update Globally
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppVersionManager;
