import Link from "next/link";
import React from "react";
import { navItemsData } from "../../constants/navItems";

type Props = {
  activeItems: number;
  isMobile: boolean;
};

export const NavItems: React.FC<Props> = ({ activeItems, isMobile }) => {
  return (
    <nav
      className={`${isMobile ? "w-full text-center py-6 mt-5" : "hidden 800px:flex items-center"}`}
    >
      {navItemsData.map((item, index) => (
        <Link href={item.url} key={index} passHref>
          <span
            className={`${
              activeItems === index
                ? "text-blue-600 dark:text-blue-400 font-semibold"
                : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            } ${
              isMobile ? "block py-5" : "px-5"
            } text-[16px] font-Poppins transition-colors duration-300`}
          >
            {item.name}
          </span>
        </Link>
      ))}
    </nav>
  );
};
