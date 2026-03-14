import React, { useState, useEffect } from "react";
import { Download, QrCode, Printer, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getSavedQRs,
  generateAndSaveQRs,
  deleteQR,
} from "../../API/restaurantApi";

const QRManager = ({ restaurant }) => {
  const [tableCount, setTableCount] = useState(10);
  const [savedQRs, setSavedQRs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchQRs();
  }, []);

  const fetchQRs = async () => {
    try {
      const res = await getSavedQRs();
      setSavedQRs(res.data.data);
    } catch (error) {
      toast.error("Failed to load saved QR codes.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteQR = async (id) => {
    try {
      await deleteQR(id);
      setSavedQRs((prev) => prev.filter((qr) => qr._id !== id));
      toast.success("QR Code deleted successfully");
    } catch (error) {
      toast.error("Failed to delete QR code");
    }
  };

  const handleClearAll = async () => {
    try {
      await Promise.all(savedQRs.map((qr) => deleteQR(qr._id)));
      setSavedQRs([]);
      toast.success("All QR codes cleared");
    } catch (error) {
      toast.error("Error clearing some QR codes");
    }
  };
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (tableCount < 1 || tableCount > 100) {
      toast.error("Please enter a number between 1 and 100");
      return;
    }

    const tablesToGenerate = Array.from(
      { length: tableCount },
      (_, i) => i + 1,
    );
    setIsGenerating(true);

    toast("Generating and saving QR codes... This may take a moment.", {
      icon: "⏳",
    });

    try {
      const res = await generateAndSaveQRs(tablesToGenerate);
      const newQRs = res.data.data;
      setSavedQRs((prev) => {
        const existingIds = new Set(prev.map((q) => q.tableNumber));
        const newlyAdded = newQRs.filter(
          (q) => !existingIds.has(q.tableNumber),
        );
        return [...prev, ...newlyAdded].sort(
          (a, b) => a.tableNumber - b.tableNumber,
        );
      });
      toast.success("QR Codes generated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate QRs");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadProfessionalQR = async (
    qrUrl,
    tableNumber,
    showToast = true,
  ) => {
    try {
      if (showToast)
        toast(`Preparing Table ${tableNumber} print file...`, { icon: "🖨️" });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 800;
      canvas.height = 1050;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#f97316";
      ctx.fillRect(0, 0, canvas.width, 20);

      const loadImg = (src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = (e) => reject(e);
          img.src = src + "?not-from-cache=" + Date.now();
        });
      };

      const [logoImg, qrImg] = await Promise.all([
        loadImg("/BhojanQR-removebg.png"),
        loadImg(qrUrl),
      ]);

      const logoWidth = 260;
      const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
      const logoY = 40;
      ctx.drawImage(
        logoImg,
        (canvas.width - logoWidth) / 2,
        logoY,
        logoWidth,
        logoHeight,
      );

      let currentY = logoY + logoHeight + 20;

      ctx.fillStyle = "#1f2937";
      ctx.font = "bold 52px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(restaurant.restaurantName, canvas.width / 2, currentY, 720);

      currentY += 40;

      ctx.fillStyle = "#f97316";
      ctx.font = "bold 22px Arial, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("SCAN TO VIEW DIGITAL MENU", canvas.width / 2, currentY);

      currentY += 30;

      const qrSize = 480;
      ctx.drawImage(
        qrImg,
        (canvas.width - qrSize) / 2,
        currentY,
        qrSize,
        qrSize,
      );

      currentY += qrSize + 70;

      ctx.fillStyle = "#1f2937";
      ctx.font = "bold 75px Arial, sans-serif";
      ctx.fillText(`TABLE ${tableNumber}`, canvas.width / 2, currentY);

      currentY += 45;

      ctx.fillStyle = "#6b7280";
      ctx.font = "20px Arial, sans-serif";
      ctx.fillText(
        "Point your phone's camera at the QR code to order.",
        canvas.width / 2,
        currentY,
      );

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${restaurant.restaurantName.replace(/\s+/g, "_")}_Table_${tableNumber}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      if (showToast)
        toast.error(
          "Failed to download professional QR. Ensure CORS is enabled on Cloudinary.",
        );
    }
  };

  const downloadAll = async () => {
    toast(
      "Starting bulk download. Please click 'Allow' if your browser prompts for multiple file downloads.",
      { icon: "ℹ️" },
    );

    for (let i = 0; i < savedQRs.length; i++) {
      const qr = savedQRs[i];
      await downloadProfessionalQR(qr.qrImageUrl, qr.tableNumber, false);

      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    toast.success("Bulk download complete!");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Table QR Codes
        </h2>
        <p className="text-gray-500 mt-1 font-medium">
          Generate, save, and print table stands.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Generate up to Table #
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={tableCount}
            onChange={(e) => setTableCount(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/50 outline-none"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm h-full disabled:opacity-70"
        >
          {isGenerating ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <QrCode size={20} />
          )}
          {isGenerating ? "Generating..." : "Generate QRs"}
        </button>

        {savedQRs.length > 0 && (
          <button
            onClick={downloadAll}
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm h-full"
          >
            <Printer size={20} /> Download All
          </button>
        )}
      </div>

      {savedQRs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {savedQRs.map((qr) => (
            <div
              key={qr._id}
              className="group bg-gray-100 rounded-2xl p-4 flex flex-col items-center shadow-inner relative border border-gray-200"
            >
              <button
                onClick={() => handleDeleteQR(qr._id)}
                className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-red-500 hover:text-white text-gray-400 rounded-full transition-all z-10 shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
              <div className="bg-white w-full rounded-xl shadow-sm overflow-hidden flex flex-col items-center pt-0 pb-5 px-4 relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-500"></div>

                <img
                  src="/BhojanQR-removebg.png"
                  alt="Logo"
                  className="w-24 mt-5 mb-1 object-contain"
                />

                <h3 className="font-bold text-gray-800 text-xl text-center leading-tight truncate w-full mb-1">
                  {restaurant?.restaurantName || "Restaurant"}
                </h3>

                <p className="text-[9px] font-bold text-orange-500 mb-2 tracking-widest uppercase text-center">
                  Scan to view digital menu
                </p>

                <img
                  src={qr.qrImageUrl}
                  alt={`Table ${qr.tableNumber}`}
                  className="w-40 h-40 object-contain mb-3"
                />

                <h4 className="font-black text-gray-800 text-2xl mb-1">
                  TABLE {qr.tableNumber}
                </h4>

                <p className="text-[8px] text-gray-500 text-center px-2">
                  Point your phone's camera at the QR code to order.
                </p>
              </div>

              <button
                onClick={() =>
                  downloadProfessionalQR(qr.qrImageUrl, qr.tableNumber)
                }
                className="w-full mt-4 bg-white hover:bg-orange-500 text-gray-800 hover:text-white border border-gray-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm shadow-sm"
              >
                <Download size={16} /> Print Card
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <QrCode className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">
            No QR codes saved yet. Generate them above!
          </p>
        </div>
      )}
    </div>
  );
};

export default QRManager;
