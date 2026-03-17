import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import InteractiveHive from "../components/ui/InteractiveHive";
import HexButton from "../components/ui/HexButton";
import { auth, profiles as profilesApi } from "../services/api";

const HEX = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

const PROFESSIONS = [
  { id: "student",    label: "Student",    emoji: "🎓" },
  { id: "developer",  label: "Developer",  emoji: "💻" },
  { id: "researcher", label: "Researcher", emoji: "🔬" },
  { id: "teacher",    label: "Teacher",    emoji: "📚" },
  { id: "creator",    label: "Creator",    emoji: "🎨" },
  { id: "business",   label: "Business",   emoji: "📊" },
];

const AVATARS = ["🐝","🦋","🌸","🔥","⚡","🌙","🎯","🚀","🌿","💎","🎨","🔬"];

function useBreakpoint() {
  const [bp, setBp] = useState({ isMobile: false });
  useEffect(() => {
    const update = () => setBp({ isMobile: window.innerWidth < 768 });
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

function HexInput({ label, type = "text", value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <label style={{
        display: "block", fontFamily: "Orbitron, sans-serif",
        fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase",
        marginBottom: 7,
        color: focused ? "#F4B400" : "rgba(244,180,0,0.45)",
        transition: "color 0.2s",
      }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "11px 15px",
          background: "rgba(8,13,26,0.85)",
          border: `1px solid ${focused ? "rgba(244,180,0,0.7)" : "rgba(244,180,0,0.15)"}`,
          borderRadius: 3, color: "#E8D9A0",
          fontFamily: "Syne, sans-serif", fontSize: "0.88rem",
          outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: focused ? "0 0 18px rgba(244,180,0,0.13)" : "none",
          letterSpacing: "0.02em", boxSizing: "border-box",
        }}
      />
    </div>
  );
}

// ── Netflix-style Profile Picker ──────────────────────────────────────────────
function ProfilePicker({ profiles, onSelect, selecting }) {
  const { isMobile } = useBreakpoint();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "#080D1A",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "Syne, sans-serif",
        overflow: "hidden",
      }}
    >
      <InteractiveHive />

      {/* Background orbs */}
      <div style={{ position: "fixed", left: "-10%", top: "10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(244,180,0,0.06) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", right: "0%", bottom: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,213,79,0.05) 0%, transparent 70%)", filter: "blur(90px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(244,180,0,0.01) 2px, rgba(244,180,0,0.01) 4px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "0 1.5rem", maxWidth: 900, width: "100%" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ marginBottom: isMobile ? "2.5rem" : "3.5rem" }}
        >
          <motion.div
            animate={{ rotate: [0, 5, 0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            style={{ display: "inline-block", marginBottom: 16 }}
          >
            <div style={{
              width: isMobile ? 44 : 54, height: (isMobile ? 44 : 54) * 1.1547,
              clipPath: HEX, background: "linear-gradient(135deg,#F4B400,#FFD54F)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: isMobile ? "1.1rem" : "1.3rem",
              boxShadow: "0 0 30px rgba(244,180,0,0.5)",
              margin: "0 auto",
            }}>🐝</div>
          </motion.div>
          <h1 style={{
            fontFamily: "Orbitron, sans-serif", fontWeight: 900,
            fontSize: isMobile ? "1.2rem" : "1.8rem",
            color: "#F4B400", letterSpacing: "0.12em",
            textShadow: "0 0 40px rgba(244,180,0,0.35)",
            margin: "0 0 10px",
          }}>WHO'S BUZZING?</h1>
          <p style={{
            fontFamily: "Syne, sans-serif", fontSize: isMobile ? "0.8rem" : "0.92rem",
            color: "rgba(232,217,160,0.4)", letterSpacing: "0.04em",
          }}>Select your hive identity to continue</p>
        </motion.div>

        {/* Profile grid */}
        <div style={{
          display: "flex", flexWrap: "wrap",
          justifyContent: "center",
          gap: isMobile ? "1.5rem 1.2rem" : "2rem 2.5rem",
          marginBottom: "3rem",
        }}>
          {profiles.map((profile, i) => (
            <ProfilePickerCard
              key={profile._id}
              profile={profile}
              index={i}
              onSelect={onSelect}
              selecting={selecting}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          style={{
            fontFamily: "Syne, sans-serif", fontSize: "0.75rem",
            color: "rgba(232,217,160,0.2)", letterSpacing: "0.04em",
          }}
        >
          Manage profiles in settings
        </motion.p>
      </div>
    </motion.div>
  );
}

function ProfilePickerCard({ profile, index, onSelect, selecting, isMobile }) {
  const [hovered, setHovered] = useState(false);
  const isSelecting = selecting === profile._id;
  const size = isMobile ? 80 : 110;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, cursor: selecting ? "wait" : "pointer" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => !selecting && onSelect(profile._id)}
    >
      {/* Big hex avatar */}
      <motion.div
        animate={{
          scale: hovered ? 1.1 : 1,
          boxShadow: hovered
            ? "0 0 40px rgba(244,180,0,0.6), 0 0 80px rgba(244,180,0,0.2)"
            : "0 0 0px rgba(244,180,0,0)",
        }}
        transition={{ duration: 0.25 }}
        style={{
          width: size, height: size * 1.1547,
          clipPath: HEX,
          background: hovered
            ? "linear-gradient(135deg, rgba(244,180,0,0.28), rgba(255,213,79,0.18))"
            : "rgba(13,21,37,0.9)",
          border: `2px solid ${hovered ? "#F4B400" : "rgba(244,180,0,0.2)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: isMobile ? "2rem" : "2.8rem",
          position: "relative",
          transition: "border-color 0.25s, background 0.25s",
        }}
      >
        {isSelecting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            style={{
              width: isMobile ? 22 : 28, height: isMobile ? 22 : 28,
              border: "2px solid rgba(244,180,0,0.25)",
              borderTopColor: "#F4B400", borderRadius: "50%",
            }}
          />
        ) : (
          profile.avatar
        )}

        {/* Hover glow overlay */}
        <AnimatePresence>
          {hovered && !isSelecting && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: "absolute", inset: 0, clipPath: HEX,
                background: "rgba(244,180,0,0.08)",
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Name */}
      <motion.span
        animate={{ color: hovered ? "#F4B400" : "rgba(232,217,160,0.65)" }}
        transition={{ duration: 0.2 }}
        style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: isMobile ? "0.62rem" : "0.72rem",
          letterSpacing: "0.1em", textTransform: "uppercase",
          maxWidth: isMobile ? 80 : 120,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          textAlign: "center",
        }}
      >{profile.name}</motion.span>

      {/* Profession badge */}
      {profile.profession && (
        <motion.span
          animate={{ opacity: hovered ? 0.8 : 0.35 }}
          style={{
            fontFamily: "Syne, sans-serif", fontSize: "0.62rem",
            color: "rgba(244,180,0,0.6)", letterSpacing: "0.04em",
            marginTop: -8,
          }}
        >{profile.profession}</motion.span>
      )}
    </motion.div>
  );
}

// ── Main Login Page ───────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  const [mode, setMode] = useState("login");

  // Login fields
  const [loginEmail, setLoginEmail]       = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup fields — all on one page
  const [username, setUsername]           = useState("");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [profession, setProfession]       = useState(null);
  const [displayName, setDisplayName]     = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🐝");

  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState("");
  const [msgType, setMsgType]   = useState("error");

  // Profile picker state (shown after login)
  const [showPicker, setShowPicker]     = useState(false);
  const [pickerProfiles, setPickerProfiles] = useState([]);
  const [selecting, setSelecting]       = useState(null); // profileId being selected

  const isSignup = mode === "signup";

  useEffect(() => {
    if (auth.isLoggedIn()) navigate("/dashboard");
  }, [navigate]);

  const showError   = (text) => { setMsgType("error");   setMsg(text); };
  const showSuccess = (text) => { setMsgType("success"); setMsg(text); };

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
  if (!loginEmail.trim() || !loginPassword) {
    showError("Fill all fields, worker bee. 🐝"); return;
  }
  setLoading(true); setMsg("");
  try {
    const data = await auth.login(loginEmail.trim(), loginPassword);
    auth.saveSession(data.token, data.user);

    // fetch + cache profiles, then go to picker
    const profilesData = await profilesApi.getAll();
    const list = profilesData.profiles || [];
    profilesApi.setCached(list);

    showSuccess("Access granted. Entering hive...");
    setTimeout(() => navigate("/pick-profile"), 600);
  } catch (err) {
    showError(err.message || "Something went wrong. Try again.");
  } finally {
    setLoading(false);
  }
};

  // ── Profile picker selection ───────────────────────────────────────────────
  const handlePickProfile = async (profileId) => {
    setSelecting(profileId);
    try {
      const data = await profilesApi.select(profileId);
      profilesApi.setCached(pickerProfiles);
      // Small delay for satisfying animation
      setTimeout(() => navigate("/dashboard"), 400);
    } catch (err) {
      showError(err.message || "Failed to switch profile.");
      setSelecting(null);
    }
  };

  // ── Signup ─────────────────────────────────────────────────────────────────
  const handleSignup = async () => {
    if (!username.trim())    { showError("Username is required, worker bee. 🐝"); return; }
    if (!email.trim())       { showError("Email is required."); return; }
    if (password.length < 6) { showError("Password must be at least 6 characters."); return; }
    if (!profession)         { showError("Choose your profession so Livvy knows you."); return; }
    if (!displayName.trim()) { showError("Give your hive member a name."); return; }

    setLoading(true); setMsg("");
    try {
      // 1. Register account
      const data = await auth.register(username.trim(), email.trim(), password, profession);
      auth.saveSession(data.token, data.user);

      // 2. Create primary profile
      const profileData = await profilesApi.create(
        displayName.trim() || username.trim(),
        selectedAvatar,
        profession
      );
      const newProfile = profileData.profile;

      // 3. Auto-select it
      const selected = await profilesApi.select(newProfile._id);
      profilesApi.setCached([selected.profile]);

      showSuccess("Welcome to the hive! 🐝");
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      showError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isSignup) handleSignup();
    else handleLogin();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: "#080D1A",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      position: "relative", overflow: "hidden", fontFamily: "Syne, sans-serif",
    }}>
      {/* Netflix profile picker overlay */}
      <AnimatePresence>
        {showPicker && (
          <ProfilePicker
            profiles={pickerProfiles}
            onSelect={handlePickProfile}
            selecting={selecting}
          />
        )}
      </AnimatePresence>

      <InteractiveHive />

      {/* Background orbs */}
      <div style={{ position: "fixed", left: "-8%", top: "15%", width: isMobile ? 240 : 480, height: isMobile ? 240 : 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(244,180,0,0.07) 0%, transparent 70%)", filter: "blur(70px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", right: "5%", bottom: "10%", width: isMobile ? 180 : 360, height: isMobile ? 180 : 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,213,79,0.05) 0%, transparent 70%)", filter: "blur(90px)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}>
        {!isMobile && <>
          <FloatingHex size={160} x="76%" y="4%"  opacity={0.04} rotate={15}  delay={0.2} blur={4} />
          <FloatingHex size={90}  x="-2%" y="58%" opacity={0.05} rotate={-10} delay={0.5} blur={3} />
          <FloatingHex size={60}  x="88%" y="68%" opacity={0.06} rotate={30}  delay={0.7} blur={2} />
        </>}
        <FloatingHex size={isMobile ? 30 : 40} x="8%"  y="10%" opacity={0.11} rotate={-5}  delay={0.9} color="#FFD54F" />
        <FloatingHex size={isMobile ? 18 : 26} x="84%" y="28%" opacity={0.13} rotate={20}  delay={1.1} />
        <motion.div animate={{ scale: [1,1.2,1], opacity: [0.3,0.7,0.3] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }} style={{ position: "absolute", left: "22%", top: "20%" }}>
          <FloatingHex size={isMobile ? 7 : 10} x={0} y={0} opacity={0.55} rotate={30} delay={0} color="#F4B400" />
        </motion.div>
      </div>

      <div style={{ position: "fixed", inset: 0, zIndex: 2, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(244,180,0,0.012) 2px, rgba(244,180,0,0.012) 4px)", pointerEvents: "none" }} />

      {/* Top nav */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(8,13,26,0.75)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(244,180,0,0.08)", padding: isMobile ? "0.75rem 1.25rem" : "0.85rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <motion.div whileHover={{ scale: 1.04 }} onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ width: isMobile ? 24 : 28, height: (isMobile ? 24 : 28) * 1.1547, clipPath: HEX, background: "linear-gradient(135deg,#F4B400,#FFD54F)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? "0.7rem" : "0.8rem" }}>🐝</div>
          <span style={{ fontFamily: "Orbitron, sans-serif", fontWeight: 700, fontSize: isMobile ? "0.72rem" : "0.82rem", color: "#F4B400", letterSpacing: "0.1em" }}>MIGHTBEE</span>
        </motion.div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F4B400", boxShadow: "0 0 8px #F4B400" }} />
          {!isMobile && <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.55rem", letterSpacing: "0.22em", color: "rgba(244,180,0,0.4)", textTransform: "uppercase" }}>Hive Access</span>}
        </div>
      </div>

      {/* Auth card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative", zIndex: 10,
          width: "100%", maxWidth: isMobile ? "100%" : 480,
          margin: isMobile ? "4.5rem 0 0" : "5rem 1.5rem 2rem",
          background: "rgba(13,21,37,0.88)", backdropFilter: "blur(24px)",
          border: isMobile ? "none" : "1px solid rgba(244,180,0,0.2)",
          borderTop: "1px solid rgba(244,180,0,0.2)",
          borderRadius: isMobile ? "0" : 4,
          padding: isMobile ? "2rem 1.5rem 3rem" : "2.5rem 2.5rem",
          boxShadow: isMobile ? "none" : "0 0 80px rgba(244,180,0,0.07), 0 32px 100px rgba(0,0,0,0.55)",
          minHeight: isMobile ? "calc(100vh - 4.5rem)" : "auto",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(244,180,0,0.55), transparent)" }} />

        {!isMobile && [{ top: -12, left: -12 }, { top: -12, right: -12 }, { bottom: -12, left: -12 }, { bottom: -12, right: -12 }].map((pos, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 + i * 0.07, duration: 0.5 }}
            style={{ position: "absolute", ...pos, width: 24, height: 24 * 1.1547, clipPath: HEX, background: "rgba(244,180,0,0.12)", border: "1px solid rgba(244,180,0,0.45)" }} />
        ))}

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
          <motion.div animate={{ rotate: [0, 6, 0, -6, 0] }} transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }} style={{ display: "inline-block", marginBottom: 12 }}>
            <div style={{ width: isMobile ? 44 : 50, height: (isMobile ? 44 : 50) * 1.1547, clipPath: HEX, background: "linear-gradient(135deg,#F4B400,#FFD54F)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? "1.1rem" : "1.3rem", boxShadow: "0 0 28px rgba(244,180,0,0.45)" }}>🐝</div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, letterSpacing: "0.5em" }} animate={{ opacity: 1, letterSpacing: "0.14em" }} transition={{ duration: 1, delay: 0.2 }}
            style={{ fontFamily: "Orbitron, sans-serif", fontWeight: 900, fontSize: isMobile ? "1.3rem" : "1.5rem", color: "#F4B400", textShadow: "0 0 40px rgba(244,180,0,0.4)", letterSpacing: "0.14em", marginBottom: 6 }}>MIGHTBEE</motion.h1>
          <AnimatePresence mode="wait">
            <motion.p key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}
              style={{ fontFamily: "Syne, sans-serif", fontSize: "0.8rem", color: "rgba(232,217,160,0.45)", letterSpacing: "0.04em" }}>
              {isSignup ? "Join the hive — set everything up below" : "Access the hive"}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.6rem" }}>
          <div style={{ height: 1, flex: 1, background: "linear-gradient(to right, transparent, rgba(244,180,0,0.2))" }} />
          <div style={{ width: 6, height: 6, clipPath: HEX, background: "rgba(244,180,0,0.4)" }} />
          <div style={{ height: 1, flex: 1, background: "linear-gradient(to left, transparent, rgba(244,180,0,0.2))" }} />
        </div>

        {/* Mode tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, background: "rgba(8,13,26,0.6)", border: "1px solid rgba(244,180,0,0.12)", borderRadius: 3, padding: 3, marginBottom: "1.8rem" }}>
          {["login", "signup"].map(m => (
            <motion.button key={m} whileTap={{ scale: 0.97 }}
              onClick={() => { setMode(m); setMsg(""); }}
              style={{ padding: "9px", border: "none", borderRadius: 2, background: mode === m ? "rgba(244,180,0,0.16)" : "transparent", color: mode === m ? "#F4B400" : "rgba(232,217,160,0.35)", fontFamily: "Orbitron, sans-serif", fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" }}>
              {m === "login" ? "Login" : "Sign Up"}
            </motion.button>
          ))}
        </div>

        {/* ── LOGIN FORM ── */}
        <AnimatePresence mode="wait">
          {!isSignup && (
            <motion.div key="login-form" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.28 }}>
              <HexInput label="Email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@hive.io" />
              <HexInput label="Password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••••" />
            </motion.div>
          )}

          {/* ── SIGNUP FORM — all on one page ── */}
          {isSignup && (
            <motion.div key="signup-form" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.28 }}>

              {/* Section: Account */}
              <div style={{ marginBottom: "1.6rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
                  <div style={{ width: 18, height: 18 * 1.1547, clipPath: HEX, background: "rgba(244,180,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", flexShrink: 0 }}>1</div>
                  <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.55rem", letterSpacing: "0.18em", color: "rgba(244,180,0,0.5)", textTransform: "uppercase" }}>Account Credentials</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(244,180,0,0.08)" }} />
                </div>
                <HexInput label="Username" value={username} onChange={e => setUsername(e.target.value)} placeholder="worker_bee_42" />
                <HexInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@hive.io" />
                <HexInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••" />
              </div>

              {/* Section: Profession */}
              <div style={{ marginBottom: "1.6rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
                  <div style={{ width: 18, height: 18 * 1.1547, clipPath: HEX, background: "rgba(244,180,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", flexShrink: 0 }}>2</div>
                  <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.55rem", letterSpacing: "0.18em", color: "rgba(244,180,0,0.5)", textTransform: "uppercase" }}>Your Profession</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(244,180,0,0.08)" }} />
                </div>
                <p style={{ fontFamily: "Syne, sans-serif", fontSize: "0.8rem", color: "rgba(232,217,160,0.4)", marginBottom: "0.9rem", lineHeight: 1.5 }}>
                  So Livvy can <span style={{ color: "#FFD54F" }}>adapt</span> her tone to your world:
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: isMobile ? 7 : 8, marginBottom: "0.5rem" }}>
                  {PROFESSIONS.map(p => (
                    <motion.button key={p.id} whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setProfession(p.id)}
                      style={{ padding: "11px 6px", border: `1px solid ${profession === p.id ? "#F4B400" : "rgba(244,180,0,0.13)"}`, borderRadius: 3, background: profession === p.id ? "rgba(244,180,0,0.14)" : "rgba(8,13,26,0.6)", color: profession === p.id ? "#F4B400" : "rgba(232,217,160,0.5)", cursor: "pointer", textAlign: "center", transition: "all 0.18s", boxShadow: profession === p.id ? "0 0 14px rgba(244,180,0,0.18)" : "none", position: "relative", overflow: "hidden" }}>
                      {profession === p.id && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(244,180,0,0.6), transparent)" }} />}
                      <div style={{ fontSize: "1.3rem", marginBottom: 4 }}>{p.emoji}</div>
                      <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.5rem", letterSpacing: "0.07em" }}>{p.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Section: Identity */}
              <div style={{ marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
                  <div style={{ width: 18, height: 18 * 1.1547, clipPath: HEX, background: "rgba(244,180,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", flexShrink: 0 }}>3</div>
                  <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.55rem", letterSpacing: "0.18em", color: "rgba(244,180,0,0.5)", textTransform: "uppercase" }}>Hive Identity</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(244,180,0,0.08)" }} />
                </div>
                <HexInput label="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="e.g. Manan" />
                <div>
                  <label style={{ display: "block", fontFamily: "Orbitron, sans-serif", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 9, color: "rgba(244,180,0,0.45)" }}>Pick Your Avatar</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 7 }}>
                    {AVATARS.map(av => (
                      <motion.button key={av} whileHover={{ scale: 1.14 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedAvatar(av)}
                        style={{ padding: "9px 4px", border: `1px solid ${selectedAvatar === av ? "#F4B400" : "rgba(244,180,0,0.14)"}`, borderRadius: 4, background: selectedAvatar === av ? "rgba(244,180,0,0.18)" : "rgba(8,13,26,0.6)", fontSize: "1.15rem", cursor: "pointer", boxShadow: selectedAvatar === av ? "0 0 10px rgba(244,180,0,0.22)" : "none", transition: "all 0.18s" }}>
                        {av}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message */}
        <AnimatePresence>
          {msg && (
            <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontFamily: "Syne, sans-serif", fontSize: "0.8rem", color: msgType === "success" ? "#4ADE80" : "#FFD54F", textAlign: "center", margin: "1rem 0 0", padding: "8px 12px", background: msgType === "success" ? "rgba(74,222,128,0.07)" : "rgba(244,180,0,0.07)", border: `1px solid ${msgType === "success" ? "rgba(74,222,128,0.22)" : "rgba(244,180,0,0.22)"}`, borderRadius: 3 }}>
              {msg}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
          <HexButton size={isMobile ? "sm" : "md"} onClick={handleSubmit} disabled={loading} variant="primary">
            {loading
              ? (isSignup ? "Creating hive..." : "Entering hive...")
              : isSignup ? "🐝 Join Hive" : "Enter Hive"}
          </HexButton>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.4rem", fontFamily: "Syne, sans-serif", fontSize: "0.78rem", color: "rgba(232,217,160,0.3)" }}>
          {mode === "login" ? (
            <>New worker bee?{" "}<span onClick={() => setMode("signup")} style={{ color: "#F4B400", cursor: "pointer" }}>Create account</span></>
          ) : (
            <>Already in the hive?{" "}<span onClick={() => setMode("login")} style={{ color: "#F4B400", cursor: "pointer" }}>Login</span></>
          )}
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: "1.8rem", opacity: 0.12 }}>
          {[...Array(5)].map((_, i) => (
            <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.25, ease: "easeInOut" }}
              style={{ width: 8, height: 8 * 1.1547, clipPath: HEX, background: "#F4B400" }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}