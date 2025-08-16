"use client";

import { useEffect, useState } from "react";

interface FloatingOrb {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  opacity: number;
}

export function CryptoBackground() {
  const [orbs, setOrbs] = useState<FloatingOrb[]>([]);

  useEffect(() => {
    // Create initial orbs
    const initialOrbs: FloatingOrb[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 200 + 100,
      color: [
        "from-cyan-400/20 to-blue-600/20",
        "from-amber-400/20 to-orange-600/20",
        "from-green-400/20 to-emerald-600/20",
        "from-purple-400/20 to-pink-600/20",
        "from-blue-400/20 to-cyan-600/20",
        "from-orange-400/20 to-red-600/20",
      ][Math.floor(Math.random() * 6)],
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.6 + 0.2,
    }));
    setOrbs(initialOrbs);

    // Animation loop
    const animate = () => {
      setOrbs((prevOrbs) =>
        prevOrbs.map((orb) => ({
          ...orb,
          x: (orb.x + orb.speedX + 100) % 100,
          y: (orb.y + orb.speedY + 100) % 100,
        }))
      );
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={`absolute rounded-full bg-gradient-to-br ${orb.color} blur-xl transition-all duration-1000 ease-linear`}
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            opacity: orb.opacity,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}
