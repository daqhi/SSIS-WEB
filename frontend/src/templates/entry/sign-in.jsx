import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleUser, Lock } from 'lucide-react';
import "../../static/css/entry.css";

import Dashboard from "../dashboard/dashboard";
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
            <div className="flex justify-center items-center bg-gradient-to-r from-[#5ba3ad] to-[#488f97] to-[#3a6f7f] w-full h-full ">
                <div className="flex flex-row items-center h-150 w-1/2 rounded-2xl shadow-lg overflow-hidden bg-[#F8FFFF] py-10 pl-10">
                    <div className="bg-white border-1 border-[#8EE1EA] rounded-xl w-1/2 p-10">
                        <div className="mb-5">
                            <h1 className="font-bold text-3xl">Sign In</h1>
                            <p>Welcome back, user!</p>
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
                            onClick={handleSignIn}> 
                            Sign In
                        </button>

                        <div className="flex flex-row gap-1 text-sm justify-start">
                            <p>Don't have an account? </p>
                            <button 
                                className="text-start underline hover:text-orange-600 transition ease-in-out duration-200" 
                                onClick={() => navigate("/sign-up")}>
                                Create account
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
    );
}



export default SignIn;
