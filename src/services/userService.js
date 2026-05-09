import api from "./api";

// User-related API calls (real backend endpoints)

export const getCurrentUserProfile = async () => {
  const response = await api.post("/auth/viewprofile");
  return response.data;
};

export const updateProfile = async (formData) => {
  // formData must be a FormData instance so multer can parse the file
  const response = await api.put("/auth/editprofile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
