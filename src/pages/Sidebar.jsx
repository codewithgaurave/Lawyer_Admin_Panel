import { Link } from "react-router-dom";

const Sidebar = ({ isOpen, onClose, routes, currentPath, logout }) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b" style={{ borderColor: '#4a5568' }}>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              JanNyay Admin
            </h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {routes.map((route) => {
              const Icon = route.icon;
              return (
                <Link
                  key={route.path}
                  to={route.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPath === route.path ? "bg-blue-600 text-white" : "hover:bg-gray-700"
                  }`}
                  style={currentPath !== route.path ? { color: 'var(--text-primary)' } : {}}
                >
                  <Icon className="text-lg" />
                  <span>{route.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t" style={{ borderColor: '#4a5568' }}>
            <button
              onClick={logout}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
