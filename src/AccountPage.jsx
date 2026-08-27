import { useEffect, useState } from "react";
import { getAuth, updatePassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import { useSidebar } from "./useSidebar.js";
import SignOutButton from "./signOut.jsx";
import "./assets/global.css";
import "./assets/AccountPage.css";

function AccountPage() {
    const { collapsed, setCollapsed } = useSidebar();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        setUser(currentUser);

        if (currentUser) {
            const fetchProfile = async () => {
                const userRef = doc(db, "user", currentUser.uid);
                const snapshot = await getDoc(userRef);
                if (snapshot.exists()) {
                    setProfile(snapshot.data());
                } else {
                    console.warn("No matching user document found in Firestore.");
                }
            };
            fetchProfile();
        }
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        try {
            await updatePassword(auth.currentUser, newPassword);
            setStatus("Password updated successfully!");
            setNewPassword("");
        } catch (err) {
            console.error(err);
            if (err.code === "auth/requires-recent-login") {
                setStatus("Please sign out and sign in again before changing your password.");
            } else {
                setStatus("Failed to update password: " + err.message);
            }
        }
    };

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
                <h2 style={{ margin: 0 }}>Asset Management</h2>
                <SignOutButton />
            </div>

            <div style={{ padding: "20px" }} className="content">
                <h1>Account</h1>
                {user ? (
                    <div>
                        <p><strong>Username:</strong> {profile?.username || "Loading..."}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>User ID:</strong> {user.uid}</p>
                    </div>
                ) : (
                    <p>No user signed in.</p>
                )}
                <form onSubmit={handleChangePassword} className="form-change-password">
                    <h3><strong>Change a new password:</strong></h3>
                    <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={6}
                        required
                    />
                    <button type="submit" className="change-pass-btn">Change Password</button>
                    {status && <p>{status}</p>}
                </form>
            </div>
        </>
    );
}

export default AccountPage;