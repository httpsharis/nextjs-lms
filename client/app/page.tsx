"use client";

import React, { FC, useState } from "react";

import Heading from "./utils/Heading";

interface Props {}

export const Page: FC<Props> = (props) => {
  return (
    <div>
      <Heading
        title="Learning Management System"
        description="A platform to learn better then the words"
        keywords="Programming, MERN, MAchine Learning, Redux"
      />
    </div>
  );
};
