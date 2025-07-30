
import { UserContext } from "@/provider/ContextProvider";
import PortfolioOverview from "@/components/portfolio/PortfolioOverview";

const userId: string = ""; // Retrieve from the session 
const page = () => {
  return (
    <div>
      <PortfolioOverview/>
    </div>
  );
};

export default page;
