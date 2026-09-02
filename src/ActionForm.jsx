import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase.js";

import { useSidebar } from "./useSidebar.js";
import SignOutButton from "./signOut.jsx";
import Loading from "./loading.jsx";
import "./assets/global.css";
import "./assets/ActionForm.css";


const PROBLEM_TYPES = [
    "Light is blinking",
    "Light is not turning on",
    "Light stays on during the day",
    "Physical damage",
    "Other",
];

function ActionForm() {
    const { collapsed, setCollapsed } = useSidebar();

    const [streetlights, setStreetlights] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedId, setSelectedId] = useState("");
    const [problemType, setProblemType] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState(null);

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
            } finally {
                setLoading(false);
            }
        };

        fetchStreetlights();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedId || !problemType) {
            setStatus("Please select a streetlight and a problem type.");
            return;
        }

        try {
            setSubmitting(true);
            const ref = doc(db, "streetlights", selectedId);
            await updateDoc(ref, {
                problem: {
                    type: problemType,
                    description: description || null,
                    reportedAt: Timestamp.now(),
                },
            });

            setStatus(`Report submitted for ${selectedId}.`);
            setDescription("");
        } catch (err) {
            console.error("Error submitting report:", err);
            setStatus("Failed to submit report: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loading text="Loading..." />;;

    return (
        <>
            <div className="header">
                <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
                    ☰
                </button>
                <h2 style={{ margin: 0 }}>Streetlight Dashboard</h2>
                <SignOutButton />
            </div>

            <div className="action-content">
                <h1>Report a Problem</h1>
                <p>Select a streetlight and describe the issue you noticed.</p>

                <form onSubmit={handleSubmit} className="action-form">
                    <label>
                        Streetlight ID
                        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                            <option value="" selected disabled>
                                Please select a streetlight
                            </option>
                            {streetlights.map((light) => (
                                <option key={light.id} value={light.id}>
                                    {light.id} — Zone {light.zone}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Problem Type
                        <select value={problemType} onChange={(e) => setProblemType(e.target.value)}>
                            <option  value=""  selected disabled>
                                Please select a problem type
                            </option>
                            {PROBLEM_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Details (optional)
                        <textarea
                            rows={5}
                            placeholder="Describe what you observed..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </label>

                    <button type="submit" disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit Report"}
                    </button>

                    {status && <p className="status-msg">{status}</p>}
                </form>
            </div>
        </>
    );
}

export default ActionForm;