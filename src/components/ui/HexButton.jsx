import { useState } from "react";
import { motion } from "framer-motion";

const HEX = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

const SIZES = {
  xs: { width: 90,  height: 104, fontSize: "0.58rem" },
  sm: { width: 130, height: 150, fontSize: "0.68rem" },
  md: { width: 158, height: 182, fontSize: "0.78rem" },
  lg: { width: 186, height: 215, fontSize: "0.88rem" },
};

export default function HexButton({
  children,
  variant   = "outline",
  onClick,
  disabled  = false,
  size      = "md",
  glowColor = "#F4B400",
}) {
  const [hov, setHov] = useState(false);
  const s         = SIZES[size] || SIZES.md;
  const isPrimary = variant === "primary";

  // Same pattern as Landing.jsx — animate prop with transition duration
  // glowColor is already a hex string like "#FF5252", passed directly
  const borderOpacity   = isPrimary ? (hov ? 1 : 0.82) : (hov ? 0.65 : 0.42);
  const innerOpacity    = isPrimary ? (hov ? 0.92 : 0.65) : null;

  return (
    <motion.div
      onHoverStart={() => !disabled && setHov(true)}
      onHoverEnd={() => setHov(false)}
      whileHover={disabled ? {} : { scale: 1.06 }}
      whileTap={disabled   ? {} : { scale: 0.94 }}
      style={{
        position: "relative",
        width:    s.width,
        height:   s.height,
        cursor:   disabled ? "not-allowed" : "pointer",
      }}
    >
      {/* Border hex — same animate pattern as Landing orbs/hexes */}
      <motion.div
        animate={{
          background: glowColor,
          opacity:    borderOpacity,
          boxShadow:  isPrimary && hov
            ? `0 0 30px ${glowColor}88, 0 0 70px ${glowColor}33`
            : !isPrimary && hov
              ? `0 0 18px ${glowColor}44`
              : "none",
        }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
        style={{
          position: "absolute", inset: 0,
          clipPath: HEX,
        }}
      />

      {/* Inner dark fill — inset 2px to show border */}
      <motion.div
        animate={{
          background: isPrimary
            ? glowColor
            : "rgba(13,21,37,0.94)",
          opacity: isPrimary ? innerOpacity : (hov ? 0.78 : 1),
        }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
        style={{
          position: "absolute", inset: 2,
          clipPath: HEX,
          background: isPrimary ? glowColor : hov ? "rgba(13,21,37,0.78)" : "rgba(13,21,37,0.94)",
        }}
      />

      {/* Text label */}
      <motion.button
        onClick={() => { if (!disabled) onClick?.(); }}
        disabled={disabled}
        animate={{ color: isPrimary ? "#080D1A" : glowColor }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
        style={{
          position:       "absolute",
          inset:          0,
          clipPath:       HEX,
          border:         "none",
          outline:        "none",
          background:     "transparent",
          fontFamily:     "'Orbitron', sans-serif",
          fontWeight:     800,
          fontSize:       s.fontSize,
          letterSpacing:  "0.13em",
          textTransform:  "uppercase",
          cursor:         disabled ? "not-allowed" : "pointer",
          opacity:        disabled ? 0.4 : 1,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
        }}
      >
        {children}
      </motion.button>
    </motion.div>
  );
}