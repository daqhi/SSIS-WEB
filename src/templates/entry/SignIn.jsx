import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import SignUpImg from "../../static/images/signup.png";
import "../../static/css/entry.css";

library.add(faGoogle);

function SignIn() {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
    }, []);

    return (
        <div className={`main-container page ${show ? 'show' : ''}`}>
        <div className="form-card-container">
            <h1>Sign In</h1>
            <p>Welcome back, user!</p>

            <div className="form-input">
            <label className="form-label">Username</label>
            <input type="text" placeholder="@username" className="input-field" />
            <div className="forgot-password-area">
                <label className="form-label">Password</label>
                <button className="forgot-password-btn">Forgot?</button>
            </div>
            <input type="password" className="input-field" />
            </div>

            <button className="btn">Sign In</button>

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

        <div className="side-image-container">
            <img src={SignUpImg} className="side-image" />
        </div>
        </div>
    );
}

export default SignIn;
