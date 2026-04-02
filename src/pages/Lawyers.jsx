import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getAllLawyersWithServices,
  getServicesByLawyer,
  registerLawyer,
  updateLawyer,
  toggleLawyerStatus,
  deleteLawyer,
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
  FaIdCard,
} from "react-icons/fa";
import Swal from "sweetalert2";

const emptyForm = {
  registration_type: "Individual",
  full_name: "",
  mobile_number: "",
  email: "",
  password: "",
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
  // Firm / Association
  firm_name: "",
  firm_registration_number: "",
  firm_email: "",
};

export default function Lawyers() {
  const { isDark } = useTheme();
  const { isLoggedIn } = useAuth();

  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewLawyer, setViewLawyer] = useState(null);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [search, setSearch] = useState("");
  const [showServicesOnly, setShowServicesOnly] = useState(false);

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllLawyersWithServices();
      const all = res.lawyers || [];
      setLawyers(showServicesOnly ? all.filter(l => l.services?.length > 0) : all);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load lawyers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLawyers(); }, [showServicesOnly]);

  const resetForm = () => { setForm(emptyForm); setEditing(null); };

  const openAddModal = () => {
    resetForm();
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleEdit = (lawyer) => {
    setEditing(lawyer);
    setForm({
      registration_type: lawyer.registration_type || "Individual",
      full_name: lawyer.full_name || "",
      mobile_number: lawyer.mobile_number || "",
      email: lawyer.email || "",
      password: "",
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
      firm_name: lawyer.firm_name || "",
      firm_registration_number: lawyer.firm_registration_number || "",
      firm_email: lawyer.firm_email || "",
    });
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleDelete = async (lawyer) => {
    const lawyerId = lawyer._id || lawyer.id;
    const result = await Swal.fire({
      title: `Delete "${lawyer.full_name}"?`,
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
      await deleteLawyer(lawyerId);
      await fetchLawyers();
      Swal.fire({ icon: "success", title: "Deleted", timer: 1500, showConfirmButton: false });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e?.response?.data?.message || e?.message });
    } finally {
      setSaving(false);
    }
  };

  const handleView = async (lawyer) => {
    if (!lawyer.services || lawyer.services.length === 0) {
      try {
        const res = await getServicesByLawyer(lawyer._id || lawyer.id);
        lawyer = { ...lawyer, services: res.services || [] };
      } catch {}
    }
    setViewLawyer(lawyer);
  };

  const handleToggleStatus = async (lawyer) => {
    const lawyerId = lawyer._id || lawyer.id;
    try {
      setSaving(true);
      await toggleLawyerStatus(lawyerId, !lawyer.isActive);
      setLawyers(prev =>
        prev.map(l => (l._id || l.id) === lawyerId ? { ...l, isActive: !l.isActive } : l)
      );
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to update status.");
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
    if (!editing && !form.password) {
      setError("Password is required for new lawyer.");
      return;
    }
    const isFirmType = form.registration_type === "Firm" || form.registration_type === "Association";
    if (isFirmType && (!form.firm_name || !form.firm_registration_number)) {
      setError("Firm name and registration number are required.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      if (editing) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await updateLawyer(editing._id || editing.id, payload);
      } else {
        await registerLawyer(form);
      }
      setIsModalOpen(false);
      resetForm();
      await fetchLawyers();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: editing ? "Lawyer updated successfully." : "Lawyer registered successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to save lawyer.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const filteredLawyers = lawyers.filter(l =>
    (l.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.mobile_number || "").includes(search) ||
    (l.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const isFirmType = form.registration_type === "Firm" || form.registration_type === "Association";

  const inputStyle = {
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
    borderColor: "#4a5568",
  };

  const InputField = ({ label, name, type = "text", required, placeholder, disabled }) => (
    <div>
      <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">
        {label} {required && "*"}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full p-2 rounded border ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        style={inputStyle}
      />
    </div>
  );

  if (loading)
    return <div className="text-center p-8" style={{ color: "var(--text-primary)" }}>Loading...</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <FaUser /> Lawyer Management
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>Manage lawyers and their details</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> <span className="hidden sm:inline">Add Lawyer</span>
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-600 text-white p-4 rounded-lg">
          <h3 className="text-sm font-medium opacity-90">Total Lawyers</h3>
          <p className="text-3xl font-bold mt-2">{lawyers.length}</p>
        </div>
        <div className="bg-green-600 text-white p-4 rounded-lg">
          <h3 className="text-sm font-medium opacity-90">Individual</h3>
          <p className="text-3xl font-bold mt-2">{lawyers.filter(l => l.registration_type === "Individual").length}</p>
        </div>
        <div className="bg-purple-600 text-white p-4 rounded-lg">
          <h3 className="text-sm font-medium opacity-90">Firm</h3>
          <p className="text-3xl font-bold mt-2">{lawyers.filter(l => l.registration_type === "Firm").length}</p>
        </div>
        <div className="bg-orange-600 text-white p-4 rounded-lg">
          <h3 className="text-sm font-medium opacity-90">Association</h3>
          <p className="text-3xl font-bold mt-2">{lawyers.filter(l => l.registration_type === "Association").length}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      {/* Search & Filter */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <FaSearch style={{ color: "var(--text-secondary)" }} />
          <input
            type="text"
            placeholder="Search by name, mobile, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2 rounded border text-sm"
            style={inputStyle}
          />
        </div>
        <button
          onClick={() => setShowServicesOnly(!showServicesOnly)}
          className={`px-4 py-2 rounded text-sm font-medium transition-all ${showServicesOnly ? "bg-blue-600 text-white" : "bg-gray-600 text-white"}`}
        >
          {showServicesOnly ? "Show All" : "With Services"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "#4a5568" }}>
        <table className="w-full">
          <thead style={{ backgroundColor: "var(--bg-secondary)" }}>
            <tr>
              {["Name", "Mobile", "Type", "Specialization", "City", "Services", "Status", "Actions"].map(h => (
                <th key={h} className="p-3 text-left" style={{ color: "var(--text-primary)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredLawyers.map((lawyer) => (
              <tr key={lawyer._id || lawyer.id} className="border-t" style={{ borderColor: "#4a5568" }}>
                <td className="p-3" style={{ color: "var(--text-primary)" }}>{lawyer.full_name}</td>
                <td className="p-3" style={{ color: "var(--text-primary)" }}>{lawyer.mobile_number}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs text-white ${
                    lawyer.registration_type === "Individual" ? "bg-blue-600" :
                    lawyer.registration_type === "Firm" ? "bg-purple-600" : "bg-orange-600"
                  }`}>
                    {lawyer.registration_type || "Individual"}
                  </span>
                </td>
                <td className="p-3" style={{ color: "var(--text-primary)" }}>{lawyer.specialization}</td>
                <td className="p-3" style={{ color: "var(--text-primary)" }}>{lawyer.city}</td>
                <td className="p-3">
                  {lawyer.services?.length > 0 ? (
                    <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">{lawyer.services.length} Services</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-600 text-white rounded text-xs">None</span>
                  )}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleToggleStatus(lawyer)}
                    disabled={saving}
                    className="flex items-center gap-1 px-2 py-1 rounded text-sm"
                    style={{ backgroundColor: lawyer.isActive ? "#10b981" : "#ef4444", color: "white" }}
                  >
                    {lawyer.isActive ? <FaToggleOn /> : <FaToggleOff />}
                    {lawyer.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleView(lawyer)} className="p-1.5 rounded bg-blue-500 hover:bg-blue-600 text-white" title="View"><FaEye /></button>
                    <button onClick={() => navigate(`/lawyers/${lawyer._id || lawyer.id}/profile`)} className="p-1.5 rounded bg-green-500 hover:bg-green-600 text-white" title="View Profile"><FaIdCard /></button>
                    <button onClick={() => handleEdit(lawyer)} className="p-1.5 rounded bg-yellow-500 hover:bg-yellow-600 text-white" title="Edit"><FaEdit /></button>
                    <button onClick={() => handleDelete(lawyer)} disabled={saving} className="p-1.5 rounded bg-red-500 hover:bg-red-600 text-white" title="Delete"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {viewLawyer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => { setViewLawyer(null); setShowServicesModal(false); }}>
          <div className="p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} style={{ backgroundColor: "var(--bg-secondary)" }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Lawyer Details</h2>
            <div className="space-y-2" style={{ color: "var(--text-primary)" }}>
              {[
                ["Name", viewLawyer.full_name],
                ["Registration Type", viewLawyer.registration_type],
                ["Email", viewLawyer.email],
                ["Mobile", viewLawyer.mobile_number],
                ["Specialization", viewLawyer.specialization],
                ["Classification", viewLawyer.classification],
                ["Sub Classification", viewLawyer.sub_classification],
                ["Experience", viewLawyer.years_of_experience && `${viewLawyer.years_of_experience} years`],
                ["Bar Council Number", viewLawyer.bar_council_number],
                ["Bar Council State", viewLawyer.bar_council_state],
                ["Consultation Fee", viewLawyer.consultation_fee && `₹${viewLawyer.consultation_fee}`],
                ["City", viewLawyer.city],
                ["State", viewLawyer.state],
                ["Pincode", viewLawyer.pincode],
                ["Office Address", viewLawyer.office_address],
                ["Status", viewLawyer.isActive ? "Active" : "Inactive"],
                ["About", viewLawyer.about_lawyer],
                ...(viewLawyer.registration_type !== "Individual" ? [
                  ["Firm Name", viewLawyer.firm_name],
                  ["Firm Registration", viewLawyer.firm_registration_number],
                  ["Firm Email", viewLawyer.firm_email],
                ] : []),
              ].filter(([, v]) => v).map(([label, value]) => (
                <p key={label}><strong>{label}:</strong> {value}</p>
              ))}
              {viewLawyer.services?.length > 0 && (
                <div>
                  <strong>Services:</strong> {viewLawyer.services.length} added
                  <br />
                  <button onClick={() => setShowServicesModal(true)} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                    View Services
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => { setViewLawyer(null); setShowServicesModal(false); }} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Services Modal */}
      {showServicesModal && viewLawyer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowServicesModal(false)}>
          <div className="rounded-lg w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()} style={{ backgroundColor: "var(--bg-secondary)" }}>
            <div className="p-6 border-b" style={{ borderColor: "#4a5568" }}>
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Services for {viewLawyer.full_name} ({viewLawyer.services?.length || 0})
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full border-collapse">
                <thead style={{ backgroundColor: "var(--bg-primary)" }} className="sticky top-0">
                  <tr>
                    {["Service Name", "Description", "Price", "Duration"].map(h => (
                      <th key={h} className="p-3 text-left text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {viewLawyer.services.map((s, i) => (
                    <tr key={s._id || i} className="border-t" style={{ borderColor: "#4a5568", backgroundColor: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                      <td className="p-3" style={{ color: "var(--text-primary)" }}><strong>{s.service_name}</strong></td>
                      <td className="p-3 text-sm" style={{ color: "var(--text-secondary)" }}>{s.description || "-"}</td>
                      <td className="p-3"><span className="px-2 py-1 bg-green-600 text-white rounded text-xs">₹{s.price || "N/A"}</span></td>
                      <td className="p-3" style={{ color: "var(--text-primary)" }}>{s.duration || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t" style={{ borderColor: "#4a5568" }}>
              <button onClick={() => setShowServicesModal(false)} className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()} style={{ backgroundColor: "var(--bg-secondary)" }}>
            <div className="p-6 border-b" style={{ borderColor: "#4a5568" }}>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {editing ? "Edit Lawyer" : "Add Lawyer"}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Registration Type */}
                <div>
                  <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">Registration Type *</label>
                  <select name="registration_type" value={form.registration_type} onChange={handleChange} className="w-full p-2 rounded border" style={inputStyle}>
                    <option value="Individual">Individual</option>
                    <option value="Firm">Firm</option>
                    <option value="Association">Association</option>
                  </select>
                </div>

                {/* 2-column grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left */}
                  <div className="space-y-4">
                    <InputField label="Full Name" name="full_name" required placeholder="Enter full name" />
                    <InputField label="Email (Gmail)" name="email" type="email" required placeholder="name@gmail.com" />
                    <InputField label="Mobile Number" name="mobile_number" type="tel" required={!editing} placeholder="10-digit mobile number" />
                    {!editing && <InputField label="Password" name="password" type="password" required placeholder="Min 8 chars" />}
                    <InputField label="Specialization" name="specialization" required placeholder="e.g., Criminal Law" />
                    <div>
                      <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">Classification</label>
                      <select name="classification" value={form.classification} onChange={handleChange} className="w-full p-2 rounded border" style={inputStyle}>
                        <option value="">Select Classification</option>
                        <option value="Civil">Civil</option>
                        <option value="Criminal">Criminal</option>
                        <option value="Corporate">Corporate</option>
                      </select>
                    </div>
                    {form.classification === "Civil" && (
                      <InputField label="Sub Classification" name="sub_classification" placeholder="Enter sub classification" />
                    )}
                    <InputField label="Years of Experience" name="years_of_experience" type="number" placeholder="e.g., 10" />
                  </div>

                  {/* Right */}
                  <div className="space-y-4">
                    <InputField label="Consultation Fee (₹)" name="consultation_fee" type="number" placeholder="e.g., 5000" />
                    <InputField label="Bar Council Number" name="bar_council_number" placeholder="Enter bar council number" />
                    <InputField label="Bar Council State" name="bar_council_state" placeholder="Enter bar council state" />
                    <div>
                      <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">Office Address</label>
                      <textarea name="office_address" value={form.office_address} onChange={handleChange} rows="3" className="w-full p-2 rounded border" style={inputStyle} placeholder="Enter office address" />
                    </div>
                  </div>
                </div>

                {/* City / State / Pincode */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField label="City" name="city" placeholder="City" />
                  <InputField label="State" name="state" placeholder="State" />
                  <InputField label="Pincode" name="pincode" placeholder="Pincode" />
                </div>

                {/* Firm / Association Fields */}
                {isFirmType && (
                  <div className="border rounded-lg p-4 space-y-4" style={{ borderColor: "#4a5568" }}>
                    <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {form.registration_type} Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InputField label={`${form.registration_type} Name`} name="firm_name" required placeholder={`Enter ${form.registration_type.toLowerCase()} name`} />
                      <InputField label="Registration Number" name="firm_registration_number" required placeholder="Enter registration number" />
                      <InputField label={`${form.registration_type} Email (Gmail)`} name="firm_email" type="email" placeholder="firm@gmail.com" />
                    </div>
                  </div>
                )}

                {/* About */}
                <div>
                  <label style={{ color: "var(--text-primary)" }} className="block mb-2 text-sm font-medium">About Lawyer</label>
                  <textarea name="about_lawyer" value={form.about_lawyer} onChange={handleChange} rows="3" className="w-full p-2 rounded border" style={inputStyle} placeholder="Brief description about the lawyer" />
                </div>

                {error && (
                  <div className="p-3 rounded text-sm" style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}>
                    {error}
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold">
                    {saving ? "Saving..." : editing ? "Update Lawyer" : "Register Lawyer"}
                  </button>
                  <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold">
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
