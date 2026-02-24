export default function Sidebar({ currentPage, onNavigate, isOpen, onClose }: any) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'find-ride', label: 'Find Ride', icon: '🚗' },
    { id: 'my-trips', label: 'My Trips', icon: '📋' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <aside className={`bg-white dark:bg-gray-800 w-64 h-full shadow-lg ${isOpen ? 'block' : 'hidden'} md:block`}>
      <div className="p-4">
        <h2 className="text-2xl font-bold text-primary mb-6">Wassel</h2>
        <nav className="space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); onClose(); }}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                currentPage === item.id
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
