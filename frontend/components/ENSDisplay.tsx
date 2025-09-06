"use client";

import { useAccount, useEnsName } from 'wagmi';
import { useState, useEffect } from 'react';
import { PROJECT_ENS_NAME } from '../lib/ens';

export function ENSDisplay() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);
  const { data: ensName } = useEnsName({
    address: address,
  });

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span>🌍</span>
        <span>Project by {PROJECT_ENS_NAME}</span>
      </div>
    );
  }

  if (!isConnected || !address) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span>🌍</span>
        <span>Project by {PROJECT_ENS_NAME}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span>🌍</span>
      <span className="text-gray-400">Connected as:</span>
      <span className="text-green-400 font-medium">
        {ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}
      </span>
      {ensName && (
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
          ENS
        </span>
      )}
    </div>
  );
}
