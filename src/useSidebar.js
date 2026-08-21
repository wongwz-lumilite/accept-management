import { useContext } from "react";
import { SidebarContext } from "./SidebarContext.jsx";

export function useSidebar() {
    return useContext(SidebarContext);
}