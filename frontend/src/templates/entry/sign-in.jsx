import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import SignUpImg from "../../static/icons/react.svg";

import "../../static/css/entry.css";
import Dashboard from "../dashboard/dashboards";
import ProtectedRoute from "../components/protected-route";


const API = import.meta.env.VITE_API_URL || "http://localhost:5000"

function SignIn() {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const [fadeOut, setFadeOut] = useState(false);



    useEffect(() => { setShow(true) }, []);

    async function handleSignIn() {
        if(!username || !password) {
            alert ("Please enter both username and password.")
            return;
        }

        try {
            const res = await fetch (`${API}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json()

            if(res.ok) {

                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("username", data.username);

                navigate("/dashboard");
            } else {
                alert(data.error || "Login failed.");
            }
        } catch (err) {
            console.error("Error singin in:", err)
            alert("server error. check console")
        }
    }



    return (
        <div className={`main-container page ${show ? 'show' : ''}`}>
            <div className="form-card-container">
                <h1>Sign In</h1>
                <p>Welcome back, user!</p>

                <div className="form-input">
                    <label className="form-label">Username</label>
                    <input 
                        type="text" 
                        placeholder="@username" 
                        className="input-field" 
                        value={username}
                        onChange={(e)=> setUsername(e.target.value)}/>

                    <div className="forgot-password-area">
                        <label className="form-label">Password</label>
                        <button className="forgot-password-btn">Forgot?</button>
                    </div>
                    <input 
                        type="password" 
                        placeholder="Enter password" 
                        className="input-field" 
                        value={password}
                        onChange={(e)=> setPassword(e.target.value)}/>
                </div>

                <button className="btn" onClick={handleSignIn}> Sign In</button>
                {/* if clicked, get info in database if data exists and data matches */}


                <div className="or-separator">
                    <nav>
                        <span className="breadcrumb-line"></span>
                        <span className="or">or</span>
                        <span className="breadcrumb-line"></span>
                    </nav>
                </div>

                <div className="other-options">
                    <button className="btn-google">
                        <FontAwesomeIcon icon={faGoogle} className="google-icon" /> Sign in
                        with Google
                    </button>
                </div>
                <div className="form-section">
                    <p>Don't have an account? </p>
                    <button onClick={() => navigate("/sign-up")}>Create account</button>
                </div>
            </div>

        </div>
    );
}

export default SignIn;
