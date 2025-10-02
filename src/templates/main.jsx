import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignIn from "./entry/SignIn.jsx";
import SignUp from "./entry/SignUp.jsx";

const router = createBrowserRouter([
  { path: "/signin", element: <SignIn /> },
  { path: "/signup", element: <SignUp /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
