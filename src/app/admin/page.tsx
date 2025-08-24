import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/LoginForm";

export default function AdminPage() {
  const { user, isAdmin } = useAuth();

  if (!user) return <LoginForm />;
  if (!isAdmin) return <div className="text-center mt-10 text-red-600">管理者権限がありません。</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">管理者ページ</h1>
      {/* 管理者専用の内容 */}
    </div>
  );
}
