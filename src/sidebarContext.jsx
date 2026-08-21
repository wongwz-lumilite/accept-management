import { createContext, useState } from "react";

export const SidebarContext = createContext({ collapsed: true, setCollapsed: () => {} });

export function SidebarProvider({ children }) {
    const [collapsed, setCollapsed] = useState(true);

    return (
        <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
            {children}
        </SidebarContext.Provider>
    );
}