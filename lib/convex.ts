import { ConvexHttpClient } from "convex/browser";

// Create a client for server-side HTTP requests
export const getConvexClient = () => {
  // Try both environment variables
  const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  
  if (!convexUrl) {
    throw new Error("Convex URL is not set in environment variables");
  }

  console.log("Initializing Convex client with URL:", convexUrl);
  
  try {
    const client = new ConvexHttpClient(convexUrl);
    return client;
  } catch (error) {
    console.error("Failed to initialize Convex client:", error);
    throw error;
  }
};
