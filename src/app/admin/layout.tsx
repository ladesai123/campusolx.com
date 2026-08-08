import { verifyAdminSession } from '@/lib/adminAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'CampusOLX System Operations & Engineering Console',
  description: 'Production administration, observability, database health, and system management.',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, user, reason } = await verifyAdminSession();

  if (!isAdmin || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 text-center shadow-2xl">
          <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-100 mb-2">Access Restricted</h1>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            This engineering console is restricted exclusively to authorized CampusOLX system administrators.
          </p>
          {reason && (
            <div className="bg-slate-950 px-3 py-2 rounded border border-slate-800 text-xs font-mono text-slate-400 mb-6 truncate">
              Status: {reason}
            </div>
          )}
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium">
            <Link href="/home" className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Return to Marketplace
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Persistent Engineering Sidebar */}
      <AdminSidebar userEmail={user.email || 'Admin'} />

      {/* Main Operations Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">Environment:</span>
            <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              PRODUCTION (SASTRA)
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>Server Time: {new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC</span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
