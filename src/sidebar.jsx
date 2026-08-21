import { NavLink } from "react-router-dom";
import { useSidebar } from "./useSidebar.js";
import "./assets/sidebar.css";
import "./assets/global.css";

import Lumilite from "./assets/Lumilite.png";

function Sidebar() {
    const { collapsed } = useSidebar();

    return (
        <div className={collapsed ? "sidebar collapsed" : "sidebar"}>
            <div className="image-center">
                <img src={Lumilite} alt="logo" />
            </div>
            <nav>
                <NavLink to="/home" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
                    🏠 Home
                </NavLink>
                <NavLink to="/maintenance" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
                    🔧 Maintenance Log
                </NavLink>
                <NavLink to="/account" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
                    👤 Account
                </NavLink>
            </nav>
        </div>
    );
}

export default Sidebar;
