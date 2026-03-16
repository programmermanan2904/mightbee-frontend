import { motion, useTransform } from "framer-motion";

function sr(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const particles = Array.from({ length: 28 }, (_, i) => ({
  id:      i,
  x:       sr(i * 3)     * 100,
  y:       sr(i * 3 + 1) * 100,
  size:    sr(i * 3 + 2) * 4 + 2,
  dur:     sr(i * 7)     * 14 + 10,
  delay:  -(sr(i * 11)   * 20),
  driftY: (sr(i * 5)  - 0.5) * 110,
  driftX: (sr(i * 13) - 0.5) * 60,
  opacity: sr(i * 17) * 0.5 + 0.15,
}));

export default function PollenBG({ scrollYProgress }) {
  const pollenY = useTransform(scrollYProgress, [0, 1], [0, -180]);

  return (
    <motion.div
      aria-hidden="true"
      style={{ position:"fixed", inset:0, zIndex:1, pointerEvents:"none", y: pollenY }}
    >
      {particles.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left:     `${p.x}%`,
            top:      `${p.y}%`,
            width:    p.size,
            height:   p.size,
            borderRadius: "50%",
            background: "#FFD54F",
            boxShadow: `0 0 ${p.size * 3}px #FFD54F, 0 0 ${p.size}px #F4B400`,
          }}
          animate={{
            y:       [0, p.driftY, 0],
            x:       [0, p.driftX, 0],
            opacity: [p.opacity * 0.3, p.opacity, p.opacity * 0.3],
            scale:   [1, 1.4, 1],
          }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </motion.div>
  );
}