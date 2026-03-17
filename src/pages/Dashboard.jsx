import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth, chat, profiles as profilesApi } from "../services/api";

const HEX = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

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

// ══════════════════════════════════════════════════════════════════
// TONE IDENTITY SYSTEM
// ══════════════════════════════════════════════════════════════════
const TONES = [
  {
    id: "concise",
    label: "Concise",
    emoji: "⚡",
    desc: "Short, punchy, clear",
    accent: "#FFD54F",
    accentDim: "rgba(255,213,79,0.18)",
    accentBorder: "rgba(255,213,79,0.45)",
    accentGlow: "rgba(255,213,79,0.3)",
    bgTint: "rgba(255,213,79,0.025)",
    btnRadius: "20px", btnPadding: "5px 16px", btnStyle: "italic",
    btnLetterSpacing: "0.02em", btnFontSize: "0.6rem", btnWeight: 600,
    activeIndicator: "glow",
    pillFormat: (t) => `[ ⚡ ${t.label.toUpperCase()} ]`,
    pillRadius: "2px", pillFontFamily: "'Orbitron', sans-serif",
    pillFontSize: "0.5rem", pillLetterSpacing: "0.18em",
    pillBg: "rgba(255,213,79,0.06)", pillBorder: "rgba(255,213,79,0.3)",
    inputBorderFocus: "rgba(255,213,79,0.7)",
    inputGlowFocus: "0 0 0 2px rgba(255,213,79,0.12), 0 0 20px rgba(255,213,79,0.08)",
    sendBg: "linear-gradient(135deg, #FFD54F 0%, #F4B400 100%)",
    sendGlow: "0 4px 18px rgba(255,213,79,0.45)",
    bubbleFontFamily: "'Syne', sans-serif", bubbleFontSize: "0.9rem",
    bubbleFontStyle: "normal", bubbleLineHeight: 1.75,
    bubbleLetterSpacing: "0.01em", bubbleTextTransform: "none",
    bubbleFontWeight: 400, bubbleBg: "rgba(10,18,32,0.97)",
    bubbleBorder: "rgba(255,213,79,0.18)", bubbleLeftBar: "#FFD54F",
    bubbleTextColor: "#FFE57F",
    dotColor: "#FFD54F", dotDuration: 0.5, dotDelay: 0.1,
    atmosphereTint: "rgba(255,213,79,0.018)",
    orbColor1: "radial-gradient(circle, rgba(255,213,79,0.25) 0%, transparent 70%)",
    orbColor2: "radial-gradient(circle, rgba(255,213,79,0.12) 0%, transparent 70%)",
  },
  {
    id: "witty",
    label: "Witty",
    emoji: "✨",
    desc: "Clever, sharp, fun",
    accent: "#69F0AE",
    accentDim: "rgba(105,240,174,0.14)",
    accentBorder: "rgba(105,240,174,0.4)",
    accentGlow: "rgba(105,240,174,0.28)",
    bgTint: "rgba(105,240,174,0.015)",
    btnRadius: "20px", btnPadding: "5px 16px", btnStyle: "italic",
    btnLetterSpacing: "0.02em", btnFontSize: "0.6rem", btnWeight: 600,
    activeIndicator: "glow",
    pillFormat: (t) => `✨ Witty mode — ${t.desc}`,
    pillRadius: "20px", pillFontFamily: "'Orbitron', sans-serif",
    pillFontSize: "0.58rem", pillLetterSpacing: "0.02em",
    pillBg: "rgba(105,240,174,0.08)", pillBorder: "rgba(105,240,174,0.28)",
    inputBorderFocus: "rgba(105,240,174,0.55)",
    inputGlowFocus: "0 0 0 2px rgba(105,240,174,0.12), 0 0 24px rgba(105,240,174,0.1)",
    sendBg: "linear-gradient(135deg, #69F0AE 0%, #00BFA5 100%)",
    sendGlow: "0 4px 18px rgba(105,240,174,0.4)",
    bubbleFontFamily: "'Syne', sans-serif", bubbleFontSize: "0.9rem",
    bubbleFontStyle: "normal", bubbleLineHeight: 1.75,
    bubbleLetterSpacing: "0.01em", bubbleTextTransform: "none",
    bubbleFontWeight: 400, bubbleBg: "rgba(4,20,14,0.95)",
    bubbleBorder: "rgba(105,240,174,0.18)", bubbleLeftBar: "#69F0AE",
    bubbleTextColor: "#CCFFF0",
    dotColor: "#69F0AE", dotDuration: 0.9, dotDelay: 0.2,
    atmosphereTint: "rgba(105,240,174,0.012)",
    orbColor1: "radial-gradient(circle, rgba(105,240,174,0.22) 0%, transparent 70%)",
    orbColor2: "radial-gradient(circle, rgba(105,240,174,0.1) 0%, transparent 70%)",
  },
  {
    id: "scientific",
    label: "Scientific",
    emoji: "🔬",
    desc: "Deep, analytical",
    accent: "#448AFF",
    accentDim: "rgba(68,138,255,0.14)",
    accentBorder: "rgba(68,138,255,0.4)",
    accentGlow: "rgba(68,138,255,0.28)",
    bgTint: "rgba(68,138,255,0.015)",
    btnRadius: "20px", btnPadding: "5px 16px", btnStyle: "italic",
    btnLetterSpacing: "0.02em", btnFontSize: "0.6rem", btnWeight: 600,
    activeIndicator: "glow",
    pillFormat: (t) => `[ANALYSIS MODE: ACTIVE] 🔬`,
    pillRadius: "0px", pillFontFamily: "'Orbitron', sans-serif",
    pillFontSize: "0.52rem", pillLetterSpacing: "0.12em",
    pillBg: "rgba(68,138,255,0.06)", pillBorder: "rgba(68,138,255,0.28)",
    inputBorderFocus: "rgba(68,138,255,0.55)",
    inputGlowFocus: "0 0 0 2px rgba(68,138,255,0.12), 0 0 20px rgba(68,138,255,0.08)",
    sendBg: "linear-gradient(135deg, #448AFF 0%, #1A237E 100%)",
    sendGlow: "0 4px 18px rgba(68,138,255,0.35)",
    bubbleFontFamily: "'Syne', sans-serif", bubbleFontSize: "0.9rem",
    bubbleFontStyle: "normal", bubbleLineHeight: 1.75,
    bubbleLetterSpacing: "0.01em", bubbleTextTransform: "none",
    bubbleFontWeight: 400, bubbleBg: "rgba(0,6,20,0.97)",
    bubbleBorder: "rgba(68,138,255,0.18)", bubbleLeftBar: "#448AFF",
    bubbleTextColor: "#BBDEFB",
    dotColor: "#448AFF", dotDuration: 1.4, dotDelay: 0.35,
    atmosphereTint: "rgba(68,138,255,0.012)",
    orbColor1: "radial-gradient(circle, rgba(68,138,255,0.22) 0%, transparent 70%)",
    orbColor2: "radial-gradient(circle, rgba(68,138,255,0.1) 0%, transparent 70%)",
  },
  {
    id: "strict",
    label: "Strict",
    emoji: "🎯",
    desc: "Direct, no-fluff",
    accent: "#ee820f",
    accentDim: "rgba(238,130,15,0.14)",
    accentBorder: "rgba(238,130,15,0.45)",
    accentGlow: "rgba(238,130,15,0.28)",
    bgTint: "rgba(238,130,15,0.012)",
    btnRadius: "20px", btnPadding: "5px 16px", btnStyle: "italic",
    btnLetterSpacing: "0.02em", btnFontSize: "0.6rem", btnWeight: 600,
    activeIndicator: "glow",
    pillFormat: (t) => `▶ STRICT MODE — NO FLUFF`,
    pillRadius: "1px", pillFontFamily: "'Orbitron', sans-serif",
    pillFontSize: "0.5rem", pillLetterSpacing: "0.2em",
    pillBg: "rgba(238,130,15,0.06)", pillBorder: "rgba(238,130,15,0.3)",
    inputBorderFocus: "rgba(238,130,15,0.55)",
    inputGlowFocus: "0 0 0 2px rgba(238,130,15,0.1), 0 0 18px rgba(238,130,15,0.07)",
    sendBg: "linear-gradient(135deg, #ee820f 0%, #7a4000 100%)",
    sendGlow: "0 4px 18px rgba(238,130,15,0.35)",
    bubbleFontFamily: "'Syne', sans-serif", bubbleFontSize: "0.9rem",
    bubbleFontStyle: "normal", bubbleLineHeight: 1.75,
    bubbleLetterSpacing: "0.01em", bubbleTextTransform: "none",
    bubbleFontWeight: 400, bubbleBg: "rgba(8,12,16,0.97)",
    bubbleBorder: "rgba(238,130,15,0.18)", bubbleLeftBar: "#ee820f",
    bubbleTextColor: "#FFE0B2",
    dotColor: "#ee820f", dotDuration: 0.4, dotDelay: 0.08,
    atmosphereTint: "rgba(238,130,15,0.01)",
    orbColor1: "radial-gradient(circle, rgba(238,130,15,0.2) 0%, transparent 70%)",
    orbColor2: "radial-gradient(circle, rgba(238,130,15,0.09) 0%, transparent 70%)",
  },
  {
    id: "creative",
    label: "Creative",
    emoji: "🎨",
    desc: "Imaginative, expressive",
    accent: "#8317cb",
    accentDim: "rgba(131,23,203,0.14)",
    accentBorder: "rgba(131,23,203,0.4)",
    accentGlow: "rgba(131,23,203,0.28)",
    bgTint: "rgba(131,23,203,0.012)",
    btnRadius: "20px", btnPadding: "5px 16px", btnStyle: "italic",
    btnLetterSpacing: "0.02em", btnFontSize: "0.6rem", btnWeight: 600,
    activeIndicator: "glow",
    pillFormat: (t) => `🎨 Creative mode — Paint with words`,
    pillRadius: "12px", pillFontFamily: "'Orbitron', sans-serif",
    pillFontSize: "0.58rem", pillLetterSpacing: "0.04em",
    pillBg: "linear-gradient(90deg, rgba(131,23,203,0.1), rgba(131,23,203,0.05))",
    pillBorder: "rgba(131,23,203,0.35)",
    inputBorderFocus: "rgba(131,23,203,0.6)",
    inputGlowFocus: "0 0 0 2px rgba(131,23,203,0.12), 0 0 28px rgba(131,23,203,0.1)",
    sendBg: "linear-gradient(135deg, #8317cb 0%, #4a0080 100%)",
    sendGlow: "0 4px 18px rgba(131,23,203,0.45)",
    bubbleFontFamily: "'Syne', sans-serif", bubbleFontSize: "0.9rem",
    bubbleFontStyle: "normal", bubbleLineHeight: 1.75,
    bubbleLetterSpacing: "0.01em", bubbleTextTransform: "none",
    bubbleFontWeight: 400, bubbleBg: "rgba(12,0,20,0.96)",
    bubbleBorder: "rgba(131,23,203,0.2)", bubbleLeftBar: "#8317cb",
    bubbleTextColor: "#F3E5FF",
    dotColor: "#8317cb", dotDuration: 1.2, dotDelay: 0.28,
    atmosphereTint: "rgba(131,23,203,0.01)",
    orbColor1: "radial-gradient(circle, rgba(131,23,203,0.2) 0%, transparent 70%)",
    orbColor2: "radial-gradient(circle, rgba(131,23,203,0.09) 0%, transparent 70%)",
  },
  {
    id: "spiritual",
    label: "Spiritual",
    emoji: "🔮",
    desc: "Mindful, transcendent",
    accent: "#FFB6D5",
    accentDim: "rgba(255,182,213,0.16)",
    accentBorder: "rgba(255,182,213,0.42)",
    accentGlow: "rgba(255,182,213,0.28)",
    bgTint: "rgba(255,182,213,0.015)",
    btnRadius: "20px", btnPadding: "5px 16px", btnStyle: "italic",
    btnLetterSpacing: "0.04em", btnFontSize: "0.6rem", btnWeight: 400,
    activeIndicator: "glow",
    pillFormat: (t) => `🔮 Spiritual — Let the wisdom flow`,
    pillRadius: "20px", pillFontFamily: "'Orbitron', sans-serif",
    pillFontSize: "0.58rem", pillLetterSpacing: "0.05em",
    pillBg: "linear-gradient(135deg, rgba(255,182,213,0.1), rgba(200,100,150,0.05))",
    pillBorder: "rgba(255,182,213,0.32)",
    inputBorderFocus: "rgba(255,182,213,0.55)",
    inputGlowFocus: "0 0 0 2px rgba(255,182,213,0.12), 0 0 28px rgba(200,100,150,0.1)",
    sendBg: "linear-gradient(135deg, #FFB6D5 0%, #c0507a 100%)",
    sendGlow: "0 4px 20px rgba(255,182,213,0.42)",
    bubbleFontFamily: "'Syne', sans-serif", bubbleFontSize: "0.9rem",
    bubbleFontStyle: "normal", bubbleLineHeight: 1.75,
    bubbleLetterSpacing: "0.01em", bubbleTextTransform: "none",
    bubbleFontWeight: 400, bubbleBg: "rgba(18,6,28,0.97)",
    bubbleBorder: "rgba(255,182,213,0.18)", bubbleLeftBar: "#FFB6D5",
    bubbleTextColor: "#FFE8F2",
    dotColor: "#FFB6D5", dotDuration: 1.6, dotDelay: 0.45,
    atmosphereTint: "rgba(255,182,213,0.012)",
    orbColor1: "radial-gradient(circle, rgba(255,182,213,0.2) 0%, transparent 70%)",
    orbColor2: "radial-gradient(circle, rgba(255,182,213,0.09) 0%, transparent 70%)",
  },
  {
    id: "empathetic",
    label: "Empathetic",
    emoji: "💚",
    desc: "Warm, caring, present",
    accent: "#FFF5E1",
    accentDim: "rgba(255,245,225,0.14)",
    accentBorder: "rgba(255,245,225,0.38)",
    accentGlow: "rgba(255,245,225,0.22)",
    bgTint: "rgba(255,245,225,0.012)",
    btnRadius: "20px", btnPadding: "5px 16px", btnStyle: "italic",
    btnLetterSpacing: "0.02em", btnFontSize: "0.6rem", btnWeight: 500,
    activeIndicator: "glow",
    pillFormat: (t) => `💚 Empathetic — I'm here with you`,
    pillRadius: "20px", pillFontFamily: "'Orbitron', sans-serif",
    pillFontSize: "0.58rem", pillLetterSpacing: "0.02em",
    pillBg: "linear-gradient(135deg, rgba(255,245,225,0.08), rgba(255,235,180,0.05))",
    pillBorder: "rgba(255,245,225,0.28)",
    inputBorderFocus: "rgba(255,245,225,0.45)",
    inputGlowFocus: "0 0 0 2px rgba(255,245,225,0.1), 0 0 26px rgba(255,235,180,0.08)",
    sendBg: "linear-gradient(135deg, #FFF5E1 0%, #c8a96e 100%)",
    sendGlow: "0 4px 20px rgba(255,245,225,0.35)",
    bubbleFontFamily: "'Syne', sans-serif", bubbleFontSize: "0.9rem",
    bubbleFontStyle: "normal", bubbleLineHeight: 1.75,
    bubbleLetterSpacing: "0.01em", bubbleTextTransform: "none",
    bubbleFontWeight: 400, bubbleBg: "rgba(20,20,18,0.97)",
    bubbleBorder: "rgba(255,245,225,0.14)", bubbleLeftBar: "#FFF5E1",
    bubbleTextColor: "#FFF8EE",
    dotColor: "#FFF5E1", dotDuration: 1.1, dotDelay: 0.3,
    atmosphereTint: "rgba(255,245,225,0.01)",
    orbColor1: "radial-gradient(circle, rgba(255,245,225,0.18) 0%, transparent 70%)",
    orbColor2: "radial-gradient(circle, rgba(255,245,225,0.08) 0%, transparent 70%)",
  },
];

function Portal({ children }) {
  return createPortal(children, document.body);
}

function TypingDots({ toneConfig }) {
  const tc = toneConfig || TONES[0];
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: tc.dotDuration, repeat: Infinity, delay: i * tc.dotDelay, ease: tc.id === "strict" ? "linear" : "easeInOut" }}
          style={{ width: 7, height: 7, borderRadius: tc.id === "strict" ? "0px" : tc.id === "scientific" ? "1px" : "50%", background: tc.dotColor, boxShadow: `0 0 8px ${tc.dotColor}` }}
        />
      ))}
    </div>
  );
}

function ChatSkeleton({ isMobile }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", padding: isMobile ? "1.25rem 1rem" : "2rem" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ display: "flex", justifyContent: i % 2 === 0 ? "flex-start" : "flex-end", gap: 12, alignItems: "flex-start" }}>
          {i % 2 === 0 && <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }} style={{ width: 34, height: 34 * 1.1547, flexShrink: 0, clipPath: HEX, background: "rgba(244,180,0,0.12)" }} />}
          <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }} style={{ height: 52, width: `${[55, 40, 65][i]}%`, borderRadius: 8, background: "rgba(244,180,0,0.06)", border: "1px solid rgba(244,180,0,0.08)" }} />
          {i % 2 !== 0 && <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }} style={{ width: 34, height: 34 * 1.1547, flexShrink: 0, clipPath: HEX, background: "rgba(244,180,0,0.12)" }} />}
        </div>
      ))}
    </div>
  );
}

function SendButton({ onClick, disabled, toneConfig }) {
  const [hov, setHov] = useState(false);
  const tc = toneConfig || TONES[0];
  return (
    <motion.button
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      whileHover={disabled ? {} : { scale: 1.08 }} whileTap={disabled ? {} : { scale: 0.92 }}
      onClick={onClick} disabled={disabled}
      style={{ width: 48, height: 48 * 1.1547, flexShrink: 0, clipPath: HEX, background: disabled ? "rgba(244,180,0,0.08)" : tc.sendBg, border: "none", outline: "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.3 : 1, transition: "all 0.2s", boxShadow: !disabled && hov ? tc.sendGlow : "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#080D1A", fontSize: "1.05rem" }}>
      ➤
    </motion.button>
  );
}

function DeleteConfirmModal({ chatTitle, onConfirm, onCancel }) {
  return (
    <Portal>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel}
        style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(8,13,26,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div initial={{ opacity: 0, scale: 0.88, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 20 }} transition={{ duration: 0.22, ease: "easeOut" }} onClick={e => e.stopPropagation()}
          style={{ background: "#0D1525", backdropFilter: "blur(24px)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 10, padding: "28px 30px", width: 320, boxShadow: "0 24px 60px rgba(0,0,0,0.8)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>🗑️</div>
            <div>
              <p style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.72rem", color: "#ff6b6b", letterSpacing: "0.1em", margin: 0 }}>DELETE CHAT</p>
              <p style={{ fontFamily: "Syne, sans-serif", fontSize: "0.62rem", color: "rgba(232,217,160,0.3)", margin: "3px 0 0" }}>This action cannot be undone</p>
            </div>
          </div>
          <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(255,80,80,0.2),transparent)", marginBottom: 18 }} />
          <div style={{ padding: "10px 14px", borderRadius: 6, background: "rgba(255,80,80,0.05)", border: "1px solid rgba(255,80,80,0.1)", marginBottom: 22 }}>
            <p style={{ fontFamily: "Syne, sans-serif", fontSize: "0.6rem", color: "rgba(232,217,160,0.3)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Chat to delete</p>
            <p style={{ fontFamily: "Syne, sans-serif", fontSize: "0.85rem", color: "#E8D9A0", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{chatTitle || "New Chat"}</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <motion.button whileHover={{ background: "rgba(255,80,80,0.25)" }} whileTap={{ scale: 0.96 }} onClick={(e) => { e.stopPropagation(); onConfirm(); }}
              style={{ flex: 1, padding: "12px 0", border: "1px solid rgba(255,80,80,0.4)", borderRadius: 5, background: "rgba(255,80,80,0.14)", color: "#ff6b6b", fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", cursor: "pointer", transition: "all 0.2s" }}>YES, DELETE</motion.button>
            <motion.button whileHover={{ background: "rgba(244,180,0,0.1)" }} whileTap={{ scale: 0.96 }} onClick={(e) => { e.stopPropagation(); onCancel(); }}
              style={{ flex: 1, padding: "12px 0", border: "1px solid rgba(244,180,0,0.2)", borderRadius: 5, background: "rgba(255,255,255,0.03)", color: "rgba(232,217,160,0.6)", fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", cursor: "pointer", transition: "all 0.2s" }}>CANCEL</motion.button>
          </div>
        </motion.div>
      </motion.div>
    </Portal>
  );
}

function ChatMenu({ chatItem, onRename, onDeleteRequest, isActive }) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(chatItem.title || "");
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open && !renaming) return;
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) { setOpen(false); setRenaming(false); }
    };
    const t = setTimeout(() => document.addEventListener("mousedown", handleOutside), 100);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", handleOutside); };
  }, [open, renaming]);

  const openMenu = (e) => {
    e.stopPropagation();
    if (btnRef.current) { const r = btnRef.current.getBoundingClientRect(); setMenuPos({ top: r.bottom + 4, left: r.right - 148 }); }
    setOpen(v => !v); setRenaming(false);
  };

  const handleRenameSubmit = () => {
    if (newTitle.trim()) onRename(chatItem._id || chatItem.id, newTitle.trim());
    setRenaming(false); setOpen(false);
  };

  const startRename = (e) => {
    e.stopPropagation();
    if (btnRef.current) { const r = btnRef.current.getBoundingClientRect(); setMenuPos({ top: r.bottom + 4, left: r.right - 220 }); }
    setNewTitle(chatItem.title || ""); setRenaming(true); setOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: "relative", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
      <motion.button ref={btnRef} whileTap={{ scale: 0.9 }} onClick={openMenu}
        style={{ width: 26, height: 26, borderRadius: 4, background: open ? "rgba(244,180,0,0.18)" : "transparent", border: "none", color: "#F4B400", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", visibility: isActive ? "visible" : "hidden", pointerEvents: "auto", transition: "background 0.15s" }}>⋯</motion.button>
      <AnimatePresence>
        {open && !renaming && (
          <Portal>
            <motion.div initial={{ opacity: 0, y: -6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.95 }} transition={{ duration: 0.12 }}
              style={{ position: "fixed", top: menuPos.top, left: menuPos.left, background: "#0A1220", border: "1px solid rgba(244,180,0,0.3)", borderRadius: 6, overflow: "hidden", zIndex: 99999, minWidth: 148, boxShadow: "0 12px 40px rgba(0,0,0,0.9)" }}>
              <div onClick={startRename} style={{ padding: "12px 16px", borderBottom: "1px solid rgba(244,180,0,0.1)", color: "#E8D9A0", fontFamily: "Syne, sans-serif", fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, userSelect: "none", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(244,180,0,0.12)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>✏️ Rename</div>
              <div onClick={(e) => { e.stopPropagation(); onDeleteRequest(chatItem._id || chatItem.id, chatItem.title); setOpen(false); }}
                style={{ padding: "12px 16px", color: "#E8D9A0", fontFamily: "Syne, sans-serif", fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, userSelect: "none", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,80,80,0.12)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>🗑️ Delete</div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {renaming && (
          <Portal>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.12 }}
              style={{ position: "fixed", top: menuPos.top, left: menuPos.left, background: "#0A1220", border: "1px solid rgba(244,180,0,0.35)", borderRadius: 6, padding: "14px", zIndex: 99999, width: 220, boxShadow: "0 12px 40px rgba(0,0,0,0.9)" }}>
              <p style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.5rem", color: "rgba(244,180,0,0.5)", letterSpacing: "0.14em", margin: "0 0 10px", textTransform: "uppercase" }}>RENAME CHAT</p>
              <input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => { e.stopPropagation(); if (e.key === "Enter") handleRenameSubmit(); if (e.key === "Escape") setRenaming(false); }}
                style={{ width: "100%", padding: "8px 10px", background: "rgba(244,180,0,0.07)", border: "1px solid rgba(244,180,0,0.35)", borderRadius: 4, color: "#E8D9A0", fontFamily: "Syne, sans-serif", fontSize: "0.8rem", outline: "none", boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <div onClick={(e) => { e.stopPropagation(); handleRenameSubmit(); }} style={{ flex: 1, padding: "8px", borderRadius: 4, textAlign: "center", background: "rgba(244,180,0,0.2)", color: "#F4B400", fontFamily: "Orbitron, sans-serif", fontSize: "0.55rem", letterSpacing: "0.1em", cursor: "pointer", userSelect: "none", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(244,180,0,0.35)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(244,180,0,0.2)"}>SAVE</div>
                <div onClick={(e) => { e.stopPropagation(); setRenaming(false); }} style={{ flex: 1, padding: "8px", borderRadius: 4, textAlign: "center", background: "rgba(255,255,255,0.05)", color: "rgba(232,217,160,0.4)", fontFamily: "Orbitron, sans-serif", fontSize: "0.55rem", letterSpacing: "0.1em", cursor: "pointer", userSelect: "none", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>CANCEL</div>
              </div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatMsgTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function WelcomeScreen({ isMobile, currentUser, onSuggestion, toneConfig }) {
  const tc = toneConfig || TONES[0];
  const suggestions = [
    "What can you help me with?",
    "Give me a quick summary of quantum computing",
    "Help me write a professional email",
    "What's the best way to learn a new skill?",
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isMobile ? "2rem 1.5rem" : "3rem 2rem", gap: "2rem" }}>
      <div style={{ textAlign: "center" }}>
        <motion.div animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          style={{ fontSize: isMobile ? "3rem" : "4rem", marginBottom: "1rem", display: "block" }}>🐝</motion.div>
        <motion.h1 animate={{ color: tc.accent, textShadow: `0 0 30px ${tc.accentGlow}` }} transition={{ duration: 0.5 }}
          style={{ fontFamily: "Orbitron, sans-serif", fontSize: isMobile ? "1.2rem" : "1.6rem", margin: 0, letterSpacing: "0.1em" }}>
          Hey{currentUser?.username ? `, ${currentUser.username}` : ""}!
        </motion.h1>
        <p style={{ fontFamily: "Syne, sans-serif", fontSize: isMobile ? "0.85rem" : "0.95rem", color: "rgba(232,217,160,0.5)", marginTop: "0.5rem" }}>
          I'm Livvy 🐝 Your Bio-Digital AI. What's buzzing?
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, width: "100%", maxWidth: 520 }}>
        {suggestions.map((s, i) => (
          <motion.button key={i} whileHover={{ borderColor: tc.accentBorder, background: tc.accentDim, y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => onSuggestion(s)}
            style={{ padding: "12px 14px", border: "1px solid rgba(244,180,0,0.15)", borderRadius: 6, background: "rgba(13,21,37,0.6)", color: "rgba(232,217,160,0.6)", fontFamily: "Syne, sans-serif", fontSize: "0.78rem", cursor: "pointer", textAlign: "left", lineHeight: 1.4, transition: "all 0.2s" }}>
            {s}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function ToneButton({ t, isActive, onClick, isTablet }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.button
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      onClick={onClick} whileTap={{ scale: 0.93 }}
      animate={{ background: isActive ? t.accentDim : hov ? "rgba(255,255,255,0.04)" : "transparent", borderColor: isActive ? t.accent : hov ? t.accentBorder : "rgba(244,180,0,0.15)", color: isActive ? t.accent : hov ? t.accent : "rgba(232,217,160,0.38)", scale: isActive ? 1.04 : 1, boxShadow: isActive ? `0 0 16px ${t.accentGlow}, 0 0 4px ${t.accentGlow}` : "none" }}
      transition={{ duration: 0.3 }}
      style={{ padding: isTablet ? "4px 9px" : t.btnPadding, borderRadius: "1000px", border: "1px solid", fontFamily: "'Orbitron', sans-serif", fontSize: isTablet ? "0.48rem" : t.btnFontSize, letterSpacing: t.btnLetterSpacing, fontStyle: t.btnStyle === "italic" ? "italic" : "normal", fontWeight: t.btnWeight, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, position: "relative", transition: "all 0.2s" }}>
      <span style={{ fontSize: "0.85em" }}>{t.emoji}</span>
      <span>{t.label}</span>
    </motion.button>
  );
}

function MessageTonePills({ activeToneId, seenTones, onSwitch, isRegenerating }) {
  if (!seenTones || seenTones.length === 0) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
      <AnimatePresence initial={false}>
        {seenTones.map((toneId) => {
          const t = TONES.find(x => x.id === toneId);
          if (!t) return null;
          const isActive = toneId === activeToneId;
          return (
            <motion.button key={toneId} initial={{ opacity: 0, scale: 0.7, x: -6 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
              whileHover={!isActive ? { scale: 1.08, opacity: 1 } : {}} whileTap={!isActive ? { scale: 0.93 } : {}}
              onClick={() => { if (!isActive && !isRegenerating) onSwitch(toneId); }}
              style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", border: `1px solid ${isActive ? t.accent : t.accentBorder}`, borderRadius: "20px", background: isActive ? t.accentDim : "rgba(255,255,255,0.03)", boxShadow: isActive ? `0 0 10px ${t.accentGlow}` : "none", cursor: isActive ? "default" : isRegenerating ? "wait" : "pointer", opacity: isActive ? 1 : 0.5, transition: "all 0.2s" }}>
              <span style={{ fontSize: "0.62rem", lineHeight: 1 }}>{t.emoji}</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.52rem", letterSpacing: "0.05em", color: isActive ? t.accent : "rgba(232,217,160,0.6)", fontWeight: isActive ? 700 : 400, whiteSpace: "nowrap" }}>{t.label}</span>
            </motion.button>
          );
        })}
      </AnimatePresence>
      <AnimatePresence>
        {isRegenerating && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }}
            style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.48rem", color: "rgba(232,217,160,0.3)", letterSpacing: "0.06em" }}>
            regenerating...
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useBreakpoint();
  const [tone, setTone] = useState("concise");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebar] = useState(!isMobile);
  const [activeChat, setActive] = useState(null);
  const [toneMenuOpen, setToneMenuOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [hoveredChat, setHoveredChat] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [toneVariants, setToneVariants] = useState({});
  const [regeneratingMsgId, setRegeneratingMsgId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ── FIX: ref guard prevents navigate("/profile") from triggering
  //         an infinite re-render loop in production ──────────────
  const authChecked = useRef(false);

  const isWelcome = messages.length === 0;
  const ct = TONES.find(t => t.id === tone) || TONES[0];

  // ── Auth guard + profile check ────────────────────────────────────────────
  useEffect(() => {
    // Only run once — the missing guard was the root cause of the infinite loop
    if (authChecked.current) return;
    authChecked.current = true;

    if (!auth.isLoggedIn()) {
      navigate("/login");
      return;
    }

    const accountUser = auth.getUser();
    const activeProfile = profilesApi.getActive();

    if (activeProfile) {
      setCurrentUser({
        ...accountUser,
        username: activeProfile.name,
        avatar: activeProfile.avatar,
        profession: activeProfile.profession,
        preferredTone: activeProfile.preferredTone,
        profileId: activeProfile._id,
      });
      if (activeProfile.preferredTone) setTone(activeProfile.preferredTone);
    } else {
      setCurrentUser({
        ...accountUser,
        username: accountUser?.name || accountUser?.username || "Worker Bee",
        avatar: "👤",
      });
      navigate("/profile");
    }
  }, [navigate]);
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => { if (isMobile) setSidebar(false); }, [isMobile]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, chatLoading]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await chat.getHistory();
        const chats = Array.isArray(data) ? data : data.chats || [];
        setHistory(chats);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setHistoryLoading(false);
      }
    };
    if (auth.isLoggedIn()) loadHistory();
  }, []);

  const loadConversation = async (convId) => {
    setActive(convId);
    setChatLoading(true);
    if (isMobile) setSidebar(false);
    try {
      const data = await chat.getConversation(convId);
      setCurrentConvId(convId);
      const msgs = (data.messages || []).map((m, i) => ({
        id: i, role: m.role,
        text: m.content || m.text || "",
        timestamp: m.timestamp || m.createdAt || null,
      }));
      setMessages(msgs.length > 0 ? msgs : []);
    } catch (err) {
      console.error("Failed to load conversation:", err);
      setMessages([]);
    } finally {
      setChatLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const sendMessage = async (overrideText) => {
    const q = (overrideText || input).trim();
    if (!q || isTyping) return;
    const toneAtSend = tone;
    setMessages(prev => [...prev, { id: Date.now(), role: "user", text: q, timestamp: new Date().toISOString() }]);
    setInput("");
    setIsTyping(true);
    try {
      let chatId = currentConvId;
      if (!chatId) {
        const newChat = await chat.create(toneAtSend, {
          username: currentUser?.username,
          profession: currentUser?.profession,
          preferences: currentUser?.preferences,
        });
        chatId = newChat.chat?._id || newChat._id;
        setCurrentConvId(chatId);
        setActive(chatId);
        setHistory(prev => [newChat.chat || newChat, ...prev]);
      }
      const data = await chat.sendMessage(chatId, q, toneAtSend);
      setIsTyping(false);
      const replyText = data.assistantMessage?.content || data.reply || "Hmm, something went wrong.";
      const newMsgId = Date.now() + 1;
      setToneVariants(prev => ({ ...prev, [newMsgId]: { [toneAtSend]: replyText } }));
      setMessages(prev => [...prev, { id: newMsgId, role: "assistant", text: replyText, timestamp: new Date().toISOString(), toneId: toneAtSend }]);
      if (data.updatedTitle || data.chat?.title) {
        const newTitle = data.updatedTitle || data.chat?.title;
        setHistory(prev => prev.map(h => (h._id || h.id) === chatId ? { ...h, title: newTitle, updatedAt: new Date().toISOString() } : h));
      } else {
        try { const histData = await chat.getHistory(); setHistory(Array.isArray(histData) ? histData : histData.chats || []); } catch (_) {}
      }
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", text: `⚠️ ${err.message || "Couldn't reach the hive."}`, timestamp: new Date().toISOString(), toneId: toneAtSend }]);
    }
  };

  const startNewChat = () => {
    setMessages([]); setCurrentConvId(null); setActive(null);
    if (isMobile) setSidebar(false);
  };

  const handleRename = async (chatId, newTitle) => {
    try {
      await chat.rename(chatId, newTitle);
      setHistory(prev => prev.map(h => (h._id || h.id) === chatId ? { ...h, title: newTitle } : h));
    } catch (err) { console.error("Rename failed:", err.message); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    try {
      await chat.deleteConversation(id);
      setHistory(prev => prev.filter(h => (h._id || h.id) !== id));
      if (currentConvId === id) startNewChat();
    } catch (err) { console.error("Delete failed:", err.message); }
  };

  const copyMessage = useCallback((msgId, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const regenerateInTone = async (msg, targetToneId) => {
    if (msg.toneId === targetToneId) return;
    if (toneVariants[msg.id]?.[targetToneId]) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, text: toneVariants[msg.id][targetToneId], toneId: targetToneId } : m));
      return;
    }
    const msgIndex = messages.findIndex(m => m.id === msg.id);
    const userMsg = [...messages].slice(0, msgIndex).reverse().find(m => m.role === "user");
    if (!userMsg || !currentConvId) return;
    setRegeneratingMsgId(msg.id);
    try {
      const data = await chat.sendMessage(currentConvId, userMsg.text, targetToneId);
      const newText = data.assistantMessage?.content || data.reply || "";
      setToneVariants(prev => ({ ...prev, [msg.id]: { ...(prev[msg.id] || {}), [targetToneId]: newText } }));
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, text: newText, toneId: targetToneId } : m));
    } catch (err) { console.error("Regenerate failed:", err); }
    finally { setRegeneratingMsgId(null); }
  };

  const handleLogout = () => { auth.logout(); navigate("/login"); };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#080D1A", overflow: "hidden", position: "relative", fontFamily: "Syne, sans-serif" }}>
      <motion.div key={`orb1-${tone}`} animate={{ background: ct.orbColor1 }} transition={{ duration: 0.9, ease: "easeInOut" }}
        style={{ position: "fixed", left: "-5%", top: "20%", width: 400, height: 400, borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />
      <motion.div key={`orb2-${tone}`} animate={{ background: ct.orbColor2 }} transition={{ duration: 0.9, ease: "easeInOut" }}
        style={{ position: "fixed", right: "10%", bottom: "10%", width: 300, height: 300, borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none", zIndex: 0 }} />
      <motion.div key={`orb3-${tone}`} animate={{ background: ct.orbColor1 }} transition={{ duration: 0.9, ease: "easeInOut", delay: 0.15 }}
        style={{ position: "fixed", right: "-8%", top: "5%", width: 280, height: 280, borderRadius: "50%", filter: "blur(90px)", opacity: 0.6, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "fixed", inset: 0, zIndex: 2, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(244,180,0,0.012) 2px, rgba(244,180,0,0.012) 4px)", pointerEvents: "none" }} />

      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebar(false)}
            style={{ position: "fixed", inset: 0, zIndex: 18, background: "rgba(8,13,26,0.7)", backdropFilter: "blur(4px)" }} />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -270, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -270, opacity: 0 }} transition={{ duration: 0.35, ease: "easeInOut" }}
            style={{ width: 265, flexShrink: 0, background: `linear-gradient(160deg, ${ct.accentDim} 0%, rgba(8,13,26,0.55) 60%, rgba(8,13,26,0.4) 100%)`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderRight: `1px solid ${ct.accentBorder}`, boxShadow: `inset -1px 0 0 ${ct.accentGlow}, 4px 0 40px rgba(0,0,0,0.4)`, display: "flex", flexDirection: "column", zIndex: 20, position: isMobile ? "fixed" : "relative", top: 0, left: 0, bottom: 0, transition: "background 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease" }}>

            <motion.div animate={{ borderBottomColor: ct.accentBorder }} transition={{ duration: 0.5 }}
              style={{ padding: "1.4rem 1.2rem 1rem", borderBottom: "1px solid", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32 * 1.1547, clipPath: HEX, background: "linear-gradient(135deg,#F4B400,#FFD54F)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", flexShrink: 0, boxShadow: "0 0 14px rgba(244,180,0,0.35)" }}>🐝</div>
                <motion.span whileHover={{ color: "#FFD54F" }} onClick={() => navigate("/")} style={{ fontFamily: "Orbitron, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#F4B400", letterSpacing: "0.1em", cursor: "pointer" }}>MIGHTBEE</motion.span>
              </div>
              {isMobile && (
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSidebar(false)}
                  style={{ width: 28, height: 28 * 1.1547, clipPath: HEX, background: "rgba(244,180,0,0.1)", border: "none", color: "#F4B400", fontSize: "0.7rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</motion.button>
              )}
            </motion.div>

            <div style={{ padding: "1rem 1rem 0.5rem" }}>
              <motion.button whileHover={{ borderColor: "rgba(244,180,0,0.6)", color: "#F4B400", background: "rgba(244,180,0,0.06)" }} onClick={startNewChat}
                style={{ width: "100%", padding: "10px", border: "1px dashed rgba(244,180,0,0.3)", borderRadius: 3, background: "transparent", color: "rgba(244,180,0,0.55)", fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" }}>
                + New Chat
              </motion.button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem 1rem" }}>
              <motion.p animate={{ color: ct.accent }} transition={{ duration: 0.5 }}
                style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.55rem", letterSpacing: "0.22em", textTransform: "uppercase", padding: "0.75rem 0 0.5rem", margin: 0, opacity: 0.5 }}>Recent</motion.p>
              {historyLoading ? (
                [...Array(3)].map((_, i) => (
                  <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                    style={{ height: 38, marginBottom: 4, borderRadius: 3, background: "rgba(244,180,0,0.05)", border: "1px solid rgba(244,180,0,0.06)" }} />
                ))
              ) : history.length === 0 ? (
                <p style={{ fontFamily: "Syne, sans-serif", fontSize: "0.72rem", color: "rgba(232,217,160,0.25)", textAlign: "center", paddingTop: "1rem" }}>No conversations yet</p>
              ) : (
                history.map(h => {
                  const hId = h._id || h.id;
                  const isActive = activeChat === hId;
                  const isHovered = hoveredChat === hId;
                  return (
                    <motion.div key={hId} whileHover={{ x: 3 }} onHoverStart={() => setHoveredChat(hId)} onHoverEnd={() => setHoveredChat(null)} onClick={() => loadConversation(hId)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 8px", borderRadius: 3, cursor: "pointer", marginBottom: 2, transition: "all 0.2s", background: isActive ? "rgba(244,180,0,0.08)" : "transparent", border: isActive ? "1px solid rgba(244,180,0,0.2)" : "1px solid transparent", position: "relative" }}>
                      {isActive && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(244,180,0,0.4), transparent)" }} />}
                      <div style={{ width: 16, height: 16 * 1.1547, flexShrink: 0, clipPath: HEX, background: isActive ? "rgba(244,180,0,0.35)" : "rgba(244,180,0,0.07)", transition: "background 0.2s" }} />
                      <div style={{ overflow: "hidden", flex: 1 }}>
                        <p style={{ fontFamily: "Syne, sans-serif", fontSize: "0.78rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 130, color: isActive ? "#F4B400" : "rgba(232,217,160,0.6)", margin: 0 }}>{h.title || "New Chat"}</p>
                        <p style={{ fontFamily: "Syne, sans-serif", fontSize: "0.62rem", color: "rgba(232,217,160,0.28)", margin: "2px 0 0" }}>{formatDate(h.updatedAt || h.date)}</p>
                      </div>
                      <ChatMenu chatItem={h} onRename={handleRename} onDeleteRequest={(id, title) => setDeleteTarget({ id, title })} isActive={isActive || isHovered} />
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* ── Sidebar Footer ── */}
            <motion.div
              animate={{ borderTopColor: ct.accentBorder, background: ct.accentDim }}
              whileHover={{ background: ct.accentDim.replace("0.18", "0.28") }}
              transition={{ duration: 0.5 }}
              style={{ padding: "1rem", borderTop: "1px solid rgba(244,180,0,0.08)", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <div style={{ width: 30, height: 30 * 1.1547, clipPath: HEX, flexShrink: 0, background: "rgba(244,180,0,0.12)", border: "1px solid rgba(244,180,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>
                {currentUser?.avatar || "👤"}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }} onClick={() => navigate("/profile")}>
                <p style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.68rem", color: "#E8D9A0", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {currentUser?.username || "Worker Bee"}
                </p>
                <p style={{ fontFamily: "Syne, sans-serif", fontSize: "0.62rem", color: "rgba(244,180,0,0.4)", margin: "2px 0 0" }}>
                  {currentUser?.profession ? `${currentUser.profession} • ` : ""}Pro
                </p>
              </div>
              <motion.span whileHover={{ color: "#FFD54F" }} onClick={handleLogout} title="Logout"
                style={{ color: "rgba(244,180,0,0.35)", fontSize: "0.75rem", cursor: "pointer", padding: "4px" }}>⏻</motion.span>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 10, overflow: "hidden", minWidth: 0 }}>

        {/* ── Topbar ── */}
        <motion.div animate={{ borderBottomColor: ct.accentBorder.replace("0.4", "0.15") }} transition={{ duration: 0.5 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "0.75rem 1rem" : "0.9rem 1.5rem", borderBottom: "1px solid", background: "rgba(8,13,26,0.8)", backdropFilter: "blur(20px)", flexShrink: 0, position: "relative", gap: 8 }}>
          <motion.div animate={{ background: `linear-gradient(90deg, transparent, ${ct.accentGlow.replace("0.28", "0.2")}, transparent)` }} transition={{ duration: 0.5 }}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1 }} />

          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
            <motion.button whileHover={{ scale: 1.08, background: "rgba(244,180,0,0.12)" }} whileTap={{ scale: 0.92 }} onClick={() => setSidebar(v => !v)}
              style={{ width: 32, height: 32, borderRadius: "6px", background: "rgba(244,180,0,0.06)", border: "1px solid rgba(244,180,0,0.25)", cursor: "pointer", color: "#F4B400", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
              <motion.span key={sidebarOpen ? "left" : "right"} initial={{ opacity: 0, x: sidebarOpen ? 6 : -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} style={{ lineHeight: 1, display: "flex", alignItems: "center" }}>
                {sidebarOpen ? "←" : "→"}
              </motion.span>
            </motion.button>
            {!isMobile && <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.72rem", color: "rgba(232,217,160,0.45)", letterSpacing: "0.12em" }}>Hive Core</span>}
          </div>

          {/* ── Tone Switcher ── */}
          {isMobile ? (
            <div style={{ position: "relative" }}>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setToneMenuOpen(v => !v)}
                animate={{ borderColor: ct.accent, color: ct.accent, background: ct.accentDim }} transition={{ duration: 0.3 }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: ct.btnRadius, border: "1px solid", fontFamily: "Orbitron, sans-serif", fontSize: "0.58rem", letterSpacing: "0.1em", cursor: "pointer" }}>
                <span>{ct.emoji}</span><span>{ct.label}</span><span style={{ opacity: 0.6 }}>▾</span>
              </motion.button>
              <AnimatePresence>
                {toneMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.2 }}
                    style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "rgba(13,21,37,0.98)", backdropFilter: "blur(20px)", border: "1px solid rgba(244,180,0,0.2)", borderRadius: 4, overflow: "hidden", zIndex: 100, minWidth: 200 }}>
                    {TONES.map(t => (
                      <motion.button key={t.id} whileHover={{ background: t.accentDim }}
                        onClick={() => { setTone(t.id); setToneMenuOpen(false); const lastAssistant = [...messages].reverse().find(m => m.role === "assistant"); if (lastAssistant && lastAssistant.toneId !== t.id) regenerateInTone(lastAssistant, t.id); }}
                        style={{ width: "100%", padding: "11px 14px", border: "none", borderBottom: "1px solid rgba(244,180,0,0.06)", background: tone === t.id ? t.accentDim : "transparent", color: tone === t.id ? t.accent : "rgba(232,217,160,0.6)", fontFamily: "Orbitron, sans-serif", fontSize: "0.58rem", letterSpacing: "0.1em", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}>
                        <span>{t.emoji}</span>
                        <div><div style={{ fontWeight: 700 }}>{t.label}</div><div style={{ fontSize: "0.5rem", opacity: 0.5, marginTop: 2 }}>{t.desc}</div></div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: isTablet ? "wrap" : "nowrap" }}>
              <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.52rem", letterSpacing: "0.2em", color: "rgba(244,180,0,0.35)", textTransform: "uppercase", marginRight: 4 }}>Tone:</span>
              {TONES.map(t => (
                <ToneButton key={t.id} t={t} isActive={tone === t.id} onClick={() => {
                  setTone(t.id);
                  const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
                  if (lastAssistant && lastAssistant.toneId !== t.id) regenerateInTone(lastAssistant, t.id);
                }} isTablet={isTablet} />
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Messages ── */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {isWelcome && !chatLoading && (
            <WelcomeScreen isMobile={isMobile} currentUser={currentUser} toneConfig={ct}
              onSuggestion={(text) => { setInput(text); setTimeout(() => sendMessage(text), 50); }} />
          )}
          {chatLoading && <ChatSkeleton isMobile={isMobile} />}
          {!chatLoading && !isWelcome && (
            <div style={{ padding: isMobile ? "1.25rem 1rem" : "2rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                    style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: isMobile ? 8 : 12, alignItems: "flex-start" }}>
                    {msg.role === "assistant" && (
                      <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.4, type: "spring" }}
                        style={{ width: isMobile ? 28 : 34, height: (isMobile ? 28 : 34) * 1.1547, flexShrink: 0, clipPath: HEX, background: "linear-gradient(135deg,#F4B400,#FFD54F)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? "0.75rem" : "0.9rem", boxShadow: "0 0 16px rgba(244,180,0,0.4)" }}>🐝</motion.div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", gap: 4, maxWidth: isMobile ? "82%" : "70%" }}>
                      {msg.role === "assistant" && (
                        <MessageTonePills
                          activeToneId={msg.toneId || "concise"}
                          seenTones={toneVariants[msg.id] ? Object.keys(toneVariants[msg.id]) : [msg.toneId || "concise"]}
                          onSwitch={(targetToneId) => regenerateInTone(msg, targetToneId)}
                          isRegenerating={regeneratingMsgId === msg.id}
                        />
                      )}
                      <motion.div
                        key={`${msg.id}-${msg.toneId}`} initial={{ opacity: 0.6 }}
                        animate={{ opacity: 1, background: msg.role === "assistant" ? (TONES.find(t => t.id === msg.toneId) || ct).bubbleBg : "rgba(244,180,0,0.11)", borderColor: msg.role === "assistant" ? (TONES.find(t => t.id === msg.toneId) || ct).bubbleBorder : "rgba(244,180,0,0.32)", color: msg.role === "assistant" ? (TONES.find(t => t.id === msg.toneId) || ct).bubbleTextColor : "#FFD54F", boxShadow: msg.role === "assistant" ? `0 2px 20px ${(TONES.find(t => t.id === msg.toneId) || ct).accentGlow.replace("0.28", "0.08")}` : "none" }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        style={{ padding: isMobile ? "10px 13px" : "13px 17px", borderRadius: msg.role === "user" ? "12px 3px 12px 12px" : "3px 12px 12px 12px", border: "1px solid", borderLeft: msg.role === "assistant" ? `3px solid ${(TONES.find(t => t.id === msg.toneId) || ct).bubbleLeftBar}` : undefined, fontFamily: "'Syne', sans-serif", fontSize: isMobile ? "0.85rem" : "0.9rem", fontStyle: "normal", fontWeight: 400, lineHeight: 1.75, letterSpacing: "0.01em", textTransform: "none", backdropFilter: "blur(10px)", position: "relative", overflow: "hidden", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${msg.role === "user" ? "rgba(244,180,0,0.4)" : (TONES.find(t => t.id === msg.toneId) || ct).bubbleLeftBar + "44"}, transparent)` }} />
                        {msg.text}
                      </motion.div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                        {msg.timestamp && <span style={{ fontFamily: "Syne, sans-serif", fontSize: "0.6rem", color: "rgba(232,217,160,0.22)" }}>{formatMsgTime(msg.timestamp)}</span>}
                        {msg.role === "assistant" && (
                          <motion.button whileHover={{ color: ct.accent, background: ct.accentDim, borderColor: ct.accentBorder }} whileTap={{ scale: 0.9 }} onClick={() => copyMessage(msg.id, msg.text)}
                            style={{ padding: "2px 7px", border: "1px solid rgba(244,180,0,0.12)", borderRadius: 3, background: "transparent", color: copiedId === msg.id ? ct.accent : "rgba(232,217,160,0.25)", fontFamily: "Syne, sans-serif", fontSize: "0.6rem", cursor: "pointer", transition: "all 0.2s" }}>
                            {copiedId === msg.id ? "✓ Copied" : "⎘ Copy"}
                          </motion.button>
                        )}
                      </div>
                    </div>
                    {msg.role === "user" && (
                      <div style={{ width: isMobile ? 28 : 34, height: (isMobile ? 28 : 34) * 1.1547, flexShrink: 0, clipPath: HEX, background: "rgba(244,180,0,0.12)", border: "1px solid rgba(244,180,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? "0.75rem" : "0.9rem" }}>
                        {currentUser?.avatar || "👤"}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: isMobile ? 8 : 12, alignItems: "flex-start" }}>
                  <div style={{ width: isMobile ? 28 : 34, height: (isMobile ? 28 : 34) * 1.1547, flexShrink: 0, clipPath: HEX, background: "linear-gradient(135deg,#F4B400,#FFD54F)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? "0.75rem" : "0.9rem" }}>🐝</div>
                  <motion.div animate={{ borderColor: ct.bubbleBorder, background: ct.bubbleBg, borderLeftColor: ct.bubbleLeftBar }} transition={{ duration: 0.5 }}
                    style={{ padding: "12px 18px", borderRadius: "3px 12px 12px 12px", border: "1px solid", borderLeft: `3px solid ${ct.bubbleLeftBar}` }}>
                    <TypingDots toneConfig={ct} />
                  </motion.div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── Input Area ── */}
        <div style={{ padding: isMobile ? "0.75rem 1rem 1rem" : "1rem 1.5rem 1.25rem", borderTop: "1px solid rgba(244,180,0,0.1)", background: "rgba(8,13,26,0.85)", backdropFilter: "blur(20px)", flexShrink: 0, position: "relative" }}>
          <motion.div animate={{ background: `linear-gradient(90deg, transparent, ${ct.accentGlow.replace("0.28", "0.2")}, transparent)` }} transition={{ duration: 0.5 }}
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1 }} />
          {!isMobile && (
            <motion.div key={tone} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "0.3rem 0.85rem", border: `1px solid ${ct.pillBorder}`, borderRadius: ct.pillRadius, background: ct.pillBg, boxShadow: `0 0 12px ${ct.accentGlow.replace("0.28", "0.12")}` }}>
              <motion.div animate={{ background: ct.accent, boxShadow: `0 0 8px ${ct.accent}` }} transition={{ duration: 0.4 }} style={{ width: 5, height: 5, borderRadius: ct.id === "strict" ? "0px" : "50%" }} />
              <span style={{ fontFamily: ct.pillFontFamily, fontSize: ct.pillFontSize, letterSpacing: ct.pillLetterSpacing, color: ct.accent, textTransform: ct.id === "witty" || ct.id === "creative" || ct.id === "spiritual" || ct.id === "empathetic" ? "none" : "uppercase", fontStyle: ct.id === "witty" || ct.id === "spiritual" ? "italic" : "normal" }}>
                {ct.pillFormat(ct)}
              </span>
            </motion.div>
          )}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={`Ask Livvy... (${ct.label} mode)`} rows={1}
              style={{ flex: 1, padding: isMobile ? "10px 12px" : "12px 16px", background: "rgba(13,21,37,0.88)", border: "1px solid rgba(244,180,0,0.18)", borderRadius: "4px", color: "#E8D9A0", fontFamily: "Syne, sans-serif", fontSize: isMobile ? "0.85rem" : "0.9rem", outline: "none", resize: "none", lineHeight: 1.5, maxHeight: 120, overflow: "auto", transition: "border-color 0.3s, box-shadow 0.3s" }}
              onFocus={e => { e.target.style.borderColor = ct.inputBorderFocus; e.target.style.boxShadow = ct.inputGlowFocus; }}
              onBlur={e => { e.target.style.borderColor = "rgba(244,180,0,0.18)"; e.target.style.boxShadow = "none"; }}
            />
            <SendButton onClick={() => sendMessage()} disabled={!input.trim() || isTyping} toneConfig={ct} />
          </div>
          {!isMobile && <p style={{ fontFamily: "Syne, sans-serif", fontSize: "0.58rem", color: "rgba(232,217,160,0.2)", marginTop: 8, textAlign: "center" }}>Enter to send • Shift+Enter for new line</p>}
        </div>
      </main>

      <AnimatePresence>
        {deleteTarget && <DeleteConfirmModal chatTitle={deleteTarget.title} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />}
      </AnimatePresence>
    </div>
  );
}