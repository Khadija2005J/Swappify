import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import SwapRoom from "./components/Swap";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import ToastContainer from "./components/ToastContainer";

// Debug helper
console.log('App boot');

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Render the Home component at the root route */}
        <Route path="/" element={<Home />} />

        {/* THIS IS YOUR LOGIN PAGE */}
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-swaps" element={<Dashboard />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/swap" element={<SwapRoom />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);