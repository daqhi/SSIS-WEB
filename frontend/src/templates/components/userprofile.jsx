import Navbar from "./navbar"
import React, { useState, useEffect, useRef } from "react";


export default function UserProfile() {
    const [openMenu, setOpenMenu] = useState(null);
    
    
    return (
        <div>
            <Navbar />
            <h1>User Profile Page</h1>
        </div>
    )
}