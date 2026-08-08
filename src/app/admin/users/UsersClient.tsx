'use client';

import { useState } from 'react';
import { Search, UserCheck, ShieldAlert, ShoppingBag, Mail, Calendar, Eye, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function UsersClient({ initialProfiles }: { initialProfiles: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = initialProfiles.filter((p) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    return (
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.email && p.email.toLowerCase().includes(query)) ||
      (p.university && p.university.toLowerCase().includes(query)) ||
      (p.id && p.id.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Search Bar & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow">
        <div className="relative w-full sm:w-96">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, email, or user ID..."
            className="bg-slate-950 border-slate-800 text-slate-200 text-xs pl-9 focus:border-blue-500 font-mono"
          />
        </div>
        <div className="text-xs font-mono text-slate-400">
          Showing <span className="text-slate-100 font-bold">{filtered.length}</span> of {initialProfiles.length} registered profiles
        </div>
      </div>

      {/* Profiles Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">University Campus</th>
                <th className="py-2.5 px-3">Joined Date</th>
                <th className="py-2.5 px-3">Acquisition</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filtered.length > 0 ? (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-semibold text-slate-200 flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                        {user.name?.[0] || 'U'}
                      </div>
                      <span className="truncate max-w-[150px]">{user.name || 'Anonymous User'}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{user.email || 'N/A'}</td>
                    <td className="py-3 px-3 text-slate-400 truncate max-w-[180px]">
                      {user.university || 'SASTRA University'}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{user.acquisition_source || 'Google Resilient'}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No student profiles matched your search term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
