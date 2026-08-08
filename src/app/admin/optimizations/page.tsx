import { ListTodo, CheckCircle2, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Recommended Optimizations • CampusOLX Ops',
};

export default function OptimizationsPage() {
  const backlog = [
    {
      priority: 'HIGH',
      priorityColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      title: 'Restructure Chat Preview Queries',
      impact: 'High (~99.9% egress reduction on chat loads)',
      status: 'RESOLVED',
      description: 'Replaced unbounded `messages` table scans with targeted `.limit(1)` per connection queries.',
      file: 'src/app/(main)/chat/page.tsx',
    },
    {
      priority: 'HIGH',
      priorityColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      title: 'Eliminate Similar Products Recommendation Query',
      impact: 'High (100% removal of secondary detail page DB queries)',
      status: 'RESOLVED',
      description: 'Removed category recommendation query & rendering from item detail view per user directive.',
      file: 'src/app/(main)/product/[id]/page.tsx',
    },
    {
      priority: 'MEDIUM',
      priorityColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      title: 'Enforce Explicit Field Selections Across Queries',
      impact: 'Medium (40-60% payload size reduction)',
      status: 'RESOLVED',
      description: 'Replaced wildcard `select(*)` with explicit column selections in profile, chat, requests, and product endpoints.',
      file: 'src/app/(main)/profile/page.tsx',
    },
    {
      priority: 'MEDIUM',
      priorityColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      title: 'Public Landing Page Edge Response Caching',
      impact: 'Medium (90% reduction in landing page DB calls)',
      status: 'RESOLVED',
      description: 'Connected ProductCarousel to `/api/products/landing` with `s-maxage=300` cache headers.',
      file: 'src/app/api/products/landing/route.ts',
    },
    {
      priority: 'LOW',
      priorityColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      title: 'Periodic Telemetry Flush Throttling',
      impact: 'Low (66% reduction in telemetry HTTP requests)',
      status: 'RESOLVED',
      description: 'Extended view count flush interval from 10s to 30s while retaining exit beacon handlers.',
      file: 'src/app/(main)/home/HomeClient.tsx',
    },
    {
      priority: 'FUTURE (10K MAU)',
      priorityColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      title: 'Add Composite Index on Products (university, is_hidden, status)',
      impact: 'Scalability at 10,000+ MAU',
      status: 'RECOMMENDED',
      description: 'Will accelerate marketplace feed filters when product table exceeds 50,000 rows.',
      file: 'PostgreSQL Database Indexes',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-emerald-400" /> Recommended System Maintenance Backlog
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Prioritized optimization tasks evaluated by Impact × Request Frequency × Payload Size.
        </p>
      </div>

      <div className="space-y-4">
        {backlog.map((item, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${item.priorityColor}`}>
                  {item.priority}
                </span>
                <h3 className="font-bold text-slate-200 text-sm">{item.title}</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> {item.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed">{item.description}</p>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
              <span>Impact: {item.impact}</span>
              <span className="text-slate-400">{item.file}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
