import { auth } from "./firebaseAuth";
import { signInWithEmailAndPassword } from "firebase/auth";

export async function signIn(username, password) {
    const userCredential = await signInWithEmailAndPassword(auth, username, password);
    return userCredential.user;
}