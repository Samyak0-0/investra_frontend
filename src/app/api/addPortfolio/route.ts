import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { stockTicker, no_of_Stocks, userId } = await request.json();

    const existingPortfolio = await prisma.portfolio.findFirst({
      where: {
        user_id: userId,
        stock_Name: stockTicker,
      },
    });

    if (existingPortfolio) {
      const updatedPortfolio = await prisma.portfolio.update({
        where: {
          user_id_stock_Name: {
            user_id: userId,
            stock_Name: stockTicker,
          },
        },
        data: {
          stock_Amt: existingPortfolio.stock_Amt + no_of_Stocks,
        },
      });
      return NextResponse.json(updatedPortfolio, { status: 200 });
    } else {
      const newPortfolio = await prisma.portfolio.create({
        data: {
          user_id: userId,
          stock_Name: stockTicker,
          stock_Amt: no_of_Stocks,
        },
      });

      await fetch(`http://127.0.0.1:5000/api/reset/?userId=${userId}`, {
        method: "DELETE",
      });

      return NextResponse.json(newPortfolio, { status: 201 });
    }
  } catch (error) {
    console.error("Error adding stock to portfolio:", error);
    return NextResponse.json(
      { error: "Failed to add stock to portfolio" },
      { status: 500 }
    );
  }
}
