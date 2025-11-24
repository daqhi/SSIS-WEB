import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircleUser, Lock, Mail } from 'lucide-react';
import "../../static/css/entry.css";
import supabase from "../../lib/supabaseClient";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SignUp() {
    const [username, setUsername] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [show, setShow] = useState(false);

    useEffect(() => { setShow(true) }, []);

    // Send an email using Mailtrap API (Option 1: Direct API call)
    async function sendWelcomeEmail(toEmail, username) {
        try {
            const response = await fetch('https://send.api.mailtrap.io/api/send', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer YOUR_MAILTRAP_API_TOKEN', // Replace with your actual token
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: {
                        email: "hello@demomailtrap.com",
                        name: "SSIS Web App"
                    },
                    to: [
                        {
                            email: toEmail,
                            name: username
                        }
                    ],
                    subject: "Welcome to SSIS Web App!",
                    text: `Hello ${username}!\n\nWelcome to SSIS Web App! Your account has been created successfully.\n\nBest regards,\nSSIS Team`,
                    html: `
                        <h2>Welcome to SSIS Web App!</h2>
                        <p>Hello <strong>${username}</strong>!</p>
                        <p>Your account has been created successfully. You can now access the dashboard and manage your academic data.</p>
                        <p>Best regards,<br>SSIS Team</p>
                    `
                })
            });

            if (response.ok) {
                console.log('Welcome email sent successfully');
                return true;
            } else {
                console.error('Failed to send welcome email:', response.statusText);
                return false;
            }
        } catch (error) {
            console.error('Error sending welcome email:', error);
            return false;
        }
    }

    // Alternative: Send email through your Flask backend (Option 2: Recommended)
    async function sendWelcomeEmailViaBackend(toEmail, username) {
        try {
            const response = await fetch(`${API}/api/send-welcome-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to_email: toEmail,
                    username: username
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                console.log('Welcome email sent via backend');
                return true;
            } else {
                console.error('Backend email error:', result.error);
                return false;
            }
        } catch (error) {
            console.error('Error sending email via backend:', error);
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
            // Option 1: Insert into a 'users' table (if you have one)
            const { data: userData, error: userError } = await supabase
                .from('users')
                .insert([
                    {
                        username: username,
                        useremail: userEmail,
                        userpass: password, // Note: In production, hash this password!
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
            
            // Send welcome email after successful registration
            const emailSent = await sendWelcomeEmail(userEmail, username);
            if (emailSent) {
                alert("Account created successfully! A welcome email has been sent.");
            } else {
                alert("Account created successfully! (Note: Welcome email could not be sent)");
            }
            
            // Store user info locally (optional)
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", username);
            
            navigate("/dashboard");

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