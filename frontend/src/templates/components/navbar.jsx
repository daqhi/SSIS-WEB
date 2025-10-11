import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import '../../static/css/navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(null);
    const formsRef = useRef(null);
    const directoriesRef = useRef(null);

    // Close dropdown when clicking outside
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
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
    }, []);

    const toggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    return (
        <div className="navbar">
            <div className="nav-left">
                <img src='/src/static/icons/react.svg' alt="Logo" className="nav-logo" />
                <button className="nav-btn">Home</button>

                {/* Forms Dropdown */}
                <div
                    className={`dropdown ${openMenu === "forms" ? "open" : ""}`}
                    ref={formsRef}
                >
                <button className="nav-btn" onClick={() => toggleMenu("forms")}>
                    Forms <img src='/src/static/icons/arrow-down.png' className='nav-dropdown-icon'/>
                </button>
                    <ul className="dropdown-menu">
                        <li><button className='nav-dropdown-btn' onClick={() => navigate('/student-page')}>Student Form</button></li>
                        <li>Program Form</li>
                        <li>College Form</li>
                    </ul>
                </div>

                {/* Directories Dropdown */}
                <div
                    className={`dropdown ${openMenu === "directories" ? "open" : ""}`}
                    ref={directoriesRef}
                >
                <button className="nav-btn" onClick={() => toggleMenu("directories")}>
                    Directories <img src='/src/static/icons/arrow-down.png' className='nav-dropdown-icon'/>
                </button>
                    <ul className="dropdown-menu">
                        <li>Student Directory</li>
                        <li>Faculty Directory</li>
                        <li>Department Directory</li>
                    </ul>
                </div>

                <button className="nav-btn">Analytics</button>
            </div>

            <div className="nav-right">
                <div className='user-info'>
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
