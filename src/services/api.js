const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

// ================= TOKEN HELPERS =================

function getAccountToken() {
  const token = localStorage.getItem("mb_token");
  return token && token !== "undefined" ? token : null;
}

function getProfileToken() {
  const token = localStorage.getItem("mb_profile_token");
  return token && token !== "undefined" ? token : null;
}

// ================= CORE REQUEST =================

async function request(path, options = {}) {
  const token = getAccountToken();
  const finalURL = `${BASE_URL}${path}`;

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(finalURL, { ...options, headers });

  let data;
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// ================= PROFILE REQUEST =================

async function profileRequest(path, options = {}) {
  const accountToken = getAccountToken();
  const profileToken = getProfileToken();
  const finalURL = `${BASE_URL}${path}`;

  const headers = {
    "Content-Type": "application/json",
    ...(accountToken && { Authorization: `Bearer ${accountToken}` }),
    ...(profileToken && { "x-profile-token": profileToken }),
    ...options.headers,
  };

  const res = await fetch(finalURL, { ...options, headers });

  let data;
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.message || "Profile request failed");
  }

  return data;
}

// ================= AUTH =================

export const auth = {
  login: async (email, password) => {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!res.token) throw new Error("No token received");

    localStorage.setItem("mb_token", res.token);
    localStorage.setItem("mb_user", JSON.stringify(res.user));

    return res;
  },

  register: async (name, email, password, profession) => {
    const res = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, profession }),
    });

    if (res.token) {
      localStorage.setItem("mb_token", res.token);
      localStorage.setItem("mb_user", JSON.stringify(res.user));
    }

    return res;
  },

  logout: () => {
    localStorage.clear();
  },

  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem("mb_user"));
    } catch {
      return null;
    }
  },

  // ✅ Used in Profile.jsx after updateProfile
  saveSession: (token, user) => {
    if (token) localStorage.setItem("mb_token", token);
    if (user)  localStorage.setItem("mb_user", JSON.stringify(user));
  },

  getToken: () => getAccountToken(),

  isLoggedIn: () => !!getAccountToken(),
};

// ================= PROFILES =================

export const profiles = {
  getAll: () => request("/profiles"),

  create: (name, avatar, profession) =>
    request("/profiles", {
      method: "POST",
      body: JSON.stringify({ name, avatar, profession }),
    }),

  update: (profileId, updates) =>
    request(`/profiles/${profileId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  delete: (profileId) =>
    request(`/profiles/${profileId}`, { method: "DELETE" }),

  // ✅ Fixed — single token check, saves both items before returning
  select: async (profileId) => {
    const data = await request(`/profiles/${profileId}/select`, {
      method: "POST",
    });

    const profileToken = data.profileToken || data.token;

    if (!profileToken) {
      throw new Error("Profile token missing from backend response");
    }

    localStorage.setItem("mb_profile_token", profileToken);
    localStorage.setItem("mb_active_profile", JSON.stringify(data.profile));

    return data;
  },

  getActive: () => {
    try {
      return JSON.parse(localStorage.getItem("mb_active_profile"));
    } catch {
      return null;
    }
  },

  clearActive: () => {
    localStorage.removeItem("mb_profile_token");
    localStorage.removeItem("mb_active_profile");
  },

  // ✅ Used in Login.jsx and Profile.jsx — was missing entirely
  setCached: (list) => {
    try {
      localStorage.setItem("mb_profiles_cache", JSON.stringify(list));
    } catch {
      // storage full or unavailable — fail silently
    }
  },

  getCached: () => {
    try {
      const raw = localStorage.getItem("mb_profiles_cache");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
};

// ================= CHAT =================

export const chat = {
  create: (tone) =>
    profileRequest("/chats", {
      method: "POST",
      body: JSON.stringify({ tone }),
    }),

  sendMessage: (chatId, message, tone) =>
    profileRequest(`/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content: message, tone }),
    }),

  getHistory: () => profileRequest("/chats"),

  getConversation: (id) => profileRequest(`/chats/${id}`),

  deleteConversation: (id) =>
    profileRequest(`/chats/${id}`, { method: "DELETE" }),

  rename: (chatId, title) =>
    profileRequest(`/chats/${chatId}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    }),
};

// ================= USER =================

export const user = {
  getProfile: () => request("/user/me"),

  updateProfile: (updates) =>
    request("/user/profile", {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
};