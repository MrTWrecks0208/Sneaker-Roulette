import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface RouletteAnimationProps {
  onComplete: () => void;
}

// Helper to create circular segment paths for the roulette wheel SVG
const createSegmentPath = (
  startAngle: number,
  endAngle: number,
  outerRadius: number,
  innerRadius: number
) => {
  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;

  const x1_out = 200 + outerRadius * Math.cos(startRad);
  const y1_out = 200 + outerRadius * Math.sin(startRad);
  const x2_out = 200 + outerRadius * Math.cos(endRad);
  const y2_out = 200 + outerRadius * Math.sin(endRad);

  const x1_in = 200 + innerRadius * Math.cos(startRad);
  const y1_in = 200 + innerRadius * Math.sin(startRad);
  const x2_in = 200 + innerRadius * Math.cos(endRad);
  const y2_in = 200 + innerRadius * Math.sin(endRad);

  return `
    M ${x1_in} ${y1_in}
    L ${x1_out} ${y1_out}
    A ${outerRadius} ${outerRadius} 0 0 1 ${x2_out} ${y2_out}
    L ${x2_in} ${y2_in}
    A ${innerRadius} ${innerRadius} 0 0 0 ${x1_in} ${y1_in}
    Z
  `;
};

export default function RouletteAnimation({ onComplete }: RouletteAnimationProps) {
  const [phase, setPhase] = useState<'intro' | 'spin' | 'zoomOut' | 'done'>('intro');

  // Play a synthesized physical clicking sound using the Web Audio API
  const playTickSound = () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.04);

      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch {
      // Audio block or error ignored gracefully
    }
  };

  // Synchronize synthetic click audio with the wheel's spin deceleration
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let ticksPlayed = 0;
    const maxTicks = 24;

    const scheduleNextTick = (currentDelay: number) => {
      if (ticksPlayed >= maxTicks) return;

      playTickSound();
      ticksPlayed++;

      // Increase delay gradually to simulate deceleration/friction
      const nextDelay = currentDelay * 1.15;
      timeoutId = setTimeout(() => {
        scheduleNextTick(nextDelay);
      }, currentDelay);
    };

    // Start with quick ticks that gradually slow down
    const startTimeout = setTimeout(() => {
      scheduleNextTick(60);
    }, 200);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeoutId);
    };
  }, []);

  // Control phase transitions for scaling/fade out
  useEffect(() => {
    // 1. Initial spin phase
    setPhase('spin');

    // 2. Start dramatic scale and exit fade
    const zoomTimeout = setTimeout(() => {
      setPhase('zoomOut');
    }, 2300);

    // 3. Complete and call the picker
    const completeTimeout = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 2850);

    return () => {
      clearTimeout(zoomTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  // Generate 37 alternating segments (0 - 36)
  const angleStep = 360 / 37;
  const segments = [];
  const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

  for (let i = 0; i < 37; i++) {
    const startAngle = i * angleStep;
    const endAngle = (i + 1) * angleStep;
    const midAngle = startAngle + angleStep / 2;
    const midRad = ((midAngle - 90) * Math.PI) / 180;

    let color = '#ef4444'; // Red
    if (numbers[i] === 0) color = '#10b981'; // Green Zero
    else if (i % 2 === 1) color = '#18181b'; // Black / Zinc-900

    segments.push({
      path: createSegmentPath(startAngle, endAngle, 170, 118),
      color,
      textX: 200 + 144 * Math.cos(midRad),
      textY: 200 + 144 * Math.sin(midRad),
      angle: midAngle,
      number: numbers[i],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-md overflow-hidden">
      {/* Dynamic ambient grid background with flashing neon particles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.12),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* The Container that scales up to swallow the screen */}
      <motion.div
        initial={{ scale: 0.15, opacity: 0 }}
        animate={
          phase === 'zoomOut'
            ? { scale: 5.5, opacity: 0 }
            : { scale: 1, opacity: 1 }
        }
        transition={{
          duration: phase === 'zoomOut' ? 0.6 : 0.85,
          ease: phase === 'zoomOut' ? [0.6, 0.01, 0.05, 0.95] : [0.16, 1, 0.3, 1],
        }}
        className="relative flex items-center justify-center w-[90vw] h-[90vw] max-w-[420px] max-h-[420px] shrink-0"
      >
        {/* Glow behind the wheel */}
        <div className="absolute inset-0 rounded-full bg-red-500/20 blur-2xl animate-pulse" />

        {/* Golden outer neon frame */}
        <div className="absolute inset-[-4px] rounded-full border-4 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]" />

        {/* Rotating Main Wheel Layer */}
        <motion.div
          animate={{ rotate: 1800 }}
          transition={{
            duration: 2.8,
            ease: [0.1, 0.75, 0.25, 1],
          }}
          className="w-full h-full"
        >
          <svg
            viewBox="0 0 400 400"
            className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]"
          >
            <defs>
              {/* Metallic brass outer rim gradient */}
              <radialGradient id="outerRim" cx="50%" cy="50%" r="50%">
                <stop offset="70%" stopColor="#27272a" />
                <stop offset="88%" stopColor="#d97706" />
                <stop offset="93%" stopColor="#f59e0b" />
                <stop offset="97%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#18181b" />
              </radialGradient>

              {/* Gold gradient for spokes and spinner */}
              <linearGradient id="goldSpokes" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="30%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#78350f" />
                <stop offset="70%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>

              {/* Inner dark cone */}
              <radialGradient id="innerCone" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3f3f46" />
                <stop offset="45%" stopColor="#18181b" />
                <stop offset="100%" stopColor="#09090b" />
              </radialGradient>
            </defs>

            {/* Brass / Wood Outer Rim */}
            <circle cx="200" cy="200" r="195" fill="url(#outerRim)" />
            <circle cx="200" cy="200" r="172" fill="#09090b" stroke="#78350f" strokeWidth="2" />

            {/* Colored Number Wedges */}
            {segments.map((seg, idx) => (
              <g key={idx}>
                <path
                  d={seg.path}
                  fill={seg.color}
                  stroke="#78350f"
                  strokeWidth="0.75"
                />
                {/* Numbers printed in gold/white */}
                <text
                  x={seg.textX}
                  y={seg.textY}
                  transform={`rotate(${seg.angle + 180}, ${seg.textX}, ${seg.textY})`}
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="font-sans select-none fill-zinc-100 opacity-90"
                >
                  {seg.number}
                </text>
              </g>
            ))}

            {/* Track Rim separator */}
            <circle cx="200" cy="200" r="118" fill="none" stroke="#d97706" strokeWidth="1.5" />

            {/* Inner Cone Base */}
            <circle cx="200" cy="200" r="116" fill="url(#innerCone)" />

            {/* Golden Core Spokes and Center Turret */}
            <g id="center-turret">
              {/* Gold Spokes */}
              <rect x="195" y="100" width="10" height="200" rx="3" fill="url(#goldSpokes)" />
              <rect x="100" y="195" width="200" height="10" rx="3" fill="url(#goldSpokes)" />

              {/* Hub Base */}
              <circle cx="200" cy="200" r="45" fill="url(#goldSpokes)" stroke="#78350f" strokeWidth="1.5" />
              <circle cx="200" cy="200" r="32" fill="#18181b" />
              <circle cx="200" cy="200" r="18" fill="url(#goldSpokes)" />
              <circle cx="200" cy="200" r="8" fill="#09090b" />

              {/* Spinner Handles */}
              <circle cx="200" cy="100" r="8" fill="url(#goldSpokes)" stroke="#78350f" strokeWidth="1" />
              <circle cx="200" cy="300" r="8" fill="url(#goldSpokes)" stroke="#78350f" strokeWidth="1" />
              <circle cx="100" cy="200" r="8" fill="url(#goldSpokes)" stroke="#78350f" strokeWidth="1" />
              <circle cx="300" cy="200" r="8" fill="url(#goldSpokes)" stroke="#78350f" strokeWidth="1" />
            </g>
          </svg>
        </motion.div>

        {/* Counter-rotating Ball orbiting the track */}
        <motion.div
          animate={{ rotate: -1980 }}
          transition={{
            duration: 2.7,
            ease: [0.08, 0.6, 0.15, 1],
          }}
          className="absolute inset-[34px] pointer-events-none"
        >
          {/* White ivory ball with a soft neon blur shadow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4.5 h-4.5 rounded-full bg-white border border-zinc-300 shadow-[0_0_8px_rgba(255,255,255,0.8),0_4px_6px_rgba(0,0,0,0.4)]" />
        </motion.div>
      </motion.div>

      {/* Atmospheric Loading details under the wheel */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={phase === 'zoomOut' ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute bottom-16 sm:bottom-24 flex flex-col items-center gap-3 select-none text-center px-4"
      >
        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">Locker Roulette</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-widest uppercase text-shadow">
          Choosing Your Pair
        </h2>
        <p className="text-xs text-zinc-500 max-w-xs">
          Spinning the wheel of destiny to select the perfect sneakers for your day...
        </p>
      </motion.div>
    </div>
  );
}
