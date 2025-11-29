import React, { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, Loader } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async () => {
    if (!name || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    setLoading(true);
    try {
      await registerUser({ name, email, password });
      alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (e) {
      alert(e.response?.data?.msg || "Error registering. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        
        <div className="form-group-auth">
            <div className="input-icon-group">
                <User size={18} className="input-icon" />
                <input 
                    className="auth-input"
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Full Name" 
                    disabled={loading}
                />
            </div>
        </div>

        <div className="form-group-auth">
            <div className="input-icon-group">
                <Mail size={18} className="input-icon" />
                <input 
                    className="auth-input"
                    type="email"
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="Email Address" 
                    disabled={loading}
                />
            </div>
        </div>

        <div className="form-group-auth">
            <div className="input-icon-group">
                <Lock size={18} className="input-icon" />
                <input 
                    className="auth-input"
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="Password" 
                    disabled={loading}
                />
            </div>
        </div>
        
        <button 
            onClick={register} 
            disabled={loading} 
            className="auth-btn register-btn-submit"
        >
            {loading ? (
                <div className="flex-center">
                    <Loader size={20} className="spinner spin-fast" /> Registering...
                </div>
            ) : (
                <div className="flex-center">
                    Register <ArrowRight size={18} />
                </div>
            )}
        </button>

        <p className="auth-footer">
            Already have an account?{" "}
            <Link to="/login">
                Log In
            </Link>
        </p>
      </div>
    </div>
  );
}