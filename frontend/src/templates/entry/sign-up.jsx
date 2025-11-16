import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircleUser, Lock, Mail } from 'lucide-react';
import "../../static/css/entry.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SignUp() {
    const [username, setUsername] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [show, setShow] = useState(false);

    useEffect(() => { setShow(true) }, []);


    // Add user handler
    async function handleSignUp(e) {
        e.preventDefault();

        if (!username || !userEmail || !password) {
            console.error("All fields required!");
            return;
        }

        console.log("Sending to backend:", {
            username: username,
            email: userEmail,
            password: password,
        });

        try {
            const res = await fetch(`${API}/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: username,
                    email: userEmail,
                    password: password,
                }),
            });

            const data = await res.json();
            console.log("Response from backend:", data);

            if (!res.ok) {
                console.error("Register failed:", data);
                return;
            }

            alert("User registered successfully!");
            setUsername("");
            setUserEmail("");
            setPassword("");
        } catch (err) {
            console.error("Error submitting form:", err);
        }
    }


    return (
        <div>

            <div className={`main-container page ${show ? 'show' : ''}`}>
                <div className="flex justify-center items-center bg-gradient-to-r from-[#5ba3ad] to-[#488f97] to-[#3a6f7f] w-full h-full ">
                    <div className="flex flex-row items-center h-150 w-1/2 rounded-2xl shadow-lg overflow-hidden bg-[#F8FFFF] py-10 pl-10">
                        <div className="bg-white border-1 border-[#8EE1EA] rounded-xl w-1/2 p-10">
                            <div className="mb-5">
                                <h1 className="font-bold text-2xl">Sign Up</h1>
                                <p>Create an account to get started!</p>
                            </div>


                            <div className="flex flex-col gap-3">
                                <div className="flex flex-row gap-2 h-10 rounded-lg border-2 border-[#17C1D3] flex items-center px-3">
                                    <CircleUser size={20} color={"#17C1D3"}/>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        className="focus:outline-none w-full"
                                        value={username}
                                        onChange={(e)=> setUsername(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-row gap-2 h-10 rounded-lg border-2 border-[#17C1D3] flex items-center px-3">
                                    <Mail size={20} color={"#17C1D3"}/>
                                    <input
                                        type="text"
                                        placeholder="Email"
                                        className="focus:outline-none w-full"
                                        value={userEmail}
                                        onChange={(e)=> setUserEmail(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-row gap-2 h-10 rounded-lg border-2 border-[#17C1D3] flex items-center px-3">
                                    <Lock size={20} color={"#17C1D3"}/>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        className="focus:outline-none w-full"
                                        value={password}
                                        onChange={(e)=> setPassword(e.target.value)}
                                    />
                                </div>
                            </div>


                            <button 
                                className="bg-[#293339] hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg my-10 w-full transition ease-in-out duration-200" 
                                onClick={handleSignUp}> 
                                Sign Up
                            </button>

                            <div className="flex flex-row gap-1 text-sm justify-start">
                                <p>Already have an account? </p>
                                <button 
                                    className="text-start underline hover:text-orange-600 transition ease-in-out duration-200" 
                                    onClick={() => navigate("/sign-in")}>
                                    Sign in
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center w-1/2 ">    
                            <img className="h-100 w-full"
                                src="src/static/images/entry-image.png" alt="Entry Illustration"></img>
                        </div>
                    </div>
                </div>

            </div>
        
            {/* <div className={`main-container page ${show ? 'show' : ''}`}>
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
                            <label className='form-label'>Password</label>
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
                        <p>Already have an account? </p>
                        <button onClick={() => navigate("/sign-in")}>Sign in</button>
                    </div>
                </div>
                {/* <div className="side-image-container">
                    <img src={SignUpImg} className="side-image" />
                </div> 
            
            
            </div> */}
        </div>
    );
}