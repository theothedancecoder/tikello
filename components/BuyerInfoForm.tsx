"use client";

import { useState } from "react";
import { useCart, BuyerInfo } from "./cart/CartContext";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";

interface BuyerInfoFormProps {
  onComplete: () => void;
}

export default function BuyerInfoForm({ onComplete }: BuyerInfoFormProps) {
  const { user } = useUser();
  const { buyerInfo, setBuyerInfo } = useCart();
  
  const [formData, setFormData] = useState<BuyerInfo>({
    fullName: buyerInfo?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    email: buyerInfo?.email || user?.emailAddresses[0]?.emailAddress || "",
    phone: buyerInfo?.phone || "",
  });

  const [errors, setErrors] = useState<Partial<BuyerInfo>>({});

  const validateForm = () => {
    const newErrors: Partial<BuyerInfo> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setBuyerInfo(formData);
      onComplete();
    }
  };

  const handleInputChange = (field: keyof BuyerInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Buyer Information</h3>
      <p className="text-gray-600 mb-6">Please provide your information for the ticket purchase.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.fullName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your full name"
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your phone number"
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" className="px-6 py-2">
            Continue to Payment
          </Button>
        </div>
      </form>
    </div>
  );
}
