const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

// ================= TOKEN HELPERS =================

function getAccountToken() {
  const token = localStorage.getItem("mb_token");
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

  const res = await fetch(finalURL, {
    ...options,
    headers,
  });

  let data;

  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  // ✅ Auto logout on expired/invalid token
  if (res.status === 401) {
    localStorage.removeItem("mb_token");
    localStorage.removeItem("mb_user");
  }

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// ================= AUTH =================

export const auth = {
  login: async (email, password) => {
    const res = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!res.token) {
      throw new Error("No token received");
    }

    localStorage.setItem("mb_token", res.token);
    localStorage.setItem("mb_user", JSON.stringify(res.user));

    return res;
  },

  // ✅ FIXED REGISTER ROUTE
  register: async (name, email, password, profession) => {
    const res = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        profession,
      }),
    });

    if (res.token) {
      localStorage.setItem("mb_token", res.token);
      localStorage.setItem("mb_user", JSON.stringify(res.user));
    }

    return res;
  },

  logout: () => {
    localStorage.removeItem("mb_token");
    localStorage.removeItem("mb_user");
  },

  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem("mb_user"));
    } catch {
      return null;
    }
  },

  saveSession: (token, user) => {
    if (token) {
      localStorage.setItem("mb_token", token);
    }

    if (user) {
      localStorage.setItem("mb_user", JSON.stringify(user));
    }
  },

  getToken: () => getAccountToken(),

  isLoggedIn: () => !!getAccountToken(),
};

// ================= PROFILES =================

export const profiles = {
  getAll: async () => {
    const u = auth.getUser();

    return {
      profiles: u ? [u] : [],
    };
  },

  create: async () => {
    return {
      profile: auth.getUser(),
    };
  },

  update: async (profileId, updates) => {
    return user.updateProfile(updates);
  },

  delete: async () => {
    return {};
  },

  select: async () => {
    const u = auth.getUser();

    return {
      profile: u,
    };
  },

  getActive: () => auth.getUser(),

  clearActive: () => {},

  setCached: (list) => {
    try {
      localStorage.setItem(
        "mb_profiles_cache",
        JSON.stringify(list)
      );
    } catch {}
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
    request("/api/chats", {
      method: "POST",
      body: JSON.stringify({ tone }),
    }),

  sendMessage: (chatId, message, tone) =>
    request(`/api/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        content: message,
        tone,
      }),
    }),

  getHistory: () => request("/api/chats"),

  getConversation: (id) =>
    request(`/api/chats/${id}`),

  deleteConversation: (id) =>
    request(`/api/chats/${id}`, {
      method: "DELETE",
    }),

  rename: (chatId, title) =>
    request(`/api/chats/${chatId}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    }),
};

// ================= USER =================

export const user = {
  getProfile: () => request("/api/auth/me"),

  updateProfile: (updates) =>
    request("/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
};
