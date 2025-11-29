import { createContext, useState, useEffect } from "react";
import { fetchUser, getProfile } from "../api/auth";

export const AuthContext = createContext({
    user: null,
    setUser: () => {},
    loading: true,
    refreshUserProfile: () => Promise.resolve(null),
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser()
      .then(res => {
        if (res.data && res.data.user) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      })
      .catch(err => {
        console.error("fetchUser error", err);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const refreshUserProfile = async () => {
    try {
      const res = await getProfile();
      setUser(prev => ({ ...(prev || {}), ...res.data }));
      return res.data;
    } catch (err) {
      console.error("refreshUserProfile error", err);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}