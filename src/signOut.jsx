import { logOut } from "./authSignOut";
import "./assets/global.css";

function SignOutButton() {
    const handleSignOut = async () => {
        try {
            await logOut();
            console.log("Signed out");
            // redirect to sign-in page or update app state here
        } catch (err) {
            console.error(err.message);
        }
    };

    return <button onClick={handleSignOut} className="sign-out">Sign Out</button>;
}

export default SignOutButton;