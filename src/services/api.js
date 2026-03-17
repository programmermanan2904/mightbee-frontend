const BASE_URL = import.meta.env.VITE_API_URL;

// ── Token helpers ─────────────────────────────────────────

function getAccountToken() {
  return localStorage.getItem("mb_token");
}

function getProfileToken() {
  return localStorage.getItem("mb_profile_token");
}

// ── Base request (Account-level) ──────────────────────────

async function request(path, options = {}) {
  const token = getAccountToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.message || data.error || "Something went wrong");
  }

  return data;
}

// ── Profile request (Profile-level token) ─────────────────

async function profileRequest(path, options = {}) {
  const token = getProfileToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Profile ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.message || data.error || "Something went wrong");
  }

  return data;
}

// ── Auth ──────────────────────────────────────────────────

export const auth = {
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name, email, password, profession) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, profession }),
    }),

  logout: () => {
    localStorage.removeItem("mb_token");
    localStorage.removeItem("mb_user");
    localStorage.removeItem("mb_profile_token");
    localStorage.removeItem("mb_active_profile");
  },

  saveSession: (token, user) => {
    localStorage.setItem("mb_token", token);
    localStorage.setItem("mb_user", JSON.stringify(user));
  },

  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem("mb_user"));
    } catch {
      return null;
    }
  },

  getToken: () => getAccountToken(),

  isLoggedIn: () => Boolean(getAccountToken()),
};

// ── Profiles ──────────────────────────────────────────────

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

  select: async (profileId) => {
    const data = await request(`/profiles/${profileId}/select`, {
      method: "POST",
    });
    localStorage.setItem("mb_profile_token", data.profileToken);
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
};

// ── Chat ──────────────────────────────────────────────────

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

// ── User ──────────────────────────────────────────────────

export const user = {
  getProfile: () => request("/user/me"),

  updateProfile: (updates) =>
    request("/user/profile", {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
};