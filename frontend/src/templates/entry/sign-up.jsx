import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircleUser, Lock, Mail } from 'lucide-react';
import "../../static/css/entry.css";
import supabase from "../../lib/supabaseClient";
import bcrypt from 'bcryptjs';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SignUp() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [show, setShow] = useState(false);

    useEffect(() => { setShow(true) }, []);

    // Send email through Flask backend
    async function sendWelcomeEmail(email, username) {
        try {
            console.log("Sending email to:", email);
            const response = await fetch("http://localhost:5000/api/send-welcome-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email: email
                }),
            });

            console.log("Response status:", response.status);
            const data = await response.json();
            console.log("Response data:", data);
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            console.log("Email sent successfully:", data.message);
            return true;
        } catch (error) {
            console.error("Error sending welcome email:", error);
            return false;
        }
    }


    // Supabase database registration (insert into your custom tables)
    async function handleSupabaseSignUp(e) {
        e.preventDefault();
        setIsLoading(true);

        if (!username || !userEmail || !password) {
            console.error("All fields are required!");
            alert("Please fill in all fields.");
            setIsLoading(false);
            return;
        }

        try {
            // Hash password
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            // Insert into a 'users' table (if you have one)
            const { data: userData, error: userError } = await supabase
                .from('users')
                .insert([
                    {
                        username: username,
                        useremail: userEmail,
                        userpass: hashedPassword, 
                        created_on: new Date().toISOString()
                    }
                ])
                .select();

            if (userError) {
                console.error("Error inserting user:", userError.message);
                alert(`Registration failed: ${userError.message}`);
                setIsLoading(false);
                return;
            }

            console.log("User created in database:", userData);
            
            // Store the newly created userid
            const newUserId = userData[0].userid;
            
            // Send welcome email after successful registration
            const emailSent = await sendWelcomeEmail(userEmail, username);
            if (emailSent) {
                alert("Account created successfully! A welcome email has been sent.");
            } else {
                alert("Account created successfully! (Note: Welcome email could not be sent)");
            }
            
            // Store user info locally including userid
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userid", newUserId);
            localStorage.setItem("username", username);
            localStorage.setItem("useremail", userEmail);
            
            navigate("/sign-in");

        } catch (err) {
            console.error("Error during database signup:", err);
            alert("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <div>
            <div className={`main-container page ${show ? 'show' : ''}`}>
                <div className="bg-gradient-to-br from-[#18181b] via-[#1e2b38] to-[#293B4D] flex justify-center items-center w-full h-full ">
                    <div className="flex flex-row items-center h-150] rounded-2xl shadow-lg overflow-hidden bg-[#F8FFFF] py-10 pl-10">
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


                            <div className="flex flex-col gap-2 my-6">
                                <button 
                                    className="bg-[#293339] hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg w-full transition ease-in-out duration-200 disabled:opacity-50" 
                                    onClick={handleSupabaseSignUp}
                                    disabled={isLoading}> 
                                    {isLoading ? "Creating Account..." : "Create User Account"}
                                </button>
                            </div>

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
        </div>
    );
}