'use client';

import { 
  useState, 
  useEffect, 
  createContext, 
  useContext, 
  ReactNode 
} from 'react';
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

// 環境変数から管理者メールアドレスを取得（なければ空文字）
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || '';

// Contextが提供する値の型定義
interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean; // ★ loading 状態を追加
}

// 認証情報のContextを作成
const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  isAdmin: false,
  loading: true // ★ 初期値は読み込み中として true に設定
});

// アプリケーション全体に認証情報を提供するためのプロバイダーコンポーネント
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // ★ 読み込み状態のstateを追加

  useEffect(() => {
    // onAuthStateChanged でFirebaseの認証状態の変更を監視
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAdmin(firebaseUser?.email === ADMIN_EMAIL);
      
      // ★ 認証状態が確定したので、loadingをfalseにする
      setLoading(false); 
    });

    // コンポーネントがアンマウントされたときに監視を解除
    return () => unsubscribe();
  }, []);

  // Context Providerで認証情報とloading状態を子コンポーネントに渡す
  const value = { user, isAdmin, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 認証情報とloading状態を簡単に取得するためのカスタムフック
export const useAuth = () => useContext(AuthContext);