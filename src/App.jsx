import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./firebaseAuth";
import { onAuthStateChanged } from "firebase/auth";

import "./assets/App.css";

import SignUp from "./SignUp";
import SignIn from "./SignIn";
import HomePage from "./HomePage";
import AccountPage from "./AccountPage.jsx";
import MaintenanceLogPage from "./MaintenanceLog.jsx";
import Layout from "./layout.jsx";
import { SidebarProvider } from "./SidebarContext.jsx"; // NEW

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <BrowserRouter>
            <SidebarProvider> {/* NEW — wraps all routes, persists across navigation */}
                <Routes>
                    <Route
                        path="/signin"
                        element={user ? <Navigate to="/home" /> : <SignIn />}
                    />
                    <Route path="/signup" element={<SignUp />} />
                    <Route
                        path="/home"
                        element={user ? <Layout><HomePage /></Layout> : <Navigate to="/signin" />}
                    />
                    <Route
                        path="/account"
                        element={user ? <Layout><AccountPage /></Layout> : <Navigate to="/signin" />}
                    />
                    <Route
                        path="/maintenance"
                        element={user ? <Layout><MaintenanceLogPage /></Layout> : <Navigate to="/signin" />}
                    />
                    <Route path="*" element={<Navigate to={user ? "/home" : "/signin"} />} />
                </Routes>
            </SidebarProvider>
        </BrowserRouter>
    );
}

export default App;