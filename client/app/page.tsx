"use client";

import { useState } from "react";
import Heading from "./utils/Heading";
import Header from "./components/Header";

export default function Page() {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);

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
        setActiveItem={setActiveItem}
      />
    </div>
  );
}