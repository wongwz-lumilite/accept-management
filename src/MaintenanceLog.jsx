import {useEffect, useState} from "react";
import {collection, getDocs} from "firebase/firestore";
import {db} from "./firebase.js";
import {useSidebar} from "./useSidebar.js";
import SignOutButton from "./signOut.jsx";
import "./assets/global.css";
import "./assets/HomePage.css";
import Loading from "./loading.jsx";

function isMaintenanceRequired(lastMaintainedDate) {
    if (!lastMaintainedDate) return false; // never maintained — ignore

    return lastMaintainedDate.toDate
        ? lastMaintainedDate.toDate()
        : new Date(lastMaintainedDate);
}

function getMaintainedDateValue(light) {
    if (!light.lastMaintainedDate) return null;
    return light.lastMaintainedDate.toDate
        ? light.lastMaintainedDate.toDate()
        : new Date(light.lastMaintainedDate);
}

function setStatusStyle(status) {
    if (!status) return false;
    if (status === "active") {
        return "green-text";
    } else if (status === "inactive") {
        return "red-text";
    }
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

                const filtered = data.filter((light) =>
                    isMaintenanceRequired(light.isMaintained)
                );

                const sorted = filtered.sort((a, b) => {
                    const dateA = getMaintainedDateValue(a);
                    const dateB = getMaintainedDateValue(b);

                    if (!dateA && !dateB) return 0;
                    if (!dateA) return 1;
                    if (!dateB) return -1;
                    return dateB - dateA;
                });

                setStreetlights(sorted);
            } catch (err) {
                console.error("Error fetching streetlights:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStreetlights();
    }, []);

    if (loading) return <Loading text="Loading logs..." />;;
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
                <h2 style={{ margin: 0 }}>Asset Management Platform</h2>
                <SignOutButton />
            </div>

            <div style={{ padding: "20px" }} className="table-wrapper">
                <h1>Maintenance Log</h1>
                <p>Streetlights that has been maintained will be logged here.</p>

                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th className="center" style={{width: "5%",}}>Zone</th>
                        <th className="center">Status</th>
                        <th>Installation Date</th>
                        <th>Last maintained date</th>
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
                                <td className="center">
                                    <span className={setStatusStyle(light.status)} style={{width: "40%"}}>{light.status.charAt(0).toUpperCase() + light.status.slice(1)}</span>
                                </td>
                                <td>
                                    {light.installedDate?.toDate
                                        ? light.installedDate.toDate().toLocaleDateString()
                                        : light.installedDate}
                                </td>
                                <td>
                                    {light.isMaintained?.toDate
                                        ? light.isMaintained.toDate().toLocaleDateString()
                                        : "Haven't been maintained yet"}
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