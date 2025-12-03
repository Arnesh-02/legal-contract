// import React, { useState, useContext } from "react";
// import { loginUser, GOOGLE_AUTH_URL, fetchUser } from "../api/auth";
// import { AuthContext } from "../context/auth-context";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const { setUser } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const login = async () => {
//     try {
//       await loginUser({ email, password });
//       const r = await fetchUser();
//       setUser(r.data.user);
//       navigate("/");
//     } catch (err) {
//       alert(err.response?.data?.msg || "Login failed");
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <h2>Login</h2>

//         <input
//           className="auth-input"
//           placeholder="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <input
//           className="auth-input"
//           placeholder="password"
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <button className="auth-btn" onClick={login}>Login</button>

//         <button className="google-btn" onClick={() => window.location.href = GOOGLE_AUTH_URL}>
//           Login with Google
//         </button>

//         <p className="auth-footer">
//           Don’t have an account? <span onClick={() => navigate("/signup")}>Register</span>
//         </p>
//       </div>
//     </div>
//   );
// }
import React, { useState, useContext } from "react";
import { loginUser, GOOGLE_AUTH_URL, fetchUser } from "../api/auth";
import { AuthContext } from "../context/auth-context";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";

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
      <div className="auth-card enhanced-card">
        <h2 className="auth-title">Welcome Back 👋</h2>
        <p className="auth-subtitle">Please login to continue</p>

        {/* EMAIL */}
        <div className="input-icon-group">
          <Mail size={18} className="input-icon"/>
          <input
            className="auth-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="input-icon-group">
          <Lock size={18} className="input-icon"/>
          <input
            className="auth-input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* LOGIN BUTTON */}
        <button className="auth-btn new-login-btn" onClick={login}>
          Login
        </button>

        <div className="divider-or">OR</div>

        {/* GOOGLE LOGIN (Official Logo) */}
        <button
  className="google-btn new-google-btn"
  onClick={() => (window.location.href = GOOGLE_AUTH_URL)}
>
  <img
    className="google-original-icon"
    src="https://www.gstatic.com/images/branding/product/1x/gsa_48dp.png"
    alt="Google Logo"
  />
  <span>Continue with Google</span>
</button>


        <p className="auth-footer">
          Don’t have an account?
          <span onClick={() => navigate("/signup")}> Register</span>
        </p>
      </div>
    </div>
  );
}
