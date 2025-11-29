import { useEffect, useContext } from "react";
import { fetchUser } from "../api/auth";
import { AuthContext } from "../context/auth-context";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";

export default function OAuthSuccess() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser().then((res) => {
      setUser(res.data.user);
      navigate("/");
    });
  }, []);

  return (
    <div className="loading-page-auth">
        <Loader size={40} className="spinner spin-fast" />
        <p>Processing secure login... Redirecting shortly.</p>
    </div>
  );
}