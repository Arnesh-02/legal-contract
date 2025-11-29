import React, { useState, useContext } from "react";
import { loginUser, GOOGLE_AUTH_URL, fetchUser } from "../api/auth";
import { AuthContext } from "../context/auth-context";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      await loginUser({ email, password });
      const r = await fetchUser();
      setUser(r.data.user);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>

        <input
          className="auth-input"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="auth-input"
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-btn" onClick={login}>Login</button>

        <button className="google-btn" onClick={() => window.location.href = GOOGLE_AUTH_URL}>
          Login with Google
        </button>

        <p className="auth-footer">
          Don’t have an account? <span onClick={() => navigate("/signup")}>Register</span>
        </p>
      </div>
    </div>
  );
}