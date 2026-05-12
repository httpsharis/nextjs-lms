"use client";
import Link from "next/link";
import { FC, useState, useEffect } from "react";
import NavItems from "./NavItems";
import { ThemeSwitcher } from "../utils/ThemeSwitcher";
import { Menu } from "lucide-react";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeItems: number;
  setActiveItem: (item: number) => void;
};

const Header: FC<Props> = ({ activeItems, open, setOpen, setActiveItem }) => {
  const [active, setActive] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false)

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
            ? "dark:bg-opacity-50 dark:bg-linear-to-b dark:from-gray-900 dark:to-black fixed top-0 left-0 w-full h-30 py-10 z-[80] border-b dark:border-[#ffffff1c]"
            : "w-full border-b dark:border-[#ffffff1c] h-22 z-[80] dark:shadow"
        } transition-all duration-300`}
      >
        <div className="w-[95%] 800px:w-[92%] m-auto py-0.5 h-full">
          <div className="w-full h-20 flex items-center justify-between p-3">
            <Link
              href={"/"}
              className="text-[25px] font-Poppins font-medium text-black dark:text-white"
            >
              ELearning
            </Link>

            <div className="flex items-center">
              <NavItems activeItems={activeItems} isMobile={false} />
              <ThemeSwitcher />
              <div className="800px:hidden">
                <Menu 
                  size={25}
                  className="cursor-pointer dark:text-white text-black"
                  onClick={()=> setOpenSidebar(true)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
