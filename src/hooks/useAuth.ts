'use client';

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

const ADMIN_EMAIL = "admin@example.com"; // 管理者メールアドレス

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAdmin(firebaseUser?.email === ADMIN_EMAIL);
    });
    return () => unsubscribe();
  }, []);

  return { user, isAdmin };
}
