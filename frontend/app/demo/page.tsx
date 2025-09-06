'use client';

import { Navbar } from '@/components/Navbar';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background dark relative overflow-hidden">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Demo Page</h1>
          <p className="text-gray-400">Demo functionality coming soon...</p>
        </div>
      </div>
    </div>
  );
}
