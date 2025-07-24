import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const {
    phone,
    location,
    bio,
    avatar,
    riskTolerance,
    investmentGoals,
    preferredSectors,
  } = body;

  try {
    const profile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        phone,
        location,
        bio,
        avatar,
        riskTolerance,
        investmentGoals,
        preferredSectors,
      },
      create: {
        userId: session.user.id,
        phone,
        location,
        bio,
        avatar,
        riskTolerance,
        investmentGoals,
        preferredSectors,
      },
    });

    return new Response(JSON.stringify({ profile }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return new Response(JSON.stringify({ error: "Failed to update profile" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
