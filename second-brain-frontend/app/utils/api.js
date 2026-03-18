const BASE_URL = "https://second-brain-ai-5au3.onrender.com";

// 🔐 Common fetch with auth
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    // ✅ FIXED ERROR HANDLING
    throw new Error(data.error || data.message || "Something went wrong");
  }

  return data;
};

// 🧾 Signup
export const signupUser = async (userData) => {
  return fetchWithAuth("/auth/signup", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

// 🔑 Login
export const loginUser = async (userData) => {
  return fetchWithAuth("/auth/login", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

// 📝 Get Notes
export const getNotes = async () => {
  return fetchWithAuth("/notes");
};

// ➕ Create Note
export const createNote = async (noteData) => {
  return fetchWithAuth("/notes", {
    method: "POST",
    body: JSON.stringify(noteData),
  });
};

// ❌ Delete Note
export const deleteNote = async (id) => {
  return fetchWithAuth(`/notes/${id}`, {
    method: "DELETE",
  });
};