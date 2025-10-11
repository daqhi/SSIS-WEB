import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Navbar from "./templates/components/navbar.jsx";
import SignIn from "./templates/entry/sign-up.jsx";
import SignUp from "./templates/entry/sign-up.jsx";
import Dashboard from './templates/dashboard/dashboardS.jsx'
import Analytics from './templates/analytics/analytics-page.jsx'
import CollegePage from './templates/college/college-page.jsx'
import ProgramPage from './templates/program/program-page.jsx'
import StudentPage from './templates/student/student-page.jsx'

const router = createBrowserRouter([
    { path: "/", element: <CollegePage /> },
    { path: "/sign-in", element: <SignIn /> },
    { path: "/sign-up", element: <SignUp /> },
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/analytics', element: <Analytics />},
    { path: '/college-page', element: <CollegePage /> },
    { path: '/program-page', element: <ProgramPage /> },
    { path: '/student-page', element: <StudentPage />},
  
]);


ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Navbar />
        <RouterProvider router={router} /> 
    </React.StrictMode>
);
