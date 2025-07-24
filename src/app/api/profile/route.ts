import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    phone,
    location,
    bio,
    avatar,
    riskTolerance,
    investmentGoals,
    preferredSectors,
    email,
  } = body;

  try {
    const profile = await prisma.user.update({
      where: { email: email },
      data: {
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
