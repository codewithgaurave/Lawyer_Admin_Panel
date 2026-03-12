import http from "./http";

// Admin: Get all contacts
export const getAllContacts = async (page = 1, limit = 10) => {
  const { data } = await http.get(`/api/contacts?page=${page}&limit=${limit}`);
  return data;
};

// Admin: Create contact
export const createContact = async (contactData) => {
  const { data } = await http.post("/api/contacts", contactData);
  return data;
};

// Admin: Update contact
export const updateContact = async (contactId, contactData) => {
  const { data } = await http.put(`/api/contacts/${contactId}`, contactData);
  return data;
};

// Admin: Delete contact
export const deleteContact = async (contactId) => {
  const { data } = await http.delete(`/api/contacts/${contactId}`);
  return data;
};
