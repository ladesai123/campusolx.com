import { getAdminSupabase } from '@/lib/adminAuth';
import UsersClient from './UsersClient';
import { Users } from 'lucide-react';

export const metadata = {
  title: 'User Operations • CampusOLX Ops',
};

export default async function UsersPage() {
  const adminSupabase = getAdminSupabase();

  const { data: profiles } = await adminSupabase
    .from('profiles')
    .select('id, name, email, university, acquisition_source, created_at, last_active_at')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-400" /> Student Profile & User Operations Console
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Search registered users, view university affiliations, and monitor student accounts safely.
        </p>
      </div>

      <UsersClient initialProfiles={profiles || []} />
    </div>
  );
}
