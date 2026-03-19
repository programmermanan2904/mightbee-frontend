const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

// 🔥 DEBUG
console.log("🚀 BASE_URL:", BASE_URL);

// ================= TOKEN HELPERS =================

function getAccountToken() {
  const token = localStorage.getItem("mb_token");
  console.log("🔑 Account Token:", token);
  return token && token !== "undefined" ? token : null;
}

function getProfileToken() {
  const token = localStorage.getItem("mb_profile_token");
  console.log("🎭 Profile Token:", token);
  return token && token !== "undefined" ? token : null;
}

// ================= CORE REQUEST =================

async function request(path, options = {}) {
  const token = getAccountToken();

  const finalURL = `${BASE_URL}${path}`;
  console.log("📡 REQUEST →", finalURL);

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  console.log("📨 HEADERS →", headers);

  const res = await fetch(finalURL, {
    ...options,
    headers,
  });

  console.log("📊 STATUS →", res.status);

  let data;

  try {
    const text = await res.text();
    console.log("📦 RAW RESPONSE:", text);

    data = text ? JSON.parse(text) : {};
  } catch (err) {
    console.error("❌ JSON PARSE ERROR:", err);
    data = {};
  }

  console.log("📥 RESPONSE →", data);

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// ================= PROFILE REQUEST (FIXED) =================

async function profileRequest(path, options = {}) {
  const accountToken = getAccountToken();
  const profileToken = getProfileToken();

  const finalURL = `${BASE_URL}${path}`;
  console.log("📡 PROFILE REQUEST →", finalURL);

  const headers = {
    "Content-Type": "application/json",

    // ✅ Send BOTH tokens correctly
    ...(accountToken && { Authorization: `Bearer ${accountToken}` }),
    ...(profileToken && { "x-profile-token": profileToken }),

    ...options.headers,
  };

  console.log("📨 PROFILE HEADERS →", headers);

  const res = await fetch(finalURL, {
    ...options,
    headers,
  });

  console.log("📊 PROFILE STATUS →", res.status);

  let data;

  try {
    const text = await res.text();
    console.log("📦 PROFILE RAW RESPONSE:", text);

    data = text ? JSON.parse(text) : {};
  } catch (err) {
    console.error("❌ PROFILE JSON ERROR:", err);
    data = {};
  }

  console.log("📥 PROFILE RESPONSE →", data);

  if (!res.ok) {
    throw new Error(data.message || "Profile request failed");
  }

  return data;
}

// ================= AUTH =================

export const auth = {
  login: async (email, password) => {
    console.log("🔐 LOGIN:", email);

    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!res.token) throw new Error("No token received");

    localStorage.setItem("mb_token", res.token);
    localStorage.setItem("mb_user", JSON.stringify(res.user));

    console.log("✅ LOGIN SUCCESS");

    return res;
  },

  register: async (name, email, password, profession) => {
    console.log("📝 REGISTER:", email);

    const res = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, profession }),
    });

    console.log("✅ REGISTER RESPONSE:", res);

    if (res.token) {
      localStorage.setItem("mb_token", res.token);
      localStorage.setItem("mb_user", JSON.stringify(res.user));
      console.log("✅ TOKEN SAVED AFTER SIGNUP");
    }

    return res;
  },

  logout: () => {
    console.log("🚪 LOGOUT");
    localStorage.clear();
  },

  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem("mb_user"));
    } catch {
      return null;
    }
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

  select: async (profileId) => {
    const data = await request(`/profiles/${profileId}/select`, {
      method: "POST",
    });

    // ✅ IMPORTANT: Ensure correct key from backend
    const profileToken = data.profileToken || data.token;

    if (!profileToken) {
      console.error("❌ PROFILE TOKEN MISSING IN RESPONSE");
      throw new Error("Profile token missing");
    }

    localStorage.setItem("mb_profile_token", profileToken);
    localStorage.setItem("mb_active_profile", JSON.stringify(data.profile));

    console.log("✅ PROFILE SELECTED");

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