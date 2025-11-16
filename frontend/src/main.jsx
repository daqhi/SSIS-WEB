import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./static/css/index.css";

import SignIn from "./templates/entry/sign-in.jsx";
import SignUp from "./templates/entry/sign-up.jsx";
import ProtectedRoute from './templates/components/protected-route.jsx'
import Dashboard from './templates/dashboard/dashboard.jsx'
import Analytics from './templates/analytics/analytics-page.jsx'
import CollegePage from './templates/college/college-page.jsx'
import ProgramPage from './templates/program/program-page.jsx'
import StudentPage from './templates/student/student-page.jsx'

const router = createBrowserRouter([
    { path: "/sign-in", element: <SignIn /> },
    { path: "/sign-up", element: <SignUp /> },
    { 
        path: "/", 
        element: (
            <ProtectedRoute>
                <SignIn />
            </ProtectedRoute>
        ) 
    },
    { 
        path: '/dashboard', 
        element: (
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        ) 
    },
    { 
        path: '/analytics', 
        element:( 
            <ProtectedRoute>
                <Analytics />
            </ProtectedRoute>
        )
    },
    { 
        path: '/college-page', 
        element: (
            <ProtectedRoute>
                <CollegePage /> 
            </ProtectedRoute>
        )
    },
    { 
        path: '/program-page', 
        element: (
            <ProtectedRoute>
                <ProgramPage /> 
            </ProtectedRoute>
        )
    },
    { 
        path: '/student-page', 
        element: (
            <ProtectedRoute>
                <StudentPage />
            </ProtectedRoute>
        )
    },
]);


ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} /> 
    </React.StrictMode>
);



// "xs", "sm", "lg", "xl", "2x", "3x", "4x", "5x", "6x", "7x", "8x", "9x", "10x"