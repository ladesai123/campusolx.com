import { getFeedbacks } from '../getFeedbacks';
import FeedbackTable from '../FeedbackTable';
import { ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Moderation Queue • CampusOLX Ops',
};

export default async function ModerationPage() {
  const feedbacks = await getFeedbacks();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" /> Testimonial & Feedback Moderation Queue
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review, approve, or reject student testimonials submitted for the public landing carousel.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow space-y-4">
        <h3 className="font-bold text-slate-200 text-sm">Student Testimonials Submission Queue</h3>
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-200">
          <FeedbackTable feedbacks={feedbacks || []} />
        </div>
      </div>
    </div>
  );
}
