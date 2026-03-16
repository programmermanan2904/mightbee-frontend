const BASE_URL = import.meta.env.VITE_API_URL;

console.log("🚀 API BASE URL:", BASE_URL);

// ── Token helpers ─────────────────────────────────────────

function getAccountToken() {
  const token = localStorage.getItem("mb_token");
  console.log("🔑 Account Token:", token);
  return token;
}

function getProfileToken() {
  const token = localStorage.getItem("mb_profile_token");
  console.log("👤 Profile Token:", token);
  return token;
}

// ── Base request (Account-level) ──────────────────────────

async function request(path, options = {}) {
  try {
    console.log("📡 REQUEST START:", path);

    const token = getAccountToken();

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const url = `${BASE_URL}${path}`;

    console.log("🌍 URL:", url);
    console.log("📦 Headers:", headers);
    console.log("📤 Body:", options.body);

    const res = await fetch(url, { ...options, headers });

    console.log("📥 Status:", res.status);

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    console.log("📥 Response:", data);

    if (!res.ok) {
      throw new Error(data.message || data.error || "Something went wrong");
    }

    return data;

  } catch (error) {
    console.error("🔥 REQUEST ERROR:", error);
    throw error;
  }
}

// ── Profile request (Profile-level token) ─────────────────

async function profileRequest(path, options = {}) {
  try {
    console.log("📡 PROFILE REQUEST:", path);

    const token = getProfileToken();

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Profile ${token}` } : {}),
      ...options.headers,
    };

    const url = `${BASE_URL}${path}`;

    console.log("🌍 Profile URL:", url);
    console.log("📦 Profile Headers:", headers);

    const res = await fetch(url, { ...options, headers });

    console.log("📥 Profile Status:", res.status);

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    console.log("📥 Profile Response:", data);

    if (!res.ok) {
      throw new Error(data.message || data.error || "Something went wrong");
    }

    return data;

  } catch (error) {
    console.error("🔥 PROFILE REQUEST ERROR:", error);
    throw error;
  }
}

// ── Auth ──────────────────────────────────────────────────

export const auth = {
  login: (email, password) => {
    console.log("🔐 LOGIN:", email);

    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: (name, email, password, profession) => {
    console.log("📝 REGISTER:", { name, email, profession });

    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, profession }),
    });
  },

  logout: () => {
    console.log("🚪 LOGOUT");

    localStorage.removeItem("mb_token");
    localStorage.removeItem("mb_user");
    localStorage.removeItem("mb_profile_token");
    localStorage.removeItem("mb_active_profile");
  },

  saveSession: (token, user) => {
    console.log("💾 Save Session:", user);

    localStorage.setItem("mb_token", token);
    localStorage.setItem("mb_user", JSON.stringify(user));
  },

  getUser: () => {
    try {
      const user = JSON.parse(localStorage.getItem("mb_user"));
      console.log("👤 Current User:", user);
      return user;
    } catch {
      return null;
    }
  },

  isLoggedIn: () => {
    const loggedIn = Boolean(getAccountToken());
    console.log("🔎 Is Logged In:", loggedIn);
    return loggedIn;
  },
};

// ── Profiles ──────────────────────────────────────────────

export const profiles = {
  getAll: () => {
    console.log("📂 Get Profiles");
    return request("/profiles");
  },

  create: (name, avatar, profession) => {
    console.log("➕ Create Profile:", name);

    return request("/profiles", {
      method: "POST",
      body: JSON.stringify({ name, avatar, profession }),
    });
  },

  update: (profileId, updates) => {
    console.log("✏ Update Profile:", profileId);

    return request(`/profiles/${profileId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  delete: (profileId) => {
    console.log("🗑 Delete Profile:", profileId);

    return request(`/profiles/${profileId}`, {
      method: "DELETE",
    });
  },

  select: async (profileId) => {
    console.log("🎯 Select Profile:", profileId);

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