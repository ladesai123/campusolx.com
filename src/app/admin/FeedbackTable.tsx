"use client";


import { useState } from "react";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import type { FC } from "react";


type Feedback = {
  id: number;
  name: string | null;
  year: string;
  experience: string;
  consent: boolean;
  status: string;
};

interface FeedbackTableProps {
  feedbacks: Feedback[];
}

const FeedbackTable: FC<FeedbackTableProps> = ({ feedbacks: initialFeedbacks }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    setUpdatingId(id);
    setError(null);
    const newStatus = currentStatus === "approved" ? "pending" : "approved";
    const supabase = createClient();
    const { error } = await supabase
      .from("feedback")
      .update({ status: newStatus })
      .eq("id", id);
    if (error) {
      setError(error.message);
    } else {
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
      );
    }
    setUpdatingId(null);
  };

  return (
    <div className="overflow-x-auto">
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <table className="min-w-full border text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Year</th>
            <th className="p-2 border">Experience</th>
            <th className="p-2 border">Consent</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.map((fb) => (
            <tr key={fb.id}>
              <td className="p-2 border">{fb.name}</td>
              <td className="p-2 border">{fb.year}</td>
              <td className="p-2 border max-w-xs truncate">{fb.experience}</td>
              <td className="p-2 border text-center">{fb.consent ? "Yes" : "No"}</td>
              <td className="p-2 border">
                <span
                  className={
                    fb.status === "approved"
                      ? "bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                      : "bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs"
                  }
                >
                  {fb.status}
                </span>
              </td>
              <td className="p-2 border">
                <Button
                  size="sm"
                  onClick={() => handleToggleStatus(fb.id, fb.status)}
                  disabled={updatingId === fb.id}
                  className={
                    fb.status === "approved"
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }
                >
                  {updatingId === fb.id
                    ? "Updating..."
                    : fb.status === "approved"
                    ? "Revert to Pending"
                    : "Approve"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeedbackTable;
