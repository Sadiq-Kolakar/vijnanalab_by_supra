import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

type AuthContextType = {
  user: User | null;
  role: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase failed to initialize, don't try to listen for auth changes
    if (!auth) {
      console.warn("Auth context skip: Firebase auth is not initialized.");
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser && db) {
          setUser(currentUser);

          // Fetch role from Firestore
          const snap = await getDoc(doc(db, 'users', currentUser.uid));
          if (snap.exists()) {
            setRole(snap.data().role);
          } else {
            // Default role if not in DB yet (or just created)
            setRole('Student');
          }
        } else {
          setUser(currentUser || null);
          setRole(currentUser ? 'Student' : null);
        }
      } catch (error) {
        console.error("Auth context error:", error);
        // Fallback to avoid infinite loading if Firestore fails
        setUser(currentUser);
        setRole('Student'); 
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
