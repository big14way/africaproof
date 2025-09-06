"use client";

import React, { useEffect, useRef } from 'react';

interface NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  city: string;
  country: string;
  flag: string;
}

export const AfricanNetworkAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<NetworkNode[]>([]);

  const africanCities = [
    { city: "Lagos", country: "Nigeria", flag: "🇳🇬" },
    { city: "Cairo", country: "Egypt", flag: "🇪🇬" },
    { city: "Accra", country: "Ghana", flag: "🇬🇭" },
    { city: "Nairobi", country: "Kenya", flag: "🇰🇪" },
    { city: "Cape Town", country: "South Africa", flag: "🇿🇦" },
    { city: "Casablanca", country: "Morocco", flag: "🇲🇦" },
    { city: "Addis Ababa", country: "Ethiopia", flag: "🇪🇹" },
    { city: "Dakar", country: "Senegal", flag: "🇸🇳" },
    { city: "Kampala", country: "Uganda", flag: "🇺🇬" },
    { city: "Kigali", country: "Rwanda", flag: "🇷🇼" },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize nodes
    nodesRef.current = africanCities.map((city, index) => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      ...city
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Update node positions
      nodesRef.current.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x <= 20 || node.x >= canvas.offsetWidth - 20) node.vx *= -1;
        if (node.y <= 20 || node.y >= canvas.offsetHeight - 20) node.vy *= -1;

        // Keep within bounds
        node.x = Math.max(20, Math.min(canvas.offsetWidth - 20, node.x));
        node.y = Math.max(20, Math.min(canvas.offsetHeight - 20, node.y));
      });

      // Draw connections
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.2)';
      ctx.lineWidth = 1;
      
      nodesRef.current.forEach((node1, i) => {
        nodesRef.current.slice(i + 1).forEach(node2 => {
          const distance = Math.sqrt(
            Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2)
          );
          
          if (distance < 200) {
            const opacity = (200 - distance) / 200;
            ctx.strokeStyle = `rgba(34, 197, 94, ${opacity * 0.3})`;
            ctx.beginPath();
            ctx.moveTo(node1.x, node1.y);
            ctx.lineTo(node2.x, node2.y);
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      nodesRef.current.forEach((node, index) => {
        // Outer glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 15);
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.8)');
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 15, 0, Math.PI * 2);
        ctx.fill();

        // Main node
        ctx.fillStyle = index === 2 ? '#fbbf24' : '#22c55e'; // Highlight Accra in gold
        ctx.beginPath();
        ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
        ctx.fill();

        // City label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.flag, node.x, node.y - 20);
        ctx.fillText(node.city, node.x, node.y + 25);
      });

      // Pulsing effect for Accra (ETH Accra hackathon)
      const accra = nodesRef.current[2];
      const pulseRadius = 20 + Math.sin(Date.now() * 0.005) * 10;
      const pulseGradient = ctx.createRadialGradient(accra.x, accra.y, 0, accra.x, accra.y, pulseRadius);
      pulseGradient.addColorStop(0, 'rgba(251, 191, 36, 0)');
      pulseGradient.addColorStop(1, 'rgba(251, 191, 36, 0.3)');
      
      ctx.fillStyle = pulseGradient;
      ctx.beginPath();
      ctx.arc(accra.x, accra.y, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 rounded-2xl overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Overlay content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🌍</div>
          <h3 className="text-2xl font-bold mb-2">African Identity Network</h3>
          <p className="text-green-200 text-sm">
            Connecting verified identities across the continent
          </p>
        </div>
      </div>

      {/* Network stats */}
      <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Network Active</span>
        </div>
        <div className="text-green-200">
          {africanCities.length} Cities Connected
        </div>
      </div>

      {/* Africa highlight */}
      <div className="absolute bottom-4 right-4 bg-green-500/20 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
        <div className="flex items-center gap-2">
          <span className="text-green-400">🌍</span>
          <span>Africa Connected</span>
        </div>
      </div>
    </div>
  );
};
