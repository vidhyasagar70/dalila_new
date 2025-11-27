"use client";
import React, { useState, useEffect } from "react";
import Footer from "./Footer";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  Play,
  X,
  Clock,
  MessageCircle,
} from "lucide-react";
import type { DiamondData } from "@/types/Diamondtable";
import { cartApi, holdApi, queryApi } from "@/lib/api";
import { Maven_Pro } from "next/font/google";
import toast from "react-hot-toast";
import { Marcellus, Jost } from "next/font/google";

const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: "400",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const mavenPro = Maven_Pro({
  variable: "--font-maven-pro",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

interface DiamondDetailViewProps {
  diamond: DiamondData;
  onClose: () => void;
}

const DiamondDetailView: React.FC<DiamondDetailViewProps> = ({
  diamond,
  onClose,
}) => {
  const [selectedImage] = useState<string>(diamond.REAL_IMAGE || "");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isAddingToHold, setIsAddingToHold] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryText, setEnquiryText] = useState("");
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check user role on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      let userStr = localStorage.getItem("user");

      // Fallback to cookies if not in localStorage
      if (!userStr) {
        const cookies = document.cookie.split(";");
        const userCookie = cookies.find((c) => c.trim().startsWith("user="));
        if (userCookie) {
          try {
            userStr = decodeURIComponent(userCookie.split("=")[1].trim());
          } catch (e) {
            console.error("Error decoding user cookie:", e);
          }
        }
      }

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserRole(user.role || null);
        } catch (e) {
          console.error("Error parsing user data:", e);
          setUserRole(null);
        }
      }
    }
  }, []);

  const videoUrl = (diamond as DiamondData & { MP4?: string }).MP4 || "";
  const videoThumbnail = diamond.REAL_IMAGE || "";

  const formatCurrency = (value: string | number) => {
    const num = parseFloat(String(value));
    return isNaN(num)
      ? "N/A"
      : `$${num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} USD`;
  };

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);

      const response = await cartApi.add(diamond.STONE_NO);

      if (response?.success) {
        toast.success(
          response?.message ||
            `${diamond.STONE_NO} added to cart successfully!`,
        );

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cart-updated"));
        }
      } else {
        toast.error(response?.message || "Failed to add to cart");
      }
    } catch (error: unknown) {
      console.error("Error adding to cart:", error);

      let errorMessage = "Failed to add to cart. Please try again.";
      if (error && typeof error === "object" && "response" in error) {
        const err = error as {
          response?: {
            status?: number;
            data?: { error?: string; message?: string };
          };
          message?: string;
        };
        if (err.response?.status === 401) {
          errorMessage = "Please log in to add items to cart.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleVideoClick = () => {
    if (videoUrl) {
      setIsPlayingVideo(true);
    }
  };

  const handleAddToHold = async () => {
    try {
      setIsAddingToHold(true);

      const response = await holdApi.add(diamond.STONE_NO);

      if (response?.success) {
        toast.success(
          response?.message ||
            `${diamond.STONE_NO} added to hold successfully!`,
        );
      } else {
        toast.error(response?.message || "Failed to add to hold");
      }
    } catch (error: unknown) {
      console.error("Error adding to hold:", error);

      let errorMessage = "Failed to add to hold. Please try again.";

      if (error && typeof error === "object" && "response" in error) {
        const err = error as {
          response?: {
            status?: number;
            data?: {
              error?: string;
              message?: string;
              success?: boolean;
            };
          };
          message?: string;
        };

        if (err.response?.status === 401) {
          errorMessage = "Please log in to add items to hold.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsAddingToHold(false);
    }
  };

  const handleEnquirySubmit = async () => {
    if (!enquiryText.trim()) {
      toast.error("Please enter your query");
      return;
    }

    try {
      setIsSubmittingEnquiry(true);

      const response = await queryApi.create({
        stoneNo: diamond.STONE_NO,
        query: enquiryText.trim(),
      });

      if (response?.success) {
        toast.success("Query submitted successfully!");
        setEnquiryText("");
        setIsEnquiryOpen(false);
      } else {
        toast.error(response?.message || "Failed to submit query");
      }
    } catch (error: unknown) {
      console.error("Error submitting query:", error);

      let errorMessage = "Failed to submit query. Please try again.";
      if (error && typeof error === "object" && "response" in error) {
        const err = error as {
          response?: { status?: number; data?: { error?: string } };
          message?: string;
        };
        if (err.response?.status === 401) {
          errorMessage = "Please log in to submit queries.";
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  const InfoItem = ({
    label,
    value,
    description,
  }: {
    label: string;
    value: string;
    description: string;
  }) => (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-gray-600">
        <span className={`text-sm font-medium ${marcellus.className}`}>{label}</span>
      </div>
      <p className={`text-lg font-semibold text-gray-900 ${marcellus.className}`}>{value}</p>
      {description && (
        <p className={`text-xs text-gray-500 ${marcellus.className}`}>{description}</p>
      )}
    </div>
  );

  const DetailTable = ({
    title,
    data,
    certiPdfUrl,
  }: {
    title: string;
    data: [string, string | number][];
    certiPdfUrl?: string;
  }) => (
    <div className="bg-white overflow-hidden border border-[#e9e2c6]">
      <div className="bg-[#050C3A] text-white px-4 py-3">
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div>
        {data.map(([key, value], idx) => (
          <div
            key={idx}
            className="grid grid-cols-2 hover:bg-gray-50"
            style={{
              borderBottom:
                idx < data.length - 1 ? "1px solid #e9e2c6" : "none",
            }}
          >
            <div className="px-4 py-2.5 bg-gray-50">
              <p className="text-sm font-medium text-gray-700">{key}</p>
            </div>
            <div className="px-4 py-2.5 bg-white">
              {key === "Report No" && certiPdfUrl && value && value !== "N/A" ? (
                <a
                  href={certiPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800 text-sm"
                >
                  {value}
                </a>
              ) : (
                <p className="text-sm text-gray-900">{value}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={`fixed left-0 right-0 bottom-0 top-[88px] w-full flex items-center justify-center z-40 bg-black/50 ${mavenPro.variable} ${marcellus.variable} ${jost.variable}`}
      onClick={onClose}
    >
      <div
        className="bg-white shadow-xl w-full h-full overflow-y-auto font-maven-pro scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Header with Back Button and Title */}
        <div className="bg-[#050C3A] text-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10 mt-8">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">Back</h2>
        </div>

        <div className="p-6 pb-20">
          {/* Top Section: Certificate, Image, and Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* LEFT - Video only (same height as center image) */}
            <div className="lg:col-span-4 flex items-center justify-center">
              {/* Video Section (matched height with image) */}
              {videoUrl ? (
                <div className="bg-white overflow-hidden h-[500px] w-full flex items-center justify-center">
                  <div className="relative bg-gray-50 h-full w-full">
                    {!isPlayingVideo ? (
                      <div
                        className="relative w-full h-full cursor-pointer group"
                        onClick={handleVideoClick}
                      >
                        {videoThumbnail ? (
                          <Image
                            src={videoThumbnail}
                            alt="Diamond Video"
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-sm text-gray-400">Video Available</span>
                          </div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play size={20} className="text-[#050C3A] ml-1" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <button
                          onClick={() => setIsPlayingVideo(false)}
                          className="absolute top-2 right-2 z-10 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
                        >
                          <X size={16} className="text-white" />
                        </button>
                        <video src={videoUrl} controls autoPlay className="w-full h-full object-contain">
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-[#e9e2c6] overflow-hidden h-[500px] w-full flex items-center justify-center">
                  <div className="relative bg-gray-50 h-full w-full flex items-center justify-center">
                    <span className="text-sm text-gray-400">No Video Available</span>
                  </div>
                </div>
              )}
            </div>
            {/* CENTER - Main Image (match video size) */}
            <div className="lg:col-span-4 flex items-center justify-center">
              <div className="relative overflow-hidden h-[500px] w-full bg-gray-50 flex items-center justify-center">
                {/* Main Display Image */}
                {selectedImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="relative w-full h-full">
                      <Image
                        src={selectedImage}
                        alt={diamond.STONE_NO}
                        fill
                        style={{ objectFit: "contain" }}
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                    No Image Available
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT - Diamond Info (4 columns) */}
            <div className="lg:col-span-4 flex flex-col ">
              <div className="space-y-4 flex-1 flex flex-col ">
                {/* Title Section - show Stone Number instead of shape */}
                <div className="pt-4 mt-11">
                  <div className="flex justify-between items-start mb-1">
                    <h1 className={`text-3xl font-bold text-gray-900 ${marcellus.className}`}>
                      {diamond.STONE_NO}
                    </h1>
                  </div>
                </div>

                {/* Price Section */}
                <div className="py-2 border-b border-gray-200">
                  <div className={`flex items-baseline gap-2 ${marcellus.className}`}>
                    <span className="text-3xl font-bold text-gray-900">
                      {formatCurrency(diamond.NET_VALUE)}
                    </span>
                    
                  </div>
                </div>

                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-none flex-1 flex flex-col">
                 
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <InfoItem
                      label="Shape"
                      value={diamond.SHAPE}
                      description=""
                    />
                    <InfoItem
                      label="Carat"
                      value={String(diamond.CARATS || diamond.SIZE)}
                      description=""
                    />
                    <InfoItem
                      label="Color"
                      value={diamond.COLOR}
                      description=""
                    />
                    <InfoItem
                      label="Clarity"
                      value={diamond.CLARITY}
                      description=""
                    />
                  </div>
                  <div className="border-t border-[#e9e2c6] pt-2 mt-2"></div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mt-auto">
                  {/* All buttons - Only for non-admin users */}
                  {userRole !== "ADMIN" && userRole !== "SUPER_ADMIN" && (
                    <>
                      {/* Add to Cart */}
                      <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                        className="w-full bg-[#050C3A] text-white py-2.5 rounded-none font-semibold hover:bg-[#030822] transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAddingToCart ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "ADD TO CART"
                        )}
                      </button>

                      {/* Hold Item and Enquiry */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleAddToHold}
                          disabled={isAddingToHold}
                          className="bg-[#050C3A] text-white py-2.5 rounded-none font-semibold hover:bg-[#030822] transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAddingToHold ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4" />
                              Hold Item
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setIsEnquiryOpen(true)}
                          className="bg-[#050C3A] text-white py-2.5 rounded font-semibold hover:bg-[#030822] transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Enquiry
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Details */}
            <DetailTable
              title="Details"
              data={[
                ["Packet No", diamond.STONE_NO || "N/A"],
                ["Report No", diamond.REPORT_NO || "N/A"],
                ["Lab", diamond.LAB || "N/A"],
                ["Rap.($)", diamond.RAP_PRICE || "N/A"],
                ["Shape", diamond.SHAPE || "N/A"],
                ["Carat", diamond.CARATS || diamond.SIZE || "N/A"],
                ["Color", diamond.COLOR || "N/A"],
                ["Clarity", diamond.CLARITY || "N/A"],
                ["Shade", diamond.TINGE || "NO BGM"],
                ["Cut", diamond.CUT || "N/A"],
                ["Polish", diamond.POL || "N/A"],
                ["Symmetry", diamond.SYM || "N/A"],
                ["Fluorescence", diamond.FLOUR || "N/A"],
              ]}
              certiPdfUrl={diamond.CERTI_PDF}
            />

            {/* Measurements */}
            <DetailTable
              title="Measurements"
              data={[
                ["Table%", diamond.TABLE_PER || "N/A"],
                ["Depth%", diamond.DEPTH_PER || "N/A"],
                [
                  "Length",
                  diamond.MEASUREMENTS?.split("x")[0]?.trim() || "N/A",
                ],
                // ["Width", diamond.MEASUREMENTS?.split("x")[1]?.trim() || "N/A"],
                // ["Depth", diamond.MEASUREMENTS?.split("x")[2]?.trim() || "N/A"],
                // ["Ratio", "-"],
                ["Crown Angle", diamond.CROWN_ANGLE || "N/A"],
                ["Crown Height", diamond.CROWN_HEIGHT || "N/A"],
                ["Pav Angle", diamond.PAVILLION_ANGLE || "N/A"],
                ["Pav Height", diamond.PAVILLION_HEIGHT || "N/A"],
                // ["Girdle", "THN"],
                // ["Culet", "NON"],
                // ["Laser Ins.", "-"],
              ]}
            />

            {/* Inclusion Details */}
            <DetailTable
              title="Inclusion Details"
              data={[
                ["Center Natts", diamond.CN || "-"],
                ["Side Natts", diamond.SN || "-"],
                ["Center White", diamond.CW || "-"],
                ["Side White", diamond.SW || "-"],
                // ["Table open", "TO-O"],
                // ["Crown open", "CO-O"],
                // ["Pavilion open", "PO-O"],
                ["Eye Clean", diamond.EY_CLN || "-"],
                // ["Herat & Arrow", diamond.HA || diamond.H_AND_A || "-"],
                // ["Brilliancy", "EX"],
                // ["Type2 Cert", "-"],
                ["Location", diamond.LOCATION || "-"],
              ]}
            />
          </div>
        </div>
        <Footer/>
      </div>

      {/* Enquiry Modal */}
      {isEnquiryOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsEnquiryOpen(false)}
        >
          <div
            className="bg-white rounded-none shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#050C3A] text-white px-6 py-4 rounded-none flex items-center justify-between">
              <h3 className="text-lg font-semibold">Submit Enquiry</h3>
              <button
                onClick={() => setIsEnquiryOpen(false)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stone Number
                </label>
                <input
                  type="text"
                  value={diamond.STONE_NO}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-none bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Query <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={enquiryText}
                  onChange={(e) => setEnquiryText(e.target.value)}
                  placeholder="Enter your query here..."
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#050C3A] resize-none bg-white text-gray-900"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-none flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsEnquiryOpen(false);
                  setEnquiryText("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-none text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEnquirySubmit}
                disabled={isSubmittingEnquiry || !enquiryText.trim()}
                className="px-4 py-2 bg-[#050C3A] text-white cursor-pointer rounded-none hover:bg-[#030822] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmittingEnquiry ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Query"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiamondDetailView;