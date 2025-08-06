
import { prisma } from "@/lib/prisma"; 
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const { stockName, userId } = await request.json();

    if (!stockName || !userId) {
      return NextResponse.json(
        { error: "Missing stockName or userId" },
        { status: 400 }
      );
    }

    const deletedPortfolio = await prisma.portfolio.delete({
      where: {
        user_id_stock_Name: {
          user_id: userId,
          stock_Name: stockName,
        },
      },
    });

    fetch(`http://127.0.0.1:5000/api/reset/?userId=${userId}`, {
        method: "DELETE",
      });

    return NextResponse.json(
      { message: "Stock deleted successfully", deletedPortfolio },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting stock from portfolio:", error);
    return NextResponse.json(
      { error: "Failed to delete stock from portfolio" },
      { status: 500 }
    );
  }
}
