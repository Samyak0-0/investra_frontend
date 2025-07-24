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
    riskTolerance,
    investmentHorizon,
    monthlyInvestment,
    portfolioValue,
    diversificationLevel,
  } = body;

  try {
    const preferences = await prisma.investmentPreference.upsert({
      where: { userId: session.user.id },
      update: {
        riskTolerance,
        investmentHorizon,
        monthlyInvestment,
        portfolioValue,
        diversificationLevel,
      },
      create: {
        userId: session.user.id,
        riskTolerance,
        investmentHorizon,
        monthlyInvestment,
        portfolioValue,
        diversificationLevel,
      },
    });

    return new Response(JSON.stringify({ preferences }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating investment preferences:", error);
    return new Response(JSON.stringify({ error: "Failed to update preferences" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
