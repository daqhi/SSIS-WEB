import { Navigate } from "react-router-dom";



export default function ProtectedRoute({ children }) {
    const isLoggedIn=localStorage.getItem("isLoggedIn");

    if (!isLoggedIn) {
        return <Navigate to="/sign-in" replace />
    }

    return children;
}