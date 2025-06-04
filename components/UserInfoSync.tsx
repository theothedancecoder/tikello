"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

export default function UserInfoSync() {
  const { user, isLoaded } = useUser();
  const updateUser = useMutation(api.users.updateUser);

  useEffect(() => {
    if (isLoaded && user) {
      updateUser({
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.emailAddresses[0].emailAddress,
      });
    }
  }, [isLoaded, user, updateUser]);

  // This is a utility component that doesn't render anything
  return null;
}
