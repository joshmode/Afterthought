"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth";

interface Comment {
    id: number;
    content: string;
    is_approved: boolean;
    created_at: string;
    user_id: number;
    essay_id: number;
}

export default function AdminComments() {
  const { token } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/engagement/admin/comments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setComments(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchComments();
  }, [token]);

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/engagement/admin/comments/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setComments(comments.map(c => c.id === id ? { ...c, is_approved: true } : c));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/engagement/admin/comments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setComments(comments.filter(c => c.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-serif text-white mb-8">Comment Moderation</h1>
      {loading ? (
          <div className="text-zinc-500 font-mono">Loading queue...</div>
      ) : comments.length === 0 ? (
          <div className="border border-zinc-800 rounded-lg bg-surface/30 p-12 text-center text-zinc-500 font-mono">
            No comments require moderation. You&apos;re all caught up.
          </div>
      ) : (
          <div className="space-y-4">
              {comments.map(c => (
                <div key={c.id} className="border border-zinc-800 rounded-lg bg-surface/30 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-xs font-mono text-zinc-500 mb-1">
                        Essay #{c.essay_id} &bull; {new Date(c.created_at).toLocaleString()}
                      </div>
                      <div className="text-zinc-300 font-sans">{c.content}</div>
                    </div>
                    <span className={`text-xs font-mono px-2 py-1 rounded ${c.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {c.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex space-x-4 border-t border-zinc-800 pt-4 mt-4">
                    {!c.is_approved && (
                      <button onClick={() => handleApprove(c.id)} className="text-sm text-green-400 hover:text-green-300 transition-colors font-medium">
                        Approve
                      </button>
                    )}
                    <button onClick={() => handleDelete(c.id)} className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
      )}
    </div>
  );
}
