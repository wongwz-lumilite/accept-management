import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase.js";

import "./assets/global.css";
import "./assets/Dashboard.css";

import { useSidebar } from "./useSidebar.js";
import SignOutButton from "./signOut.jsx";

function isMaintenanceRequired(installedDate, maintenanceDate) {
    if (!installedDate) return false;

    const installed = installedDate.toDate ? installedDate.toDate() : new Date(installedDate);
    const maintained = maintenanceDate?.toDate
        ? maintenanceDate.toDate()
        : maintenanceDate
            ? new Date(maintenanceDate)
            : null;

    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    if (maintained && maintained >= threeYearsAgo) {
        return false;
    }

    return installed < threeYearsAgo;
}

const ZONE_COLORS = ["#2f7cb8", "#7fc8f8", "#1a3d5c", "#cfe8fa", "#5a7f9c"];

function Dashboard() {
    const { collapsed, setCollapsed } = useSidebar();
    const navigate = useNavigate();

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
                setStreetlights(data);
            } catch (err) {
                console.error("Error fetching streetlights:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStreetlights();
    }, []);

    if (loading) return <p>Loading dashboard...</p>;
    if (error) return <p>Error: {error}</p>;

    const activeCount = streetlights.filter((light) => light.status === "active").length;
    const maintenanceCount = streetlights.filter((light) =>
        isMaintenanceRequired(light.installedDate, light.isMaintained)
    ).length;

    // Group by zone for the pie chart
    const zoneCounts = streetlights.reduce((acc, light) => {
        const zone = light.zone || "Unassigned";
        acc[zone] = (acc[zone] || 0) + 1;
        return acc;
    }, {});

    const zoneData = Object.entries(zoneCounts).map(([zone, count]) => ({
        name: `Zone ${zone}`,
        value: count,
    }));

    return (
        <>
            <div className="header">
                <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
                    ☰
                </button>
                <h2 style={{ margin: 0 }}>Streetlight Dashboard</h2>
                <SignOutButton />
            </div>

            <div className="dashboard-content">
                <h1>Dashboard</h1>

                <div className="summary-row">
                    <div className="summary-card active">
                        <h3>Active Lights</h3>
                        <p>{activeCount}</p>
                    </div>

                    <div className="summary-card maintenance clickable"
                         onClick={() => navigate("/list")}>
                        <h3>Maintenance Required</h3>
                        <p>{maintenanceCount}</p>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Number of Streetlights by Zone</h3>
                    <ResponsiveContainer width="100%" height={500}>
                        <PieChart>
                            <Pie
                                data={zoneData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={150}
                                label={({ name, value }) => `${name}: ${value} Streetlight(s)`}
                            >
                                {zoneData.map((entry, index) => (
                                    <Cell key={entry.name} fill={ZONE_COLORS[index % ZONE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
}


export default Dashboard;

