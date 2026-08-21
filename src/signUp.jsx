import { useState } from "react";
import { signUp } from "./authSignUp";

function SignUp() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await signUp(email, password, username);
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Sign Up</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
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
            {success && <p style={{ color: "green" }}>Account created!</p>}
            <button type="submit">Sign Up</button>
        </form>
    );
}

export default SignUp;