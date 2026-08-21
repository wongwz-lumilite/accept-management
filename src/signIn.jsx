import { useState } from "react";
import { signIn } from "./authSignIn";

import "./assets/signIn.css";
import "./assets/global.css";

import LumiliteLogo from "./assets/Lumilite-logo.png";
import Lumilite from "./assets/Lumilite.png";

function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const user = await signIn(email, password);
            console.log("Signed in:", user);
            // redirect or update app state here
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <div className="image-center">
                <img src={Lumilite} alt="logo" />
            </div>
            <div className="signIn">
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <button type="submit" className="general-button ">Sign In</button>
                </form>
            </div>
        </>
    );
}

export default SignIn;