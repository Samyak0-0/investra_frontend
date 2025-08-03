"use client"
import React from "react";
import Link from "next/link"; // Import Link from Next.js
import { TrendingUp } from "lucide-react"; // Importing Lucide icons
import { MessageIcon, NotificationIcon, ProfileIcon } from "./NavbarIcons";

type Props = {};

const Navbar = (props: Props) => {
  return (
    // <nav className="bg-[#f2f2f2] text-black py-4 px-8 flex justify-between items-center">
    //   {/* Left Section: Logo and Links */}
    //   <div className="flex items-center space-x-6">

    //     {/* Investra Logo */}
    //     <div className="flex items-center space-x-2">
    //         <TrendingUp className="h-8 w-8 text-[#0cb9c1]" />
    //         <h1 className="text-2xl font-bold text-[#0cb9c1] tracking-wide">
    //             Investra
    //         </h1>
    //     </div>

    //     <Link
    //       href="/"
    //       className="text-lg font-medium hover:text-[#0cb9c1] hover:scale-125 px-4 py-2 transition-all duration-500"
    //     >
    //       Home
    //     </Link>

    //     <Link
    //       href="/stock"
    //       className="text-lg font-medium hover:text-[#0cb9c1] hover:scale-125 px-4 py-2 transition-all duration-500"
    //     >
    //       Market
    //     </Link>

    //     <Link
    //       href="/portfolio"
    //       className="text-lg font-medium hover:text-[#0cb9c1] hover:scale-125 px-4 py-2 transition-all duration-500"
    //     >
    //       Portfolio
    //     </Link>

    //   </div>

    //   {/* Right Section: Icons */}
    //   <div className="flex items-center space-x-4">

    //     <Link href="/profile">
    //       <button className="p-2 focus:outline-none transition-all duration-500 ease-in-out hover:text-[#0cb9c1] hover:scale-125">
    //         <ProfileIcon className="h-7 w-7" />
    //       </button>
    //     </Link>

    //   </div>
    // </nav>

    // <nav className="bg-gradient-to-r from-slate-800/95 via-purple-800/90 to-slate-800/95 backdrop-blur-lg border-b border-white/15 shadow-lg text-white py-4 px-8 flex justify-between items-center sticky top-0 z-50">
    //   {/* Left Section: Logo and Links */}
    //   <div className="flex items-center space-x-8">
    //     {/* Investra Logo */}
    //     <div className="flex items-center space-x-3">
    //       <div className="p-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl">
    //         <TrendingUp className="h-6 w-6 text-white" />
    //       </div>
    //       <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent tracking-wide">
    //         Investra
    //       </h1>
    //     </div>

    //     {/* Navigation Links */}
    //     <div className="hidden md:flex items-center space-x-2">
    //       <Link
    //         href="/"
    //         className="relative px-4 py-2 text-gray-300 hover:text-white transition-all duration-300 group"
    //       >
    //         <span className="relative z-10 font-medium">Home</span>
    //         <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100"></div>
    //       </Link>

    //       <Link
    //         href="/stock"
    //         className="relative px-4 py-2 text-gray-300 hover:text-white transition-all duration-300 group"
    //       >
    //         <span className="relative z-10 font-medium">Market</span>
    //         <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100"></div>
    //       </Link>

    //       <Link
    //         href="/portfolio"
    //         className="relative px-4 py-2 text-gray-300 hover:text-white transition-all duration-300 group"
    //       >
    //         <span className="relative z-10 font-medium">Portfolio</span>
    //         <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100"></div>
    //       </Link>
    //     </div>
    //   </div>

    //   {/* Right Section: Profile */}
    //   <div className="flex items-center space-x-4">
    //     <Link href="/profile">
    //       <button className="relative p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-400/30">
    //         <ProfileIcon className="h-5 w-5 text-gray-300 group-hover:text-white" />
    //         <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"></div>
    //       </button>
    //     </Link>
    //   </div>
    // </nav>

    <nav className="bg-white border-b-2 border-blue-100 shadow-sm text-gray-800 py-4 px-8 flex justify-between items-center sticky top-0 z-50">
      {/* Left Section: Logo and Links */}
      <div className="flex items-center space-x-8">
        {/* Investra Logo */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent tracking-wide">
            Investra
          </h1>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-2">
          <Link
            href="/"
            className="relative px-5 py-2.5 text-gray-600 hover:text-blue-600 transition-all duration-300 group font-medium"
          >
            <span className="relative z-10">Home</span>
            <div className="absolute inset-0 bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100"></div>
          </Link>

          <Link
            href="/stock"
            className="relative px-5 py-2.5 text-gray-600 hover:text-blue-600 transition-all duration-300 group font-medium"
          >
            <span className="relative z-10">Market</span>
            <div className="absolute inset-0 bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100"></div>
          </Link>

          <Link
            href="/portfolio"
            className="relative px-5 py-2.5 text-gray-600 hover:text-blue-600 transition-all duration-300 group font-medium"
          >
            <span className="relative z-10">Portfolio</span>
            <div className="absolute inset-0 bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100"></div>
          </Link>
        </div>
      </div>

      {/* Right Section: Profile */}
      <div className="flex items-center space-x-4">
        <Link href="/profile">
          <button className="relative p-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-100 group">
            <ProfileIcon className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-pulse shadow-sm"></div>
          </button>
        </Link>
      </div>

      {/* Mobile Menu Button (Optional - for responsive design) */}
      <div className="md:hidden">
        <button className="p-2 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg transition-all duration-300">
          <div className="w-5 h-5 flex flex-col justify-center space-y-1">
            <div className="w-full h-0.5 bg-blue-600"></div>
            <div className="w-full h-0.5 bg-blue-600"></div>
            <div className="w-full h-0.5 bg-blue-600"></div>
          </div>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;