'use client';

import { Comment } from '@/types';

interface CommentItemProps {
  comment: Comment;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="flex space-x-3 py-3">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
          <span className="text-sm font-medium text-white">
            {(comment.user.name || 'A').charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-100">
            {comment.user.name || 'Anonymous'}
          </span>
          <span className="text-xs text-gray-500">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="mt-1 text-sm text-gray-300 whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  );
}
