import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [experience, setExperience] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setName(user.user_metadata?.name || user.email || '');
      }
    };
    if (open) fetchUser();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, year, experience, consent }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Failed to submit feedback');
        return;
      }
      setSuccess(true);
      setName(user?.user_metadata?.name || user?.email || '');
      setYear('');
      setExperience('');
      setConsent(false);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };



  // If not open, don't render anything
  if (!open) return null;
  if (open && user === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <Card className="relative w-full max-w-md mx-auto">
        {/* Loading overlay spinner */}
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
            <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        )}
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-3xl sm:text-2xl w-12 h-12 flex items-center justify-center rounded-full bg-white/80 shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 z-50"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Share Your Experience</CardTitle>
          <CardDescription>Get a chance to be featured on our website!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name (as you want it featured)</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Year</Label>
              <Select value={year} onValueChange={setYear} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st Year">1st Year</SelectItem>
                  <SelectItem value="2nd Year">2nd Year</SelectItem>
                  <SelectItem value="3rd Year">3rd Year</SelectItem>
                  <SelectItem value="4th Year">4th Year</SelectItem>
                  <SelectItem value="Recently Graduated">Recently Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>How could CampusOlx bring change to SASTRA University students?</Label>
              <Textarea
                placeholder="Share your ideas, hopes, or what you think CampusOlx could do for SASTRA."
                value={experience}
                onChange={e => setExperience(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                required
              />
              <Label htmlFor="consent" className="text-sm">I consent to my feedback being featured on the website.</Label>
            </div>
            <Button type="submit" className="w-full" variant="default" size="default" disabled={loading}>
              {loading && (
                <svg className="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              Submit
            </Button>
          </form>
          {success && <div className="text-green-600 mt-2 text-center font-semibold">Thank you for your valuable feedback!</div>}
          {error && <div className="text-red-600 mt-2 text-center">{error}</div>}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackModal;
