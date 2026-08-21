import { signUp } from "./authSignUp";

async function handleSignUp(email, password) {
    try {
        const user = await signUp(email, password);
        alert("Account created:", user);
    } catch (err) {
        console.error(err.message);
    }
}