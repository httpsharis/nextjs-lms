import React from "react";

export type HeaderProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    activeItems: number
    setActiveItems: (items: number) => void
    route: string;
    setRoute: (route: string) => void
}

export type CustomModalProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    activeItem: number | string;
    component: React.ElementType<{ setOpen: (open: boolean) => void; setRoute?: (route: string) => void }>;
    setRoute?: (route: string) => void;
}