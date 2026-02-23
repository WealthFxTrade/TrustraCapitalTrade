// src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
      <h1 className="text-9xl font-bold text-accent">404</h1>
      <h2 className="text-3xl mt-4 mb-8">Page Not Found</h2>
      <p className="text-xl mb-8 text-gray-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-accent text-black px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition"
      >
        Go Back to Home
      </Link>
    </div>
  );
}
