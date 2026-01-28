export default function Dashboard({ token, user, onLogout }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-indigo-400">Dashboard</h1>
        <button
          onClick={onLogout}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium"
        >
          Logout
        </button>
      </header>

      <div className="bg-gray-800 rounded-xl p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl mb-6">Welcome back, {user?.fullName || 'Investor'}!</h2>
        <p className="text-gray-300 mb-4">Current balance: <span className="text-green-400 font-bold">$0.00</span></p>
        <p className="text-gray-400">Active Plan: None</p>
        {/* Add real data fetching here using token */}
      </div>
    </div>
  );
}
