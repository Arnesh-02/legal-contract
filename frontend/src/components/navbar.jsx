import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react"; // Removed Phone, X
import { AuthContext } from "../context/auth-context";
import { logoutUser } from "../api/auth";

// Removed the 'experts' array as it's no longer used.

function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  // Removed isOffCanvasOpen and toggleOffCanvas
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Removed toggleOffCanvas

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
    } catch {}
    setUser(null);
    navigate("/login");
  };

  // 🎯 NEW FUNCTIONALITY: Navigate to the Advocates Page
  const goToAdvocatesPage = () => {
    navigate("/advocates"); 
  };

  return (
    <>
      <header className="navbar">
        <div className="app-container navbar-content">
          <div className="navbar-brand" onClick={() => navigate("/")}>
            Legal Tech
          </div>

          <nav className="navbar-links">
            <span className="nav-link" onClick={() => navigate("/")}>Home</span>
            <span className="nav-link" onClick={() => navigate("/generate-founders-agreement")}>
              Document Generation
            </span>
            <span className="nav-link" onClick={() => navigate("/risk-analysis")}>
              Risk Analysis
            </span>
            {/* Added a direct link to the Advocates Page in the main nav */}
            <span className="nav-link" onClick={goToAdvocatesPage}>
              Find an Advocate
            </span>
          </nav>

          <div className="navbar-right-section">
            {user ? (
              <div className="user-menu" ref={dropdownRef}>
                <div className="user-info" onClick={() => setDropdownOpen(!isDropdownOpen)}>
                  <img
                    src={user.picture || "/default-avatar.png"}
                    alt="avatar"
                    className="user-avatar"
                  />
                  <span className="user-name">{user.name || user.email}</span>
                  <ChevronDown size={16} className={isDropdownOpen ? 'rotate' : ''} />
                </div>

                {isDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-item" onClick={() => { setDropdownOpen(false); navigate("/dashboard"); }}>
                      Dashboard
                    </div>
                    <div className="dropdown-item" onClick={() => { setDropdownOpen(false); navigate("/document-history"); }}>
                      Documents
                    </div>
                    <div className="dropdown-item" onClick={() => { setDropdownOpen(false); navigate("/profile"); }}>
                      Profile
                    </div>
                    <div className="dropdown-item logout-btn" onClick={logout}>
                      Logout
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
                <button className="register-btn" onClick={() => navigate("/signup")}>Register</button>
              </div>
            )}

            {/* Changed the CTA to use the new navigation function */}
            <button className="nav-cta" onClick={goToAdvocatesPage}>
              Call an Expert
            </button>
          </div>
        </div>
      </header>

      {/* ❌ REMOVED: The entire off-canvas JSX panel is gone */}
    </>
  );
}

export default Navbar;