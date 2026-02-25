'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { blogApi, ApiError } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import RichTextEditor from '@/components/RichTextEditor';

export default function NewBlogPage() {
  return (
    <ProtectedRoute>
      <NewBlogContent />
    </ProtectedRoute>
  );
}

function NewBlogContent() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await blogApi.createBlog({ title, content, isPublished });
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create blog');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Create New Blog</h1>
        <p className="text-gray-400 mt-1">Write and publish your thoughts</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl border border-gray-800 p-8 space-y-6">
        {error && (
          <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg">{error}</div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            maxLength={200}
            className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm text-gray-100 bg-gray-800 placeholder-gray-500"
            placeholder="Enter blog title"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">
            Content <span className="text-xs text-gray-500 font-normal ml-1">Markdown supported</span>
          </label>
          <RichTextEditor
            id="content"
            value={content}
            onChange={setContent}
            required
            minLength={10}
            rows={15}
            placeholder="Write your blog content here..."
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            id="isPublished"
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 text-red-600 border-gray-700 rounded focus:ring-red-500 bg-gray-800"
          />
          <label htmlFor="isPublished" className="text-sm text-gray-300">
            Publish immediately (visible on public feed)
          </label>
        </div>

        <div className="flex items-center space-x-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Creating...' : 'Create Blog'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-200 px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
