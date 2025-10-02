// D:\CCC181 sdfasd\frontend\src\main.jsx (CORRECTED)
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom"; // You need RouterProvider!
import SignIn from "./templates/entry/sign-in.jsx";
import SignUp from "./templates/entry/sign-up.jsx";

// 1. DEFINE THE ROUTER
const router = createBrowserRouter([
  {
    path: "/sign-in", // Define the path for the SignIn component
    element: <SignIn />, // Render the SignIn component at this path
  },
  {
    path: "/sign-up", // Define the path for the SignUp component
    element: <SignUp />, // Render the SignUp component at this path
  },
  {
    path: "/", // A default or home path
    element: <SignIn />, // You can decide what the root path shows
  },
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. USE THE ROUTERPROVIDER */}
    <RouterProvider router={router} /> 
  </React.StrictMode>
);

// Note: Ensure SignUp is correctly defined and imported, 
// even though its code isn't shown.