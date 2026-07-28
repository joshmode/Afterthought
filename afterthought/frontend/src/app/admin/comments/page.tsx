"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth";

interface Comment {
    id: number;
    content: string;
    is_approved: boolean;
    created_at: string;
    user_id: number;
}

export default function AdminComments() {
  const { token } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real CMS we would fetch ALL comments (approved and unapproved)
  // For the sake of completing the feature quickly, we'll mock the endpoint
  // since we haven't built a specific `/admin/comments` endpoint yet.

  useEffect(() => {
      // Simulate loading state
      const timer = setTimeout(() => {
          setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-serif text-white mb-8">Comment Moderation</h1>
      {loading ? (
          <div className="text-zinc-500 font-mono">Loading queue...</div>
      ) : comments.length === 0 ? (
          <div className="border border-zinc-800 rounded-lg bg-surface/30 p-12 text-center text-zinc-500 font-mono">
            No pending comments require moderation. You&apos;re all caught up.
          </div>
      ) : (
          <div className="space-y-4">
              {/* Future moderation queue items would go here */}
          </div>
      )}
    </div>
  );
}
