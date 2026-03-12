import http from "./http";

export const getAllUsers = async () => {
  const res = await http.get("/api/users/admin/all");
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await http.put(`/api/users/admin/${id}`, data);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await http.delete(`/api/users/admin/${id}`);
  return res.data;
};

export const toggleUserStatus = async (id, isActive) => {
  const res = await http.patch(`/api/users/admin/${id}/status`, { isActive });
  return res.data;
};
