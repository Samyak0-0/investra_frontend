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

    const updatedStockNames = Array.isArray(user.stockName)
      ? [...user.stockName, ticker]
      : [ticker];

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { stockName: updatedStockNames },
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.log(err);
  }
}
