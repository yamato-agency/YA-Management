import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

type TabType = "login" | "register" | "reset";

export default function LoginForm({ onLogin }: { onLogin?: () => void }) {
  const [tab, setTab] = useState<TabType>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // ログイン処理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setInfo("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (onLogin) onLogin();
    } catch (err: any) {
      setError("ログインに失敗しました: " + err.message);
    }
  };

  // 新規登録処理
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setInfo("");
    if (registerPassword !== registerConfirm) {
      setError("パスワードが一致しません。");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, registerPassword);
      setInfo("ユーザー登録が完了しました。ログインしてください。");
      setTab("login");
    } catch (err: any) {
      setError("登録に失敗しました: " + err.message);
    }
  };

  // パスワードリセット処理
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setInfo("");
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setInfo("パスワード再設定メールを送信しました。メールをご確認ください。");
    } catch (err: any) {
      setError("再設定メール送信に失敗しました: " + err.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded-lg shadow">
      {/* タブ切り替え */}
      <div className="flex mb-6 border-b">
        <button
          className={`flex-1 py-2 font-semibold ${tab === "login" ? "text-blue-700 border-b-2 border-blue-600" : "text-gray-400"}`}
          onClick={() => { setTab("login"); setError(""); setInfo(""); }}
        >
          ログイン
        </button>
        <button
          className={`flex-1 py-2 font-semibold ${tab === "register" ? "text-blue-700 border-b-2 border-blue-600" : "text-gray-400"}`}
          onClick={() => { setTab("register"); setError(""); setInfo(""); }}
        >
          新規登録
        </button>
        <button
          className={`flex-1 py-2 font-semibold ${tab === "reset" ? "text-blue-700 border-b-2 border-blue-600" : "text-gray-400"}`}
          onClick={() => { setTab("reset"); setError(""); setInfo(""); }}
        >
          パスワード再設定
        </button>
      </div>

      {/* メッセージ表示 */}
      {info && <div className="text-blue-500 mb-4 text-sm">{info}</div>}
      {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

      {/* ログインフォーム */}
      {tab === "login" && (
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full mb-2 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-300"
            required
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full mb-4 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-300"
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">ログイン</button>
        </form>
      )}

      {/* 新規登録フォーム */}
      {tab === "register" && (
        <form onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full mb-2 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-300"
            required
          />
          <input
            type="password"
            placeholder="パスワード（6文字以上）"
            value={registerPassword}
            onChange={e => setRegisterPassword(e.target.value)}
            className="w-full mb-2 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-300"
            required
          />
          <input
            type="password"
            placeholder="パスワード（確認）"
            value={registerConfirm}
            onChange={e => setRegisterConfirm(e.target.value)}
            className="w-full mb-4 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-300"
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">登録する</button>
        </form>
      )}

      {/* パスワード再設定フォーム */}
      {tab === "reset" && (
        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
            className="w-full mb-4 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-300"
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">再設定メール送信</button>
        </form>
      )}
    </div>
  );
}