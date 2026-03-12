import { useEffect, useState } from "react";
import { getAllContacts, createContact, updateContact, deleteContact } from "../apis/contacts";
import { FaEnvelope, FaTrash, FaEye, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewContact, setViewContact] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    organizationName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await getAllContacts(1, 100);
      setContacts(res.contacts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete contact?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        await deleteContact(id);
        setContacts(contacts.filter((c) => c._id !== id));
        Swal.fire("Deleted!", "Contact deleted successfully.", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to delete contact", "error");
      }
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateContact(id, { status, isRead: true });
      setContacts(contacts.map((c) => (c._id === id ? { ...c, status, isRead: true } : c)));
      Swal.fire("Updated!", "Status updated successfully.", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await createContact(form);
      setContacts([res.contact, ...contacts]);
      setShowAddModal(false);
      setForm({ organizationName: "", email: "", phone: "", subject: "", message: "" });
      Swal.fire("Success!", "Contact added successfully.", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to add contact", "error");
    }
  };

  if (loading) return <div className="text-center p-8" style={{ color: 'var(--text-primary)' }}>Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FaEnvelope /> Contact Messages
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage contact form submissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> <span className="hidden sm:inline">Add Contact</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#4a5568' }}>
        <table className="w-full">
          <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <tr>
              <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>Organization</th>
              <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>Email</th>
              <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>Phone</th>
              <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>Subject</th>
              <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>Status</th>
              <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact._id} className="border-t" style={{ borderColor: '#4a5568' }}>
                <td className="p-3" style={{ color: 'var(--text-primary)' }}>{contact.organizationName}</td>
                <td className="p-3" style={{ color: 'var(--text-primary)' }}>{contact.email}</td>
                <td className="p-3" style={{ color: 'var(--text-primary)' }}>{contact.phone}</td>
                <td className="p-3" style={{ color: 'var(--text-primary)' }}>{contact.subject}</td>
                <td className="p-3">
                  <select
                    value={contact.status || "pending"}
                    onChange={(e) => handleStatusUpdate(contact._id, e.target.value)}
                    className="px-2 py-1 rounded border text-sm"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      borderColor: '#4a5568',
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewContact(contact)}
                      className="p-1.5 text-sm rounded hover:bg-blue-600 text-white bg-blue-500"
                      title="View"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleDelete(contact._id)}
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

      {viewContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setViewContact(null)}>
          <div
            className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Contact Details</h2>
            <div className="space-y-3" style={{ color: 'var(--text-primary)' }}>
              <p><strong>Organization:</strong> {viewContact.organizationName}</p>
              <p><strong>Email:</strong> {viewContact.email}</p>
              <p><strong>Phone:</strong> {viewContact.phone}</p>
              <p><strong>Subject:</strong> {viewContact.subject}</p>
              <p><strong>Message:</strong> {viewContact.message}</p>
              <p><strong>Status:</strong> {viewContact.status || "pending"}</p>
            </div>
            <button
              onClick={() => setViewContact(null)}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div
            className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Add Contact</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <input
                type="text"
                placeholder="Organization Name"
                value={form.organizationName}
                onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                required
                className="w-full p-2 rounded border"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: '#4a5568' }}
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full p-2 rounded border"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: '#4a5568' }}
              />
              <input
                type="tel"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                className="w-full p-2 rounded border"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: '#4a5568' }}
              />
              <input
                type="text"
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                className="w-full p-2 rounded border"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: '#4a5568' }}
              />
              <textarea
                placeholder="Message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows="4"
                className="w-full p-2 rounded border"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: '#4a5568' }}
              />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Add Contact
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
