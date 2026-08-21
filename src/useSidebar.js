import { useContext } from "react";
import { SidebarContext } from "./sidebarContext.jsx";

export function useSidebar() {
    return useContext(SidebarContext);
}
