"use client";

import { useContext, useEffect } from "react";

import StockDashboard from "@/components/dashboard/Dashboard";
import { useSession } from "next-auth/react";
import { UserContext } from "@/provider/ContextProvider";

export default function Home() {
  const { data } = useSession();
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    const fetchId = async () => {
      if (data?.user?.email) {
        try {
          const response = await fetch(`/api/userId?mail=${data.user.email}`);
          const result = await response.json();
          console.log("fetched user: ", result)

          setUser(result);
        } catch (error) {
          console.error("Error fetching user ID:", error);
        }
      }
    };
    fetchId();
  }, [data?.user?.email, setUser]);

  return (
    <div>
      <StockDashboard />
    </div>
  );
}
