import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faUser, faDoorOpen, } from "@fortawesome/free-solid-svg-icons";
import { ChevronDown } from "lucide-react";
import "../../static/css/navbar.css";
import { getCurrentUsername, getCurrentUserEmail, logout } from "../../lib/auth.js";

function Navbar() {
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(null);
    const formsRef = useRef(null);
    const directoriesRef = useRef(null);
    
    // Get user info from localStorage
    const [username, setUsername] = useState("");
    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {
        // Fetch user data on component mount
        setUsername(getCurrentUsername() || "Guest");
        setUserEmail(getCurrentUserEmail() || "No email");
    }, []);

    // to close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                formsRef.current && !formsRef.current.contains(event.target) &&
                directoriesRef.current && !directoriesRef.current.contains(event.target)
            ) {
                setOpenMenu(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    // for handling navigation + close dropdown
    const handleNavigate = (path, options = {}) => {
        navigate(path, options);
        setOpenMenu(null);
    };

    // to handle logout


    return (
        <div className="navbar h-17">
            <div className="flex flex-row justify-between w-full items-center px-4">
                <div className="nav-left">
                    <img src="/src/static/icons/react.svg" alt="Logo" className="nav-logo" />
                    <button className="nav-btn" onClick={() => navigate("/dashboard")}>Home</button>
                    {/* Forms Dropdown */}
                    <div
                        className={`dropdown ${openMenu === "forms" ? "open" : ""}`}
                        ref={formsRef}
                    >
                        <button className="nav-btn flex flex-row items-center gap-1" onClick={() => toggleMenu("forms")}>
                            Forms <ChevronDown color="white" size={15} strokeWidth={'2px'} />
                        </button>
                        <ul className="dropdown-menu">
                            <li onClick={() => handleNavigate("/student-page", { state: { openForm: true } })}>Student Form</li>
                            <li onClick={() => handleNavigate("/program-page", { state: { openForm: true } })}>Program Form</li>
                            <li onClick={() => handleNavigate("/college-page", { state: { openForm: true } })}>College Form</li>
                        </ul>
                    </div>

                    {/* Directories Dropdown */}
                    <div
                        className={`dropdown ${openMenu === "directories" ? "open" : ""}`}
                        ref={directoriesRef}
                    >
                        <button className="nav-btn flex flex-row items-center gap-1" onClick={() => toggleMenu("directories")}>
                            Directories <ChevronDown color="white" size={15} strokeWidth={'2px'} />
                        </button>
                        <ul className="dropdown-menu">
                            <li onClick={() => handleNavigate("/student-page")}>Student Directory</li>
                            <li onClick={() => handleNavigate("/program-page")}>Program Directory</li>
                            <li onClick={() => handleNavigate("/college-page")}>College Directory</li>
                        </ul>
                    </div>
                    <button className="nav-btn" onClick={() => navigate("/analytics")}>Analytics</button>
                </div>
                <div className="menu">
                    <div className="item">
                        <div className="nav-right">
                            <div className="user-info">
                                <label>@{username}</label>
                                <p>{userEmail}</p>
                            </div>
                            <img
                                src="/src/static/images/default.jpg"
                                alt="Profile"
                                className="profile-pic"
                            />
                        </div>
                
                        <div className="submenu">
                            <div className="submenu-item">
                                <a href="#" className="submenu-link" onClick={() => navigate("/user-profile")}>
                                    <FontAwesomeIcon icon={faUser} style={{color:"#767676ff", paddingRight: "10px"}}/>
                                    Profile
                                </a>
                            </div>
                            <div className="submenu-item">
                                <a href="#" className="submenu-link">
                                    <FontAwesomeIcon icon={faGear} style={{color:"#767676ff", paddingRight: "10px"}}/>
                                    Settings
                                </a>
                            </div>
                            <div className="submenu-item">
                                <a
                                    className="submenu-link"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        logout(); // Use the logout function from auth.js
                                        navigate("/sign-in");
                                    }}
                                >
                                    <FontAwesomeIcon icon={faDoorOpen} style={{color:"#767676ff", paddingRight: "10px"}}/>
                                    Logout
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;
