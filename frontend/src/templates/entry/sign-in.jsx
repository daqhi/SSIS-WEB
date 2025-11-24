import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleUser, Lock } from 'lucide-react';
import "../../static/css/entry.css";
import supabase from "../../lib/supabaseClient";
import bcrypt from 'bcryptjs';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000"

export default function SignIn() {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => { setShow(true) }, []);


    // Sign-in using backend API (bypasses Supabase RLS)
    async function handleSupabaseSignIn(e) {
        e.preventDefault();
        setIsLoading(true);

        if (!username || !password) {
            alert("Please enter both username and password.");
            setIsLoading(false);
            return;
        }

        try {
            console.log("Attempting login with:", username);

            // Query Supabase for user by username only (not password)
            const { data: users, error } = await supabase
                .from("users")
                .select("*")
                .eq("username", username);

            if (error) {
                console.error("Supabase query error:", error.message);
                alert("An error occurred during login.");
                setIsLoading(false);
                return;
            }

            if (!users || users.length === 0) {
                alert("Invalid username or password.");
                setIsLoading(false);
                return;
            }

            // If multiple users found, take the first one (but ideally username should be unique)
            const user = users[0];

            // Verify password using bcrypt
            const passwordMatch = await bcrypt.compare(password, user.userpass);
            
            if (!passwordMatch) {
                alert("Invalid username or password.");
                setIsLoading(false);
                return;
            }

            console.log("User logged in:", user);

            // Save login
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userid", user.userid);
            localStorage.setItem("username", user.username);
            localStorage.setItem("useremail", user.useremail);

            alert(`Welcome back, ${user.username}!`);
            navigate("/dashboard");

        } catch (err) {
            console.error("Unexpected login error:", err);
            alert("Something went wrong logging in.");
        } finally {
            setIsLoading(false);
        }
    }



    return (
        <div className={`main-container page ${show ? 'show' : ''}`}>
            <div className="bg-gradient-to-br from-[#18181b] via-[#1e2b38] to-[#293B4D] flex justify-center items-center w-full h-full ">
                <div className="flex flex-row items-center h-150 rounded-2xl shadow-lg overflow-hidden bg-[#F8FFFF] py-10 pl-10">
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
                            className="bg-[#293339] hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg my-10 w-full transition ease-in-out duration-200 disabled:opacity-50" 
                            onClick={handleSupabaseSignIn}
                            disabled={isLoading}> 
                            {isLoading ? "Signing In..." : "Sign In"}
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


