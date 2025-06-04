import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function POST(request: NextRequest) {
  try {
    const { eventId, code } = await request.json();

    if (!eventId || !code) {
      return NextResponse.json(
        { valid: false, message: "Event ID and code are required" },
        { status: 400 }
      );
    }

    const convex = getConvexClient();
    
    // Validate the discount code
    const validation = await convex.query(api.discountCodes.validateCode, {
      eventId: eventId as Id<"events">,
      code: code as string,
    });

    return NextResponse.json(validation);
  } catch (error) {
    console.error("Error validating discount code:", error);
    return NextResponse.json(
      { valid: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
