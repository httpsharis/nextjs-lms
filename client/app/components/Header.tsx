"use client";
import { FC, useState } from "react";

// 1. The Child defines the exact package it expects from the Parent.
type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeItem: number;
  setActiveItem: number;
};

// 2. The Child receives the package via 'props'.
const Header: FC<Props> = (props) => {
  const [active, setActive] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 80) {
        setActive(true);
      } else {
        setActive(false);
      }
    });
  }
  return (
    <div className="w-full relative">
      <div
        className={`${
          active
            ? "dark:bg-opacity-50 dark:bg-gradient-t0-b dark:from-gray-900 dark:to-black fixed top left-0 w-full h-20 z-[80px] border-b dark:border-[#ffffff1c]"
            : "w-full border-b dark:border-[ffffff1c] h-20 z-[80ox] dark:shadow"
        }`}
      ></div>
    </div>
  );
};

export default Header;
