import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import InteractiveHive from "../components/ui/InteractiveHive";
import { auth, user as userApi, profiles as profilesApi } from "../services/api";

const HEX = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

const PROFESSIONS = [
  { id: "student",    label: "Student",    emoji: "🎓" },
  { id: "developer",  label: "Developer",  emoji: "💻" },
  { id: "researcher", label: "Researcher", emoji: "🔬" },
  { id: "teacher",    label: "Teacher",    emoji: "📚" },
  { id: "creator",    label: "Creator",    emoji: "🎨" },
  { id: "business",   label: "Business",   emoji: "📊" },
];

const AVATARS = ["🐝", "🦋", "🌸", "🔥", "⚡", "🌙", "🎯", "🚀", "🌿", "💎", "🎨", "🔬"];
const MAX_PROFILES = 6;

function useBreakpoint() {
  const [bp, setBp] = useState({ isMobile: false, isTablet: false });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setBp({ isMobile: w < 768, isTablet: w >= 768 && w < 1024 });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return bp;
}

function FloatingHex({ size, x, y, opacity, rotate, delay, color = "#F4B400", blur = 0 }) {
  return (
    <motion.div
      style={{
        position: "absolute", left: x, top: y,
        width: size, height: size * 1.1547, opacity,
        filter: blur ? `blur(${blur}px)` : "none",
        clipPath: HEX, background: color, pointerEvents: "none",
      }}
      initial={{ opacity: 0, scale: 0.6, rotate: rotate - 20 }}
      animate={{ opacity, scale: 1, rotate }}
      transition={{ duration: 1.8, delay, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}

function HexInput({ label, type = "text", value, onChange, placeholder, disabled = false }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <label style={{
        display: "block", fontFamily: "Orbitron, sans-serif",
        fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase",
        marginBottom: 8,
        color: disabled ? "rgba(244,180,0,0.2)" : focused ? "#F4B400" : "rgba(244,180,0,0.45)",
        transition: "color 0.2s",
      }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "12px 16px",
          background: disabled ? "rgba(8,13,26,0.4)" : "rgba(8,13,26,0.85)",
          border: `1px solid ${disabled ? "rgba(244,180,0,0.06)" : focused ? "rgba(244,180,0,0.7)" : "rgba(244,180,0,0.15)"}`,
          borderRadius: 3, color: disabled ? "rgba(232,217,160,0.3)" : "#E8D9A0",
          fontFamily: "Syne, sans-serif", fontSize: "0.9rem",
          outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: focused && !disabled ? "0 0 20px rgba(244,180,0,0.15)" : "none",
          letterSpacing: "0.02em", boxSizing: "border-box",
          cursor: disabled ? "not-allowed" : "text",
        }}
      />
    </div>
  );
}

function SectionCard({ title, icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: "rgba(13,21,37,0.88)", backdropFilter: "blur(24px)",
        border: "1px solid rgba(244,180,0,0.15)", borderRadius: 4,
        padding: "1.8rem 2rem", position: "relative", overflow: "hidden",
        marginBottom: "1.25rem",
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(244,180,0,0.4), transparent)",
      }} />
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem",
        paddingBottom: "1rem", borderBottom: "1px solid rgba(244,180,0,0.08)",
      }}>
        <div style={{
          width: 28, height: 28 * 1.1547, clipPath: HEX, flexShrink: 0,
          background: "rgba(244,180,0,0.12)", border: "1px solid rgba(244,180,0,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem",
        }}>{icon}</div>
        <span style={{
          fontFamily: "Orbitron, sans-serif", fontSize: "0.68rem",
          letterSpacing: "0.18em", color: "#F4B400", textTransform: "uppercase",
        }}>{title}</span>
      </div>
      {children}
    </motion.div>
  );
}

function HexActionButton({ children, onClick, variant = "primary", disabled = false, loading = false, small = false }) {
  const isPrimary = variant === "primary";
  const isDanger  = variant === "danger";
  const isGhost   = variant === "ghost";
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={onClick} disabled={disabled || loading}
      style={{
        padding: small ? "7px 14px" : "10px 24px",
        border: `1px solid ${isDanger ? "rgba(255,80,80,0.4)" : isGhost ? "rgba(244,180,0,0.12)" : isPrimary ? "rgba(244,180,0,0.6)" : "rgba(244,180,0,0.2)"}`,
        borderRadius: 3,
        background: isDanger ? "rgba(255,80,80,0.1)" : isGhost ? "transparent" : isPrimary ? (disabled ? "rgba(244,180,0,0.06)" : "rgba(244,180,0,0.16)") : "transparent",
        color: isDanger ? "rgba(255,120,120,0.9)" : isGhost ? "rgba(244,180,0,0.4)" : isPrimary ? "#F4B400" : "rgba(244,180,0,0.5)",
        fontFamily: "Orbitron, sans-serif", fontSize: small ? "0.54rem" : "0.62rem",
        letterSpacing: "0.15em", textTransform: "uppercase",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1, transition: "all 0.2s",
        display: "inline-flex", alignItems: "center", gap: 8,
      }}>
      {loading && (
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ width: 10, height: 10, border: "1.5px solid rgba(244,180,0,0.3)", borderTopColor: "#F4B400", borderRadius: "50%" }} />
      )}
      {children}
    </motion.button>
  );
}

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
      style={{
        position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)",
        zIndex: 200, padding: "12px 20px",
        background: type === "success" ? "rgba(13,21,37,0.98)" : "rgba(30,10,10,0.98)",
        border: `1px solid ${type === "success" ? "rgba(74,222,128,0.4)" : "rgba(255,80,80,0.4)"}`,
        borderRadius: 4, backdropFilter: "blur(20px)",
        fontFamily: "Syne, sans-serif", fontSize: "0.82rem",
        color: type === "success" ? "#4ADE80" : "#FF8080",
        whiteSpace: "nowrap",
        boxShadow: `0 8px 32px ${type === "success" ? "rgba(74,222,128,0.1)" : "rgba(255,80,80,0.1)"}`,
      }}>
      {type === "success" ? "✓  " : "⚠  "}{msg}
    </motion.div>
  );
}

// ── Profile Card ──────────────────────────────────────────────────────────────

function ProfileCard({ profile, isActive, onSelect, onEdit, onDelete, selectLoading, isMobile, navigate }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }} layout
      style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
    >
      {/* Avatar hex — click switches to this user AND goes to dashboard */}
      <motion.div
        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}
        onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
        onClick={async () => {
          if (selectLoading) return;
          if (!isActive) {
            await onSelect(profile._id);
          }
          navigate("/dashboard");
        }}
        style={{
          width: isMobile ? 56 : 68,
          height: (isMobile ? 56 : 68) * 1.1547,
          clipPath: HEX,
          background: isActive
            ? "linear-gradient(135deg, rgba(244,180,0,0.3), rgba(255,213,79,0.2))"
            : hovered
              ? "rgba(244,180,0,0.12)"
              : "rgba(13,21,37,0.9)",
          border: `2px solid ${isActive ? "#F4B400" : hovered ? "rgba(244,180,0,0.5)" : "rgba(244,180,0,0.18)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: isMobile ? "1.4rem" : "1.7rem",
          cursor: selectLoading ? "wait" : "pointer",
          boxShadow: isActive
            ? "0 0 24px rgba(244,180,0,0.45), 0 0 48px rgba(244,180,0,0.15)"
            : hovered ? "0 0 16px rgba(244,180,0,0.2)" : "none",
          transition: "box-shadow 0.3s, border-color 0.3s, background 0.3s",
          position: "relative",
        }}
      >
        {profile.avatar}

        {/* Hover label */}
        <AnimatePresence>
          {hovered && !isActive && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: "absolute", inset: 0, clipPath: HEX,
                background: "rgba(8,13,26,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <span style={{
                fontFamily: "Orbitron, sans-serif", fontSize: "0.38rem",
                letterSpacing: "0.1em", color: "#F4B400", textAlign: "center",
                lineHeight: 1.4,
              }}>GO →</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active pulse ring */}
        {isActive && (
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            style={{
              position: "absolute", inset: -4, clipPath: HEX,
              border: "1px solid rgba(244,180,0,0.4)", pointerEvents: "none",
            }}
          />
        )}
      </motion.div>

      {/* Name */}
      <span style={{
        fontFamily: "Syne, sans-serif", fontSize: isMobile ? "0.72rem" : "0.78rem",
        color: isActive ? "#F4B400" : "rgba(232,217,160,0.6)",
        letterSpacing: "0.03em", textAlign: "center",
        maxWidth: isMobile ? 64 : 80,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{profile.name}</span>

      {/* Active badge */}
      {isActive && (
        <div style={{
          fontFamily: "Orbitron, sans-serif", fontSize: "0.42rem",
          letterSpacing: "0.15em", color: "#F4B400",
          background: "rgba(244,180,0,0.1)", border: "1px solid rgba(244,180,0,0.3)",
          borderRadius: 2, padding: "2px 6px",
        }}>ACTIVE</div>
      )}

      {/* Edit / Delete */}
      <div style={{ display: "flex", gap: 4 }}>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onEdit(profile)}
          style={{
            width: 22, height: 22, borderRadius: 2, border: "1px solid rgba(244,180,0,0.2)",
            background: "rgba(244,180,0,0.06)", color: "rgba(244,180,0,0.5)",
            fontSize: "0.6rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>✏️</motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onDelete(profile)}
          style={{
            width: 22, height: 22, borderRadius: 2, border: "1px solid rgba(255,80,80,0.2)",
            background: "rgba(255,80,80,0.06)", color: "rgba(255,100,100,0.5)",
            fontSize: "0.6rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>🗑</motion.button>
      </div>
    </motion.div>
  );
}

// ── Add Profile Card ──────────────────────────────────────────────────────────

function AddProfileCard({ onClick, isMobile }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <motion.div
        whileHover={{ scale: 1.06, borderColor: "rgba(244,180,0,0.5)" }} whileTap={{ scale: 0.96 }}
        onClick={onClick}
        style={{
          width: isMobile ? 56 : 68, height: (isMobile ? 56 : 68) * 1.1547,
          clipPath: HEX, background: "rgba(13,21,37,0.5)",
          border: "1.5px dashed rgba(244,180,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: isMobile ? "1.2rem" : "1.5rem",
          cursor: "pointer", transition: "all 0.2s", color: "rgba(244,180,0,0.35)",
        }}>+</motion.div>
      <span style={{ fontFamily: "Syne, sans-serif", fontSize: "0.7rem", color: "rgba(232,217,160,0.3)", letterSpacing: "0.02em" }}>Add</span>
    </motion.div>
  );
}

// ── Profile Modal ─────────────────────────────────────────────────────────────

function ProfileModal({ mode, initial, onSave, onClose, saving, isMobile }) {
  const [name, setName]             = useState(initial?.name || "");
  const [avatar, setAvatar]         = useState(initial?.avatar || "🐝");
  const [profession, setProfession] = useState(initial?.profession || "student");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(8,13,26,0.85)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
      }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "rgba(13,21,37,0.98)", border: "1px solid rgba(244,180,0,0.2)",
          borderRadius: 6, padding: isMobile ? "1.5rem" : "2rem",
          width: "100%", maxWidth: 400, position: "relative",
        }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(244,180,0,0.5), transparent)",
        }} />
        <h2 style={{
          fontFamily: "Orbitron, sans-serif", fontSize: "0.75rem",
          letterSpacing: "0.18em", color: "#F4B400", marginBottom: "1.5rem", textTransform: "uppercase",
        }}>
          {mode === "create" ? "🐝 New Hive Member" : "✏️ Edit Member"}
        </h2>

        <HexInput label="Profile Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aryan, Work, Study..." />

        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{
            display: "block", fontFamily: "Orbitron, sans-serif",
            fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase",
            marginBottom: 8, color: "rgba(244,180,0,0.45)",
          }}>Avatar</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {AVATARS.map(a => (
              <motion.button key={a} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => setAvatar(a)}
                style={{
                  width: 38, height: 38,
                  border: `1px solid ${avatar === a ? "#F4B400" : "rgba(244,180,0,0.15)"}`,
                  borderRadius: 3,
                  background: avatar === a ? "rgba(244,180,0,0.14)" : "rgba(8,13,26,0.6)",
                  fontSize: "1.1rem", cursor: "pointer",
                  boxShadow: avatar === a ? "0 0 12px rgba(244,180,0,0.25)" : "none",
                  transition: "all 0.15s",
                }}>{a}</motion.button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{
            display: "block", fontFamily: "Orbitron, sans-serif",
            fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase",
            marginBottom: 8, color: "rgba(244,180,0,0.45)",
          }}>Profession</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {PROFESSIONS.map(p => (
              <motion.button key={p.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setProfession(p.id)}
                style={{
                  padding: "8px 4px",
                  border: `1px solid ${profession === p.id ? "#F4B400" : "rgba(244,180,0,0.12)"}`,
                  borderRadius: 3,
                  background: profession === p.id ? "rgba(244,180,0,0.12)" : "rgba(8,13,26,0.5)",
                  color: profession === p.id ? "#F4B400" : "rgba(232,217,160,0.4)",
                  cursor: "pointer", textAlign: "center", transition: "all 0.15s",
                }}>
                <div style={{ fontSize: "1rem", marginBottom: 3 }}>{p.emoji}</div>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.48rem", letterSpacing: "0.06em" }}>{p.label}</div>
              </motion.button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <HexActionButton variant="ghost" onClick={onClose}>Cancel</HexActionButton>
          <HexActionButton onClick={() => onSave({ name, avatar, profession })} loading={saving} disabled={!name.trim() || saving}>
            {mode === "create" ? "Create" : "Save"}
          </HexActionButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────

function DeleteModal({ profile, onConfirm, onClose, deleting }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 101,
        background: "rgba(8,13,26,0.9)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
      }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "rgba(20,8,8,0.98)", border: "1px solid rgba(255,80,80,0.25)",
          borderRadius: 6, padding: "2rem", width: "100%", maxWidth: 360, position: "relative",
        }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,80,80,0.4), transparent)",
        }} />
        <div style={{ fontSize: "2rem", marginBottom: "1rem", textAlign: "center" }}>{profile.avatar}</div>
        <h2 style={{
          fontFamily: "Orbitron, sans-serif", fontSize: "0.72rem",
          letterSpacing: "0.15em", color: "#FF8080", textAlign: "center", marginBottom: "0.75rem",
        }}>DELETE PROFILE?</h2>
        <p style={{
          fontFamily: "Syne, sans-serif", fontSize: "0.82rem",
          color: "rgba(232,217,160,0.45)", textAlign: "center", marginBottom: "1.5rem", lineHeight: 1.6,
        }}>
          <span style={{ color: "rgba(255,150,150,0.7)" }}>{profile.name}</span> and all their chat history will be permanently deleted.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <HexActionButton variant="ghost" onClick={onClose}>Cancel</HexActionButton>
          <HexActionButton variant="danger" onClick={onConfirm} loading={deleting}>Delete</HexActionButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  const [pageLoading, setPageLoading]       = useState(true);
  const [username, setUsername]             = useState("");
  const [email, setEmail]                   = useState("");
  const [infoLoading, setInfoLoading]       = useState(false);
  const [currentPw, setCurrentPw]           = useState("");
  const [newPw, setNewPw]                   = useState("");
  const [confirmPw, setConfirmPw]           = useState("");
  const [pwLoading, setPwLoading]           = useState(false);
  const [profession, setProfession]         = useState(null);
  const [profLoading, setProfLoading]       = useState(false);
  const [toast, setToast]                   = useState(null);
  const [profileList, setProfileList]       = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [selectLoading, setSelectLoading]   = useState(null);
  const [modal, setModal]                   = useState(null);
  const [modalSaving, setModalSaving]       = useState(false);
  const [deleting, setDeleting]             = useState(false);

  const showToast = useCallback((msg, type = "success") => setToast({ msg, type }), []);

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!auth.isLoggedIn()) { navigate("/login"); return; }
    const load = async () => {
      try {
        const [accountData, profilesData] = await Promise.all([
          userApi.getProfile(),
          profilesApi.getAll(),
        ]);
        setUsername(accountData.user?.name || accountData.name || "");
        setEmail(accountData.user?.email || accountData.email || "");
        setProfession(accountData.user?.profession || accountData.profession || null);
        const list = profilesData.profiles || [];
        setProfileList(list);
        profilesApi.setCached(list); // ← sync cache

        const active = profilesApi.getActive();
        if (active) setActiveProfileId(active._id);
      } catch {
        const cached = auth.getUser();
        if (cached) {
          setUsername(cached.name || "");
          setEmail(cached.email || "");
          setProfession(cached.profession || null);
        }
        showToast("Couldn't load latest data.", "error");
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, [navigate, showToast]);

  // ── Select profile → go to dashboard ─────────────────────────────────────
  const handleSelectProfile = async (profileId) => {
    if (profileId === activeProfileId) return;
    setSelectLoading(profileId);
    try {
      const data = await profilesApi.select(profileId);
      setActiveProfileId(data.profile._id);
      showToast(`Switched to ${data.profile.name} 🐝`);
      return data;
    } catch (err) {
      showToast(err.message || "Failed to switch profile.", "error");
    } finally {
      setSelectLoading(null);
    }
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreateProfile = async ({ name, avatar, profession: prof }) => {
    setModalSaving(true);
    try {
      const data = await profilesApi.create(name, avatar, prof);
      const newList = [...profileList, data.profile];
      setProfileList(newList);
      profilesApi.setCached(newList); // ← sync cache
      setModal(null);
      showToast(`${name} added to the hive! 🐝`);
    } catch (err) {
      showToast(err.message || "Failed to create profile.", "error");
    } finally {
      setModalSaving(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEditProfile = async ({ name, avatar, profession: prof }) => {
    setModalSaving(true);
    try {
      const data = await profilesApi.update(modal.profile._id, { name, avatar, profession: prof });
      const newList = profileList.map(p => p._id === data.profile._id ? data.profile : p);
      setProfileList(newList);
      profilesApi.setCached(newList); // ← sync cache
      if (data.profile._id === activeProfileId) {
        const current = profilesApi.getActive();
        localStorage.setItem("mb_active_profile", JSON.stringify({ ...current, ...data.profile }));
      }
      setModal(null);
      showToast("Profile updated!");
    } catch (err) {
      showToast(err.message || "Failed to update profile.", "error");
    } finally {
      setModalSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteProfile = async () => {
    setDeleting(true);
    try {
      await profilesApi.delete(modal.profile._id);
      const wasActive = modal.profile._id === activeProfileId;
      const newList = profileList.filter(p => p._id !== modal.profile._id);
      setProfileList(newList);
      profilesApi.setCached(newList); // ← sync cache
      if (wasActive) { profilesApi.clearActive(); setActiveProfileId(null); }
      setModal(null);
      showToast("Profile deleted.");
    } catch (err) {
      showToast(err.message || "Failed to delete profile.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ── Account saves ─────────────────────────────────────────────────────────
  const saveInfo = async () => {
    if (!username.trim()) { showToast("Username can't be empty.", "error"); return; }
    setInfoLoading(true);
    try {
      const data = await userApi.updateProfile({ name: username.trim(), email: email.trim() });
      const cached = auth.getUser();
      auth.saveSession(localStorage.getItem("mb_token"), { ...cached, ...data.user });
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(err.message || "Failed to update profile.", "error");
    } finally {
      setInfoLoading(false);
    }
  };

  const savePassword = async () => {
    if (!currentPw)          { showToast("Enter your current password.", "error"); return; }
    if (newPw.length < 6)    { showToast("New password must be at least 6 characters.", "error"); return; }
    if (newPw !== confirmPw) { showToast("Passwords don't match.", "error"); return; }
    setPwLoading(true);
    try {
      await userApi.updateProfile({ currentPassword: currentPw, newPassword: newPw });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      showToast("Password changed successfully!");
    } catch (err) {
      showToast(err.message || "Failed to change password.", "error");
    } finally {
      setPwLoading(false);
    }
  };

  const saveProfession = async () => {
    if (!profession) { showToast("Select a profession first.", "error"); return; }
    setProfLoading(true);
    try {
      const data = await userApi.updateProfile({ profession });
      const cached = auth.getUser();
      auth.saveSession(localStorage.getItem("mb_token"), { ...cached, ...data.user });
      showToast("Profession updated!");
    } catch (err) {
      showToast(err.message || "Failed to update profession.", "error");
    } finally {
      setProfLoading(false);
    }
  };

  const handleLogout = () => { auth.logout(); navigate("/login"); };

  if (pageLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#080D1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          style={{ width: 40, height: 40 * 1.1547, clipPath: HEX, border: "2px solid rgba(244,180,0,0.15)", borderTopColor: "#F4B400", background: "transparent" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080D1A", fontFamily: "Syne, sans-serif", position: "relative", overflow: "hidden" }}>
      <InteractiveHive />

      <div style={{ position: "fixed", left: "-8%", top: "15%", width: isMobile ? 240 : 480, height: isMobile ? 240 : 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(244,180,0,0.07) 0%, transparent 70%)", filter: "blur(70px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", right: "5%", bottom: "10%", width: isMobile ? 180 : 360, height: isMobile ? 180 : 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,213,79,0.05) 0%, transparent 70%)", filter: "blur(90px)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}>
        {!isMobile && <>
          <FloatingHex size={160} x="78%" y="5%"  opacity={0.04} rotate={15}  delay={0.2} blur={4} />
          <FloatingHex size={80}  x="-2%" y="60%" opacity={0.05} rotate={-10} delay={0.5} blur={3} />
          <FloatingHex size={55}  x="88%" y="70%" opacity={0.06} rotate={30}  delay={0.7} blur={2} />
        </>}
        <FloatingHex size={isMobile ? 30 : 40} x="6%"  y="12%" opacity={0.11} rotate={-5}  delay={0.9} color="#FFD54F" />
        <FloatingHex size={isMobile ? 18 : 26} x="85%" y="30%" opacity={0.13} rotate={20}  delay={1.1} />
      </div>

      <div style={{ position: "fixed", inset: 0, zIndex: 2, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(244,180,0,0.012) 2px, rgba(244,180,0,0.012) 4px)", pointerEvents: "none" }} />

      {/* Top nav */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(8,13,26,0.75)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(244,180,0,0.08)", padding: isMobile ? "0.75rem 1.25rem" : "0.85rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <motion.div whileHover={{ scale: 1.04 }} onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ width: isMobile ? 24 : 28, height: (isMobile ? 24 : 28) * 1.1547, clipPath: HEX, background: "linear-gradient(135deg,#F4B400,#FFD54F)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? "0.7rem" : "0.8rem" }}>🐝</div>
          <span style={{ fontFamily: "Orbitron, sans-serif", fontWeight: 700, fontSize: isMobile ? "0.72rem" : "0.82rem", color: "#F4B400", letterSpacing: "0.1em" }}>MIGHTBEE</span>
        </motion.div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => navigate("/dashboard")}
          style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(244,180,0,0.07)", border: "1px solid rgba(244,180,0,0.2)", borderRadius: 3, padding: "6px 14px", cursor: "pointer", fontFamily: "Orbitron, sans-serif", fontSize: "0.55rem", letterSpacing: "0.15em", color: "rgba(244,180,0,0.6)", textTransform: "uppercase", transition: "all 0.2s" }}>
          ← Dashboard
        </motion.button>
      </div>

      {/* Page content */}
      <div style={{ position: "relative", zIndex: 10, maxWidth: 600, margin: "0 auto", padding: isMobile ? "5.5rem 1.25rem 3rem" : "6rem 1.5rem 3rem" }}>

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: 14 }}>
          <motion.div animate={{ rotate: [0, 6, 0, -6, 0] }} transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}>
            <div style={{ width: isMobile ? 44 : 54, height: (isMobile ? 44 : 54) * 1.1547, clipPath: HEX, background: "linear-gradient(135deg,#F4B400,#FFD54F)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? "1.1rem" : "1.3rem", boxShadow: "0 0 28px rgba(244,180,0,0.4)" }}>👤</div>
          </motion.div>
          <div>
            <h1 style={{ fontFamily: "Orbitron, sans-serif", fontWeight: 900, fontSize: isMobile ? "1.1rem" : "1.3rem", color: "#F4B400", letterSpacing: "0.12em", marginBottom: 4, textShadow: "0 0 30px rgba(244,180,0,0.3)" }}>HIVE PROFILE</h1>
            <p style={{ fontFamily: "Syne, sans-serif", fontSize: "0.8rem", color: "rgba(232,217,160,0.4)", letterSpacing: "0.04em" }}>
              {username && <span style={{ color: "rgba(244,180,0,0.6)" }}>{username}</span>}
              {username && " · "}Manage your worker bee identity
            </p>
          </div>
        </motion.div>

        {/* ── Hive Members ── */}
        <SectionCard title="Hive Members" icon="🐝" delay={0}>
          <p style={{ fontFamily: "Syne, sans-serif", fontSize: "0.82rem", color: "rgba(232,217,160,0.4)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            Up to <span style={{ color: "#FFD54F" }}>6 members</span> can share this account. Each has their own isolated chat history.
            <br />
            <span style={{ color: "rgba(244,180,0,0.4)", fontSize: "0.75rem" }}>Click a member to switch to their dashboard.</span>
          </p>

          <AnimatePresence mode="popLayout">
            <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 16 : 24, justifyContent: profileList.length === 0 ? "center" : "flex-start", minHeight: 100, alignItems: "flex-start" }}>
              {profileList.map(p => (
                <ProfileCard
                  key={p._id}
                  profile={p}
                  isActive={p._id === activeProfileId}
                  onSelect={handleSelectProfile}
                  onEdit={(profile) => setModal({ type: "edit", profile })}
                  onDelete={(profile) => setModal({ type: "delete", profile })}
                  selectLoading={selectLoading}
                  isMobile={isMobile}
                  navigate={navigate}
                />
              ))}

              {profileList.length < MAX_PROFILES && (
                <AddProfileCard onClick={() => setModal({ type: "create" })} isMobile={isMobile} />
              )}

              {profileList.length === 0 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ fontFamily: "Syne, sans-serif", fontSize: "0.8rem", color: "rgba(232,217,160,0.25)", textAlign: "center", width: "100%" }}>
                  No members yet. Add your first profile above.
                </motion.p>
              )}
            </div>
          </AnimatePresence>

          <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(244,180,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.52rem", letterSpacing: "0.12em", color: "rgba(244,180,0,0.3)" }}>
              {profileList.length} / {MAX_PROFILES} MEMBERS
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              {[...Array(MAX_PROFILES)].map((_, i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: 1, background: i < profileList.length ? "rgba(244,180,0,0.6)" : "rgba(244,180,0,0.1)", transition: "background 0.3s" }} />
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Account Info */}
        <SectionCard title="Account Info" icon="✏️" delay={0.1}>
          <HexInput label="Name" value={username} onChange={e => setUsername(e.target.value)} placeholder="worker_bee_42" />
          <HexInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@hive.io" />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <HexActionButton onClick={saveInfo} loading={infoLoading} disabled={infoLoading}>Save Info</HexActionButton>
          </div>
        </SectionCard>

        {/* Change Password */}
        <SectionCard title="Change Password" icon="🔐" delay={0.2}>
          <HexInput label="Current Password" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••••" />
          <HexInput label="New Password" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••••" />
          <HexInput label="Confirm New Password" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••••" />
          {newPw && (
            <div style={{ marginBottom: "1.25rem", marginTop: "-0.5rem" }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                {[1,2,3,4].map(i => {
                  const strength = Math.min(4, (newPw.length >= 6 ? 1 : 0) + (newPw.length >= 10 ? 1 : 0) + (/[^a-zA-Z0-9]/.test(newPw) ? 1 : 0) + (/[A-Z]/.test(newPw) && /[0-9]/.test(newPw) ? 1 : 0));
                  const colors = ["#FF5555","#FF9800","#FFD54F","#4ADE80"];
                  return <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? colors[strength-1] : "rgba(244,180,0,0.08)", transition: "background 0.3s" }} />;
                })}
              </div>
              <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.5rem", letterSpacing: "0.15em", color: "rgba(244,180,0,0.35)" }}>
                {["","WEAK","FAIR","GOOD","STRONG"][Math.min(4,(newPw.length>=6?1:0)+(newPw.length>=10?1:0)+(/[^a-zA-Z0-9]/.test(newPw)?1:0)+(/[A-Z]/.test(newPw)&&/[0-9]/.test(newPw)?1:0))]}
              </span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <HexActionButton onClick={savePassword} loading={pwLoading} disabled={pwLoading}>Change Password</HexActionButton>
          </div>
        </SectionCard>

        {/* Profession */}
        <SectionCard title="Profession & Preferences" icon="🎯" delay={0.3}>
          <p style={{ fontFamily: "Syne, sans-serif", fontSize: "0.82rem", color: "rgba(232,217,160,0.45)", marginBottom: "1.2rem", lineHeight: 1.6 }}>
            Livvy adapts her tone based on your <span style={{ color: "#FFD54F" }}>profession</span>.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: isMobile ? 8 : 10, marginBottom: "1.5rem" }}>
            {PROFESSIONS.map(p => (
              <motion.button key={p.id} whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setProfession(p.id)}
                style={{ padding: isMobile ? "12px 6px" : "14px 8px", border: `1px solid ${profession === p.id ? "#F4B400" : "rgba(244,180,0,0.15)"}`, borderRadius: 3, background: profession === p.id ? "rgba(244,180,0,0.14)" : "rgba(8,13,26,0.6)", color: profession === p.id ? "#F4B400" : "rgba(232,217,160,0.5)", cursor: "pointer", textAlign: "center", transition: "all 0.2s", boxShadow: profession === p.id ? "0 0 16px rgba(244,180,0,0.2)" : "none", position: "relative", overflow: "hidden" }}>
                {profession === p.id && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(244,180,0,0.6), transparent)" }} />}
                <div style={{ fontSize: isMobile ? "1.2rem" : "1.4rem", marginBottom: 5 }}>{p.emoji}</div>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: isMobile ? "0.5rem" : "0.58rem", letterSpacing: "0.08em" }}>{p.label}</div>
              </motion.button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <HexActionButton onClick={saveProfession} loading={profLoading} disabled={profLoading || !profession}>Save Preference</HexActionButton>
          </div>
        </SectionCard>

        {/* Session */}
        <SectionCard title="Session" icon="⏻" delay={0.4}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontFamily: "Syne, sans-serif", fontSize: "0.85rem", color: "rgba(232,217,160,0.55)", marginBottom: 4 }}>Signed in as <span style={{ color: "#F4B400" }}>{email || username}</span></p>
              <p style={{ fontFamily: "Syne, sans-serif", fontSize: "0.72rem", color: "rgba(232,217,160,0.25)" }}>You will be redirected to the login page.</p>
            </div>
            <HexActionButton variant="danger" onClick={handleLogout}>⏻ &nbsp;Logout</HexActionButton>
          </div>
        </SectionCard>

        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: "2rem", opacity: 0.1 }}>
          {[...Array(5)].map((_, i) => (
            <motion.div key={i} animate={{ opacity: [0.3,1,0.3] }} transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.25, ease: "easeInOut" }}
              style={{ width: 8, height: 8 * 1.1547, clipPath: HEX, background: "#F4B400" }} />
          ))}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal?.type === "create" && <ProfileModal key="create" mode="create" onSave={handleCreateProfile} onClose={() => setModal(null)} saving={modalSaving} isMobile={isMobile} />}
        {modal?.type === "edit" && <ProfileModal key="edit" mode="edit" initial={modal.profile} onSave={handleEditProfile} onClose={() => setModal(null)} saving={modalSaving} isMobile={isMobile} />}
        {modal?.type === "delete" && <DeleteModal profile={modal.profile} onConfirm={handleDeleteProfile} onClose={() => setModal(null)} deleting={deleting} />}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}