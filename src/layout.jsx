import Sidebar from "./sidebar.jsx";

function Layout({ children }) {
    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <div style={{ flex: 1, minHeight: "100vh" }}>{children}</div>
        </div>
    );
}

export default Layout;