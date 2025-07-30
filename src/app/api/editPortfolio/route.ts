import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { stockName, userId, stock_Amt } = await request.json();

    if (!stockName || !userId) {
      return NextResponse.json(
        { error: "Missing stockName or userId" },
        { status: 400 }
      );
    }

    const updatedPortfolio = await prisma.portfolio.update({
      where: {
        user_id_stock_Name: {
          user_id: userId,
          stock_Name: stockName,
        },
      },
      data: {
        stock_Amt: stock_Amt,
      },
    });

    return NextResponse.json(
      { message: "Portfolio updated successfully", updatedPortfolio },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating portfolio:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
