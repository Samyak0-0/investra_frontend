import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    riskTolerance,
    investmentHorizon,
    monthlyInvestment,
    portfolioValue,
    diversificationLevel,
    userId,
  } = body;

  try {
    const preferences = await prisma.investmentPreference.upsert({
      where: { id: userId },
      update: {
        riskTolerance,
        investmentHorizon,
        monthlyInvestment,
        portfolioValue,
        diversificationLevel,
      },
      create: {
        userId: userId,
        riskTolerance,
        investmentHorizon,
        monthlyInvestment,
        portfolioValue,
        diversificationLevel,
      },
    });

    return new Response(JSON.stringify({ preferences }));
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to update preferences" })
    );
  }
}
