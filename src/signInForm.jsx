import { signIn } from "./authSignIn";

async function handleSignIn(email, password) {
    try {
        const user = await signIn(email, password);
        alert("Signed in:", user);
    } catch (err) {
        console.error(err.message);
    }
}