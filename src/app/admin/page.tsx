// No 'use client' here! This is a Server Component.
import { Button } from "@/components/ui/button";
import ProductTable from "./ProductTable";
import FeedbackTable from "./FeedbackTable";
import { getFeedbacks } from "./getFeedbacks";

// Change this to your founder/admin email
const ADMIN_EMAIL = "126156075@sastra.ac.in";

import { createClient } from "@/lib/server";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">You are not allowed to see this</h1>
          <p className="text-gray-600">This page is restricted to the admin only.</p>
        </div>
      </div>
    );
  }
  // Server-side fetch for feedbacks
  const feedbacks = await getFeedbacks();
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-extrabold text-blue-700 mb-8">CampusOlx Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow col-span-full">
          <h2 className="text-xl font-bold mb-4">Product Management</h2>
          <ProductTable />
        </div>
        <div className="rounded-lg border bg-white p-6 shadow col-span-full">
          <h2 className="text-xl font-bold mb-2">Testimonial Management</h2>
          <p className="mb-4 text-slate-600">Approve or reject testimonials for the homepage carousel.</p>
          <FeedbackTable feedbacks={feedbacks} />
        </div>
        <div className="rounded-lg border bg-white p-6 shadow">
          <h2 className="text-xl font-bold mb-2">User Management</h2>
          <p className="mb-4 text-slate-600">Block or remove users from CampusOlx.</p>
          <Button disabled>Go to Users (coming soon)</Button>
        </div>
      </div>
      <div className="mt-12 text-center text-slate-400 text-xs">For security, only the founder can access this dashboard.</div>
    </div>
  );
}
