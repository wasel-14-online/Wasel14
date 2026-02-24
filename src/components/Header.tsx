export default function Header({ onMenuClick, onNavigate }: any) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between">
      <button onClick={onMenuClick} className="md:hidden p-2">
        <span className="text-2xl">☰</span>
      </button>
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-xl font-semibold">Wassel Ride Sharing</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          🔔
        </button>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          👤
        </button>
      </div>
    </header>
  );
}
