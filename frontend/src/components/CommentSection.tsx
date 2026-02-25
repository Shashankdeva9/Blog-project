'use client';

import { useState, useEffect, useCallback } from 'react';
import { Comment } from '@/types';
import { commentApi, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import CommentItem from './CommentItem';

interface CommentSectionProps {
  blogId: string;
}

export default function CommentSection({ blogId }: CommentSectionProps) {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadComments = useCallback(async () => {
    try {
      const response = await commentApi.getComments(blogId);
      setComments(response.data);
    } catch {
      setError('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const comment = await commentApi.createComment(blogId, newComment.trim());
      setComments((prev) => [comment, ...prev]);
      setNewComment('');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to post comment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">
        Comments ({comments.length})
      </h3>

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm text-gray-100 bg-gray-800 placeholder-gray-500"
            maxLength={2000}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">{newComment.length}/2000</span>
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      )}

      {!isAuthenticated && (
        <p className="text-sm text-gray-500 mb-4">
          <a href="/login" className="text-red-500 hover:text-red-400 font-medium">Login</a> to leave a comment.
        </p>
      )}

      {error && (
        <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg mb-4">{error}</div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex space-x-3">
              <div className="w-8 h-8 bg-gray-800 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-800 rounded w-1/4" />
                <div className="h-3 bg-gray-800 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="divide-y divide-gray-800">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
