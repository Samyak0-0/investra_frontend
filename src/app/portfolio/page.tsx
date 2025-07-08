<<<<<<< HEAD
import Portfolio from "@/components/portfolio/Portfolio";
import { UserContext } from "@/provider/ContextProvider";
import { useContext } from "react";
import PortfolioOverview from "@/components/portfolio/PortfolioOverview";

const page = () => {
  const user = useContext(UserContext);
  return (
    <div>
      <Portfolio userId={user.id} />
    </div>
  );
};

export default page;
