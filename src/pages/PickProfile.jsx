import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth, profiles as profilesApi } from "../services/api";

const HEX = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

function ProfileCard({ profile, index, onSelect, selecting }) {
  const [hovered, setHovered] = useState(false);
  const isSelecting = selecting === profile?._id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: 0.1 + index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => {
  if (!profile?._id || selecting) return;
  onSelect(profile._id);
}}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 16, cursor: selecting ? "wait" : "pointer",
        userSelect: "none",
      }}
    >
      {/* Big hex avatar */}
      <motion.div
        animate={{
          scale: hovered && !selecting ? 1.08 : 1,
          borderColor: hovered ? "#F4B400" : "rgba(244,180,0,0.15)",
          background: hovered
            ? "linear-gradient(135deg, rgba(244,180,0,0.22), rgba(255,213,79,0.12))"
            : "rgba(13,21,37,0.95)",
          boxShadow: hovered
            ? "0 0 50px rgba(244,180,0,0.55), 0 0 100px rgba(244,180,0,0.18)"
            : "0 0 0px rgba(244,180,0,0)",
        }}
        transition={{ duration: 0.22 }}
        style={{
          width: 130, height: 130 * 1.1547,
          clipPath: HEX,
          border: "2px solid rgba(244,180,0,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "3.5rem", position: "relative",
        }}
      >
        {isSelecting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
            style={{
              width: 32, height: 32,
              border: "2.5px solid rgba(244,180,0,0.2)",
              borderTopColor: "#F4B400", borderRadius: "50%",
            }}
          />
        ) : profile.avatar}

        {/* Hover overlay */}
        <AnimatePresence>
          {hovered && !isSelecting && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute", inset: 0, clipPath: HEX,
                background: "rgba(244,180,0,0.07)",
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Name */}
      <motion.div
        animate={{ color: hovered ? "#F4B400" : "rgba(232,217,160,0.6)" }}
        transition={{ duration: 0.2 }}
        style={{ textAlign: "center" }}
      >
        <div style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: "0.78rem", letterSpacing: "0.12em",
          textTransform: "uppercase", marginBottom: 5,
          maxWidth: 140, overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{profile.name}</div>
        {profile.profession && (
          <div style={{
            fontFamily: "Syne, sans-serif", fontSize: "0.68rem",
            color: "rgba(244,180,0,0.38)", letterSpacing: "0.04em",
          }}>{profile.profession}</div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function PickProfile() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selecting, setSelecting] = useState(null);

  useEffect(() => {
    if (!auth.isLoggedIn()) { navigate("/login"); return; }

    const load = async () => {
  try {
    const cached = profilesApi.getCached();

    if (Array.isArray(cached) && cached.length > 0) {
      setProfiles(cached.filter(Boolean));
      setLoading(false);
    }

    const data = await profilesApi.getAll();

    const list = Array.isArray(data?.profiles)
      ? data.profiles.filter(Boolean)
      : [];

    setProfiles(list);
    profilesApi.setCached(list);

    if (list.length === 0) navigate("/profile");

  } catch {
    const cached = profilesApi.getCached();
    if (cached?.length) setProfiles(cached.filter(Boolean));
    else navigate("/profile");
  } finally {
    setLoading(false);
  }
};
    load();
  }, [navigate]);

  const handleSelect = async (profileId) => {
  if (!profileId) return;

  setSelecting(profileId);
  try {
    await profilesApi.select(profileId);
    setTimeout(() => navigate("/dashboard"), 350);
  } catch {
    setSelecting(null);
  }
};

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#080D1A",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          style={{
            width: 44, height: 44 * 1.1547, clipPath: HEX,
            border: "2px solid rgba(244,180,0,0.12)",
            borderTopColor: "#F4B400",
          }}
        />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#080D1A",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "Syne, sans-serif", overflow: "hidden",
      position: "relative", padding: "2rem 1.5rem",
    }}>
      {/* Background glow */}
      <div style={{
        position: "fixed", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        width: 700, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(244,180,0,0.04) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(244,180,0,0.008) 2px, rgba(244,180,0,0.008) 4px)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: "center", marginBottom: "4rem", position: "relative", zIndex: 1 }}
      >
        <motion.div
          animate={{ rotate: [0, 5, 0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          style={{ display: "inline-block", marginBottom: 20 }}
        >
          <div style={{
            width: 58, height: 58 * 1.1547, clipPath: HEX,
            background: "linear-gradient(135deg, #F4B400, #FFD54F)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", margin: "0 auto",
            boxShadow: "0 0 36px rgba(244,180,0,0.5)",
          }}>🐝</div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, letterSpacing: "0.8em" }}
          animate={{ opacity: 1, letterSpacing: "0.18em" }}
          transition={{ duration: 1, delay: 0.15 }}
          style={{
            fontFamily: "Orbitron, sans-serif", fontWeight: 900,
            fontSize: "clamp(1.4rem, 4vw, 2.4rem)",
            color: "#F4B400", margin: "0 0 12px",
            textShadow: "0 0 50px rgba(244,180,0,0.4)",
          }}
        >WHO'S BUZZING?</motion.h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "clamp(0.78rem, 2vw, 0.92rem)",
            color: "rgba(232,217,160,0.35)", letterSpacing: "0.06em",
          }}
        >Select your hive identity</motion.p>
      </motion.div>

      {/* Profile grid */}
      <div style={{
        display: "flex", flexWrap: "wrap",
        justifyContent: "center",
        gap: "clamp(1.5rem, 4vw, 3.5rem)",
        maxWidth: 900, width: "100%",
        position: "relative", zIndex: 1,
        marginBottom: "3.5rem",
      }}>
        {profiles.filter(Boolean).map((profile, i) => {
  if (!profile?._id) return null;

  return (
    <ProfileCard
      key={profile._id}
      profile={profile}
      index={i}
      onSelect={handleSelect}
      selecting={selecting}
    />
  );
})}
      </div>

      {/* Manage profiles link */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <motion.button
          whileHover={{ color: "#F4B400", borderColor: "rgba(244,180,0,0.4)" }}
          onClick={() => navigate("/profile")}
          style={{
            fontFamily: "Orbitron, sans-serif", fontSize: "0.58rem",
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "rgba(232,217,160,0.25)",
            background: "transparent",
            border: "1px solid rgba(244,180,0,0.1)",
            borderRadius: 3, padding: "8px 20px",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >⚙ Manage Profiles</motion.button>
      </motion.div>

      {/* Bottom hex row */}
      <div style={{ display: "flex", gap: 6, marginTop: "2.5rem", opacity: 0.08, position: "relative", zIndex: 1 }}>
        {[...Array(7)].map((_, i) => (
          <motion.div key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.2 }}
            style={{ width: 8, height: 8 * 1.1547, clipPath: HEX, background: "#F4B400" }}
          />
        ))}
      </div>
    </div>
  );
}