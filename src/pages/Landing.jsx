import { useRef, useEffect, useState } from "react";
import { useScroll, useTransform, motion, useSpring, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HexButton from "../components/ui/HexButton";
import InteractiveHive from "../components/ui/InteractiveHive";
import PollenBG from "../components/ui/PollenBG";

const TONES = [
  {
    id: "concise",
    label: "Concise",
    emoji: "⚡",
    accent: "#FFD54F",
    accentDim: "rgba(255,213,79,0.18)",
    accentBorder: "rgba(255,213,79,0.45)",
    accentGlow: "rgba(255,213,79,0.3)",
    accentGlowStrong: "rgba(255,213,79,0.55)",
    orbColor1: "radial-gradient(circle, rgba(255,213,79,0.22) 0%, transparent 70%)",
    orbColor2: "radial-gradient(circle, rgba(255,213,79,0.1) 0%, transparent 70%)",
    cardBar: "linear-gradient(90deg, transparent, #FFD54F, transparent)",
    statGlow: "0 0 40px rgba(255,213,79,0.35)",
    titleGlow: "0 0 60px rgba(255,213,79,0.4), 0 0 120px rgba(255,213,79,0.18)",
    scrollLine: "linear-gradient(to bottom, rgba(255,213,79,0.7), transparent)",
    hexColor: "#FFD54F",
    quoteAccent: "#FFD54F",
    ctaRadial: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,213,79,0.07) 0%, transparent 70%)",
    badgeBorder: "rgba(255,213,79,0.35)",
    badgeBg: "rgba(255,213,79,0.06)",
    badgeDot: "#FFD54F",
  },
  {
    id: "witty",
    label: "Witty",
    emoji: "✨",
    accent: "#69F0AE",
    accentDim: "rgba(105,240,174,0.14)",
    accentBorder: "rgba(105,240,174,0.4)",
    accentGlow: "rgba(105,240,174,0.25)",
    accentGlowStrong: "rgba(105,240,174,0.48)",
    orbColor1: "radial-gradient(circle, rgba(105,240,174,0.2) 0%, transparent 70%)",
    orbColor2: "radial-gradient(circle, rgba(105,240,174,0.09) 0%, transparent 70%)",
    cardBar: "linear-gradient(90deg, transparent, #69F0AE, transparent)",
    statGlow: "0 0 40px rgba(105,240,174,0.3)",
    titleGlow: "0 0 60px rgba(105,240,174,0.35), 0 0 120px rgba(105,240,174,0.14)",
    scrollLine: "linear-gradient(to bottom, rgba(105,240,174,0.65), transparent)",
    hexColor: "#69F0AE",
    quoteAccent: "#69F0AE",
    ctaRadial: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(105,240,174,0.06) 0%, transparent 70%)",
    badgeBorder: "rgba(105,240,174,0.32)",
    badgeBg: "rgba(105,240,174,0.05)",
    badgeDot: "#69F0AE",
  },
  {
    id: "scientific",
    label: "Scientific",
    emoji: "🔬",
    accent: "#448AFF",
    accentDim: "rgba(68,138,255,0.14)",
    accentBorder: "rgba(68,138,255,0.4)",
    accentGlow: "rgba(68,138,255,0.25)",
    accentGlowStrong: "rgba(68,138,255,0.5)",
    orbColor1: "radial-gradient(circle, rgba(68,138,255,0.2) 0%, transparent 70%)",
    orbColor2: "radial-gradient(circle, rgba(68,138,255,0.09) 0%, transparent 70%)",
    cardBar: "linear-gradient(90deg, transparent, #448AFF, transparent)",
    statGlow: "0 0 40px rgba(68,138,255,0.3)",
    titleGlow: "0 0 60px rgba(68,138,255,0.35), 0 0 120px rgba(68,138,255,0.14)",
    scrollLine: "linear-gradient(to bottom, rgba(68,138,255,0.65), transparent)",
    hexColor: "#448AFF",
    quoteAccent: "#448AFF",
    ctaRadial: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(68,138,255,0.06) 0%, transparent 70%)",
    badgeBorder: "rgba(68,138,255,0.32)",
    badgeBg: "rgba(68,138,255,0.05)",
    badgeDot: "#448AFF",
  },
  {
    id: "strict",
    label: "Strict",
    emoji: "🎯",
    accent: "#ee820f",
    accentDim: "rgba(238,130,15,0.14)",
    accentBorder: "rgba(238,130,15,0.45)",
    accentGlow: "rgba(238,130,15,0.22)",
    accentGlowStrong: "rgba(238,130,15,0.45)",
    orbColor1: "radial-gradient(circle, rgba(238,130,15,0.18) 0%, transparent 70%)",
    orbColor2: "radial-gradient(circle, rgba(238,130,15,0.08) 0%, transparent 70%)",
    cardBar: "linear-gradient(90deg, transparent, #ee820f, transparent)",
    statGlow: "0 0 40px rgba(238,130,15,0.28)",
    titleGlow: "0 0 60px rgba(238,130,15,0.3), 0 0 120px rgba(238,130,15,0.12)",
    scrollLine: "linear-gradient(to bottom, rgba(238,130,15,0.6), transparent)",
    hexColor: "#ee820f",
    quoteAccent: "#ee820f",
    ctaRadial: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(238,130,15,0.05) 0%, transparent 70%)",
    badgeBorder: "rgba(238,130,15,0.3)",
    badgeBg: "rgba(238,130,15,0.04)",
    badgeDot: "#ee820f",
  },
  {
  id: "creative",
  label: "Creative",
  emoji: "🎨",
  desc: "Imaginative, expressive",
  accent: "#8317cb",
  accentDim: "rgba(131,23,203,0.14)",
  accentBorder: "rgba(131,23,203,0.4)",
  accentGlow: "rgba(131,23,203,0.25)",
  bgTint: "rgba(131,23,203,0.015)",
  btnRadius: "20px", btnPadding: "5px 16px", btnStyle: "italic",
  btnLetterSpacing: "0.02em", btnFontSize: "0.6rem", btnWeight: 600,
  activeIndicator: "glow",
  pillFormat: (t) => `🎨 Creative mode — Paint with words`,
  pillRadius: "12px", pillFontFamily: "'Syne', sans-serif",
  pillFontSize: "0.58rem", pillLetterSpacing: "0.04em",
  pillBg: "linear-gradient(90deg, rgba(131,23,203,0.1), rgba(131,23,203,0.05))",
  pillBorder: "rgba(131,23,203,0.35)",
  inputBorderFocus: "rgba(131,23,203,0.6)",
  inputGlowFocus: "0 0 0 2px rgba(131,23,203,0.12), 0 0 28px rgba(131,23,203,0.1)",
  sendBg: "linear-gradient(135deg, #8317cb 0%, #4a0080 100%)",
  sendGlow: "0 4px 18px rgba(131,23,203,0.45)",
  bubbleFontFamily: "'Syne', sans-serif", bubbleFontSize: "0.94rem",
  bubbleFontStyle: "normal", bubbleLineHeight: 1.9, bubbleLetterSpacing: "0.008em",
  bubbleTextTransform: "none", bubbleFontWeight: 400,
  bubbleBg: "rgba(14,4,20,0.96)", bubbleBorder: "rgba(131,23,203,0.2)",
  bubbleLeftBar: "#8317cb", bubbleTextColor: "#F3E5FF",
  dotColor: "#8317cb", dotDuration: 1.2, dotDelay: 0.28,
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
  pillRadius: "20px", pillFontFamily: "'Syne', sans-serif",
  pillFontSize: "0.58rem", pillLetterSpacing: "0.05em",
  pillBg: "linear-gradient(135deg, rgba(255,182,213,0.1), rgba(200,100,150,0.05))",
  pillBorder: "rgba(255,182,213,0.32)",
  inputBorderFocus: "rgba(255,182,213,0.55)",
  inputGlowFocus: "0 0 0 2px rgba(255,182,213,0.12), 0 0 28px rgba(200,100,150,0.1)",
  sendBg: "linear-gradient(135deg, #FFB6D5 0%, #c0507a 100%)",
  sendGlow: "0 4px 20px rgba(255,182,213,0.42)",
  bubbleFontFamily: "'Syne', sans-serif", bubbleFontSize: "0.91rem",
  bubbleFontStyle: "italic", bubbleLineHeight: 1.95, bubbleLetterSpacing: "0.015em",
  bubbleTextTransform: "none", bubbleFontWeight: 400,
  bubbleBg: "rgba(18,6,28,0.97)", bubbleBorder: "rgba(255,182,213,0.18)",
  bubbleLeftBar: "#FFB6D5", bubbleTextColor: "#FFE8F2",
  dotColor: "#FFB6D5", dotDuration: 1.6, dotDelay: 0.45,
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
  pillRadius: "20px", pillFontFamily: "'Syne', sans-serif",
  pillFontSize: "0.58rem", pillLetterSpacing: "0.02em",
  pillBg: "linear-gradient(135deg, rgba(255,245,225,0.08), rgba(255,235,180,0.05))",
  pillBorder: "rgba(255,245,225,0.28)",
  inputBorderFocus: "rgba(255,245,225,0.45)",
  inputGlowFocus: "0 0 0 2px rgba(255,245,225,0.1), 0 0 26px rgba(255,235,180,0.08)",
  sendBg: "linear-gradient(135deg, #FFF5E1 0%, #c8a96e 100%)",
  sendGlow: "0 4px 20px rgba(255,245,225,0.35)",
  bubbleFontFamily: "'Syne', sans-serif", bubbleFontSize: "0.93rem",
  bubbleFontStyle: "normal", bubbleLineHeight: 1.88, bubbleLetterSpacing: "0.01em",
  bubbleTextTransform: "none", bubbleFontWeight: 400,
  bubbleBg: "rgba(20,20,18,0.97)", bubbleBorder: "rgba(255,245,225,0.14)",
  bubbleLeftBar: "#FFF5E1", bubbleTextColor: "#FFF8EE",
  dotColor: "#FFF5E1", dotDuration: 1.1, dotDelay: 0.3,
},
];

const COLOR_TRANSITION = { duration: 0.9, ease: "easeInOut" };

function useBreakpoint() {
  const [bp, setBp] = useState({ isMobile: false, isTablet: false, isDesktop: true });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setBp({
        isMobile:  w < 768,
        isTablet:  w >= 768 && w < 1024,
        isDesktop: w >= 1024,
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return bp;
}

function ToneHex({ size, x, y, opacity, rotate, delay, hexColor, blur = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, rotate: rotate - 20 }}
      animate={{ opacity, scale: 1, rotate, background: hexColor }}
      transition={{
        opacity: { duration: 1.8, delay, ease: [0.16, 1, 0.3, 1] },
        scale:   { duration: 1.8, delay, ease: [0.16, 1, 0.3, 1] },
        rotate:  { duration: 1.8, delay, ease: [0.16, 1, 0.3, 1] },
        background: COLOR_TRANSITION,
      }}
      style={{
        position: "absolute", left: x, top: y,
        width: size, height: size * 1.1547,
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        filter: blur ? `blur(${blur}px)` : "none",
        zIndex: 0,
      }}
    />
  );
}

function ParallaxLayer({ children, speed, style = {} }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rawY = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);
  const y = useSpring(rawY, { stiffness: 60, damping: 20 });
  return (
    <motion.div ref={ref} style={{ y, ...style }}>
      {children}
    </motion.div>
  );
}

function RevealOnScroll({ children, delay = 0, direction = "up" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["0 1", "0.3 1"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [direction === "up" ? 60 : direction === "down" ? -60 : 0, 0]);
  const x = useTransform(scrollYProgress, [0, 1], [direction === "left" ? 60 : direction === "right" ? -60 : 0, 0]);
  return (
    <motion.div ref={ref} style={{ opacity, y, x }} transition={{ delay }}>
      {children}
    </motion.div>
  );
}

function DepthOrb({ cx, cy, r, speed, blur = 60, orbGradient }) {
  const { scrollYProgress } = useScroll();
  const rawY = useTransform(scrollYProgress, [0, 1], [0, speed]);
  const y = useSpring(rawY, { stiffness: 40, damping: 25 });
  return (
    <motion.div
      animate={{ background: orbGradient }}
      transition={COLOR_TRANSITION}
      style={{
        position: "fixed", left: cx, top: cy,
        width: r * 2, height: r * 2, borderRadius: "50%",
        filter: `blur(${blur}px)`,
        opacity: 0.22, pointerEvents: "none", y, zIndex: 0,
      }}
    />
  );
}

function SceneCard({ icon, title, desc, delay, hexCount = 3, ct }) {
  const hexPositions = [
    { x: "-20px", y: "-15px", size: 40, op: 0.15 },
    { x: "calc(100% - 20px)", y: "10px", size: 28, op: 0.1 },
    { x: "80%", y: "calc(100% - 20px)", size: 22, op: 0.08 },
  ].slice(0, hexCount);

  return (
    <RevealOnScroll delay={delay} direction="up">
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          position: "relative",
          background: "linear-gradient(135deg, #0D1525 0%, #111b30 100%)",
          border: "1px solid rgba(244,180,0,0.12)",
          borderRadius: "4px", padding: "2rem 1.75rem",
          overflow: "hidden", cursor: "default",
        }}
      >
        {hexPositions.map((h, i) => (
          <motion.div
            key={i}
            animate={{ background: ct.hexColor, opacity: h.op }}
            transition={COLOR_TRANSITION}
            style={{
              position: "absolute", left: h.x, top: h.y,
              width: h.size, height: h.size * 1.1547,
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }}
          />
        ))}
        <motion.div
          animate={{ background: ct.cardBar }}
          transition={COLOR_TRANSITION}
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px" }}
        />
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{icon}</div>
        <h3 style={{
          fontFamily: "Orbitron, sans-serif", color: "#E8D9A0",
          fontSize: "0.9rem", letterSpacing: "0.1em",
          marginBottom: "0.75rem", textTransform: "uppercase",
        }}>{title}</h3>
        <p style={{
          fontFamily: "Syne, sans-serif", color: "rgba(232,217,160,0.6)",
          fontSize: "0.875rem", lineHeight: 1.7,
        }}>{desc}</p>
      </motion.div>
    </RevealOnScroll>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();

  const toneLabels = TONES.map(t => t.label);
  const [activeTone, setActiveTone] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActiveTone(t => (t + 1) % TONES.length), 2200);
    return () => clearInterval(id);
  }, []);

  const ct = TONES[activeTone];

  const heroOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const heroScale   = useTransform(scrollYProgress, [0, 0.4],  [1, 1.08]);
  const titleY      = useTransform(scrollYProgress, [0, 0.3],  ["0%", isMobile ? "-10%" : "-25%"]);
  const titleScale  = useTransform(scrollYProgress, [0, 0.3],  [1, isMobile ? 0.92 : 0.85]);
  const subtitleY   = useTransform(scrollYProgress, [0, 0.3],  ["0%", isMobile ? "-15%" : "-40%"]);
  const pillsY      = useTransform(scrollYProgress, [0, 0.3],  ["0%", isMobile ? "-8%"  : "-15%"]);

  const hex1Y = useTransform(scrollYProgress, [0, 1], ["0px", isMobile ? "-80px"  : "-280px"]);
  const hex2Y = useTransform(scrollYProgress, [0, 1], ["0px", isMobile ? "-50px"  : "-180px"]);
  const hex3Y = useTransform(scrollYProgress, [0, 1], ["0px", isMobile ? "-120px" : "-420px"]);
  const hex4Y = useTransform(scrollYProgress, [0, 1], ["0px", isMobile ? "-30px"  : "-90px"]);
  const hex5Y = useTransform(scrollYProgress, [0, 1], ["0px", isMobile ? "-100px" : "-350px"]);

  const sHex1Y = useSpring(hex1Y, { stiffness: 50, damping: 20 });
  const sHex2Y = useSpring(hex2Y, { stiffness: 35, damping: 18 });
  const sHex3Y = useSpring(hex3Y, { stiffness: 65, damping: 22 });
  const sHex4Y = useSpring(hex4Y, { stiffness: 25, damping: 15 });
  const sHex5Y = useSpring(hex5Y, { stiffness: 55, damping: 20 });

  const sTitleY    = useSpring(titleY,    { stiffness: 80, damping: 30 });
  const sSubtitleY = useSpring(subtitleY, { stiffness: 70, damping: 28 });
  const sPillsY    = useSpring(pillsY,    { stiffness: 55, damping: 22 });

  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (isMobile) return;
    const handle = (e) => setMouse({
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    });
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [isMobile]);

  const mouseX     = useSpring(mouse.x * (isMobile ? 0 : 18),  { stiffness: 80, damping: 30 });
  const mouseXNeg  = useSpring(mouse.x * (isMobile ? 0 : -8),  { stiffness: 60, damping: 25 });
  const mouseXFast = useSpring(mouse.x * (isMobile ? 0 : 24),  { stiffness: 90, damping: 35 });

  const features = [
    { icon: "⬡", title: "Adaptive Tone",  desc: "Switch from formal to fun mid-conversation. Livvy reads the room so you don't have to.", delay: 0 },
    { icon: "◈", title: "Hive Memory",    desc: "Your context, preferences, and history — stored in the hive. Livvy remembers everything.", delay: 0.08 },
    { icon: "⌬", title: "Deep Research",  desc: "Scientific rigor on demand. Ask complex questions and get structured, cited answers.", delay: 0.16 },
    { icon: "❋", title: "Role Aware",     desc: "Student, developer, researcher — Livvy calibrates its depth and vocabulary to your role.", delay: 0.24 },
  ];

  return (
    <div
      ref={containerRef}
      style={{
        background: "#080D1A", minHeight: "100vh",
        overflowX: "hidden", fontFamily: "Syne, sans-serif", color: "#E8D9A0",
      }}
    >
      <InteractiveHive glowColor={ct.accent} />

      <DepthOrb cx="-120px" cy="10%" r={isMobile ? 160 : 320} orbGradient={ct.orbColor1} speed={-200} blur={90} />
      <DepthOrb cx="70%" cy="40%" r={isMobile ? 130 : 260} orbGradient={ct.orbColor2} speed={-120} blur={120} />
      <DepthOrb cx="20%" cy="75%" r={isMobile ? 100 : 200} orbGradient={ct.orbColor1} speed={-80} blur={100} />

      <PollenBG scrollYProgress={scrollYProgress} />

      {/* ── HERO ── */}
      <div
        ref={heroRef}
        style={{
          position: "relative", height: "100svh",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Layer 1 — deepest bg hexes */}
        {!isMobile && (
          <motion.div style={{ position: "absolute", inset: 0, y: sHex4Y, pointerEvents: "none" }}>
            <ToneHex size={180} x="75%" y="8%"  opacity={0.05} rotate={15}  delay={0.2} hexColor={ct.hexColor} blur={3} />
            <ToneHex size={240} x="-5%" y="55%" opacity={0.04} rotate={-10} delay={0.4} hexColor={ct.hexColor} blur={5} />
            <ToneHex size={120} x="88%" y="65%" opacity={0.06} rotate={30}  delay={0.6} hexColor={ct.hexColor} blur={2} />
          </motion.div>
        )}

        {/* Layer 2 — mid hexes */}
        <motion.div style={{ position: "absolute", inset: 0, y: sHex2Y, x: mouseX, pointerEvents: "none" }}>
          {!isMobile && <>
            <ToneHex size={90}  x="12%" y="15%" opacity={0.12} rotate={-5}  delay={0.5} hexColor={ct.hexColor} />
            <ToneHex size={60}  x="82%" y="20%" opacity={0.15} rotate={20}  delay={0.7} hexColor={ct.hexColor} />
            <ToneHex size={50}  x="65%" y="78%" opacity={0.10} rotate={-15} delay={0.9} hexColor={ct.hexColor} />
            <ToneHex size={70}  x="5%"  y="72%" opacity={0.09} rotate={10}  delay={1.0} hexColor={ct.hexColor} />
          </>}
          {isMobile && <>
            <ToneHex size={45} x="80%" y="10%" opacity={0.10} rotate={20}  delay={0.5} hexColor={ct.hexColor} />
            <ToneHex size={35} x="5%"  y="70%" opacity={0.08} rotate={-10} delay={0.8} hexColor={ct.hexColor} />
          </>}
        </motion.div>

        {/* Layer 3 — Livvy slot (RIGHT SIDE only — NOT near title) */}
        <motion.div style={{ position: "absolute", inset: 0, y: sHex1Y, x: mouseXNeg, pointerEvents: "none" }}>
          <motion.div
            animate={{
              y: [0, -16, 0],
              borderColor: ct.accentBorder,
              background: `linear-gradient(135deg, ${ct.accentDim}, ${ct.accentGlow.replace("0.3","0.04")})`,
            }}
            transition={{
              y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
              borderColor: COLOR_TRANSITION,
              background: COLOR_TRANSITION,
            }}
            style={{
              position: "absolute",
              right: isMobile ? "4%" : "8%",
              top: isMobile ? "12%" : "50%",
              transform: isMobile ? "none" : "translateY(-50%)",
              width:  isMobile ? 80  : 160,
              height: isMobile ? 80 * 1.1547 : 160 * 1.1547,
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              border: "1px solid",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          />

          {!isMobile && <>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
              style={{ position: "absolute", right: "calc(8% + 30px)", top: "calc(50% - 130px)", transformOrigin: "80px 130px" }}>
              <motion.div
                animate={{ background: ct.hexColor }}
                transition={COLOR_TRANSITION}
                style={{
                  width: 24, height: 24 * 1.1547,
                  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  opacity: 0.35,
                }}
              />
            </motion.div>
            <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
              style={{ position: "absolute", right: "calc(8% - 40px)", top: "calc(50% + 60px)", transformOrigin: "60px 60px" }}>
              <motion.div
                animate={{ background: ct.hexColor }}
                transition={COLOR_TRANSITION}
                style={{
                  width: 18, height: 18 * 1.1547,
                  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  opacity: 0.25,
                }}
              />
            </motion.div>
          </>}
        </motion.div>

        {/* Layer 4 — sparkle hexes */}
        <motion.div style={{ position: "absolute", inset: 0, x: mouseXFast, y: sHex3Y, pointerEvents: "none" }}>
          <motion.div
            animate={{ scale: [1,1.15,1], opacity: [0.4,0.7,0.4] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            style={{ position: "absolute", left: "30%", top: "22%" }}
          >
            <motion.div animate={{ background: ct.hexColor }} transition={COLOR_TRANSITION}
              style={{ width: isMobile ? 8 : 14, height: (isMobile ? 8 : 14) * 1.1547, clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
          </motion.div>
          <motion.div
            animate={{ scale: [1,1.2,1], opacity: [0.3,0.6,0.3] }}
            transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut", delay: 1 }}
            style={{ position: "absolute", left: "55%", top: "85%" }}
          >
            <motion.div animate={{ background: ct.hexColor }} transition={COLOR_TRANSITION}
              style={{ width: isMobile ? 6 : 10, height: (isMobile ? 6 : 10) * 1.1547, clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
          </motion.div>
          <motion.div
            animate={{ scale: [1,1.1,1], opacity: [0.25,0.5,0.25] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
            style={{ position: "absolute", left: "18%", top: "60%" }}
          >
            <motion.div animate={{ background: ct.hexColor }} transition={COLOR_TRANSITION}
              style={{ width: isMobile ? 9 : 16, height: (isMobile ? 9 : 16) * 1.1547, clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
          </motion.div>
        </motion.div>

        {/* ── Hero content — fully centered with no positional offsets ── */}
        <motion.div
          style={{
            position: "relative", zIndex: 10,
            textAlign: "center",
            y: sTitleY, opacity: heroOpacity, scale: titleScale,
            maxWidth: isMobile ? "100%" : 640,
            padding: isMobile ? "0 1.25rem" : "0 2rem",
            /* CRITICAL FIX: ensure this block itself is perfectly centered */
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ marginBottom: "1.5rem" }}
          >
            <motion.div
              animate={{ borderColor: ct.badgeBorder, background: ct.badgeBg }}
              transition={COLOR_TRANSITION}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "0.35rem 1rem", border: "1px solid", borderRadius: "2px",
              }}
            >
              <motion.span
                animate={{ color: ct.accent }}
                transition={COLOR_TRANSITION}
                style={{ fontSize: "0.6rem", fontFamily: "Orbitron", letterSpacing: "0.2em" }}
              >AI ASSISTANT</motion.span>
              <motion.span
                animate={{ background: ct.badgeDot, boxShadow: `0 0 8px ${ct.badgeDot}` }}
                transition={COLOR_TRANSITION}
                style={{ width: 6, height: 6, borderRadius: "50%", display: "inline-block", flexShrink: 0 }}
              />
            </motion.div>
          </motion.div>

          {/* Title — no extra padding or offset that would shift it */}
          <motion.h1
            initial={{ opacity: 0, y: 40, letterSpacing: "0.6em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "0.18em", color: ct.accent, textShadow: ct.titleGlow }}
            transition={{
              opacity: { duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] },
              y: { duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] },
              letterSpacing: { duration: 1.2, delay: 0.4 },
              color: COLOR_TRANSITION,
              textShadow: COLOR_TRANSITION,
            }}
            style={{
              fontFamily: "Orbitron, sans-serif", fontWeight: 900,
              fontSize: isMobile ? "clamp(2rem, 12vw, 3rem)" : "clamp(2.8rem, 8vw, 5.5rem)",
              lineHeight: 1,
              marginBottom: "0.5rem",
              paddingLeft: "0.18em",
            }}
          >MIGHTBEE</motion.h1>

          {/* Subtitle */}
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            style={{
              display: "block", fontFamily: "Syne, sans-serif",
              fontSize: isMobile ? "clamp(0.85rem, 3.5vw, 1rem)" : "clamp(1rem, 2.5vw, 1.25rem)",
              color: "rgba(232,217,160,0.75)", letterSpacing: "0.05em",
              marginBottom: "2rem", y: sSubtitleY,
              textAlign: "center",
            }}
          >
            Intelligence that adapts to{" "}
            <motion.span
              animate={{ color: ct.accent }}
              transition={COLOR_TRANSITION}
              style={{ fontWeight: 600 }}
            >how you think</motion.span>
          </motion.span>

          {/* Tone pills + CTAs */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            style={{ y: sPillsY, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            {/* Tone pills — single line on desktop */}
            <div style={{
              display: "flex", gap: "0.35rem", justifyContent: "center",
              flexWrap: isMobile ? "wrap" : "nowrap", marginBottom: "2.5rem",
              padding: isMobile ? "0 0.5rem" : "0",
              maxWidth: "100%",
            }}>
              {TONES.map((t, i) => (
                <motion.span
                  key={t.id}
                  animate={{
                    background:  activeTone === i ? ct.accentDim   : "rgba(244,180,0,0.04)",
                    borderColor: activeTone === i ? ct.accentBorder : "rgba(244,180,0,0.15)",
                    color:       activeTone === i ? ct.accent       : "rgba(232,217,160,0.4)",
                    opacity:     activeTone === i ? 1 : 0.45,
                    scale:       activeTone === i ? 1.06 : 1,
                    boxShadow:   activeTone === i ? `0 0 14px ${ct.accentGlow}` : "none",
                  }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  style={{
                    padding: isMobile ? "0.25rem 0.6rem" : "0.32rem 0.75rem",
                    border: "1px solid", borderRadius: "2px",
                    fontFamily: "Orbitron", fontSize: isMobile ? "0.5rem" : "0.58rem",
                    letterSpacing: "0.08em", cursor: "default", userSelect: "none",
                    display: "flex", alignItems: "center", gap: "0.3rem",
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "0.8em" }}>{t.emoji}</span>
                  {t.label}
                </motion.span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div style={{
              display: "flex", gap: isMobile ? "1rem" : "1.5rem",
              justifyContent: "center", flexWrap: "wrap",
            }}>
              <HexButton size={isMobile ? "sm" : "md"} onClick={() => navigate("/login")} variant="primary" glowColor={ct.accent}>
                Enter Hive
              </HexButton>
              <HexButton size={isMobile ? "sm" : "md"}
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                variant="outline" glowColor={ct.accent}>
                Learn More
              </HexButton>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          style={{
            position: "absolute", bottom: "2rem", left: "50%",
            transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "0.4rem", zIndex: 10,
          }}
        >
          <motion.span
            animate={{ color: ct.accent }}
            transition={COLOR_TRANSITION}
            style={{ fontFamily: "Orbitron", fontSize: "0.5rem", letterSpacing: "0.2em" }}
          >SCROLL</motion.span>
          <motion.div
            animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{ width: 1, height: 40 }}
          >
            <motion.div
              animate={{ background: ct.scrollLine }}
              transition={COLOR_TRANSITION}
              style={{ width: "100%", height: "100%" }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* ── TRANSITION TEXT BAND ── */}
      <div style={{ position: "relative", overflow: "hidden", padding: isMobile ? "4rem 0" : "8rem 0", background: "transparent" }}>
        <ParallaxLayer speed={-0.15} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
          <div style={{
            whiteSpace: "nowrap", fontFamily: "Orbitron",
            fontSize: isMobile ? "clamp(2rem, 10vw, 4rem)" : "clamp(4rem, 12vw, 9rem)",
            fontWeight: 900, color: "rgba(244,180,0,0.04)",
            letterSpacing: "0.2em", userSelect: "none", pointerEvents: "none",
          }}>
            INTELLIGENT · ADAPTIVE · LIVVY · MIGHTBEE · AI · HIVE ·&nbsp;
          </div>
        </ParallaxLayer>

        <ParallaxLayer speed={-0.3} style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 2rem" }}>
          <RevealOnScroll>
            <h2 style={{
              fontFamily: "Orbitron",
              fontSize: isMobile ? "clamp(0.9rem, 4vw, 1.1rem)" : "clamp(1.1rem, 3vw, 1.6rem)",
              color: "#E8D9A0", letterSpacing: "0.12em",
              marginBottom: "1rem", fontWeight: 700,
            }}>THE HIVE IS THINKING</h2>
            <motion.div
              animate={{ background: `linear-gradient(90deg, transparent, ${ct.accent}, transparent)` }}
              transition={COLOR_TRANSITION}
              style={{ width: 60, height: 2, margin: "0 auto 1.5rem" }}
            />
            <p style={{
              maxWidth: 520, margin: "0 auto",
              color: "rgba(232,217,160,0.55)",
              fontSize: isMobile ? "0.85rem" : "1rem",
              lineHeight: 1.8, letterSpacing: "0.03em",
            }}>
              A living AI ecosystem that learns your patterns, adapts your tone, and delivers intelligence with personality.
            </p>
          </RevealOnScroll>
        </ParallaxLayer>
      </div>

      {/* ── FEATURES ── */}
      <div id="features" style={{
        position: "relative",
        padding: isMobile ? "2rem 1.25rem 4rem" : "4rem 2rem 8rem",
        maxWidth: 1100, margin: "0 auto",
      }}>
        {!isMobile && (
          <ParallaxLayer speed={-0.2} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <ToneHex size={300} x="55%" y="-10%" opacity={0.025} rotate={15} hexColor={ct.hexColor} blur={8} delay={0} />
            <ToneHex size={160} x="-5%" y="60%"  opacity={0.04}  rotate={-20} hexColor={ct.hexColor} blur={4} delay={0} />
          </ParallaxLayer>
        )}

        <RevealOnScroll>
          <div style={{ textAlign: "center", marginBottom: isMobile ? "2rem" : "4rem" }}>
            <motion.p
              animate={{ color: ct.accent }}
              transition={COLOR_TRANSITION}
              style={{ fontFamily: "Orbitron", fontSize: "0.6rem", letterSpacing: "0.25em", marginBottom: "0.75rem" }}
            >CAPABILITIES</motion.p>
            <h2 style={{
              fontFamily: "Orbitron",
              fontSize: isMobile ? "clamp(1rem, 5vw, 1.4rem)" : "clamp(1.4rem, 4vw, 2.2rem)",
              color: "#E8D9A0", letterSpacing: "0.08em", fontWeight: 700,
            }}>BUILT FOR HOW YOU THINK</h2>
          </div>
        </RevealOnScroll>

        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: isMobile ? "1rem" : "1.25rem",
        }}>
          {features.map((f, i) => (
            <SceneCard key={i} {...f} ct={ct} />
          ))}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: isMobile ? "1rem" : "2rem",
          marginTop: isMobile ? "2.5rem" : "5rem",
          textAlign: "center",
        }}>
          {[
            { val: "7", label: "Tone Modes" },
            { val: "6", label: "Professions" },
            { val: "∞", label: "Conversations" },
          ].map(({ val, label }, i) => (
            <RevealOnScroll key={i} delay={i * 0.1} direction="up">
              <div>
                <motion.div
                  animate={{ color: ct.accent, textShadow: ct.statGlow }}
                  transition={COLOR_TRANSITION}
                  style={{
                    fontFamily: "Orbitron", fontWeight: 900,
                    fontSize: isMobile ? "clamp(1.8rem, 8vw, 2.5rem)" : "clamp(2.5rem, 6vw, 4rem)",
                    lineHeight: 1, marginBottom: "0.5rem",
                  }}
                >{val}</motion.div>
                <div style={{
                  fontFamily: "Syne", fontSize: isMobile ? "0.65rem" : "0.8rem",
                  letterSpacing: "0.15em", color: "rgba(232,217,160,0.45)", textTransform: "uppercase",
                }}>{label}</div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>

      {/* ── PARALLAX QUOTE SCENE ── */}
      <div style={{
        position: "relative",
        height: isMobile ? "40vh" : "60vh",
        overflow: "hidden", margin: "0 0 6rem",
      }}>
        <ParallaxLayer speed={-0.08} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <motion.div
            animate={{ color: `${ct.accent}08` }}
            transition={COLOR_TRANSITION}
            style={{
              fontFamily: "Orbitron", fontWeight: 900,
              fontSize: isMobile ? "clamp(3rem, 20vw, 6rem)" : "clamp(5rem, 20vw, 16rem)",
              letterSpacing: "0.1em", userSelect: "none",
            }}
          >HIVE</motion.div>
        </ParallaxLayer>

        {!isMobile && (
          <ParallaxLayer speed={-0.22} style={{ position: "absolute", inset: 0 }}>
            <motion.div animate={{ rotate: [0, 5, 0, -5, 0] }} transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
              style={{ position: "absolute", left: "15%", top: "20%" }}>
              <motion.div animate={{ background: ct.hexColor }} transition={COLOR_TRANSITION}
                style={{ width: 80, height: 80 * 1.1547, opacity: 0.18, clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
            </motion.div>
            <motion.div animate={{ rotate: [0, -8, 0, 8, 0] }} transition={{ repeat: Infinity, duration: 9, ease: "easeInOut", delay: 2 }}
              style={{ position: "absolute", right: "20%", top: "30%" }}>
              <motion.div animate={{ background: ct.hexColor }} transition={COLOR_TRANSITION}
                style={{ width: 55, height: 55 * 1.1547, opacity: 0.22, clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
            </motion.div>
          </ParallaxLayer>
        )}

        <ParallaxLayer speed={-0.4} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}>
          <RevealOnScroll>
            <div style={{ textAlign: "center", padding: isMobile ? "0 1.5rem" : "0 2rem" }}>
              <p style={{
                fontFamily: "Syne",
                fontSize: isMobile ? "clamp(0.9rem, 3.5vw, 1rem)" : "clamp(1rem, 3vw, 1.5rem)",
                color: "rgba(232,217,160,0.65)", maxWidth: 480,
                lineHeight: 1.7, margin: "0 auto", letterSpacing: "0.04em",
              }}>
                "Not just an AI. A mind that{" "}
                <motion.span animate={{ color: ct.quoteAccent }} transition={COLOR_TRANSITION} style={{ fontWeight: 700 }}>bends to yours</motion.span> — then helps you push beyond it."
              </p>
            </div>
          </RevealOnScroll>
        </ParallaxLayer>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        padding: isMobile ? "4rem 1.25rem 5rem" : "6rem 2rem 8rem",
        textAlign: "center",
      }}>
        <motion.div animate={{ background: ct.ctaRadial }} transition={COLOR_TRANSITION}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

        {!isMobile && (
          <ParallaxLayer speed={-0.15} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <ToneHex size={200} x="5%"  y="-20%" opacity={0.04} rotate={20}  hexColor={ct.hexColor} blur={6} delay={0} />
            <ToneHex size={140} x="80%" y="50%"  opacity={0.05} rotate={-10} hexColor={ct.hexColor} blur={4} delay={0} />
          </ParallaxLayer>
        )}

        <RevealOnScroll direction="up">
          <motion.p animate={{ color: ct.accent }} transition={COLOR_TRANSITION}
            style={{ fontFamily: "Orbitron", fontSize: "0.6rem", letterSpacing: "0.25em", marginBottom: "1rem" }}>BEGIN YOUR JOURNEY</motion.p>
          <h2 style={{
            fontFamily: "Orbitron", fontWeight: 900,
            fontSize: isMobile ? "clamp(1.4rem, 6vw, 2rem)" : "clamp(1.6rem, 5vw, 3rem)",
            color: "#E8D9A0", letterSpacing: "0.1em",
            marginBottom: "1rem", lineHeight: 1.2,
          }}>START WITH LIVVY</h2>
          <p style={{
            fontFamily: "Syne", color: "rgba(232,217,160,0.5)",
            fontSize: isMobile ? "0.85rem" : "1rem",
            maxWidth: 400, margin: "0 auto 3rem", lineHeight: 1.7,
          }}>
            Join the hive. Your AI companion awaits — calibrated, curious, and completely yours.
          </p>

          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            <HexButton size={isMobile ? "sm" : "lg"} onClick={() => navigate("/login")} variant="primary" glowColor={ct.accent}>
              Enter Hive
            </HexButton>
          </div>
        </RevealOnScroll>

        <div style={{
          display: "flex", justifyContent: "center",
          gap: isMobile ? "0.3rem" : "0.5rem",
          marginTop: isMobile ? "3rem" : "5rem", opacity: 0.18,
        }}>
          {[...Array(isMobile ? 5 : 7)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3], background: ct.hexColor }}
              transition={{
                opacity: { repeat: Infinity, duration: 3, delay: i * 0.3, ease: "easeInOut" },
                background: COLOR_TRANSITION,
              }}
              style={{
                width: isMobile ? 8 : 12,
                height: (isMobile ? 8 : 12) * 1.1547,
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}