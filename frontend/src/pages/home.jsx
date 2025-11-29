// src/pages/Home.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ShieldCheck, Users, ArrowRight } from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ddRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);


  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="home-container">
          <h1 className="hero-title">Create & Analyze Legal Documents Instantly</h1>
          <p className="hero-subtitle">
            Your all-in-one platform for generating founders' agreements, NDAs, and analyzing contract risks with the power of AI.
          </p>
          <div className="home-buttons">
            <div ref={ddRef} style={{ position: "relative" }}>
              <button
                className="btn-primary"
                onClick={() => setOpen((s) => !s)}
              >
                Create Document ▾
              </button>
              {open && (
                <div className="dropdown-menu1">
                  <button className="dropdown-item" onClick={() => { setOpen(false); navigate("/generate-founders-agreement"); }}>
                    Founders Agreement
                  </button>
                  <button className="dropdown-item" onClick={() => { setOpen(false); navigate("/generate-nda"); }}>
                    NDA Document
                  </button>
                </div>
              )}
            </div>
            <button className="btn-secondary" onClick={() => navigate("/risk-analysis")}>
              Analyze Risk
            </button>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="home-container">
          <h2 className="section-title">Our Core Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FileText size={40} className="feature-icon" />
              <h3>Automated Document Generation</h3>
              <p>Quickly generate legally sound documents tailored to your startup's needs. Just fill in a simple form and you're done.</p>
            </div>
            <div className="feature-card">
              <ShieldCheck size={40} className="feature-icon" />
              <h3>AI-Powered Risk Analysis</h3>
              <p>Upload your existing contracts to have our AI identify potential risks, ambiguous clauses, and missing terms in seconds.</p>
            </div>
            <div className="feature-card">
              <Users size={40} className="feature-icon" />
              <h3>Designed for Founders</h3>
              <p>We focus on the essential legal needs of early-stage startups, saving you time and thousands in legal fees.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works-section">
        <div className="home-container">
          <h2 className="section-title">Simple & Fast</h2>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Select & Customize</h3>
              <p>Choose the document you need or upload an existing one for analysis.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Input Your Details</h3>
              <p>Fill out a straightforward form with your company's information.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Get Your Results</h3>
              <p>Download your generated document or review the detailed risk report.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="home-container">
          <h2>Ready to Secure Your Business?</h2>
          <p>Get started now and take control of your legal paperwork.</p>
          <button className="btn-primary-large" onClick={() => navigate('/generate-founders-agreement')}>
            Generate Your First Document <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
