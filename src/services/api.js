const BASE_URL = import.meta.env.VITE_API_URL;

// 🔥 GLOBAL DEBUG
console.log("🚀 BASE_URL:", BASE_URL);

function getAccountToken() {
  const token = localStorage.getItem("mb_token");
  console.log("🔑 Account Token:", token);
  return token;
}

function getProfileToken() {
  const token = localStorage.getItem("mb_profile_token");
  console.log("🎭 Profile Token:", token);
  return token;
}

async function request(path, options = {}) {
  const token = getAccountToken();

console.log("🔑 Account Token:", token);

// 🚨 STEP 3 ADD THIS BLOCK HERE
if (!token || token === "undefined") {
  console.warn("🚫 BLOCKED REQUEST: No valid token");
}

  const cleanBase = BASE_URL?.replace(/\/$/, "");
  const finalURL = `${cleanBase}${path}`;

  console.log("📡 REQUEST →", finalURL);
  console.log("📦 METHOD →", options.method || "GET");

  const headers = {
    "Content-Type": "application/json",
    ...(token && token !== "undefined"
  ? { Authorization: `Bearer ${token}` }
  : {}),
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
    data = await res.json();
  } catch {
    data = {};
  }

  console.log("📥 RESPONSE →", data);

  if (!res.ok) {
    console.error("❌ API ERROR:", data);
    throw new Error(data.message || data.error || "Something went wrong");
  }

  return data;
}

async function profileRequest(path, options = {}) {
  const token = getProfileToken();

  const cleanBase = BASE_URL?.replace(/\/$/, "");
  const finalURL = `${cleanBase}${path}`;

  console.log("📡 PROFILE REQUEST →", finalURL);
  console.log("📦 METHOD →", options.method || "GET");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Profile ${token}` } : {}),
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
    data = await res.json();
  } catch {
    data = {};
  }

  console.log("📥 PROFILE RESPONSE →", data);

  if (!res.ok) {
    console.error("❌ PROFILE API ERROR:", data);
    throw new Error(data.message || data.error || "Something went wrong");
  }

  return data;
}

export const auth = {
  login: async (email, password) => {
    console.log("🔐 LOGIN ATTEMPT:", email);

    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    console.log("✅ LOGIN RESPONSE:", res);

    // Save token
    if (!res.token) {
  console.error("❌ TOKEN MISSING IN RESPONSE:", res);
} else {
  localStorage.setItem("mb_token", res.token);
  console.log("✅ TOKEN STORED:", res.token);
}
    localStorage.setItem("mb_user", JSON.stringify(res.user));

    console.log("💾 TOKEN SAVED");

    return res;
  },

  register: (name, email, password, profession) => {
    console.log("📝 REGISTER:", email);

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
    localStorage.removeItem("mb_profiles_cache");
  },

  getUser: () => {
    try {
      const user = JSON.parse(localStorage.getItem("mb_user"));
      console.log("👤 USER:", user);
      return user;
    } catch {
      return null;
    }
  },

  getToken: () => getAccountToken(),
  isLoggedIn: () => Boolean(getAccountToken()),
};

export const profiles = {
  getAll: () => {
    console.log("📂 FETCHING PROFILES");
    return request("/profiles");
  },

  create: (name, avatar, profession) => {
    console.log("➕ CREATE PROFILE:", name);

    return request("/profiles", {
      method: "POST",
      body: JSON.stringify({ name, avatar, profession }),
    });
  },

  update: (profileId, updates) => {
    console.log("✏️ UPDATE PROFILE:", profileId);

    return request(`/profiles/${profileId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  delete: (profileId) => {
    console.log("🗑 DELETE PROFILE:", profileId);
    return request(`/profiles/${profileId}`, { method: "DELETE" });
  },

  select: async (profileId) => {
    console.log("🎯 SELECT PROFILE:", profileId);

    const data = await request(`/profiles/${profileId}/select`, {
      method: "POST",
    });

    localStorage.setItem("mb_profile_token", data.profileToken);
    localStorage.setItem("mb_active_profile", JSON.stringify(data.profile));

    console.log("✅ PROFILE SELECTED");

    return data;
  },

  getActive: () => {
    try {
      const active = JSON.parse(localStorage.getItem("mb_active_profile"));
      console.log("🎭 ACTIVE PROFILE:", active);
      return active;
    } catch {
      return null;
    }
  },

  clearActive: () => {
    console.log("🧹 CLEAR ACTIVE PROFILE");
    localStorage.removeItem("mb_profile_token");
    localStorage.removeItem("mb_active_profile");
  },

  getCached: () => {
    try {
      const cache = JSON.parse(localStorage.getItem("mb_profiles_cache") || "[]");
      console.log("📦 CACHE:", cache);
      return cache;
    } catch {
      return [];
    }
  },

  setCached: (list) => {
    console.log("💾 SET CACHE:", list);
    try {
      localStorage.setItem("mb_profiles_cache", JSON.stringify(list));
    } catch {}
  },
};

export const chat = {
  create: (tone) => {
    console.log("💬 CREATE CHAT:", tone);
    return profileRequest("/chats", {
      method: "POST",
      body: JSON.stringify({ tone }),
    });
  },

  sendMessage: (chatId, message, tone) => {
    console.log("📨 SEND MESSAGE:", chatId);

    return profileRequest(`/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content: message, tone }),
    });
  },

  getHistory: () => {
    console.log("📜 GET HISTORY");
    return profileRequest("/chats");
  },

  getConversation: (id) => {
    console.log("📖 GET CONVERSATION:", id);
    return profileRequest(`/chats/${id}`);
  },

  deleteConversation: (id) => {
    console.log("🗑 DELETE CHAT:", id);
    return profileRequest(`/chats/${id}`, { method: "DELETE" });
  },

  rename: (chatId, title) => {
    console.log("✏️ RENAME CHAT:", chatId);

    return profileRequest(`/chats/${chatId}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    });
  },
};

export const user = {
  getProfile: () => {
    console.log("👤 FETCH USER PROFILE");
    return request("/user/me");
  },

  updateProfile: (updates) => {
    console.log("✏️ UPDATE USER PROFILE");

    return request("/user/profile", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },
};