import React from "react";
import Link from "next/link"; // Import Link from Next.js
import { TrendingUp } from "lucide-react"; // Importing Lucide icons
import { MessageIcon, NotificationIcon, ProfileIcon } from "./NavbarIcons";

type Props = {};

const Navbar = (props: Props) => {
  return (
    <nav className="bg-[#f2f2f2] text-black py-4 px-8 flex justify-between items-center">
      {/* Left Section: Logo and Links */}
      <div className="flex items-center space-x-6">

        {/* Investra Logo */}
        <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-[#0cb9c1]" />
            <h1 className="text-2xl font-bold text-[#0cb9c1] tracking-wide">
                Investra
            </h1>
        </div>

        <Link
          href="/"
          className="text-lg font-medium hover:text-[#0cb9c1] hover:scale-125 px-4 py-2 transition-all duration-500"
        >
          Home
        </Link>

        <Link
          href="/stock"
          className="text-lg font-medium hover:text-[#0cb9c1] hover:scale-125 px-4 py-2 transition-all duration-500"
        >
          Market
        </Link>

        <Link
          href="/portfolio"
          className="text-lg font-medium hover:text-[#0cb9c1] hover:scale-125 px-4 py-2 transition-all duration-500"
        >
          Portfolio
        </Link>

      </div>

      {/* Right Section: Icons */}
      <div className="flex items-center space-x-4">

        <Link href="/profile">
          <button className="p-2 focus:outline-none transition-all duration-500 ease-in-out hover:text-[#0cb9c1] hover:scale-125">
            <ProfileIcon className="h-7 w-7" />
          </button>
        </Link>

      </div>
    </nav>
  );
};

export default Navbar;