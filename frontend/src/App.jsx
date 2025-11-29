import React from "react";
import { Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import ProtectedRoute from "./components/protected-route";
import "./App.css"

// Pages
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Profile from "./pages/profile";
import DocumentHistory from "./pages/document-History";
import FoundersPage from "./pages/founders-page";
import RiskAnalysisPage from "./pages/risk-analysis-page";
// Assuming these pages exist and need imports based on the routes
import NDAPage from "./pages/nda-page";
import Success from "./pages/success"; 

function App() {
  return (
    <>
      <Navbar />

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />
          <Route
            path="/document-history"
            element={<ProtectedRoute><DocumentHistory /></ProtectedRoute>}
          />
          
          <Route
            path="/generate-nda"
            element={<ProtectedRoute><NDAPage /></ProtectedRoute>}
          />
          <Route
            path="/risk-analysis"
            element={<ProtectedRoute><RiskAnalysisPage /></ProtectedRoute>}
          />
          <Route
            path="/generate-founders-agreement"
            element={<ProtectedRoute><FoundersPage /></ProtectedRoute>}
          />
          <Route
            path="/download-complete"
            element={<ProtectedRoute><Success /></ProtectedRoute>}
          />
        </Routes>
      </div>

      <Footer />
    </>
  );
}

export default App;