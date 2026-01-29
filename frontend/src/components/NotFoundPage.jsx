import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-red-500 mb-4">404</h1>
        <p className="text-3xl mb-8">Page Not Found</p>
        <Link
          to="/"
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-lg font-medium transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
