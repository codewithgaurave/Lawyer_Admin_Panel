import { memo } from "react";
import { useTheme } from "../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";

const Header = memo(({ toggleSidebar, currentPageTitle }) => {
  const { isDark, setIsDark } = useTheme();

  return (
    <header
      className="h-16 flex items-center justify-between px-4 border-b backdrop-blur-sm sticky top-0 z-40"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: '#4a5568',
      }}
    >
      <div className="flex items-center min-w-0 flex-1">
        <button
          onClick={toggleSidebar}
          className="lg:hidden mr-3 p-1.5 rounded-md hover:scale-110 transition-all duration-200"
          style={{
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-primary)'
          }}
          aria-label="Open sidebar"
        >
          <span className="text-base">☰</span>
        </button>
        <h2
          className="text-sm font-semibold truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {currentPageTitle}
        </h2>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-md border hover:scale-110 transition-all duration-300 group"
          style={{
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            borderColor: '#4a5568',
          }}
          aria-label="Toggle theme"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? (
            <FaSun className="text-sm group-hover:rotate-180 transition-transform duration-300" />
          ) : (
            <FaMoon className="text-sm group-hover:rotate-180 transition-transform duration-300" />
          )}
        </button>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
export default Header;
