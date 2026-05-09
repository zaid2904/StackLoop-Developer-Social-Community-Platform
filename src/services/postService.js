import api from "./api";

// All post-related API calls abstracting the messy /auth endpoints

export const getAllPosts = async () => {
  const response = await api.get("/auth/v1/posts");
  return response.data;
};

/// categogary related post
export const categogary = async (postdata) => {
  const response = await api.post("/auth/v1/tags",postdata);
  return response.data;
};



export const getPremiumPosts = async () => {
  const response = await api.get("/auth/v1/posts/premium");
  return response.data;
};

export const createPost = async (postData) => {
  console.log(postData)
  const response = await api.post("/auth/v1/posts/create", postData);
  return response.data;
};

export const getMyPosts = async () => {
  const response = await api.get("/auth/v1/me/post");
  return response.data;
};

export const getPostById = async (id) => {
  // In case the backend has this, otherwise we return dummy data or handle gracefully
  try {
    const response = await api.get(`/auth/v1/posts/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getCommentsByPostId = async (id) => {
  try {
    const response = await api.get(`/auth/v2/comment/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createComment = async (postId, text) => {
  try {
    const response = await api.post(`/auth/v2/comment/${postId}`, { text });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const likePost = async (id) => {
  try {
    const response = await api.post(`/auth/v1/posts/like/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
