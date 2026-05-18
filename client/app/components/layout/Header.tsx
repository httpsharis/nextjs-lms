"use client";
import Link from "next/link";
import { FC, useState } from "react";
import { NavItems } from "./NavItems";
import { ThemeSwitcher } from "../../utils/ThemeSwitcher";
import { Menu, CircleUserRound } from "lucide-react";
import CustomModel from "../../utils/CustomModel";
import { useScroll } from "../../hooks/useScroll";
import Login from "../auth/Login";
import SignUp from "../auth/SignUp";
import AuthVerification from "../auth/AuthVerification";

import { HeaderProps } from "../../types";

const Header: FC<HeaderProps> = ({
  activeItems,
  open,
  setOpen,
  setActiveItems,
  setRoute,
  route,
}) => {
  const active = useScroll(80);
  const [openSidebar, setOpenSidebar] = useState(false);

  const handleClose = (e: React.MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).id === "screen") setOpenSidebar(false);
  };

  return (
    <div className="w-full relative">
      <div
        className={`${
          active
            ? "dark:bg-opacity-50 dark:bg-linear-to-b dark:from-gray-900 dark:to-black fixed top-0 left-0 w-full h-15 z-80 border-b border-gray-200 dark:border-[#ffffff1c]"
            : "w-full border-b border-gray-200 dark:border-[#ffffff1c] h-15 z-80 dark:shadow"
        } transition-all duration-300 backdrop-blur-md`}
      >
        <div className="w-[95%] 800px:w-[92%] m-auto py-1 h-full">
          <div className="w-full h-full flex items-center justify-between p-3">
            {/* Desktop Logo */}
            <Link
              href={"/"}
              className="text-[25px] font-Poppins font-bold tracking-wider text-black dark:text-white"
            >
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-900 to-teal-600">
                Dev
              </span>
              Learn.
            </Link>

            <div className="flex items-center gap-4">
              <NavItems activeItems={activeItems} isMobile={false} />
              <ThemeSwitcher />

              {/* Desktop Login Button */}
              <button
                className="hidden 800px:block px-6 py-2 text-[16px] font-Poppins font-semibold text-white bg-linear-to-r from-blue-900 to-teal-900 rounded-full hover:opacity-90 transition-opacity duration-300"
                onClick={() => setOpen(true)}
              >
                Log In
              </button>

              {/* Mobile Profile & Menu Icons */}
              <div className="800px:hidden flex items-center gap-4">
                <CircleUserRound
                  size={25}
                  className="cursor-pointer dark:text-white text-black"
                  onClick={() => setOpen(true)}
                />
                <Menu
                  size={25}
                  className="cursor-pointer dark:text-white text-black"
                  onClick={() => setOpenSidebar(true)}
                />
              </div>
            </div>
          </div>

          {/* === MOBILE SIDEBAR === */}
          {openSidebar && (
            <div
              className="fixed w-full h-screen top-0 left-0 z-99999 dark:bg-[unset] bg-[#00000040] backdrop-blur-sm"
              onClick={handleClose}
              id="screen"
            >
              {/* Added flex-col and justify-between to space out the top, middle, and bottom */}
              <div className="w-[70%] fixed z-99999 h-screen bg-white dark:bg-slate-900 top-0 right-0 flex flex-col justify-between shadow-2xl">
                {/* Top: Mobile Logo */}
                <div className="w-full pt-10 text-center">
                  <span className="text-[25px] font-Poppins font-bold tracking-wider text-black dark:text-white">
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-teal-400">
                      Dev
                    </span>
                    Learn.
                  </span>
                </div>

                {/* Middle: Centered Nav Items */}
                <div className="w-full grow flex items-center justify-center">
                  <NavItems activeItems={activeItems} isMobile={true} />
                </div>

                {/* Bottom: Pinned Login Button & Copyright */}
                <div className="w-full pb-10 px-6">
                  <button
                    className="w-full py-3 text-[16px] font-Poppins font-semibold text-white bg-linear-to-r from-blue-500 to-teal-400 rounded-full hover:shadow-lg transition-all duration-300"
                    onClick={() => {
                      setOpen(true);
                      setOpenSidebar(false);
                    }}
                  >
                    Log In
                  </button>
                  <p className="text-[12px] mt-6 text-gray-500 dark:text-gray-400 text-center">
                    Copyright © 2026 DevLearn
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {route === "Sign-Up" && (
        <>
          {open && (
            <CustomModel
              open={open}
              setOpen={setOpen}
              setRoute={setRoute}
              activeItem={activeItems}
              component={() => (
                <div className="text-center p-4">
                  <SignUp setRoute={setRoute} />
                </div>
              )}
            />
          )}
        </>
      )}
      {route === "Login" && (
        <>
          {open && (
            <CustomModel
              open={open}
              setOpen={setOpen}
              setRoute={setRoute}
              activeItem={activeItems}
              component={() => (
                <div className="text-center p-4">
                  <Login setRoute={setRoute} />
                </div>
              )}
            />
          )}
        </>
      )}

      {/* NEW Verification Route Block */}
      {route === "AuthVerification" && (
        <>
          {open && (
            <CustomModel
              open={open}
              setOpen={setOpen}
              setRoute={setRoute}
              activeItem={activeItems}
              component={() => (
                <div className="text-center p-4">
                  <AuthVerification setRoute={setRoute} />
                </div>
              )}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Header;
