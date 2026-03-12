// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../apis/auth";

const Login = () => {
  const [credentials, setCredentials] = useState({
    adminId: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { setLoginData } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await adminLogin({
        adminId: credentials.adminId.trim(),
        password: credentials.password,
      });

      if (!res || !res.token || !res.admin) {
        throw new Error("Invalid response from server");
      }

      const adminObject = {
        ...res.admin,
        token: res.token,
      };

      setLoginData(adminObject);
      navigate("/lawyers", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl shadow-lg border"
        style={{
          backgroundColor: '#000000',
          borderColor: isDark ? '#4a5568' : '#e2e8f0',
        }}
      >
        <div className="text-center mb-8">
          <div className="w-40 h-40 mx-auto mb-4 flex items-center justify-center bg-white rounded-full">
            <img
              src="/image.png"
              alt="JANNYAYA Logo"
              className="w-32 h-32 object-contain"
            />
          </div>

          <h1 className="text-3xl font-bold mb-2" style={{ color: '#2563eb' }}>
            JANNYAY
          </h1>

          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Admin Panel
          </p>
        </div>

        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-center text-sm"
            style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              border: '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="adminId"
              className="block mb-2 text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Admin ID
            </label>
            <input
              type="text"
              id="adminId"
              name="adminId"
              value={credentials.adminId}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                borderColor: isDark ? '#4a5568' : '#e2e8f0',
              }}
              placeholder="Enter admin ID"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                borderColor: isDark ? '#4a5568' : '#e2e8f0',
              }}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;