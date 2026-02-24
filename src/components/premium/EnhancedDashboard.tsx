export default function EnhancedDashboard({ onNavigate }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome Back!</h1>
        <button
          onClick={() => onNavigate('find-ride')}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
        >
          Book a Ride
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-sm opacity-90 mb-2">Total Trips</h3>
          <p className="text-4xl font-bold">0</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-sm opacity-90 mb-2">Total Spent</h3>
          <p className="text-4xl font-bold">AED 0</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-sm opacity-90 mb-2">Rating</h3>
          <p className="text-4xl font-bold">5.0 ⭐</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-sm opacity-90 mb-2">Savings</h3>
          <p className="text-4xl font-bold">AED 0</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <p className="text-gray-500">No recent trips. Book your first ride!</p>
      </div>
    </div>
  );
}
