import { HardDrive, Server, ShieldCheck, Database, Layers, Cloud, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Egress & Infrastructure Center • CampusOLX Ops',
};

export default function EgressPage() {
  const egressBreakdown = [
    { source: 'Marketplace Feed (/api/products)', share: '45%', bytes: '0.646 GB', priority: 'High', color: 'bg-blue-500' },
    { source: 'Chat Messages & Previews', share: '22%', bytes: '0.316 GB', priority: 'Medium', color: 'bg-purple-500' },
    { source: 'Profiles & User Sessions', share: '14%', bytes: '0.201 GB', priority: 'Low', color: 'bg-emerald-500' },
    { source: 'Wanted Requests Feed', share: '10%', bytes: '0.143 GB', priority: 'Low', color: 'bg-amber-500' },
    { source: 'Other API Endpoints & Auth', share: '9%', bytes: '0.130 GB', priority: 'Low', color: 'bg-slate-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-blue-400" /> Egress & Infrastructure Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed separation of database storage, Supabase network egress, Cloudinary media storage, and CDN traffic.
        </p>
      </div>

      {/* Storage & Egress Separation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Supabase Egress */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>SUPABASE EGRESS</span>
            <HardDrive className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-100">1.436 GB</p>
          <p className="text-xs text-slate-400 font-mono">Limit: 5.0 GB (28.7%)</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-blue-500 h-full w-[28.7%]" />
          </div>
        </div>

        {/* 2. Database Size */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>DATABASE STORAGE</span>
            <Database className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-100">41.0 MB</p>
          <p className="text-xs text-slate-400 font-mono">Limit: 500 MB (8.2%)</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-purple-500 h-full w-[8.2%]" />
          </div>
        </div>

        {/* 3. Cloudinary Media */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>CLOUDINARY MEDIA</span>
            <Cloud className="h-4 w-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-100">2.10 GB</p>
          <p className="text-xs text-slate-400 font-mono">Product Images Hosted</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-sky-500 h-full w-[21%]" />
          </div>
        </div>

        {/* 4. Realtime Connections */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>REALTIME CONCURRENT</span>
            <Server className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-100">5 Peak</p>
          <p className="text-xs text-slate-400 font-mono">Limit: 200 (2.5%)</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-emerald-500 h-full w-[2.5%]" />
          </div>
        </div>
      </div>

      {/* Estimated Egress Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-200 text-sm">Estimated Egress Contribution by Component</h3>
            <p className="text-xs text-slate-400 font-mono">Calculated via measured response payload size × request volume</p>
          </div>
        </div>

        <div className="space-y-4">
          {egressBreakdown.map((item, idx) => (
            <div key={idx} className="space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">{item.source}</span>
                <span className="text-slate-400">{item.bytes} ({item.share})</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className={`${item.color} h-full rounded-full`} style={{ width: item.share }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Note on Bandwidth Separation */}
      <div className="bg-blue-950/40 border border-blue-900/30 p-4 rounded-xl flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed font-mono">
          <span className="font-bold text-blue-300">Infrastructure Rule:</span> Product images are served directly via Cloudinary CDN (`res.cloudinary.com`) with `f_auto,q_auto` compression. Supabase network egress measures database row payloads only.
        </div>
      </div>
    </div>
  );
}
