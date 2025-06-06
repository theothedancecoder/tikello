
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const targetUserId = searchParams.get("userId");

  if (!targetUserId) {
    return new NextResponse("Missing userId", { status: 400 });
  }

  try {
    const user = await (await clerkClient()).users.getUser(targetUserId);
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json({
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.emailAddresses[0].emailAddress,
    });
  } catch (error) {
    console.error("Failed to get user info:", error);
    return new NextResponse("Failed to get user info", { status: 500 });
  }
}
