import Portfolio from "@/components/portfolio/Portfolio";

const userId: string = ""; // THIS VALUE MUST BE RETRIEVED FROM SESSION, FUCK YOU
const page = () => {
  return (
    <div>
      <Portfolio userId={userId} />
    </div>
  );
};

export default page;
