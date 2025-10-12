import { useState, useEffect } from "react";
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
    const navigate = useNavigate();
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
    }, []);


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
        
        <div className="entire-page">
            <div className={`main-container page ${show ? 'show' : ''}`}>
                <div className='form-card-container'>
                    <h1>Sign Up</h1>
                    <p>Create an account</p>
                    <form onSubmit={addUser}>
                        <div className='form-input'>
                            <label className='form-label'>Username</label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="@username"
                                className="input-field"
                                required
                            />
                            <label className='form-label'>Email</label>
                            <input
                                type="email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                placeholder="email@example.com"
                                required
                            />
                            <div className='forgot-password-area'>
                                <label className='form-label'>Password</label>
                                <button className='forgot-password-btn'>Forgot?</button>
                            </div>
                            <input
                                type="password"
                                value={userPass}
                                onChange={(e) => setUserPass(e.target.value)}
                                placeholder="Password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className='btn'
                        >
                            {isLoading ? "Signing up..." : "Sign Up"}
                        </button>
                    </form>
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
                        <button onClick={() => navigate("/signup")}>Sign up</button>
                    </div>
                </div>
                {/* <div className="side-image-container">
                    <img src={SignUpImg} className="side-image" />
                </div> */}
            
            
            </div>
        </div>
    );
}