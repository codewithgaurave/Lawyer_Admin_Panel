import http from "./http";

// Admin: Register new lawyer
export const registerLawyer = async (lawyerData) => {
  const { data } = await http.post(`/api/lawyers/register`, lawyerData);
  return data;
};

// Admin: Get all lawyers
export const getAllLawyers = async () => {
  const { data } = await http.get(`/api/lawyers/all`);
  return data;
};

// Admin: Get lawyer by ID
export const getLawyerById = async (lawyerId) => {
  const { data } = await http.get(`/api/lawyers/${lawyerId}`);
  return data;
};

// Admin: Update lawyer details
export const updateLawyer = async (lawyerId, lawyerData) => {
  const { data } = await http.put(`/api/lawyers/${lawyerId}`, lawyerData);
  return data;
};

// Admin: Toggle lawyer status (active/inactive)
export const toggleLawyerStatus = async (lawyerId, isActive) => {
  const { data } = await http.patch(`/api/lawyers/${lawyerId}/status`, { isActive });
  return data;
};

// Admin: Delete lawyer
export const deleteLawyer = async (lawyerId) => {
  const { data } = await http.delete(`/api/lawyers/${lawyerId}`);
  return data;
};

// Admin: Get all lawyers with services
export const getAllLawyersWithServices = async () => {
  const { data } = await http.get(`/api/services/admin/all-lawyers-services`);
  return data;
};

// Get services by lawyer ID
export const getServicesByLawyer = async (lawyerId) => {
  const { data } = await http.get(`/api/services/lawyer/${lawyerId}`);
  return data;
};
