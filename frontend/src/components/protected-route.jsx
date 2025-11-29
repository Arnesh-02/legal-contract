import { useContext } from "react";
import { AuthContext } from "../context/auth-context";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="loading-state-overlay"><div className="spinner-border text-primary" role="status"></div><p>Checking authentication...</p></div>;
  if (!user) return <Navigate to="/login" />;

  return children;
}