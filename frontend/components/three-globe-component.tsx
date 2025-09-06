"use client";
import { useRef, useEffect, useState } from "react";
import type React from "react";

export const ThreeGlobeComponent: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mountElement = mountRef.current;
    if (!mountElement) return;

    let animationId: number;
    let scene: any;
    let camera: any;
    let renderer: any;
    let globe: any;
    let networkPoints: any[] = [];
    let networkLines: any[] = [];

    const initGlobe = async () => {
      try {
        const THREE = await import("three");
        const ThreeGlobe = await import("three-globe");

        // Scene setup with better lighting
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x000000, 400, 2000);

        // Camera setup - positioned for better view
        camera = new THREE.PerspectiveCamera(75, mountElement.clientWidth / mountElement.clientHeight, 0.1, 1000);
        camera.position.set(0, 0, 250);

        // Renderer setup with better quality
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        });
        renderer.setSize(mountElement.clientWidth, mountElement.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mountElement.appendChild(renderer.domElement);

        // Create realistic Earth globe using three-globe
        globe = new ThreeGlobe.default()
          .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
          .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png');

        // Make globe bigger
        globe.scale.set(1.2, 1.2, 1.2);

        // Position globe to show Africa prominently
        globe.rotation.x = -0.1;
        globe.rotation.y = -0.3;

        // African cities and major global cities for network connections
        const cities = [
          // African cities (highlighted)
          { name: "Lagos", lat: 6.5244, lng: 3.3792, color: "#00ff88", size: 0.8 },
          { name: "Cairo", lat: 30.0444, lng: 31.2357, color: "#00ff88", size: 0.7 },
          { name: "Johannesburg", lat: -26.2041, lng: 28.0473, color: "#00ff88", size: 0.7 },
          { name: "Nairobi", lat: -1.2921, lng: 36.8219, color: "#00ff88", size: 0.6 },
          { name: "Accra", lat: 5.6037, lng: -0.1870, color: "#ffff00", size: 0.9 }, // Highlighted for ETH Accra
          { name: "Casablanca", lat: 33.5731, lng: -7.5898, color: "#00ff88", size: 0.5 },
          { name: "Addis Ababa", lat: 9.1450, lng: 40.4897, color: "#00ff88", size: 0.5 },
          { name: "Dakar", lat: 14.7167, lng: -17.4677, color: "#00ff88", size: 0.4 },

          // Global cities for network connections
          { name: "New York", lat: 40.7128, lng: -74.0060, color: "#4a90e2", size: 0.6 },
          { name: "London", lat: 51.5074, lng: -0.1278, color: "#4a90e2", size: 0.6 },
          { name: "Singapore", lat: 1.3521, lng: 103.8198, color: "#4a90e2", size: 0.5 },
          { name: "Tokyo", lat: 35.6762, lng: 139.6503, color: "#4a90e2", size: 0.5 },
          { name: "Dubai", lat: 25.2048, lng: 55.2708, color: "#4a90e2", size: 0.4 },
        ];

        // Add points to globe
        globe.pointsData(cities)
          .pointColor('color')
          .pointAltitude(0.02)
          .pointRadius('size')
          .pointResolution(8);

        // Create network connections (arcs between cities)
        const connections = [];
        const africanCities = cities.slice(0, 8); // First 8 are African
        const globalCities = cities.slice(8); // Rest are global

        // Connect African cities to each other
        for (let i = 0; i < africanCities.length; i++) {
          for (let j = i + 1; j < africanCities.length; j++) {
            if (Math.random() > 0.6) { // 40% chance of connection
              connections.push({
                startLat: africanCities[i].lat,
                startLng: africanCities[i].lng,
                endLat: africanCities[j].lat,
                endLng: africanCities[j].lng,
                color: ['#00ff88', '#ffff00']
              });
            }
          }
        }

        // Connect African cities to global cities
        africanCities.forEach(africanCity => {
          globalCities.forEach(globalCity => {
            if (Math.random() > 0.7) { // 30% chance of connection
              connections.push({
                startLat: africanCity.lat,
                startLng: africanCity.lng,
                endLat: globalCity.lat,
                endLng: globalCity.lng,
                color: ['#00ff88', '#4a90e2']
              });
            }
          });
        });

        // Add arcs to globe
        globe.arcsData(connections)
          .arcColor('color')
          .arcDashLength(0.4)
          .arcDashGap(2)
          .arcDashInitialGap(() => Math.random() * 5)
          .arcDashAnimateTime(2000)
          .arcStroke(0.5);

        scene.add(globe);

        // Enhanced lighting for realistic appearance
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Add rim lighting for atmosphere effect
        const rimLight = new THREE.DirectionalLight(0x00aaff, 0.3);
        rimLight.position.set(-100, -100, -50);
        scene.add(rimLight);

        // Animation loop with smooth rotation
        const animate = () => {
          animationId = requestAnimationFrame(animate);

          // Rotate globe slowly to show different parts of Africa
          if (globe) {
            globe.rotation.y += 0.003;
          }

          renderer.render(scene, camera);
        };

        animate();
        setIsLoading(false);

      } catch (err) {
        console.error("Globe error:", err);
        setIsLoading(false);
      }
    };

    initGlobe();

    // Cleanup
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer && mountElement && renderer.domElement) {
        mountElement.removeChild(renderer.domElement);
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">🌍</div>
            <p className="text-white/70">Loading Globe...</p>
          </div>
        </div>
      )}
      <div ref={mountRef} className="w-full h-full" style={{ minHeight: "300px" }} />
    </div>
  );
};
