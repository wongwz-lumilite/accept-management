import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase.js";
import { useSidebar } from "./useSidebar.js";
import SignOutButton from "./signOut.jsx";
import "./assets/global.css";
import "./assets/HomePage.css";

function isMaintenanceRequired(installedDate) {
    if (!installedDate) return false;
    const installed = installedDate.toDate ? installedDate.toDate() : new Date(installedDate);
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    return installed < threeYearsAgo;
}

function MaintenanceLogPage() {
    const { collapsed, setCollapsed } = useSidebar();

    const [streetlights, setStreetlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStreetlights = async () => {
            try {
                const snapshot = await getDocs(collection(db, "streetlights"));
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setStreetlights(data.filter((light) => isMaintenanceRequired(light.installedDate)));
            } catch (err) {
                console.error("Error fetching streetlights:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStreetlights();
    }, []);

    if (loading) return <p>Loading maintenance log...</p>;
    if (error) return <p>Error: {error}</p>;

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
                <h1>Maintenance Log</h1>
                <p>Streetlights installed more than 3 years ago, requiring maintenance.</p>

                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th className="center">Zone</th>
                        <th className="center">Status</th>
                        <th>Installation Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    {streetlights.length === 0 ? (
                        <tr>
                            <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                                No streetlights currently require maintenance.
                            </td>
                        </tr>
                    ) : (
                        streetlights.map((light) => (
                            <tr key={light.id}>
                                <td>{light.id}</td>
                                <td className="center">{light.zone}</td>
                                <td className="center">{light.status}</td>
                                <td>
                                    {light.installedDate?.toDate
                                        ? light.installedDate.toDate().toLocaleDateString()
                                        : light.installedDate}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default MaintenanceLogPage;