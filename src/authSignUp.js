import { auth, db } from "./firebaseAuth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export async function signUp(email, password, username) {
    // 1. Create the account in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Write user info to Firestore (no password!)
    await setDoc(doc(db, "user", user.uid), {
        email: email,
        username: username,
    });

    return user;
}