import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  getAllLawyers,
  getLawyerById,
  updateLawyer,
  toggleLawyerStatus,
  deleteLawyer,
  getAllLawyersWithServices,
  getServicesByLawyer,
} from "../apis/lawyers";
import {
  FaUser,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaToggleOn,
  FaToggleOff,
  FaSearch,
} from "react-icons/fa";
import Swal from "sweetalert2";

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN") : "-";

export default function Lawyers() {
  const { isDark } = useTheme();
  const { isLoggedIn } = useAuth();

  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    mobile_number: "",
    email: "",
    specialization: "",
    years_of_experience: "",
    consultation_fee: "",
    bar_council_number: "",
    bar_council_state: "",
    classification: "",
    sub_classification: "",
    office_address: "",
    city: "",
    state: "",
    pincode: "",
    about_lawyer: "",
  });

  const [editing, setEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewLawyer, setViewLawyer] = useState(null);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showServicesOnly, setShowServicesOnly] = useState(false);

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      setError("");
      // Always fetch with services to show service count
      const res = await getAllLawyersWithServices();
      
      // Filter if showServicesOnly is true
      const allLawyers = res.lawyers || [];
      const filteredData = showServicesOnly 
        ? allLawyers.filter(l => l.services && l.services.length > 0)
        : allLawyers;
      
      setLawyers(filteredData);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to load lawyers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyers();
  }, [showServicesOnly]);

  const resetForm = () => {
    setForm({
      full_name: "",
      mobile_number: "",
      email: "",
      specialization: "",
      years_of_experience: "",
      consultation_fee: "",
      bar_council_number: "",
      bar_council_state: "",
      classification: "",
      sub_classification: "",
      office_address: "",
      city: "",
      state: "",
      pincode: "",
      about_lawyer: "",
    });
    setEditing(null);
  };

  const openAddModal = () => {
    resetForm();
    setError("");
    setSuccess("");
    setIsModalOpen(true);
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

  const handleEdit = (lawyer) => {
    setEditing(lawyer);
    setForm({
      full_name: lawyer.full_name || "",
      mobile_number: lawyer.mobile_number || "",
      email: lawyer.email || "",
      specialization: lawyer.specialization || "",
      years_of_experience: lawyer.years_of_experience || "",
      consultation_fee: lawyer.consultation_fee || "",
      bar_council_number: lawyer.bar_council_number || "",
      bar_council_state: lawyer.bar_council_state || "",
      classification: lawyer.classification || "",
      sub_classification: lawyer.sub_classification || "",
      office_address: lawyer.office_address || "",
      city: lawyer.city || "",
      state: lawyer.state || "",
      pincode: lawyer.pincode || "",
      about_lawyer: lawyer.about_lawyer || "",
    });
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleDelete = async (lawyer) => {
    if (!isLoggedIn) {
      setError("You must be logged in as admin to delete lawyers.");
      return;
    }

    const lawyerId = lawyer._id || lawyer.id;
    if (!lawyerId) {
      setError("Cannot delete this lawyer (missing ID).");
      return;
    }

    const result = await Swal.fire({
      title: `Delete lawyer "${lawyer.full_name || lawyer.name}"?`,
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
      await deleteLawyer(lawyerId);
      setSuccess("Lawyer deleted successfully.");
      await fetchLawyers();
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Lawyer deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to delete lawyer.";
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

  const handleView = async (lawyer) => {
    // Fetch services if not already attached
    if (!lawyer.services || lawyer.services.length === 0) {
      try {
        const res = await getServicesByLawyer(lawyer._id || lawyer.id);
        lawyer = { ...lawyer, services: res.services || [] };
      } catch (err) {
        console.error("failed to fetch lawyer services", err);
      }
    }
    setViewLawyer(lawyer);
  };

  const handleToggleStatus = async (lawyer) => {
    if (!isLoggedIn) {
      setError("You must be logged in as admin to change status.");
      return;
    }

    const lawyerId = lawyer._id || lawyer.id;
    if (!lawyerId) {
      setError("Cannot update this lawyer (missing ID).");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await toggleLawyerStatus(lawyerId, !lawyer.isActive);

      setLawyers((prev) =>
        prev.map((l) =>
          (l._id || l.id) === lawyerId
            ? { ...l, isActive: !l.isActive }
            : l
        )
      );

      setSuccess(
        `Lawyer ${!lawyer.isActive ? "activated" : "deactivated"} successfully.`
      );
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to update lawyer status.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.full_name || !form.email || !form.specialization) {
      setError("Please fill in required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editing) {
        const lawyerId = editing._id || editing.id;
        await updateLawyer(lawyerId, form);
        setSuccess("Lawyer updated successfully.");
      } else {
        setSuccess("Lawyer operation completed.");
      }

      setIsModalOpen(false);
      resetForm();
      await fetchLawyers();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: editing ? "Lawyer updated successfully." : "Operation completed.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to save lawyer.";
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

  const filteredLawyers = lawyers.filter((lawyer) =>
    (lawyer.full_name || "")
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
            <FaUser /> Lawyer Management
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage lawyers and their details
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> <span className="hidden sm:inline">Add Lawyer</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-600 text-white p-4 rounded-lg">
            <h3 className="text-sm font-medium opacity-90">Total Lawyers</h3>
            <p className="text-3xl font-bold mt-2">{lawyers.length}</p>
          </div>
          <div className="bg-green-600 text-white p-4 rounded-lg">
            <h3 className="text-sm font-medium opacity-90">Total Services</h3>
            <p className="text-3xl font-bold mt-2">
              {lawyers.reduce((sum, l) => sum + (l.services?.length || 0), 0)}
            </p>
          </div>
          <div className="bg-purple-600 text-white p-4 rounded-lg">
            <h3 className="text-sm font-medium opacity-90">Lawyers with Services</h3>
            <p className="text-3xl font-bold mt-2">
              {lawyers.filter(l => l.services && l.services.length > 0).length}
            </p>
          </div>
          <div className="bg-orange-600 text-white p-4 rounded-lg">
            <h3 className="text-sm font-medium opacity-90">Active Lawyers</h3>
            <p className="text-3xl font-bold mt-2">
              {lawyers.filter(l => l.isActive).length}
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

      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <FaSearch style={{ color: "var(--text-secondary)" }} />
          <input
            type="text"
            placeholder="Search lawyers..."
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
        <button
          onClick={() => setShowServicesOnly(!showServicesOnly)}
          className={`px-4 py-2 rounded text-sm font-medium transition-all ${
            showServicesOnly ? "bg-blue-600 text-white" : "bg-gray-600 text-white"
          }`}
        >
          {showServicesOnly ? "Show All Lawyers" : "Show With Services"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "#4a5568" }}>
        <table className="w-full">
          <thead style={{ backgroundColor: "var(--bg-secondary)" }}>
            <tr>
              <th className="p-3 text-left" style={{ color: "var(--text-primary)" }}>
                Name
              </th>
              <th className="p-3 text-left" style={{ color: "var(--text-primary)" }}>
                Mobile
              </th>
              <th className="p-3 text-left" style={{ color: "var(--text-primary)" }}>
                Specialization
              </th>
              <th className="p-3 text-left" style={{ color: "var(--text-primary)" }}>
                Experience
              </th>
              <th className="p-3 text-left" style={{ color: "var(--text-primary)" }}>
                City
              </th>
              <th className="p-3 text-left" style={{ color: "var(--text-primary)" }}>
                Services
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
            {filteredLawyers.map((lawyer) => (
              <tr key={lawyer._id || lawyer.id} className="border-t" style={{ borderColor: "#4a5568" }}>
                <td className="p-3" style={{ color: "var(--text-primary)" }}>
                  {lawyer.full_name}
                </td>
                <td className="p-3" style={{ color: "var(--text-primary)" }}>
                  {lawyer.mobile_number}
                </td>
                <td className="p-3" style={{ color: "var(--text-primary)" }}>
                  {lawyer.specialization}
                </td>
                <td className="p-3" style={{ color: "var(--text-primary)" }}>
                  {lawyer.years_of_experience} years
                </td>
                <td className="p-3" style={{ color: "var(--text-primary)" }}>
                  {lawyer.city}
                </td>
                <td className="p-3" style={{ color: "var(--text-primary)" }}>
                  {lawyer.services && lawyer.services.length > 0 ? (
                    <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                      {lawyer.services.length} Services
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-600 text-white rounded text-xs">
                      No Services
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleToggleStatus(lawyer)}
                    disabled={saving}
                    className="flex items-center gap-1 px-2 py-1 rounded text-sm transition-all"
                    style={{
                      backgroundColor: lawyer.isActive ? "#10b981" : "#ef4444",
                      color: "white",
                    }}
                  >
                    {lawyer.isActive ? <FaToggleOn /> : <FaToggleOff />}
                    {lawyer.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(lawyer)}
                      className="p-1.5 text-sm rounded hover:bg-blue-600 text-white bg-blue-500"
                      title="View"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEdit(lawyer)}
                      className="p-1.5 text-sm rounded hover:bg-yellow-600 text-white bg-yellow-500"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(lawyer)}
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
      {viewLawyer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setViewLawyer(null);
            setShowServicesModal(false);
          }}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Lawyer Details
            </h2>
            <div className="space-y-3" style={{ color: "var(--text-primary)" }}>
              <p>
                <strong>Name:</strong> {viewLawyer.full_name}
              </p>
              <p>
                <strong>Email:</strong> {viewLawyer.email}
              </p>
              <p>
                <strong>Mobile:</strong> {viewLawyer.mobile_number}
              </p>
              <p>
                <strong>Specialization:</strong> {viewLawyer.specialization}
              </p>
              <p>
                <strong>Classification:</strong> {viewLawyer.classification}
              </p>
              {viewLawyer.sub_classification && (
                <p>
                  <strong>Sub Classification:</strong> {viewLawyer.sub_classification}
                </p>
              )}
              <p>
                <strong>Experience:</strong> {viewLawyer.years_of_experience} years
              </p>
              <p>
                <strong>Bar Council Number:</strong> {viewLawyer.bar_council_number}
              </p>
              <p>
                <strong>Bar Council State:</strong> {viewLawyer.bar_council_state}
              </p>
              <p>
                <strong>City:</strong> {viewLawyer.city}
              </p>
              <p>
                <strong>State:</strong> {viewLawyer.state}
              </p>
              <p>
                <strong>Pincode:</strong> {viewLawyer.pincode}
              </p>
              <p>
                <strong>Office Address:</strong> {viewLawyer.office_address}
              </p>
              <p>
                <strong>Status:</strong> {viewLawyer.isActive ? "Active" : "Inactive"}
              </p>
              {viewLawyer.about_lawyer && (
                <p>
                  <strong>About:</strong> {viewLawyer.about_lawyer}
                </p>
              )}
              {viewLawyer.consultation_fee && (
                <p>
                  <strong>Consultation Fee:</strong> ₹{viewLawyer.consultation_fee}
                </p>
              )}
              {viewLawyer.languages_spoken && viewLawyer.languages_spoken.length > 0 && (
                <p>
                  <strong>Languages:</strong> {viewLawyer.languages_spoken.join(", ")}
                </p>
              )}
              {viewLawyer.services && viewLawyer.services.length > 0 && (
                <div>
                  <strong>Services:</strong> {viewLawyer.services.length} added
                  <br />
                  <button
                    onClick={() => setShowServicesModal(true)}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    View Services
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setViewLawyer(null);
                setShowServicesModal(false);
              }}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Services List Modal */}
      {showServicesModal && viewLawyer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowServicesModal(false)}
        >
          <div
            className="rounded-lg w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="p-6 border-b" style={{ borderColor: "#4a5568" }}>
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Services for {viewLawyer.full_name} ({viewLawyer.services?.length || 0})
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {viewLawyer.services && viewLawyer.services.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead style={{ backgroundColor: "var(--bg-primary)" }} className="sticky top-0">
                      <tr>
                        <th className="p-3 text-left text-sm font-semibold" style={{ color: "var(--text-primary)", minWidth: "150px" }}>Service Name</th>
                        <th className="p-3 text-left text-sm font-semibold" style={{ color: "var(--text-primary)", minWidth: "250px" }}>Description</th>
                        <th className="p-3 text-left text-sm font-semibold" style={{ color: "var(--text-primary)", minWidth: "100px" }}>Price</th>
                        <th className="p-3 text-left text-sm font-semibold" style={{ color: "var(--text-primary)", minWidth: "120px" }}>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewLawyer.services.map((service, index) => (
                        <tr 
                          key={service._id || service.id} 
                          className="border-t hover:bg-opacity-50" 
                          style={{ 
                            borderColor: "#4a5568",
                            backgroundColor: index % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)"
                          }}
                        >
                          <td className="p-3" style={{ color: "var(--text-primary)" }}>
                            <strong>{service.service_name}</strong>
                          </td>
                          <td className="p-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                            {service.description || '-'}
                          </td>
                          <td className="p-3" style={{ color: "var(--text-primary)" }}>
                            <span className="px-2 py-1 bg-green-600 text-white rounded text-xs font-semibold">
                              ₹{service.price || 'N/A'}
                            </span>
                          </td>
                          <td className="p-3" style={{ color: "var(--text-primary)" }}>
                            {service.duration || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p style={{ color: "var(--text-secondary)", fontSize: "16px", fontStyle: "italic" }}>
                    No services added yet
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t" style={{ borderColor: "#4a5568" }}>
              <button
                onClick={() => setShowServicesModal(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
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
            className="rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="p-6 border-b" style={{ borderColor: "#4a5568" }}>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {editing ? "Edit Lawyer" : "Add Lawyer"}
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
            <form onSubmit={handleSubmit} className="space-y-6" id="lawyer-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
              <div>
                <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 rounded border"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    borderColor: "#4a5568",
                  }}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full p-2 rounded border"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    borderColor: "#4a5568",
                  }}
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile_number"
                  value={form.mobile_number}
                  onChange={handleChange}
                  className="w-full p-2 rounded border"
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
                  Specialization *
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  required
                  className="w-full p-2 rounded border"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    borderColor: "#4a5568",
                  }}
                  placeholder="e.g., Criminal Law"
                />
              </div>

              <div>
                <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">
                  Classification
                </label>
                <select
                  name="classification"
                  value={form.classification}
                  onChange={handleChange}
                  className="w-full p-2 rounded border"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    borderColor: "#4a5568",
                  }}
                >
                  <option value="">Select Classification</option>
                  <option value="Civil">Civil</option>
                  <option value="Criminal">Criminal</option>
                  <option value="Corporate">Corporate</option>
                </select>
              </div>

              {form.classification === "Civil" && (
                <div>
                  <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">
                    Sub Classification
                  </label>
                  <input
                    type="text"
                    name="sub_classification"
                    value={form.sub_classification}
                    onChange={handleChange}
                    className="w-full p-2 rounded border"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      borderColor: "#4a5568",
                    }}
                    placeholder="Enter sub classification"
                  />
                </div>
              )}

              <div>
                <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="years_of_experience"
                  value={form.years_of_experience}
                  onChange={handleChange}
                  className="w-full p-2 rounded border"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    borderColor: "#4a5568",
                  }}
                  placeholder="Enter years of experience"
                />
              </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">

              <div>
                <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">
                  Consultation Fee
                </label>
                <input
                  type="number"
                  name="consultation_fee"
                  value={form.consultation_fee}
                  onChange={handleChange}
                  className="w-full p-2 rounded border"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    borderColor: "#4a5568",
                  }}
                  placeholder="Enter consultation fee"
                />
              </div>

              <div>
                <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">
                  Bar Council Number
                </label>
                <input
                  type="text"
                  name="bar_council_number"
                  value={form.bar_council_number}
                  onChange={handleChange}
                  className="w-full p-2 rounded border"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    borderColor: "#4a5568",
                  }}
                  placeholder="Enter bar council number"
                />
              </div>

              <div>
                <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">
                  Bar Council State
                </label>
                <input
                  type="text"
                  name="bar_council_state"
                  value={form.bar_council_state}
                  onChange={handleChange}
                  className="w-full p-2 rounded border"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    borderColor: "#4a5568",
                  }}
                  placeholder="Enter bar council state"
                />
              </div>

              <div>
                <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">
                  Office Address
                </label>
                <textarea
                  name="office_address"
                  value={form.office_address}
                  onChange={handleChange}
                  rows="2"
                  className="w-full p-2 rounded border"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    borderColor: "#4a5568",
                  }}
                  placeholder="Enter office address"
                />
                </div>
              </div>
              </div>

              {/* Full Width Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full p-2 rounded border"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      borderColor: "#4a5568",
                    }}
                    placeholder="City"
                  />
                </div>

                <div>
                  <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full p-2 rounded border"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      borderColor: "#4a5568",
                    }}
                    placeholder="State"
                  />
                </div>

                <div>
                  <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    className="w-full p-2 rounded border"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      borderColor: "#4a5568",
                    }}
                    placeholder="Pincode"
                  />
                </div>
              </div>

              <div>
                <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">
                  About Lawyer
                </label>
                <textarea
                  name="about_lawyer"
                  value={form.about_lawyer}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2 rounded border"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    borderColor: "#4a5568",
                  }}
                  placeholder="Brief description about the lawyer"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors"
                >
                  {saving ? "Saving..." : "Save Lawyer"}
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
