import PortfolioOverview from "@/components/portfolio/PortfolioOverview";

const userId: string = ""; // THIS VALUE MUST BE RETRIEVED FROM SESSION, FUCK YOU
const page = () => {
  return (
    <div>
      <PortfolioOverview />
    </div>
  );
};

export default page;
