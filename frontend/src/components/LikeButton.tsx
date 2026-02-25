'use client';

import { useState, useCallback } from 'react';
import { likeApi, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface LikeButtonProps {
  blogId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
}

export default function LikeButton({ blogId, initialLikeCount, initialIsLiked }: LikeButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleLike = useCallback(async () => {
    if (!isAuthenticated) return;
    if (isLoading) return;

    // Optimistic update
    const prevLiked = isLiked;
    const prevCount = likeCount;
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    setIsLoading(true);

    try {
      const response = isLiked
        ? await likeApi.unlike(blogId)
        : await likeApi.like(blogId);
      setIsLiked(response.liked);
      setLikeCount(response.likeCount);
    } catch (error) {
      // Rollback optimistic update
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
      if (error instanceof ApiError && error.status === 409) {
        // Already liked - set correct state
        setIsLiked(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [blogId, isLiked, likeCount, isLoading, isAuthenticated]);

  return (
    <button
      onClick={handleToggleLike}
      disabled={!isAuthenticated || isLoading}
      className={`flex items-center space-x-1 text-sm transition-colors ${
        isLiked
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-500 hover:text-red-500'
      } ${!isAuthenticated ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
      title={isAuthenticated ? (isLiked ? 'Unlike' : 'Like') : 'Login to like'}
    >
      <svg
        className="w-4 h-4"
        fill={isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{likeCount}</span>
    </button>
  );
}
