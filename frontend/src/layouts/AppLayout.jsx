// src/layouts/AppLayout.jsx
import Navbar from '@/components/Navbar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8 md:px-8 md:py-12">
        {children}
      </main>
    </div>
  );
}
