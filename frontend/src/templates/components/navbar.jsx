import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../static/css/navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(null);
    const formsRef = useRef(null);
    const directoriesRef = useRef(null);

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

    return (
        <div className="navbar">
            <div className="nav-left">
                <img src="/src/static/icons/react.svg" alt="Logo" className="nav-logo" />
                <button className="nav-btn" onClick={() => navigate("/")}>Home</button>

                {/* Forms Dropdown */}
                <div
                    className={`dropdown ${openMenu === "forms" ? "open" : ""}`}
                    ref={formsRef}
                >
                    <button className="nav-btn" onClick={() => toggleMenu("forms")}>
                        Forms <img src="/src/static/icons/arrow-down.png" className="nav-dropdown-icon" />
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
                    <button className="nav-btn" onClick={() => toggleMenu("directories")}>
                        Directories <img src="/src/static/icons/arrow-down.png" className="nav-dropdown-icon" />
                    </button>
                    <ul className="dropdown-menu">
                        <li onClick={() => handleNavigate("/student-page")}>Student Directory</li>
                        <li onClick={() => handleNavigate("/program-page")}>Program Directory</li>
                        <li onClick={() => handleNavigate("/college-page")}>College Directory</li>
                    </ul>
                </div>

                <button className="nav-btn" onClick={() => navigate("/analytics")}>Analytics</button>
            </div>

            <div className="nav-right">
                <div className="user-info">
                    <label>@eliabado</label>
                    <p>eliabado24@example.com</p>
                </div>
                <img
                    src="/src/static/icons/default.jpg"
                    alt="Profile"
                    className="profile-pic"
                />
            </div>
        </div>
    );
}

export default Navbar;
