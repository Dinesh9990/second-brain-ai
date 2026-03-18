const BASE_URL = "https://second-brain-ai-5au3.onrender.com";

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};