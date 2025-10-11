// frontend/src/pages/SignUp.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import SignUpImg from "../../static/icons/react.svg";
import "../../static/css/entry.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SignUp() {
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPass, setUserPass] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Add user handler
    async function addUser(e) {
        e.preventDefault();

        if (!userName || !userEmail || !userPass) {
            console.error("All fields required!");
            return;
        }

        console.log("Sending to backend:", {
            username: userName,
            email: userEmail,
            password: userPass,
        });

        try {
            const res = await fetch(`${API}/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: userName,
                    email: userEmail,
                    password: userPass,
                }),
            });

            const data = await res.json();
            console.log("Response from backend:", data);

            if (!res.ok) {
                console.error("Register failed:", data);
                return;
            }

            alert("User registered successfully!");
            setUserName("");
            setUserEmail("");
            setUserPass("");
        } catch (err) {
            console.error("Error submitting form:", err);
        }
    }


    return (
        
        <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
            <h2>Sign Up</h2>
            
            <form onSubmit={addUser}>
                <div style={{ marginBottom: "15px" }}>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="@username"
                        required
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>
                
                <div style={{ marginBottom: "15px" }}>
                    <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="Email"
                        required
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <input
                        type="password"
                        value={userPass}
                        onChange={(e) => setUserPass(e.target.value)}
                        placeholder="Password"
                        required
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    style={{ 
                        width: "100%", 
                        padding: "10px",
                        backgroundColor: isLoading ? "#ccc" : "#007bff",
                        color: "white",
                        border: "none",
                        cursor: isLoading ? "not-allowed" : "pointer"
                    }}
                >
                    {isLoading ? "Signing up..." : "Sign Up"}
                </button>
            </form>

            {message && (
                <div style={{ 
                    marginTop: "15px", 
                    padding: "10px", 
                    backgroundColor: message.includes("✅") ? "#d4edda" : "#f8d7da",
                    color: message.includes("✅") ? "#155724" : "#721c24",
                    borderRadius: "4px",
                    height: "500px"
                }}>
                    {message}
                </div>
            )}
        </div>
    );
}