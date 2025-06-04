"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { toast } from "sonner";

interface DiscountCodeFormProps {
  eventId: Id<"events">;
  sellerId: string;
  onSuccess?: () => void;
}

interface FormData {
  code: string;
  percentage: number;
  usageLimit?: number;
  validFrom?: string;
  validTo?: string;
}

export default function DiscountCodeForm({ eventId, sellerId, onSuccess }: DiscountCodeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createDiscountCode = useMutation(api.discountCodes.create);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      await createDiscountCode({
        eventId,
        sellerId,
        code: data.code,
        percentage: Number(data.percentage),
        usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
        validFrom: data.validFrom ? new Date(data.validFrom).getTime() : undefined,
        validTo: data.validTo ? new Date(data.validTo).getTime() : undefined,
      });
      
      toast.success("Discount code created successfully");
      reset();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create discount code");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="code">Discount Code</Label>
        <Input
          id="code"
          {...register("code", { 
            required: "Discount code is required",
            minLength: { value: 3, message: "Code must be at least 3 characters" },
            pattern: {
              value: /^[A-Za-z0-9]+$/,
              message: "Code must contain only letters and numbers"
            }
          })}
          placeholder="SUMMER2024"
          className="mt-1"
        />
        {errors.code && (
          <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="percentage">Discount Percentage</Label>
        <Input
          id="percentage"
          type="number"
          {...register("percentage", {
            required: "Percentage is required",
            min: { value: 1, message: "Minimum discount is 1%" },
            max: { value: 100, message: "Maximum discount is 100%" }
          })}
          placeholder="10"
          className="mt-1"
        />
        {errors.percentage && (
          <p className="text-sm text-red-500 mt-1">{errors.percentage.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
        <Input
          id="usageLimit"
          type="number"
          {...register("usageLimit", {
            min: { value: 1, message: "Minimum usage limit is 1" }
          })}
          placeholder="100"
          className="mt-1"
        />
        {errors.usageLimit && (
          <p className="text-sm text-red-500 mt-1">{errors.usageLimit.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="validFrom">Valid From (Optional)</Label>
          <Input
            id="validFrom"
            type="datetime-local"
            {...register("validFrom")}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="validTo">Valid To (Optional)</Label>
          <Input
            id="validTo"
            type="datetime-local"
            {...register("validTo")}
            className="mt-1"
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creating..." : "Create Discount Code"}
      </Button>
    </form>
  );
}
