import { auth } from "@clerk/nextjs";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const user = auth().user;
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const convex = getConvexClient();
    await convex.mutation(api.users.updateUser, {
      userId,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.emailAddresses[0].emailAddress,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to store user info:", error);
    return new NextResponse("Failed to store user info", { status: 500 });
  }
}
