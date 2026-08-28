import {useEffect, useState} from "react";
import { collection, getDocs, doc, setDoc, updateDoc, Timestamp,deleteField } from "firebase/firestore";
import {db} from "./firebase.js";

import "./assets/App.css";
import "./assets/global.css";
import "./assets/HomePage.css";
import SignOutButton from "./signOut.jsx";
import { sendMaintenanceReminder } from "./email.js";
import { useSidebar } from "./useSidebar.js";


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

function setStatusStyle(status) {
    if (!status) return false;
    if (status === "active"){
        return "green-text";
    } else if (status === "inactive"){
        return "red-text";
    }
}

async function handleMaintenance(lights) {
    try {
        const docRef = doc(db, "streetlights", lights);
        await updateDoc(docRef, {
            isMaintained: Timestamp.now()
        });
        console.log(`Document ${lights} updated with isMaintained: null`);
        await fetchStreetlights();
    } catch (error) {
        console.error("Error updating maintenance status: ", error);
    }
}

function formatMaintenanceMessage(lights) {
    const dueLights = lights.filter((light) => isMaintenanceRequired(light.installedDate, light.isMaintained));

    if (dueLights.length === 0) {
        return "No streetlights currently require maintenance.";
    }

    return dueLights
        .map((light) => {
            const installed = light.installedDate?.toDate
                ? light.installedDate.toDate().toLocaleDateString()
                : light.installedDate;

            const lastMaintained = light.isMaintained?.toDate
                ? light.isMaintained.toDate().toLocaleDateString()
                : "Never maintained";

            let entry = `• ${light.id} (Zone ${light.zone}) — installed ${installed}, status: ${light.status}\n  Last maintained: ${lastMaintained}`;

            if (light.problem) {
                const reportedDate = light.problem.reportedAt?.toDate
                    ? light.problem.reportedAt.toDate().toLocaleDateString()
                    : "unknown date";

                entry += `\n  ⚠ Problem: ${light.problem.type}`;
                if (light.problem.description) {
                    entry += ` — ${light.problem.description}`;
                }
                entry += ` (reported ${reportedDate})`;
            }

            return entry;
        })
        .join("\n\n");
}


function HomePage() {
    const [streetlights, setStreetlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");

    const [toEmail, setToEmail] = useState("");
    const [sending, setSending] = useState(false);
    const [sendStatus, setSendStatus] = useState(null);

    const [showModal, setShowModal] = useState(false);

    const [newId, setNewId] = useState("");
    const [newUID, setNewUID] = useState("");
    const [newZone, setNewZone] = useState("");
    const [newStatus, setNewStatus] = useState("active");
    const [newWarranty, setNewWarranty] = useState("");
    const [newDate, setNewDate] = useState("");
    const [newLat, setNewLat] = useState("");
    const [newLng, setNewLng] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const { collapsed, setCollapsed } = useSidebar();

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

    useEffect(() => {
        fetchStreetlights();
    }, []);

    const filteredStreetlights = streetlights.filter((light) =>
        light.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleResolveProblem = async (lightId) => {
        try {
            const ref = doc(db, "streetlights", lightId);
            await updateDoc(ref, { problem: deleteField() });
            await fetchStreetlights();
        } catch (err) {
            console.error("Error resolving problem:", err);
            alert("Failed to mark as solved: " + err.message);
        }
    };

    const handleSendMaintenanceEmail = async () => {
        if (!toEmail) {
            setSendStatus("Please enter a recipient email.");
            return;
        }

        setSending(true);
        setSendStatus(null);

        const message = formatMaintenanceMessage(streetlights);
        const result = await sendMaintenanceReminder(toEmail, message);

        setSending(false);
        setSendStatus(result.success ? "Email sent!" : "Failed to send email.");
    };

    const handleAddStreetlight = async (e) => {
        e.preventDefault();
        if (!newId || !newZone) {
            alert("Please fill in at least ID and Zone");
            return;
        }

        try {
            setSubmitting(true);
            await setDoc(doc(db, "streetlights", newId), {
                UID: newUID,
                zone: newZone,
                status: newStatus,
                warranty: newWarranty,
                installedDate: Timestamp.now(),
                latitude: newLat ? parseFloat(newLat) : null,
                longitude: newLng ? parseFloat(newLng) : null,
            });

            setNewId("");
            setNewUID("");
            setNewZone("");
            setNewStatus("active");
            setNewDate("");
            setNewLat("");
            setNewLng("");
            setShowModal(false); // close popup on success

            await fetchStreetlights();
        } catch (err) {
            console.error("Error adding streetlight:", err);
            alert("Failed to add streetlight: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p>Loading streetlights...</p>;
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


            <div style={{ padding: "20px" }}>
                <div className="flex-row space-between align-center">
                    <div className="flex-row"
                         style={{justifyContent: "space-evenly", alignItems: "center"}}>
                        <h1>Streetlight List</h1>
                        <input className="h-20"
                           type="text"
                           placeholder="Search by ID"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex-row space-between gap-20 h-50 align-center justify-center">
                        <button className = "maintenance-btn" onClick={handleSendMaintenanceEmail} disabled={sending}>
                            {sending ? "Sending..." : "Send work order to email"}
                        </button>
                        <input className="h-20"
                            type="email"
                            placeholder="Recipient email"
                            value={toEmail}
                            onChange={(e) => setToEmail(e.target.value)}
                        />
                    </div>

                </div>
                <div className="h-850 overflow-x-auto">
                    <table border="8" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }} className="border-radius-10">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>UID</th>
                            <th className="center">Zone</th>
                            {/*<th className="center">Status</th>*/}
                            <th className="center" style={{width: "150px"}}>Location</th>
                            <th style={{width: "150px"}}>Installation Date</th>
                            <th style={{width: "20px"}}>Warranty Period</th>
                            <th className="center" style={{width: "200px"}}>Maintenance Required</th>
                            <th className="center">Mark as Maintained</th>
                            <th className="center" style={{width: "15%"}}>Issue</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredStreetlights.map((light) => (
                            <tr key={light.id}>
                                <td>{light.id}</td>
                                <td>{light.UID}</td>
                                <td className="center">{light.zone}</td>
                                {/*<td className="center">*/}
                                {/*    <span className={setStatusStyle(light.status)} style={{width: "40%"}}>{light.status.charAt(0).toUpperCase() + light.status.slice(1)}</span>*/}
                                {/*</td>*/}
                                <td>
                                    <a href={`https://www.google.com/maps?q=${light.latitude.toFixed(8)},${light.longitude.toFixed(8)}`} target="_blank">
                                        {light.latitude.toFixed(8)}, {light.longitude.toFixed(8)}
                                    </a>
                                </td>
                                <td>
                                    {light.installedDate?.toDate
                                        ? light.installedDate.toDate().toLocaleDateString()
                                        : light.installedDate}
                                </td>
                                <td>{light.warranty} years</td>
                                <td style={{ textAlign: "center" }}>
                                    {isMaintenanceRequired(light.installedDate, light.isMaintained) ? (
                                        <span className="red-text">Yes</span>
                                    ) : (
                                        <span className="green-text">No</span>
                                    )}
                                </td>
                                <td className="center">
                                    {isMaintenanceRequired(light.installedDate, light.isMaintained) ? (
                                        <button className="maintenance-btn2" onClick={() => handleMaintenance(light.id)}>
                                            Maintained
                                        </button>
                                    ) : (
                                        <span><b>No action Required</b></span>
                                    )}
                                </td>
                                <td>
                                    {light.problem ? (
                                        <>
                                            <div style={{display: "flex", justifyContent: "flex-start", alignItems: "center", gap:"50px"}}>
                                                <div>
                                                    <strong>{light.problem.type}</strong>
                                                    {light.problem.description && (
                                                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#666" }}>
                                                            {light.problem.description}
                                                        </p>
                                                    )}
                                                    {light.problem.reportedAt && (
                                                        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#999" }}>
                                                            Reported on: {light.problem.reportedAt.toDate().toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <button onClick={() => handleResolveProblem(light.id)} className="solved-btn">Solved</button>
                                                </div>
                                            </div>
                                        </>

                                    ) : (
                                        <span style={{ color: "#999" }}>No issues reported</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

            </div>

            <div className="flex-row justify-right p-20">
                <button className="fab" onClick={() => setShowModal(true)}>
                    Add Streetlight
                </button>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add New Streetlight</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleAddStreetlight}>
                            <input
                                type="text"
                                placeholder="ID (e.g. SL003)"
                                value={newId}
                                onChange={(e) => setNewId(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="UID"
                                value={newUID}
                                onChange={(e) => setNewUID(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Zone (e.g. A)"
                                value={newZone}
                                onChange={(e) => setNewZone(e.target.value)}
                            />
                            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                <option value="active">active</option>
                                <option value="inactive">inactive</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Warranty Period"
                                value={newWarranty}
                                onChange={(e) => setNewWarranty(e.target.value)}
                            />
                            <input
                                type="number"
                                step="any"
                                placeholder="Latitude"
                                value={newLat}
                                onChange={(e) => setNewLat(e.target.value)}
                            />
                            <input
                                type="number"
                                step="any"
                                placeholder="Longitude"
                                value={newLng}
                                onChange={(e) => setNewLng(e.target.value)}
                            />
                            <button type="submit" disabled={submitting}>
                                {submitting ? "Adding..." : "Add Streetlight"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>

    );
}

export default HomePage;
