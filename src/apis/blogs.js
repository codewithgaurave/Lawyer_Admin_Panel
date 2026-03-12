// src/apis/blogs.js
import http from "./http";

// Admin: Get all blogs - GET /api/blogs/admin/all
export const getAllBlogs = async (page = 1, limit = 10) => {
  const { data } = await http.get(`/api/blogs/admin/all?page=${page}&limit=${limit}`);
  return data;
};

// Admin: Create blog - POST /api/blogs/admin
export const createBlog = async (blogData) => {
  const { data } = await http.post("/api/blogs/admin", blogData);
  return data;
};

// Admin: Update blog - PUT /api/blogs/admin/:idOrSlug
export const updateBlog = async (idOrSlug, blogData) => {
  const { data } = await http.put(`/api/blogs/admin/${idOrSlug}`, blogData);
  return data;
};

// Admin: Delete blog - DELETE /api/blogs/admin/:idOrSlug
export const deleteBlog = async (idOrSlug) => {
  const { data } = await http.delete(`/api/blogs/admin/${idOrSlug}`);
  return data;
};

// Public: Get published blogs - GET /api/blogs
export const getPublishedBlogs = async (page = 1, limit = 10) => {
  const { data } = await http.get(`/api/blogs?page=${page}&limit=${limit}`);
  return data;
};

// Public: Get single blog - GET /api/blogs/:idOrSlug
export const getSingleBlog = async (idOrSlug) => {
  const { data } = await http.get(`/api/blogs/${idOrSlug}`);
  return data;
};

// Public: Get featured blogs - GET /api/blogs/featured
export const getFeaturedBlogs = async () => {
  const { data } = await http.get("/api/blogs/featured");
  return data;
};

// Public: Like blog - POST /api/blogs/:idOrSlug/like
export const likeBlog = async (idOrSlug) => {
  const { data } = await http.post(`/api/blogs/${idOrSlug}/like`);
  return data;
};