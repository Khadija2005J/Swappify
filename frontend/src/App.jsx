import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ToastContainer from "./components/ToastContainer";
// Import Register if you have it, otherwise users can't join from the landing page
// import Register from "./pages/Register"; 

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* The Landing Page is now correctly set as the root */}
        <Route path="/" element={<Home />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        {/* <Route path="/register" element={<Register />} /> */}
        
        {/* Application Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />

        {/* Dynamic Profile Route */}
        <Route path="/profile/:userId" element={<Profile />} />

        {/* If you see a blank page at localhost:5173/, 
           check that src/pages/Home.jsx exists and has 
           'export default function Home()' inside it.
        */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;