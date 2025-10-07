import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom"; // You need RouterProvider!
import SignIn from "./templates/entry/sign-up.jsx";
import SignUp from "./templates/entry/sign-up.jsx";

const router = createBrowserRouter([
  {
    path: "/sign-in", 
    element: <SignIn />,
  },
  {
    path: "/sign-up", 
    element: <SignUp />, 
  },
  {
    path: "/", 
    element: <SignIn />, 
  },
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} /> 
  </React.StrictMode>
);
