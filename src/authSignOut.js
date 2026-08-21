import { auth } from "./firebaseAuth";
import { signOut } from "firebase/auth";

export async function logOut() {
    await signOut(auth);
}