import { useEffect, useState, useMemo } from "react";

const R = 34, W = R * Math.sqrt(3), H = R * 2;

function hexPoints(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

// Parse any hex color string "#RRGGBB" or "#RGB" → "r,g,b"
function hexToRgb(hex) {
  if (!hex || !hex.startsWith("#")) return "244,180,0"; // fallback gold
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map(c => c + c).join("");
  if (h.length !== 6) return "244,180,0";
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

export default function InteractiveHive({ glowColor = "#F4B400" }) {
  const [mouse, setMouse] = useState({ x: -9999, y: -9999 });
  const [dims,  setDims]  = useState({ w: window.innerWidth, h: window.innerHeight });

  // Parse glowColor to rgb string — recomputes only when glowColor changes
  const rgb = useMemo(() => hexToRgb(glowColor), [glowColor]);

  useEffect(() => {
    const onMove   = (e) => setMouse({ x: e.clientX, y: e.clientY });
    const onResize = ()  => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize",    onResize);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize",    onResize);
    };
  }, []);

  const hexes = useMemo(() => {
    const cols = Math.ceil(dims.w / W) + 3;
    const rows = Math.ceil(dims.h / (H * 0.75)) + 3;
    const result = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cx = col * W + (row % 2 === 0 ? 0 : W / 2) - W;
        const cy = row * H * 0.75 - H * 0.5;
        result.push({ key: `${row}-${col}`, cx, cy, pts: hexPoints(cx, cy, R - 1.5) });
      }
    }
    return result;
  }, [dims]);

  return (
    <svg style={{
      position: "fixed", inset: 0,
      width: "100vw", height: "100vh",
      zIndex: 0, pointerEvents: "none", overflow: "hidden",
    }}>
      {hexes.map(({ key, cx, cy, pts }) => {
        const d = Math.sqrt((mouse.x - cx) ** 2 + (mouse.y - cy) ** 2);
        const RADIUS = 80;
        const intensity = d < RADIUS ? (1 - d / RADIUS) * 0.85 : 0;

        return (
          <polygon
            key={key}
            points={pts}
            fill={intensity > 0
              ? `rgba(${rgb},${(intensity * 0.10).toFixed(3)})`
              : "none"}
            stroke={intensity > 0
              ? `rgba(${rgb},${(0.06 + intensity * 0.45).toFixed(3)})`
              : "rgba(244,180,0,0.05)"}
            strokeWidth={intensity > 0 ? 1.2 : 0.8}
          />
        );
      })}
    </svg>
  );
}