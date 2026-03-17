import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import InteractiveHive from "../components/ui/InteractiveHive";
import HexButton from "../components/ui/HexButton";
import { auth } from "../services/api";

const HEX = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

const PROFESSIONS = [
  { id: "student",    label: "Student",    emoji: "🎓" },
  { id: "developer",  label: "Developer",  emoji: "💻" },
  { id: "researcher", label: "Researcher", emoji: "🔬" },
  { id: "teacher",    label: "Teacher",    emoji: "📚" },
  { id: "creator",    label: "Creator",    emoji: "🎨" },
  { id: "business",   label: "Business",   emoji: "📊" },
];

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

function HexInput({ label, type = "text", value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <label style={{
        display: "block", fontFamily: "Orbitron, sans-serif",
        fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase",
        marginBottom: 8,
        color: focused ? "#F4B400" : "rgba(244,180,0,0.45)",
        transition: "color 0.2s",
      }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "12px 16px",
          background: "rgba(8,13,26,0.85)",
          border: `1px solid ${focused ? "rgba(244,180,0,0.7)" : "rgba(244,180,0,0.15)"}`,
          borderRadius: 3, color: "#E8D9A0",
          fontFamily: "Syne, sans-serif", fontSize: "0.9rem",
          outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: focused ? "0 0 20px rgba(244,180,0,0.15)" : "none",
          letterSpacing: "0.02em", boxSizing: "border-box",
        }}
      />
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [profession, setProfession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("error");

  const isSignup = mode === "signup";

  useEffect(() => {
    if (auth.isLoggedIn()) navigate("/dashboard");
  }, [navigate]);

  const showError   = (text) => { setMsgType("error");   setMsg(text); };
  const showSuccess = (text) => { setMsgType("success"); setMsg(text); };

  const handleSubmit = async () => {
    if (isSignup && step === 1) {
      if (!username.trim())    { showError("Username is required, worker bee. 🐝"); return; }
      if (!email.trim())       { showError("Email is required."); return; }
      if (password.length < 6) { showError("Password must be at least 6 characters."); return; }
      setMsg(""); setStep(2); return;
    }
    if (isSignup && step === 2 && !profession) {
      showError("Choose your profession so Livvy knows you."); return;
    }

    setLoading(true); setMsg("");
    try {
      if (isSignup) {
        const data = await auth.register(username.trim(), email.trim(), password, profession);
        auth.saveSession(data.token, data.user);
        showSuccess("Welcome to the hive! 🐝");
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        if (!email.trim() || !password) { showError("Fill all fields, worker bee. 🐝"); setLoading(false); return; }
        const data = await auth.login(email.trim(), password);
        auth.saveSession(data.token, data.user);
        showSuccess("Access granted. Entering hive...");
        setTimeout(() => navigate("/dashboard"), 800);
      }
    } catch (err) {
      showError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#080D1A",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden", fontFamily: "Syne, sans-serif",
    }}>
      <InteractiveHive />

      <div style={{
        position: "fixed", left: "-8%", top: "15%",
        width: isMobile ? 240 : 480, height: isMobile ? 240 : 480,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(244,180,0,0.07) 0%, transparent 70%)",
        filter: "blur(70px)", pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", right: "5%", bottom: "10%",
        width: isMobile ? 180 : 360, height: isMobile ? 180 : 360,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,213,79,0.05) 0%, transparent 70%)",
        filter: "blur(90px)", pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}>
        {!isMobile && <>
          <FloatingHex size={160} x="76%" y="4%"  opacity={0.04} rotate={15}  delay={0.2} blur={4} />
          <FloatingHex size={90}  x="-2%" y="58%" opacity={0.05} rotate={-10} delay={0.5} blur={3} />
          <FloatingHex size={60}  x="88%" y="68%" opacity={0.06} rotate={30}  delay={0.7} blur={2} />
        </>}
        <FloatingHex size={isMobile ? 30 : 40} x="8%"  y="10%" opacity={0.11} rotate={-5}  delay={0.9} color="#FFD54F" />
        <FloatingHex size={isMobile ? 18 : 26} x="84%" y="28%" opacity={0.13} rotate={20}  delay={1.1} />
        <motion.div animate={{ scale: [1,1.2,1], opacity: [0.3,0.7,0.3] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          style={{ position: "absolute", left: "22%", top: "20%" }}>
          <FloatingHex size={isMobile ? 7 : 10} x={0} y={0} opacity={0.55} rotate={30} delay={0} color="#F4B400" />
        </motion.div>
      </div>

      <div style={{
        position: "fixed", inset: 0, zIndex: 2,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(244,180,0,0.012) 2px, rgba(244,180,0,0.012) 4px)",
        pointerEvents: "none",
      }} />

      {/* Top nav */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(8,13,26,0.75)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(244,180,0,0.08)",
        padding: isMobile ? "0.75rem 1.25rem" : "0.85rem 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <motion.div whileHover={{ scale: 1.04 }} onClick={() => navigate("/")}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{
            width: isMobile ? 24 : 28, height: (isMobile ? 24 : 28) * 1.1547,
            clipPath: HEX, background: "linear-gradient(135deg,#F4B400,#FFD54F)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: isMobile ? "0.7rem" : "0.8rem",
          }}>🐝</div>
          <span style={{
            fontFamily: "Orbitron, sans-serif", fontWeight: 700,
            fontSize: isMobile ? "0.72rem" : "0.82rem",
            color: "#F4B400", letterSpacing: "0.1em",
          }}>MIGHTBEE</span>
        </motion.div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F4B400", boxShadow: "0 0 8px #F4B400" }} />
          {!isMobile && (
            <span style={{
              fontFamily: "Orbitron, sans-serif", fontSize: "0.55rem",
              letterSpacing: "0.22em", color: "rgba(244,180,0,0.4)", textTransform: "uppercase",
            }}>Hive Access</span>
          )}
        </div>
      </div>

      {/* Auth card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative", zIndex: 10,
          width: "100%", maxWidth: isMobile ? "100%" : 460,
          margin: isMobile ? "4.5rem 0 0" : "5rem 1.5rem 1.5rem",
          background: "rgba(13,21,37,0.88)", backdropFilter: "blur(24px)",
          border: isMobile ? "none" : "1px solid rgba(244,180,0,0.2)",
          borderTop: "1px solid rgba(244,180,0,0.2)",
          borderRadius: isMobile ? "0" : 4,
          padding: isMobile ? "2rem 1.5rem 3rem" : "2.8rem 2.5rem",
          boxShadow: isMobile ? "none" : "0 0 80px rgba(244,180,0,0.07), 0 32px 100px rgba(0,0,0,0.55)",
          minHeight: isMobile ? "calc(100vh - 4.5rem)" : "auto",
        }}
      >
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(244,180,0,0.55), transparent)",
        }} />

        {!isMobile && [
          { top: -12, left: -12 }, { top: -12, right: -12 },
          { bottom: -12, left: -12 }, { bottom: -12, right: -12 },
        ].map((pos, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 + i * 0.07, duration: 0.5 }}
            style={{
              position: "absolute", ...pos,
              width: 24, height: 24 * 1.1547, clipPath: HEX,
              background: "rgba(244,180,0,0.12)", border: "1px solid rgba(244,180,0,0.45)",
            }}
          />
        ))}

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <motion.div animate={{ rotate: [0, 6, 0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
            style={{ display: "inline-block", marginBottom: 14 }}>
            <div style={{
              width: isMobile ? 44 : 52, height: (isMobile ? 44 : 52) * 1.1547,
              clipPath: HEX, background: "linear-gradient(135deg,#F4B400,#FFD54F)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: isMobile ? "1.1rem" : "1.4rem",
              boxShadow: "0 0 28px rgba(244,180,0,0.45)",
            }}>🐝</div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.14em" }}
            transition={{ duration: 1, delay: 0.2 }}
            style={{
              fontFamily: "Orbitron, sans-serif", fontWeight: 900,
              fontSize: isMobile ? "1.3rem" : "1.55rem", color: "#F4B400",
              textShadow: "0 0 40px rgba(244,180,0,0.4)",
              letterSpacing: "0.14em", marginBottom: 8,
            }}>MIGHTBEE</motion.h1>
          <AnimatePresence mode="wait">
            <motion.p key={isSignup ? (step === 1 ? "s1" : "s2") : "login"}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}
              style={{
                fontFamily: "Syne, sans-serif", fontSize: "0.82rem",
                color: "rgba(232,217,160,0.45)", letterSpacing: "0.04em",
              }}>
              {isSignup ? (step === 1 ? "Create your hive account" : "Tell Livvy who you are") : "Access the hive"}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Step indicator */}
        {isSignup && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: "1.5rem" }}>
            {[1, 2].map(s => (
              <motion.div key={s}
                animate={{
                  background: step >= s ? "rgba(244,180,0,0.25)" : "rgba(244,180,0,0.05)",
                  borderColor: step >= s ? "rgba(244,180,0,0.7)" : "rgba(244,180,0,0.15)",
                }}
                transition={{ duration: 0.35 }}
                style={{
                  padding: "0.3rem 1rem", border: "1px solid", borderRadius: 2,
                  fontFamily: "Orbitron", fontSize: "0.52rem", letterSpacing: "0.18em",
                  color: step >= s ? "#F4B400" : "rgba(244,180,0,0.3)",
                }}>
                {s === 1 ? "CREDENTIALS" : "PROFESSION"}
              </motion.div>
            ))}
          </div>
        )}

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.8rem" }}>
          <div style={{ height: 1, flex: 1, background: "linear-gradient(to right, transparent, rgba(244,180,0,0.2))" }} />
          <div style={{ width: 6, height: 6, clipPath: HEX, background: "rgba(244,180,0,0.4)" }} />
          <div style={{ height: 1, flex: 1, background: "linear-gradient(to left, transparent, rgba(244,180,0,0.2))" }} />
        </div>

        {/* Mode tabs */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3,
          background: "rgba(8,13,26,0.6)", border: "1px solid rgba(244,180,0,0.12)",
          borderRadius: 3, padding: 3, marginBottom: "2rem",
        }}>
          {["login", "signup"].map(m => (
            <motion.button key={m} whileTap={{ scale: 0.97 }}
              onClick={() => { setMode(m); setStep(1); setMsg(""); }}
              style={{
                padding: "9px", border: "none", borderRadius: 2,
                background: mode === m ? "rgba(244,180,0,0.16)" : "transparent",
                color: mode === m ? "#F4B400" : "rgba(232,217,160,0.35)",
                fontFamily: "Orbitron, sans-serif", fontSize: "0.62rem",
                letterSpacing: "0.16em", textTransform: "uppercase",
                cursor: "pointer", transition: "all 0.2s",
              }}>
              {m === "login" ? "Login" : "Sign Up"}
            </motion.button>
          ))}
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          {(!isSignup || step === 1) ? (
            <motion.div key="s1"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              {isSignup && (
                <HexInput label="Username" value={username}
                  onChange={e => setUsername(e.target.value)} placeholder="worker_bee_42" />
              )}
              <HexInput label="Email" type="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@hive.io" />
              <HexInput label="Password" type="password" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••••" />
            </motion.div>
          ) : (
            <motion.div key="s2"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <p style={{
                fontFamily: "Syne, sans-serif", fontSize: "0.85rem",
                color: "rgba(232,217,160,0.55)", marginBottom: "1.4rem",
                textAlign: "center", lineHeight: 1.6,
              }}>
                So Livvy can <span style={{ color: "#FFD54F" }}>adapt</span> her tone to your world:
              </p>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                gap: isMobile ? 8 : 10, marginBottom: "1.5rem",
              }}>
                {PROFESSIONS.map(p => (
                  <motion.button key={p.id}
                    whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setProfession(p.id)}
                    style={{
                      padding: isMobile ? "12px 6px" : "14px 8px",
                      border: `1px solid ${profession === p.id ? "#F4B400" : "rgba(244,180,0,0.15)"}`,
                      borderRadius: 3,
                      background: profession === p.id ? "rgba(244,180,0,0.14)" : "rgba(8,13,26,0.6)",
                      color: profession === p.id ? "#F4B400" : "rgba(232,217,160,0.5)",
                      cursor: "pointer", textAlign: "center", transition: "all 0.2s",
                      boxShadow: profession === p.id ? "0 0 16px rgba(244,180,0,0.2)" : "none",
                      position: "relative", overflow: "hidden",
                    }}>
                    {profession === p.id && (
                      <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: 1,
                        background: "linear-gradient(90deg, transparent, rgba(244,180,0,0.6), transparent)",
                      }} />
                    )}
                    <div style={{ fontSize: isMobile ? "1.2rem" : "1.4rem", marginBottom: 5 }}>{p.emoji}</div>
                    <div style={{
                      fontFamily: "Orbitron, sans-serif",
                      fontSize: isMobile ? "0.5rem" : "0.58rem", letterSpacing: "0.08em",
                    }}>{p.label}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message */}
        <AnimatePresence>
          {msg && (
            <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                fontFamily: "Syne, sans-serif", fontSize: "0.8rem",
                color: msgType === "success" ? "#4ADE80" : "#FFD54F",
                textAlign: "center", marginBottom: "1rem",
                padding: "8px 12px",
                background: msgType === "success" ? "rgba(74,222,128,0.07)" : "rgba(244,180,0,0.07)",
                border: `1px solid ${msgType === "success" ? "rgba(74,222,128,0.22)" : "rgba(244,180,0,0.22)"}`,
                borderRadius: 3,
              }}>{msg}</motion.p>
          )}
        </AnimatePresence>

        {/* Submit */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
          <HexButton size={isMobile ? "sm" : "md"} onClick={handleSubmit} disabled={loading} variant="primary">
            {loading
              ? (isSignup ? "Creating hive..." : "Entering hive...")
              : isSignup ? (step === 1 ? "Next →" : "🐝 Join Hive") : "Enter Hive"}
          </HexButton>
        </div>

        {isSignup && step === 2 && (
          <p onClick={() => setStep(1)} style={{
            textAlign: "center", marginTop: "1.2rem",
            fontFamily: "Syne, sans-serif", fontSize: "0.78rem",
            color: "rgba(244,180,0,0.45)", cursor: "pointer",
          }}>← Back</p>
        )}

        <p style={{
          textAlign: "center", marginTop: "1.6rem",
          fontFamily: "Syne, sans-serif", fontSize: "0.78rem",
          color: "rgba(232,217,160,0.3)",
        }}>
          {mode === "login" ? (
            <>New worker bee?{" "}
              <span onClick={() => setMode("signup")} style={{ color: "#F4B400", cursor: "pointer" }}>
                Create account
              </span></>
          ) : (
            <>Already in the hive?{" "}
              <span onClick={() => setMode("login")} style={{ color: "#F4B400", cursor: "pointer" }}>
                Login
              </span></>
          )}
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: "2rem", opacity: 0.12 }}>
          {[...Array(5)].map((_, i) => (
            <motion.div key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.25, ease: "easeInOut" }}
              style={{ width: 8, height: 8 * 1.1547, clipPath: HEX, background: "#F4B400" }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}