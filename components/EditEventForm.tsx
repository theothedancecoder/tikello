"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import Image from "next/image";
import { useStorageUrl } from "@/lib/utils";
import { toast } from "sonner";

interface EditEventFormProps {
  event: {
    _id: Id<"events">;
    name: string;
    description: string;
    location: string;
    eventDate: number;
    price: number;
    totalTickets: number;
    imageStorageId?: Id<"_storage">;
  };
}

export default function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter();
  const updateEvent = useMutation(api.events.update);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const updateEventImage = useMutation(api.storage.updateEventImage);
  const deleteImage = useMutation(api.storage.deleteImage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Image handling
  const imageInput = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removedCurrentImage, setRemovedCurrentImage] = useState(false);
  const currentImageUrl = useStorageUrl(event.imageStorageId);

  const [formData, setFormData] = useState({
    name: event.name,
    description: event.description,
    location: event.location,
    eventDate: new Date(event.eventDate).toISOString().split("T")[0],
    price: event.price,
    totalTickets: event.totalTickets,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setRemovedCurrentImage(false);
    }
  };

  async function handleImageUpload(file: File): Promise<string | null> {
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      return storageId;
    } catch (error) {
      console.error("Failed to upload image:", error);
      return null;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      let imageStorageId = null;

      // Handle image changes
      if (selectedImage) {
        // Upload new image
        imageStorageId = await handleImageUpload(selectedImage);
      }

      // Handle image deletion/update
      if (event.imageStorageId) {
        if (removedCurrentImage || selectedImage) {
          // Delete old image from storage
          await deleteImage({
            storageId: event.imageStorageId,
          });
        }
      }

      // Update event details
      await updateEvent({
        eventId: event._id,
        updates: {
          name: formData.name,
          description: formData.description,
          location: formData.location,
          eventDate: new Date(formData.eventDate).getTime(),
          price: Number(formData.price),
          totalTickets: Number(formData.totalTickets),
        },
      });

      // Update image if changed
      if (imageStorageId || removedCurrentImage) {
        await updateEventImage({
          eventId: event._id,
          storageId: imageStorageId ? (imageStorageId as Id<"_storage">) : null,
        });
      }

      toast.success("Event updated successfully!");
      router.push("/seller");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Ticket Management Section */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Ticket Management</h3>
        <button
          type="button"
          onClick={() => router.push(`/seller/events/${event._id}/tickets`)}
          className="text-blue-600 hover:text-blue-700 bg-white px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors duration-200"
        >
          Manage Ticket Types
        </button>
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Event Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          type="text"
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">
          Event Date
        </label>
        <input
          type="date"
          id="eventDate"
          value={formData.eventDate}
          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price ()
        </label>
        <input
          type="number"
          id="price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
          min="0"
          step="0.01"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="totalTickets" className="block text-sm font-medium text-gray-700">
          Total Tickets
        </label>
        <input
          type="number"
          id="totalTickets"
          value={formData.totalTickets}
          onChange={(e) => setFormData({ ...formData, totalTickets: Number(e.target.value) })}
          min="1"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Image
        </label>
        <div className="space-y-4">
          {imagePreview || (!removedCurrentImage && currentImageUrl) ? (
            <div className="relative w-32 aspect-square bg-gray-100 rounded-lg border">
              <Image
                src={imagePreview || currentImageUrl!}
                alt="Event image preview"
                fill
                className="object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                  setRemovedCurrentImage(true);
                  if (imageInput.current) {
                    imageInput.current.value = "";
                  }
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-sm"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={imageInput}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload a new image for your event
              </p>
            </div>
          )}
          
          {(imagePreview || (!removedCurrentImage && currentImageUrl)) && (
            <button
              type="button"
              onClick={() => {
                if (imageInput.current) {
                  imageInput.current.click();
                }
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Change Image
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
