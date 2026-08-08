import RetentionClient from './RetentionClient';
import { Trash2 } from 'lucide-react';

export const metadata = {
  title: 'Data Retention & Safe Cleanup • CampusOLX Ops',
};

export default function DataRetentionPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-amber-400" /> Safe Data Retention & Pruning Console
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform controlled administrative data cleanup with mandatory preview verification and explicit confirmation audit logs.
        </p>
      </div>

      <RetentionClient />
    </div>
  );
}
