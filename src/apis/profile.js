import http from "./http";

// Experience
export const getExperiences = (lawyerId) => http.get(`/api/experiences/admin/lawyer/${lawyerId}`).then(r => r.data);
export const addExperience = (lawyerId, data) => http.post(`/api/experiences/admin/lawyer/${lawyerId}`, data).then(r => r.data);
export const updateExperience = (id, data) => http.put(`/api/experiences/admin/${id}`, data).then(r => r.data);
export const deleteExperience = (id) => http.delete(`/api/experiences/admin/${id}`).then(r => r.data);

// Certificates
export const getCertificates = (lawyerId) => http.get(`/api/certificates/admin/lawyer/${lawyerId}`).then(r => r.data);
export const addCertificate = (lawyerId, data) => http.post(`/api/certificates/admin/lawyer/${lawyerId}`, data).then(r => r.data);
export const updateCertificate = (id, data) => http.put(`/api/certificates/admin/${id}`, data).then(r => r.data);
export const deleteCertificate = (id) => http.delete(`/api/certificates/admin/${id}`).then(r => r.data);

// Education
export const getEducation = (lawyerId) => http.get(`/api/education/admin/lawyer/${lawyerId}`).then(r => r.data);
export const addEducation = (lawyerId, data) => http.post(`/api/education/admin/lawyer/${lawyerId}`, data).then(r => r.data);
export const updateEducation = (id, data) => http.put(`/api/education/admin/${id}`, data).then(r => r.data);
export const deleteEducation = (id) => http.delete(`/api/education/admin/${id}`).then(r => r.data);

// Skills
export const getSkills = (lawyerId) => http.get(`/api/skills/admin/lawyer/${lawyerId}`).then(r => r.data);
export const addSkill = (lawyerId, data) => http.post(`/api/skills/admin/lawyer/${lawyerId}`, data).then(r => r.data);
export const updateSkill = (id, data) => http.put(`/api/skills/admin/${id}`, data).then(r => r.data);
export const deleteSkill = (id) => http.delete(`/api/skills/admin/${id}`).then(r => r.data);
