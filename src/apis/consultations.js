import http from "./http";

// Admin: Get all consultations
export const getAllConsultations = async (page = 1, limit = 10) => {
  const { data } = await http.get(`/api/consultations?page=${page}&limit=${limit}`);
  return data;
};

// Admin: Create consultation
export const createConsultation = async (consultationData) => {
  const { data } = await http.post("/api/consultations", consultationData);
  return data;
};

// Admin: Update consultation
export const updateConsultation = async (consultationId, consultationData) => {
  const { data } = await http.put(`/api/consultations/${consultationId}`, consultationData);
  return data;
};

// Admin: Delete consultation
export const deleteConsultation = async (consultationId) => {
  const { data } = await http.delete(`/api/consultations/${consultationId}`);
  return data;
};
