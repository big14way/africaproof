"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useState, useEffect } from "react";

export const Navbar = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="relative z-10 flex items-center justify-between p-6 lg:px-12 bg-transparent rounded-full">
      <a href="/">
        <div className="flex items-center space-x-3">
          <Image
            src="/afroproof-logo.svg"
            alt="Afroproof Logo"
            width={40}
            height={40}
            className="drop-shadow-lg"
          />
          <span className="text-2xl font-bold text-green-400 drop-shadow-lg">
            AfricanProof
          </span>
        </div>
      </a>

      <div className="hidden md:flex items-center space-x-10">
        <a
          href="/africanproof"
          className="text-white/90 hover:text-green-300 transition-all duration-300 hover:scale-105 font-medium"
        >
          Platform
        </a>
        <a
          href="/self-verify"
          className="text-white/90 hover:text-green-300 transition-all duration-300 hover:scale-105 font-medium"
        >
          Self-Verify
        </a>
        <a
          href="/example"
          className="text-white/90 hover:text-green-300 transition-all duration-300 hover:scale-105 font-medium"
        >
          Demo
        </a>
      </div>

      <div className="flex items-center">
        {mounted ? (
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== 'loading';
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus ||
                  authenticationStatus === 'authenticated');

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          type="button"
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center font-medium shadow-sm"
                        >
                          Connect Wallet
                        </button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          type="button"
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center font-medium shadow-sm"
                        >
                          Wrong network
                        </button>
                      );
                    }

                    return (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={openChainModal}
                          style={{ display: 'flex', alignItems: 'center' }}
                          type="button"
                          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center font-medium shadow-sm"
                        >
                          {chain.hasIcon && (
                            <div
                              style={{
                                background: chain.iconBackground,
                                width: 16,
                                height: 16,
                                borderRadius: 999,
                                overflow: 'hidden',
                                marginRight: 8,
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  style={{ width: 16, height: 16 }}
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                        </button>

                        <button
                          onClick={openAccountModal}
                          type="button"
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center font-medium shadow-sm"
                        >
                          {account.ensName || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
                          {account.ensName && (
                            <span className="ml-2 text-xs bg-green-400 text-green-900 px-2 py-1 rounded">
                              ENS
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        ) : (
          <div className="w-24 h-8 bg-gray-200 animate-pulse rounded"></div>
        )}
      </div>
    </nav>
  );
};
