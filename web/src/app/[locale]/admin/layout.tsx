import { AdminNav } from "./_components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <AdminNav />
      {children}
    </div>
  );
}
