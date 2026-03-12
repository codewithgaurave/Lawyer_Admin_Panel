import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  FaUser,
  FaEdit,
  FaTrash,
  FaEye,
  FaToggleOn,
  FaToggleOff,
  FaSearch,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { getAllUsers, updateUser, deleteUser, toggleUserStatus } from "../apis/users";

export default function Users() {
  const { isDark } = useTheme();
  const { isLoggedIn } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile_number: "",
  });

  const [editing, setEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllUsers();
      setUsers(res.users || []);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      mobile_number: "",
    });
    setEditing(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleEdit = (user) => {
    setEditing(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      mobile_number: user.mobile_number || "",
    });
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleDelete = async (user) => {
    if (!isLoggedIn) {
      setError("You must be logged in as admin to delete users.");
      return;
    }

    const userId = user._id || user.id;
    if (!userId) {
      setError("Cannot delete this user (missing ID).");
      return;
    }

    const result = await Swal.fire({
      title: `Delete user "${user.name || user.mobile_number}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e02424",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await deleteUser(userId);
      setSuccess("User deleted successfully.");
      await fetchUsers();
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "User deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to delete user.";
      setError(msg);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleView = (user) => {
    setViewUser(user);
  };

  const handleToggleStatus = async (user) => {
    if (!isLoggedIn) {
      setError("You must be logged in as admin to change status.");
      return;
    }

    const userId = user._id || user.id;
    if (!userId) {
      setError("Cannot update this user (missing ID).");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await toggleUserStatus(userId, !user.isActive);

      setUsers((prev) =>
        prev.map((u) =>
          (u._id || u.id) === userId
            ? { ...u, isActive: !u.isActive }
            : u
        )
      );

      setSuccess(
        `User ${!user.isActive ? "activated" : "deactivated"} successfully.`
      );
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to update user status.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.mobile_number) {
      setError("Mobile number is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editing) {
        const userId = editing._id || editing.id;
        await updateUser(userId, form);
        setSuccess("User updated successfully.");
      }

      setIsModalOpen(false);
      resetForm();
      await fetchUsers();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "User updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to save user.";
      setError(msg);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    (user.name || user.mobile_number || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="text-center p-8" style={{ color: "var(--text-primary)" }}>
        Loading...
      </div>
    );

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <FaUser /> User Management
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage users and their details
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-600 text-white p-4 rounded-lg">
            <h3 className="text-sm font-medium opacity-90">Total Users</h3>
            <p className="text-3xl font-bold mt-2">{users.length}</p>
          </div>
          <div className="bg-green-600 text-white p-4 rounded-lg">
            <h3 className="text-sm font-medium opacity-90">Active Users</h3>
            <p className="text-3xl font-bold mt-2">
              {users.filter(u => u.isActive).length}
            </p>
          </div>
          <div className="bg-red-600 text-white p-4 rounded-lg">
            <h3 className="text-sm font-medium opacity-90">Inactive Users</h3>
            <p className="text-3xl font-bold mt-2">
              {users.filter(u => !u.isActive).length}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={{
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={{
            backgroundColor: "#dbeafe",
            color: "#1e40af",
            border: "1px solid #93c5fd",
          }}
        >
          {success}
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        <FaSearch style={{ color: "var(--text-secondary)" }} />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 rounded border text-sm"
          style={{
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
            borderColor: "#4a5568",
          }}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "#4a5568" }}>
        <table className="w-full">
          <thead style={{ backgroundColor: "var(--bg-secondary)" }}>
            <tr>
              <th className="p-3 text-left" style={{ color: "var(--text-primary)" }}>
                Name
              </th>
              <th className="p-3 text-left" style={{ color: "var(--text-primary)" }}>
                Mobile Number
              </th>
              <th className="p-3 text-left" style={{ color: "var(--text-primary)" }}>
                Email
              </th>
              <th className="p-3 text-left" style={{ color: "var(--text-primary)" }}>
                Status
              </th>
              <th className="p-3 text-left" style={{ color: "var(--text-primary)" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id || user.id} className="border-t" style={{ borderColor: "#4a5568" }}>
                <td className="p-3" style={{ color: "var(--text-primary)" }}>
                  {user.name || "-"}
                </td>
                <td className="p-3" style={{ color: "var(--text-primary)" }}>
                  {user.mobile_number}
                </td>
                <td className="p-3" style={{ color: "var(--text-primary)" }}>
                  {user.email || "-"}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleToggleStatus(user)}
                    disabled={saving}
                    className="flex items-center gap-1 px-2 py-1 rounded text-sm transition-all"
                    style={{
                      backgroundColor: user.isActive ? "#10b981" : "#ef4444",
                      color: "white",
                    }}
                  >
                    {user.isActive ? <FaToggleOn /> : <FaToggleOff />}
                    {user.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(user)}
                      className="p-1.5 text-sm rounded hover:bg-blue-600 text-white bg-blue-500"
                      title="View"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-1.5 text-sm rounded hover:bg-yellow-600 text-white bg-yellow-500"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      disabled={saving}
                      className="p-1.5 text-sm rounded hover:bg-red-600 text-white bg-red-500"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {viewUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setViewUser(null)}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              User Details
            </h2>
            <div className="space-y-3" style={{ color: "var(--text-primary)" }}>
              <p>
                <strong>Name:</strong> {viewUser.name || "-"}
              </p>
              <p>
                <strong>Mobile Number:</strong> {viewUser.mobile_number}
              </p>
              <p>
                <strong>Email:</strong> {viewUser.email || "-"}
              </p>
              <p>
                <strong>Status:</strong> {viewUser.isActive ? "Active" : "Inactive"}
              </p>
              <p>
                <strong>Created At:</strong> {new Date(viewUser.createdAt).toLocaleString("en-IN")}
              </p>
              <p>
                <strong>Updated At:</strong> {new Date(viewUser.updatedAt).toLocaleString("en-IN")}
              </p>
            </div>
            <button
              onClick={() => setViewUser(null)}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="p-6 border-b" style={{ borderColor: "#4a5568" }}>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                Edit User
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-2 rounded border"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      borderColor: "#4a5568",
                    }}
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobile_number"
                    value={form.mobile_number}
                    onChange={handleChange}
                    required
                    disabled
                    className="w-full p-2 rounded border opacity-60 cursor-not-allowed"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      borderColor: "#4a5568",
                    }}
                    placeholder="Enter mobile number"
                  />
                </div>

                <div>
                  <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-2 rounded border"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      borderColor: "#4a5568",
                    }}
                    placeholder="Enter email"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors"
                  >
                    {saving ? "Saving..." : "Save User"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
