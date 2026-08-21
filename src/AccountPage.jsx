import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useSidebar } from "./useSidebar.js";
import SignOutButton from "./signOut.jsx";
import "./assets/global.css";
import "./assets/HomePage.css";

function AccountPage() {
    const { collapsed, setCollapsed } = useSidebar();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        setUser(auth.currentUser);
    }, []);

    return (
        <>
            <div className="header">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: "22px",
                        cursor: "pointer",
                        color: "#1a3d5c",
                    }}
                >
                    ☰
                </button>
                <h2 style={{ margin: 0 }}>Streetlight Dashboard</h2>
                <SignOutButton />
            </div>

            <div style={{ padding: "20px" }}>
                <h1>Account</h1>
                {user ? (
                    <div>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>User ID:</strong> {user.uid}</p>
                    </div>
                ) : (
                    <p>No user signed in.</p>
                )}
            </div>
        </>
    );
}

export default AccountPage;