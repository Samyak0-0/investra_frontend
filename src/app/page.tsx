"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StockDashboard from "@/components/dashboard/Dashboard";

export default function Home() {

  const { status } = useSession();
    const router = useRouter();
  
    if (status === "unauthenticated") {
      router.push("/api/auth/signin")
    }

  return (
    <div>
      <StockDashboard />
    </div>
  );
}
