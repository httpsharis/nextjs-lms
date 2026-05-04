"use client";

import React, { FC, useState } from "react";

import Heading from "./utils/Heading";
import Header from "./components/Header";

interface Props {}

const Page: FC<Props> = (props) => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);
  return (
    <div>
      <Heading
        title="Learning Management System"
        description="A platform to learn better then the words"
        keywords="Programming, MERN, MAchine Learning, Redux"
      />
      <Header
        open={open}
        setActiveItem={setActiveItem}
        activeItem={activeItem}
      />
    </div>
  );
};

export default Page