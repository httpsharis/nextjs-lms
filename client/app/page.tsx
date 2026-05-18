"use client";

import { useState } from "react";
import Heading from "./utils/Heading";
import Header from "./components/layout/Header";

export default function Page() {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);
  const [route, setRoute] = useState("Login")

  return (
    <div>
      <Heading
        title="Learning Management System"
        description="A platform to learn better than words"
        keywords="Programming, MERN, Machine Learning, Redux"
      />
      <Header
        open={open}
        setOpen={setOpen}
        activeItems={activeItem}
        setActiveItems={setActiveItem}
        setRoute={setRoute}
        route={route}
        
      />
    </div>
  );
}
