"use client";
import React from "react";

export const SimpleGlobe: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative">
        {/* Main Globe */}
        <div className="w-64 h-64 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 relative overflow-hidden shadow-2xl animate-spin-slow">
          {/* Continents - Africa highlighted */}
          <div className="absolute inset-0">
            {/* Africa */}
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-16 h-20 lg:w-24 lg:h-28 bg-green-400 rounded-full opacity-80 shadow-lg"></div>
            
            {/* Europe */}
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/4 w-8 h-6 lg:w-12 lg:h-8 bg-green-500 rounded-full opacity-70"></div>
            
            {/* Asia */}
            <div className="absolute top-1/4 right-1/4 w-12 h-10 lg:w-16 lg:h-14 bg-green-500 rounded-full opacity-70"></div>
            
            {/* Clouds */}
            <div className="absolute top-1/6 left-1/3 w-8 h-4 lg:w-12 lg:h-6 bg-white rounded-full opacity-30 animate-float"></div>
            <div className="absolute bottom-1/3 right-1/4 w-6 h-3 lg:w-8 lg:h-4 bg-white rounded-full opacity-25 animate-float-delayed"></div>
            
            {/* Atmosphere glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-cyan-200 to-transparent opacity-20"></div>
          </div>
          
          {/* Highlight on Africa */}
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-20 h-24 lg:w-28 lg:h-32 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 opacity-60 animate-pulse"></div>
          </div>
        </div>
        
        {/* Orbital rings */}
        <div className="absolute inset-0 rounded-full border-2 border-cyan-300 opacity-30 animate-spin-reverse"></div>
        <div className="absolute inset-2 rounded-full border border-cyan-400 opacity-20 animate-spin-slow"></div>
        
        {/* Floating particles */}
        <div className="absolute -top-4 -left-4 w-2 h-2 bg-cyan-300 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute -bottom-6 -right-6 w-3 h-3 bg-blue-300 rounded-full animate-bounce-delayed opacity-50"></div>
        <div className="absolute top-1/4 -right-8 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        
        {/* Text overlay */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-cyan-300 font-semibold text-lg lg:text-xl">Africa</p>
          <p className="text-white/70 text-sm">Digital Identity Hub</p>
        </div>
      </div>
    </div>
  );
};
