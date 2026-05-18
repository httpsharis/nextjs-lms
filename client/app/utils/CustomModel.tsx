import React, { FC } from "react";
import { Box, Modal } from "@mui/material";

import { CustomModalProps } from "../types";

const CustomModel: FC<CustomModalProps> = ({
  open,
  setOpen,
  activeItem,
  component: Component,
  setRoute,
}) => {
  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className="absolute max-h-[80vh] overflow-y-auto top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-112.5 bg-white dark:bg-slate-900 rounded-lg shadow p-4 outline-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <Component setOpen={setOpen} setRoute={setRoute} />
      </Box>
    </Modal>
  );
};

export default CustomModel;
