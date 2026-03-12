import { useEffect, useState } from "react";
import { getAllConsultations, createConsultation, updateConsultation, deleteConsultation } from "../apis/consultations";
import { FaCalendar, FaTrash, FaEye, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Consultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewConsultation, setViewConsultation] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    mobileNumber: "",
    service: "campaign",
    consultant: "sanjay",
    selectedDate: "",
  });

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const res = await getAllConsultations(1, 100);
      setConsultations(res.consultations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete consultation?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        await deleteConsultation(id);
        setConsultations(consultations.filter((c) => c._id !== id));
        Swal.fire("Deleted!", "Consultation deleted successfully.", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to delete consultation", "error");
      }
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateConsultation(id, { status });
      setConsultations(consultations.map((c) => (c._id === id ? { ...c, status } : c)));
      Swal.fire("Updated!", "Status updated successfully.", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await createConsultation(form);
      setConsultations([res.consultation, ...consultations]);
      setShowAddModal(false);
      setForm({ fullName: "", mobileNumber: "", service: "campaign", consultant: "sanjay", selectedDate: "" });
      Swal.fire("Success!", "Consultation added successfully.", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to add consultation", "error");
    }
  };

  if (loading) return <div className="text-center p-8" style={{ color: 'var(--text-primary)' }}>Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FaCalendar /> Consultation Bookings
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage consultation requests</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> <span className="hidden sm:inline">Add Consultation</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#4a5568' }}>
        <table className="w-full">
          <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <tr>
              <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>Name</th>
              <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>Mobile</th>
              <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>Service</th>
              <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>Consultant</th>
              <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>Date</th>
              <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>Status</th>
              <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {consultations.map((consultation) => (
              <tr key={consultation._id} className="border-t" style={{ borderColor: '#4a5568' }}>
                <td className="p-3" style={{ color: 'var(--text-primary)' }}>{consultation.fullName}</td>
                <td className="p-3" style={{ color: 'var(--text-primary)' }}>{consultation.mobileNumber}</td>
                <td className="p-3" style={{ color: 'var(--text-primary)' }}>{consultation.service}</td>
                <td className="p-3" style={{ color: 'var(--text-primary)' }}>{consultation.consultant}</td>
                <td className="p-3" style={{ color: 'var(--text-primary)' }}>
                  {new Date(consultation.selectedDate).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <select
                    value={consultation.status || "pending"}
                    onChange={(e) => handleStatusUpdate(consultation._id, e.target.value)}
                    className="px-2 py-1 rounded border text-sm"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      borderColor: '#4a5568',
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewConsultation(consultation)}
                      className="p-1.5 text-sm rounded hover:bg-blue-600 text-white bg-blue-500"
                      title="View"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleDelete(consultation._id)}
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

      {viewConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setViewConsultation(null)}>
          <div
            className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Consultation Details</h2>
            <div className="space-y-3" style={{ color: 'var(--text-primary)' }}>
              <p><strong>Name:</strong> {viewConsultation.fullName}</p>
              <p><strong>Mobile:</strong> {viewConsultation.mobileNumber}</p>
              <p><strong>Service:</strong> {viewConsultation.service}</p>
              <p><strong>Consultant:</strong> {viewConsultation.consultant}</p>
              <p><strong>Date:</strong> {new Date(viewConsultation.selectedDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {viewConsultation.status || "pending"}</p>
              {viewConsultation.notes && <p><strong>Notes:</strong> {viewConsultation.notes}</p>}
            </div>
            <button
              onClick={() => setViewConsultation(null)}
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
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Add Consultation</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
                className="w-full p-2 rounded border"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: '#4a5568' }}
              />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={form.mobileNumber}
                onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                required
                className="w-full p-2 rounded border"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: '#4a5568' }}
              />
              <select
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                className="w-full p-2 rounded border"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: '#4a5568' }}
              >
                <option value="campaign">Campaign</option>
                <option value="branding">Branding</option>
                <option value="marketing">Marketing</option>
              </select>
              <select
                value={form.consultant}
                onChange={(e) => setForm({ ...form, consultant: e.target.value })}
                className="w-full p-2 rounded border"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: '#4a5568' }}
              >
                <option value="sanjay">Sanjay</option>
                <option value="rahul">Rahul</option>
                <option value="priya">Priya</option>
              </select>
              <input
                type="date"
                value={form.selectedDate}
                onChange={(e) => setForm({ ...form, selectedDate: e.target.value })}
                required
                className="w-full p-2 rounded border"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: '#4a5568' }}
              />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Add Consultation
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
