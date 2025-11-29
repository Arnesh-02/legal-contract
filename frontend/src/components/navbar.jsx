import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, X, ChevronDown } from "lucide-react";
import { AuthContext } from "../context/auth-context";
import { logoutUser } from "../api/auth";

const experts = [
  { name: "Aditi Sharma", number: "+91 98765 43210", speciality: "Corporate Law" },
  { name: "Rohan Mehta", number: "+91 91234 56789", speciality: "Intellectual Property" },
  { name: "Priya Singh", number: "+91 87654 32109", speciality: "Contract Law" },
];

function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  const [isOffCanvasOpen, setOffCanvasOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleOffCanvas = () => setOffCanvasOpen(!isOffCanvasOpen);

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

            <button className="nav-cta" onClick={toggleOffCanvas}>Call an Expert</button>
          </div>
        </div>
      </header>

      {isOffCanvasOpen && (
        <div className="off-canvas-backdrop" onClick={toggleOffCanvas}>
          <div className="off-canvas-panel" onClick={(e) => e.stopPropagation()}>
            <div className="off-canvas-header">
              <h3>Legal Experts</h3>
              <button className="close-btn" onClick={toggleOffCanvas}>
                <X size={24} />
              </button>
            </div>
            <div className="expert-list">
              {experts.map((expert, index) => (
                <div key={index} className="expert-item">
                  <div className="expert-info">
                    <span className="expert-name">{expert.name}</span>
                    <span className="expert-speciality">{expert.speciality}</span>
                  </div>
                  <a href={`tel:${expert.number}`} className="expert-call-btn">
                    <Phone size={18} />
                    <span>Call</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;