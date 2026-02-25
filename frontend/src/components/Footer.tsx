import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <img
                src="/logo.jpeg"
                alt="Whispr"
                width={28}
                height={28}
                className="rounded-lg"
              />
              <span className="text-lg font-bold text-red-500">
                Whispr
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
              A modern, secure blog platform. Share your thoughts, engage with the community,
              and build your audience — one story at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-200 mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/feed" className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                  Explore Feed
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {currentYear} Whispr. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span>Made with</span>
            <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}
