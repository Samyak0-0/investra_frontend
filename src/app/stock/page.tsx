"use client"

import StockSearchPage from "@/components/stockSearch/StockSearchPage";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const page = () => {
  
  const { status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.push("/api/auth/signin")
  }

  return (
    <div>
      <StockSearchPage />
    </div>
  );
};

export default page;
