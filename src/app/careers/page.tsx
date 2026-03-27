"use client";

import { useState } from 'react';
import { createClient } from '@/lib/client';
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CareersPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    reg_no: '',
    department: '',
    year: '',
    email: '',
    phone: '',
    role_applied: '',
    skills: '',
    why_join: '',
    first_move: '',
    portfolio_link: '',
    additional_info: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { 
      id: 'Developer', emoji: '🛠', title: 'Developer', subtitle: 'Frontend / Full-Stack',
      fit: "You're the one if you've stayed up till 3 AM fixing a bug just because it bothered you." 
    },
    { 
      id: 'Designer', emoji: '🎨', title: 'Designer', subtitle: 'UI/UX',
      fit: "You're the one if bad typography physically hurts you and you obsess over user flows." 
    },
    { 
      id: 'Growth', emoji: '📈', title: 'Growth', subtitle: 'Marketing Lead',
      fit: "You're the one if you know how to make people care, click, and convert." 
    },
    { 
      id: 'Social Media', emoji: '📱', title: 'Social Media', subtitle: 'Content & Growth',
      fit: "You're the one if you understand culture, trends, and how to build a loyal audience." 
    },
    { 
      id: 'Ambassador', emoji: '🎤', title: 'Ambassador', subtitle: 'On-ground & Outreach',
      fit: "You're the one if you know everyone on campus and can sell water to a fish." 
    },
    { 
      id: 'Product', emoji: '🔍', title: 'Product / QA', subtitle: 'Testing & Thinking',
      fit: "You're the one if you love breaking things just to figure out how to build them better." 
    },
  ];

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (roleId: string) => {
    setFormData(prev => ({ ...prev, role_applied: roleId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      // Bypass strict TS typing since 'career_applications' was created manually in SQL
      const { error: submitError } = await (supabase as any)
        .from('career_applications')
        .insert([formData]);

      if (submitError) throw submitError;
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col min-h-screen bg-white text-slate-800">
        <header className="bg-white border-b border-transparent sticky top-0 z-50">
          <div className="max-w-[800px] mx-auto w-full px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl tracking-tight text-[#0F172A]">
              Campus<span className="text-[#2563EB]">Olx</span>
            </Link>
          </div>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center">
          <section 
            className="relative w-full flex-grow flex flex-col justify-center items-center px-[20px] lg:px-[80px] overflow-hidden"
            style={{
              backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              backgroundPosition: 'center center'
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,white_80%)] pointer-events-none"></div>

            <div className="max-w-[800px] w-full mx-auto relative z-10 flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-6 text-emerald-600">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-[14px] font-[600] tracking-wide">APPLICATION RECEIVED</span>
              </div>
              
              <h1 className="text-[48px] lg:text-[72px] leading-[1.1] font-[700] text-[#0F172A] mb-6 tracking-tight">
                Got it.
              </h1>
              
              <p className="max-w-[540px] mx-auto text-[18px] md:text-[20px] text-[#64748B] font-[400] leading-relaxed mb-10">
                We've received your application and we'll personally review it. Expect a WhatsApp message from us in 3–5 days. In the meantime — keep building.
              </p>
              
              <Button asChild className="rounded-[16px] px-8 py-6 text-[16px] font-[600] bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors border-0">
                 <Link href="/">Back to Commerce</Link>
              </Button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[800px] mx-auto w-full px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight text-[#0F172A]">
            Campus<span className="text-[#2563EB]">Olx</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            Cancel
          </Link>
        </div>
      </header>

      {/* Form Container */}
      <main className="flex-grow py-12 px-4 sm:px-6">
        <div className="max-w-[700px] mx-auto w-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          
          {/* Form Hero */}
          <div className="px-8 py-12 border-b border-slate-100 bg-slate-50/50">
            <h1 className="text-[32px] md:text-[40px] font-[700] text-[#0F172A] tracking-tight leading-tight mb-4">
              Build something that actually matters.
            </h1>
            <p className="text-[18px] text-slate-600 leading-relaxed mb-8">
              CampusOLX is powering trade for over 1,400+ students at SASTRA every single day. We're looking for 5–6 absolute killers to join our core founding team. This isn't a college club. This is a startup.
            </p>
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-[14px] font-[700] text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                What you're actually getting
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-3 mt-0.5">✦</span>
                  <span className="text-slate-700 text-[15px] font-[500] leading-snug">Your code and ideas live on a product used by 1,400+ of your peers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-3 mt-0.5">✦</span>
                  <span className="text-slate-700 text-[15px] font-[500] leading-snug">Full ownership, autonomy, and credit for what you build from day one</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-3 mt-0.5">✦</span>
                  <span className="text-slate-700 text-[15px] font-[500] leading-snug">A serious portfolio piece that actually ships, scales, and matters</span>
                </li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
            
            {/* Section 1 */}
            <section>
              <h2 className="text-[14px] font-bold text-blue-600 tracking-widest uppercase mb-2">01 — First, tell us who you are</h2>
              <p className="text-slate-500 text-[14px] mb-6">We read every single one of these. Make us feel like we know you.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[14px] font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                  <input required name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Your full name" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-semibold text-slate-700">Reg No <span className="text-red-500">*</span></label>
                  <input required name="reg_no" value={formData.reg_no} onChange={handleChange} placeholder="e.g. 224001234" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-semibold text-slate-700">Department <span className="text-red-500">*</span></label>
                  <input required name="department" value={formData.department} onChange={handleChange} placeholder="e.g. CSE, ECE" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-semibold text-slate-700">Year <span className="text-red-500">*</span></label>
                  <select required name="year" value={formData.year} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-700 bg-white appearance-none">
                    <option value="" disabled>Your current year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-semibold text-slate-700">Email <span className="text-red-500">*</span></label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-semibold text-slate-700">Phone / WhatsApp <span className="text-red-500">*</span></label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400" />
                </div>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Section 2 */}
            <section>
              <h2 className="text-[14px] font-bold text-blue-600 tracking-widest uppercase mb-2">02 — Where do you fit in?</h2>
              <p className="text-slate-500 text-[14px] mb-6">Choose the role that feels like home. We're hiring specialists, not generalists.</p>

              <div className="space-y-6">
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {roles.map(role => (
                      <button
                        type="button"
                        key={role.id}
                        onClick={() => handleRoleSelect(role.id)}
                        className={`flex flex-col gap-2 p-5 rounded-xl border text-left transition-all relative overflow-hidden ${
                          formData.role_applied === role.id 
                            ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600' 
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 w-full border-b border-transparent pb-1">
                          <span className="text-2xl leading-none">{role.emoji}</span>
                          <div>
                            <div className="font-bold text-slate-900 text-[15px] tracking-tight">{role.title}</div>
                            <div className="text-slate-500 text-[12px] uppercase tracking-wider mt-0.5">{role.subtitle}</div>
                          </div>
                        </div>
                        <div className={`text-[13px] leading-relaxed mt-1 ${
                          formData.role_applied === role.id ? 'text-blue-800/80 font-medium' : 'text-slate-500'
                        }`}>
                          "{role.fit}"
                        </div>
                      </button>
                    ))}
                  </div>
                  {/* Hidden input to enforce required check physically for native form validation without breaking UI flow */}
                  <input type="radio" required checked={!!formData.role_applied} onChange={() => {}} className="opacity-0 absolute -z-10 w-0 h-0" />
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-[14px] font-semibold text-slate-700">Relevant skills or tools you use <span className="text-red-500">*</span></label>
                  <p className="text-[12px] text-slate-500 pb-1">e.g. React, Figma, Canva, Meta Ads... List a few — be specific</p>
                  <input required name="skills" value={formData.skills} onChange={handleChange} placeholder="Type your skills here" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400" />
                </div>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Section 3 */}
            <section>
              <h2 className="text-[14px] font-bold text-blue-600 tracking-widest uppercase mb-2">03 — The Reality Check</h2>
              <p className="text-slate-500 text-[14px] mb-6">Why are you really here?</p>

              <div className="bg-[#F8F9FC] rounded-2xl p-6 border border-slate-100 mb-8 flex gap-4 items-start shadow-sm">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-xl border border-blue-200 overflow-hidden shadow-inner">
                  💡
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-slate-900 mb-1.5 flex items-center">Important Note</h4>
                  <p className="text-[14px] text-slate-600 leading-relaxed italic">
                    "Please don't write what you think we want to hear — write what's true for you. We respect honesty, passion, and genuine interest far more than polish."
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="text-[14px] font-semibold text-slate-700">Why do you want to join CampusOLX? <span className="text-red-500">*</span></label>
                    <span className={`text-[12px] ${formData.why_join.length >= 500 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                      {formData.why_join.length} / 500
                    </span>
                  </div>
                  <textarea required name="why_join" value={formData.why_join} onChange={handleChange} maxLength={500} rows={4} placeholder="Honestly, what made you click 'Apply'? What excites you about this?" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400 resize-none leading-relaxed" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="text-[14px] font-semibold text-slate-700">If you join, what's the first thing you'd do? <span className="text-red-500">*</span></label>
                    <span className={`text-[12px] ${formData.first_move.length >= 400 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                      {formData.first_move.length} / 400
                    </span>
                  </div>
                  <textarea required name="first_move" value={formData.first_move} onChange={handleChange} maxLength={400} rows={4} placeholder="If we give you the keys tomorrow, what's your very first move?" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400 resize-none leading-relaxed" />
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-semibold text-slate-700">Show us something you've made <span className="text-slate-400 font-normal ml-1">optional</span></label>
                  <p className="text-[12px] text-slate-500 pb-1">GitHub, Figma, Instagram handle, Google Drive link...</p>
                  <input name="portfolio_link" value={formData.portfolio_link} onChange={handleChange} placeholder="https://" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400" />
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-semibold text-slate-700">Anything else you want us to know? <span className="text-slate-400 font-normal ml-1">optional</span></label>
                  <p className="text-[12px] text-slate-500 pb-1">Questions, ideas, context — open floor</p>
                  <textarea name="additional_info" value={formData.additional_info} onChange={handleChange} rows={3} placeholder="Let us know..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400 resize-none leading-relaxed" />
                </div>

              </div>
            </section>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-start gap-2">
                <div>⚠️</div>
                <div className="pt-[1px]">{error}</div>
              </div>
            )}

            <div className="pt-6">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto rounded-xl px-10 py-7 text-[16px] font-[700] bg-[#2563EB] text-white hover:bg-blue-700 transition-colors border-0 shadow-sm tracking-wide">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    I'm In — Send My Application
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
