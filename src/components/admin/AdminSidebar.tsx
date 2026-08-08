'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Zap,
  HardDrive,
  ListTodo,
  Database,
  Users,
  ShoppingBag,
  MessageSquare,
  ShieldCheck,
  Trash2,
  FileText,
  AlertTriangle,
  LogOut,
  ChevronRight,
  Activity,
  Lock,
} from 'lucide-react';
import Logo from '@/components/shared/Logo';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Performance', href: '/admin/performance', icon: Zap },
  { label: 'Egress & Infra', href: '/admin/egress', icon: HardDrive, badge: '28.7%', badgeColor: 'bg-blue-500/20 text-blue-400' },
  { label: 'Optimizations', href: '/admin/optimizations', icon: ListTodo, badge: 'Active', badgeColor: 'bg-emerald-500/20 text-emerald-400' },
  { label: 'Database Health', href: '/admin/database', icon: Database },
  { label: 'User Operations', href: '/admin/users', icon: Users },
  { label: 'Marketplace Items', href: '/admin/marketplace', icon: ShoppingBag },
  { label: 'Chat & Messaging', href: '/admin/chats', icon: MessageSquare },
  { label: 'Moderation Queue', href: '/admin/moderation', icon: ShieldCheck },
  { label: 'Retention & Cleanup', href: '/admin/retention', icon: Trash2, badge: 'Safe', badgeColor: 'bg-amber-500/20 text-amber-400' },
  { label: 'Audit Logs', href: '/admin/audit', icon: FileText },
  { label: 'Incident Console', href: '/admin/incidents', icon: AlertTriangle },
];

export default function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Header / Logo */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            CX
          </div>
          <div>
            <div className="font-bold text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
              CampusOLX <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">OPS</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">System Console v2.0</p>
          </div>
        </div>
      </div>

      {/* Security Status Badge */}
      <div className="px-4 py-2.5 bg-emerald-950/40 border-b border-emerald-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono font-medium text-emerald-400">PROD SYSTEM HEALTHY</span>
        </div>
        <Lock className="h-3 w-3 text-emerald-500/70" />
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
        <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">
          Operations Management
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge ? (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="h-3.5 w-3.5 opacity-70" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Admin User Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="truncate pr-2">
          <p className="text-[11px] font-mono text-slate-300 truncate font-semibold">{userEmail}</p>
          <p className="text-[10px] text-slate-500 font-mono">System Administrator</p>
        </div>
        <Link
          href="/home"
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Exit to Marketplace"
        >
          <LogOut className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
