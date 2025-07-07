import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("userId");
    const ticker = searchParams.get("ticker");

    if (!id || !ticker) {
      return NextResponse.json(
        { error: "User id and ticker are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentStockNames = Array.isArray(user.stockName)
      ? user.stockName
      : [];

    if (currentStockNames.includes(ticker)) {
      return NextResponse.json(
        { message: "Ticker already exists in user's stock list", user },
        { status: 200 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { stockName: [...currentStockNames, ticker] },
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.log(err);
  }
}
