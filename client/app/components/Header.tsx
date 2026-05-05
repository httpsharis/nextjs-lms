"use client";
import Link from "next/link";
import { FC, useState, useEffect } from "react";
import NavItems from "./NavItems";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeItems: number;
  setActiveItem: (item: number) => void;
};

const Header: FC<Props> = ({ activeItems, open, setOpen, setActiveItem }) => {
  const [active, setActive] = useState(false);

  // 1. Lock the scroll listener inside useEffect so it only runs once
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setActive(true);
      } else {
        setActive(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full relative">
      <div
        className={`${
          active
            ? "dark:bg-opacity-50 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black fixed top-0 left-0 w-full h-20 z-[80px] border-b dark:border-[#ffffff1c]"
            : "w-full border-b dark:border-[#ffffff1c] h-20 z-[80px] dark:shadow"
        } transition-all duration-300`}
      >
        <div className="w-[95%] 800px:w-[92%] m-auto py-2 h-full">
          {/* 2. Fixed layout: Logo and NavItems are now direct siblings */}
          <div className="w-full h-20 flex items-center justify-between p-3">
            
            <Link
              href={"/"}
              className="text-[25px] font-Poppins font-medium text-black dark:text-white"
            >
              ELearning
            </Link>

            <div className="flex items-center">
              <NavItems activeItems={activeItems} isMobile={false} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;