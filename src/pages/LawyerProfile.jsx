import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllLawyers } from "../apis/lawyers";
import {
  getExperiences, addExperience, updateExperience, deleteExperience,
  getCertificates, addCertificate, updateCertificate, deleteCertificate,
  getEducation, addEducation, updateEducation, deleteEducation,
  getSkills, addSkill, updateSkill, deleteSkill,
} from "../apis/profile";
import { FaArrowLeft, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

const TABS = ["Experience", "Certificates", "Education", "Skills"];

const inputStyle = {
  backgroundColor: "var(--bg-primary)",
  color: "var(--text-primary)",
  borderColor: "#4a5568",
  colorScheme: "dark",
};

const Field = ({ label, name, value, onChange, type = "text", required, placeholder }) => (
  <div>
    <label className="block mb-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
      {label}{required && " *"}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full p-2 rounded border text-sm"
      style={inputStyle}
    />
  </div>
);

// ─── Section Component ────────────────────────────────────────────────────────
function Section({ title, items, columns, onAdd, onEdit, onDelete, renderRow, renderForm, formState, setFormState, editing, setEditing, saving, isCertificate }) {
  const [open, setOpen] = useState(false);
  const [certFile, setCertFile] = useState(null);

  const handleClose = () => { setOpen(false); setEditing(null); setFormState({}); setCertFile(null); };
  const handleEdit = (item) => { setEditing(item); setFormState(item); setOpen(true); };
  const handleAdd = () => { setEditing(null); setFormState({}); setOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isCertificate) {
      const fd = new FormData();
      Object.entries(formState).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (certFile) fd.append("certificate_file", certFile);
      editing ? onEdit(editing._id, fd) : onAdd(fd);
    } else {
      editing ? onEdit(editing._id, formState) : onAdd(formState);
    }
    handleClose();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h3>
        <button onClick={handleAdd} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
          <FaPlus /> Add
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm py-4 text-center" style={{ color: "var(--text-secondary)" }}>No {title.toLowerCase()} added yet</p>
      ) : (
        <div className="overflow-x-auto rounded border" style={{ borderColor: "#4a5568" }}>
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "var(--bg-primary)" }}>
              <tr>
                {columns.map(c => (
                  <th key={c} className="p-3 text-left font-medium" style={{ color: "var(--text-primary)" }}>{c}</th>
                ))}
                <th className="p-3 text-left font-medium" style={{ color: "var(--text-primary)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item._id} className="border-t" style={{ borderColor: "#4a5568", backgroundColor: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                  {renderRow(item)}
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(item)} className="p-1.5 rounded bg-yellow-500 hover:bg-yellow-600 text-white"><FaEdit /></button>
                      <button onClick={() => onDelete(item._id)} disabled={saving} className="p-1.5 rounded bg-red-500 hover:bg-red-600 text-white"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
          <div className="rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} style={{ backgroundColor: "var(--bg-secondary)" }}>
            <div className="p-5 border-b" style={{ borderColor: "#4a5568" }}>
              <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {editing ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {renderForm(formState, (e) => setFormState(prev => ({ ...prev, [e.target.name]: e.target.value })))}
              {isCertificate && (
                <div>
                  <label className="block mb-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>Certificate File (Image/PDF)</label>
                  {editing?.certificate_file && !certFile && (
                    <a href={editing.certificate_file} target="_blank" rel="noreferrer" className="block mb-2 text-xs text-blue-400 underline">View current file</a>
                  )}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={e => setCertFile(e.target.files[0])}
                    className="w-full text-sm rounded border p-2"
                    style={{ ...inputStyle, cursor: "pointer" }}
                  />
                  {certFile && <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>Selected: {certFile.name}</p>}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update" : "Add"}
                </button>
                <button type="button" onClick={handleClose} className="flex-1 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LawyerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lawyer, setLawyer] = useState(null);
  const [activeTab, setActiveTab] = useState("Experience");
  const [saving, setSaving] = useState(false);

  const [experiences, setExperiences] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);

  const [expForm, setExpForm] = useState({});
  const [certForm, setCertForm] = useState({});
  const [eduForm, setEduForm] = useState({});
  const [skillForm, setSkillForm] = useState({});

  const [editingExp, setEditingExp] = useState(null);
  const [editingCert, setEditingCert] = useState(null);
  const [editingEdu, setEditingEdu] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllLawyers();
        const found = (res.lawyers || []).find(l => (l._id || l.id) === id);
        setLawyer(found);
      } catch {}
    };
    load();
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    try {
      const [exp, cert, edu, sk] = await Promise.all([
        getExperiences(id), getCertificates(id), getEducation(id), getSkills(id),
      ]);
      setExperiences(exp.experiences || []);
      setCertificates(cert.certificates || []);
      setEducation(edu.education || []);
      setSkills(sk.skills || []);
    } catch {}
  };

  const wrap = async (fn) => {
    try { setSaving(true); await fn(); await fetchAll(); }
    catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Something went wrong";
      Swal.fire({ icon: "error", title: "Error", text: msg });
    }
    finally { setSaving(false); }
  };

  // Certificate uses FormData (multipart)
  const handleAddCert = (formData) => wrap(async () => {
    const res = await import("../apis/http").then(m => m.default.post(`/api/certificates/admin/lawyer/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }));
    return res.data;
  });

  const handleUpdateCert = (cid, formData) => wrap(async () => {
    const res = await import("../apis/http").then(m => m.default.put(`/api/certificates/admin/${cid}`, formData, { headers: { "Content-Type": "multipart/form-data" } }));
    return res.data;
  });

  const confirmDelete = (fn) => Swal.fire({
    title: "Delete this record?",
    text: "This cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e02424",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, delete",
  }).then(r => r.isConfirmed && wrap(fn));

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN") : "-";

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate("/lawyers")} className="flex items-center gap-2 px-3 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 text-sm">
          <FaArrowLeft /> Back
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {lawyer?.full_name || "Lawyer Profile"}
          </h1>
          {lawyer && (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {lawyer.specialization} • {lawyer.city}, {lawyer.state} •{" "}
              <span className={`px-2 py-0.5 rounded text-xs text-white ${lawyer.isActive ? "bg-green-600" : "bg-red-600"}`}>
                {lawyer.isActive ? "Active" : "Inactive"}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Experiences", count: experiences.length, color: "bg-blue-600" },
          { label: "Certificates", count: certificates.length, color: "bg-green-600" },
          { label: "Education", count: education.length, color: "bg-purple-600" },
          { label: "Skills", count: skills.length, color: "bg-orange-600" },
        ].map(s => (
          <div key={s.label} className={`${s.color} text-white p-4 rounded-lg`}>
            <h3 className="text-sm font-medium opacity-90">{s.label}</h3>
            <p className="text-3xl font-bold mt-1">{s.count}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: "#4a5568" }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? "border-b-2 border-blue-500 text-blue-500" : ""}`}
            style={activeTab !== tab ? { color: "var(--text-secondary)" } : {}}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-lg p-5" style={{ backgroundColor: "var(--bg-secondary)" }}>

        {/* EXPERIENCE */}
        {activeTab === "Experience" && (
          <Section
            title="Experiences"
            items={experiences}
            columns={["Job Title", "Company", "Location", "Period", "Current"]}
            saving={saving}
            formState={expForm} setFormState={setExpForm}
            editing={editingExp} setEditing={setEditingExp}
            onAdd={(data) => wrap(() => addExperience(id, data))}
            onEdit={(eid, data) => wrap(() => updateExperience(eid, data))}
            onDelete={(eid) => confirmDelete(() => deleteExperience(eid))}
            renderRow={(item) => (
              <>
                <td className="p-3 font-medium" style={{ color: "var(--text-primary)" }}>{item.job_title}</td>
                <td className="p-3" style={{ color: "var(--text-primary)" }}>{item.company_name}</td>
                <td className="p-3" style={{ color: "var(--text-secondary)" }}>{item.location || "-"}</td>
                <td className="p-3 text-xs" style={{ color: "var(--text-secondary)" }}>{fmtDate(item.start_date)} → {item.is_current ? "Present" : fmtDate(item.end_date)}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs text-white ${item.is_current ? "bg-green-600" : "bg-gray-600"}`}>
                    {item.is_current ? "Yes" : "No"}
                  </span>
                </td>
              </>
            )}
            renderForm={(form, onChange) => (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Job Title" name="job_title" value={form.job_title || ""} onChange={onChange} required placeholder="e.g., Senior Advocate" />
                  <Field label="Company Name" name="company_name" value={form.company_name || ""} onChange={onChange} required placeholder="e.g., Delhi High Court" />
                  <Field label="Location" name="location" value={form.location || ""} onChange={onChange} placeholder="e.g., Delhi" />
                  <div>
                    <label className="block mb-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>Currently Working</label>
                    <select name="is_current" value={form.is_current || false} onChange={onChange} className="w-full p-2 rounded border text-sm" style={inputStyle}>
                      <option value={false}>No</option>
                      <option value={true}>Yes</option>
                    </select>
                  </div>
                  <Field label="Start Date" name="start_date" value={form.start_date?.split("T")[0] || ""} onChange={onChange} type="date" required />
                  <Field label="End Date" name="end_date" value={form.end_date?.split("T")[0] || ""} onChange={onChange} type="date" />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>Description</label>
                  <textarea name="description" value={form.description || ""} onChange={onChange} rows="3" className="w-full p-2 rounded border text-sm" style={inputStyle} placeholder="Brief description..." />
                </div>
              </>
            )}
          />
        )}

        {/* CERTIFICATES */}
        {activeTab === "Certificates" && (
          <Section
            title="Certificates"
            isCertificate
            items={certificates}
            columns={["Certificate Name", "Issuing Org", "Issue Date", "Expiry", "File"]}
            saving={saving}
            formState={certForm} setFormState={setCertForm}
            editing={editingCert} setEditing={setEditingCert}
            onAdd={handleAddCert}
            onEdit={handleUpdateCert}
            onDelete={(cid) => confirmDelete(() => deleteCertificate(cid))}
            renderRow={(item) => (
              <>
                <td className="p-3 font-medium" style={{ color: "var(--text-primary)" }}>{item.certificate_name}</td>
                <td className="p-3" style={{ color: "var(--text-primary)" }}>{item.issuing_organization}</td>
                <td className="p-3 text-xs" style={{ color: "var(--text-secondary)" }}>{fmtDate(item.issue_date)}</td>
                <td className="p-3 text-xs" style={{ color: "var(--text-secondary)" }}>{fmtDate(item.expiry_date)}</td>
                <td className="p-3">
                  {item.certificate_file
                    ? <a href={item.certificate_file} target="_blank" rel="noreferrer" className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">View</a>
                    : <span className="text-xs" style={{ color: "var(--text-secondary)" }}>-</span>}
                </td>
              </>
            )}
            renderForm={(form, onChange) => (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Certificate Name" name="certificate_name" value={form.certificate_name || ""} onChange={onChange} required placeholder="e.g., Bar Council Certificate" />
                <Field label="Issuing Organization" name="issuing_organization" value={form.issuing_organization || ""} onChange={onChange} required placeholder="e.g., Bar Council of India" />
                <Field label="Issue Date" name="issue_date" value={form.issue_date?.split("T")[0] || ""} onChange={onChange} type="date" required />
                <Field label="Expiry Date" name="expiry_date" value={form.expiry_date?.split("T")[0] || ""} onChange={onChange} type="date" />
                <Field label="Credential ID" name="credential_id" value={form.credential_id || ""} onChange={onChange} placeholder="e.g., BCI-2015-001" />
                <Field label="Credential URL" name="credential_url" value={form.credential_url || ""} onChange={onChange} placeholder="https://..." />
              </div>
            )}
          />
        )}

        {/* EDUCATION */}
        {activeTab === "Education" && (
          <Section
            title="Education"
            items={education}
            columns={["Degree", "Field of Study", "School", "Period", "Grade"]}
            saving={saving}
            formState={eduForm} setFormState={setEduForm}
            editing={editingEdu} setEditing={setEditingEdu}
            onAdd={(data) => wrap(() => addEducation(id, data))}
            onEdit={(eid, data) => wrap(() => updateEducation(eid, data))}
            onDelete={(eid) => confirmDelete(() => deleteEducation(eid))}
            renderRow={(item) => (
              <>
                <td className="p-3 font-medium" style={{ color: "var(--text-primary)" }}>{item.degree}</td>
                <td className="p-3" style={{ color: "var(--text-primary)" }}>{item.field_of_study}</td>
                <td className="p-3" style={{ color: "var(--text-secondary)" }}>{item.school_name}</td>
                <td className="p-3 text-xs" style={{ color: "var(--text-secondary)" }}>{fmtDate(item.start_date)} → {fmtDate(item.end_date)}</td>
                <td className="p-3" style={{ color: "var(--text-secondary)" }}>{item.grade || "-"}</td>
              </>
            )}
            renderForm={(form, onChange) => (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Degree" name="degree" value={form.degree || ""} onChange={onChange} required placeholder="e.g., LLB" />
                <Field label="Field of Study" name="field_of_study" value={form.field_of_study || ""} onChange={onChange} required placeholder="e.g., Law" />
                <div className="col-span-2">
                  <Field label="School / University" name="school_name" value={form.school_name || ""} onChange={onChange} required placeholder="e.g., Delhi University" />
                </div>
                <Field label="Start Date" name="start_date" value={form.start_date?.split("T")[0] || ""} onChange={onChange} type="date" required />
                <Field label="End Date" name="end_date" value={form.end_date?.split("T")[0] || ""} onChange={onChange} type="date" required />
                <Field label="Grade" name="grade" value={form.grade || ""} onChange={onChange} placeholder="e.g., First Class" />
                <Field label="Description" name="description" value={form.description || ""} onChange={onChange} placeholder="Optional" />
              </div>
            )}
          />
        )}

        {/* SKILLS */}
        {activeTab === "Skills" && (
          <Section
            title="Skills"
            items={skills}
            columns={["Skill Name", "Proficiency", "Endorsements"]}
            saving={saving}
            formState={skillForm} setFormState={setSkillForm}
            editing={editingSkill} setEditing={setEditingSkill}
            onAdd={(data) => wrap(() => addSkill(id, data))}
            onEdit={(sid, data) => wrap(() => updateSkill(sid, data))}
            onDelete={(sid) => confirmDelete(() => deleteSkill(sid))}
            renderRow={(item) => (
              <>
                <td className="p-3 font-medium" style={{ color: "var(--text-primary)" }}>{item.skill_name}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs text-white ${
                    item.proficiency_level === "Expert" ? "bg-green-600" :
                    item.proficiency_level === "Advanced" ? "bg-blue-600" :
                    item.proficiency_level === "Intermediate" ? "bg-yellow-600" : "bg-gray-600"
                  }`}>
                    {item.proficiency_level || "Intermediate"}
                  </span>
                </td>
                <td className="p-3" style={{ color: "var(--text-secondary)" }}>{item.endorsements || 0}</td>
              </>
            )}
            renderForm={(form, onChange) => (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field label="Skill Name" name="skill_name" value={form.skill_name || ""} onChange={onChange} required placeholder="e.g., Criminal Litigation" />
                </div>
                <div className="col-span-2">
                  <label className="block mb-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>Proficiency Level</label>
                  <select name="proficiency_level" value={form.proficiency_level || "Intermediate"} onChange={onChange} className="w-full p-2 rounded border text-sm" style={inputStyle}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}
