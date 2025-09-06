"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { baseSepolia, sepolia, mainnet } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactNode, useMemo } from "react";

// RainbowKit configuration with proper ENS support
const config = getDefaultConfig({
  appName: "AfricanProof",
  projectId: "demo-project-id", // Use demo ID to avoid 403 errors
  chains: [baseSepolia, sepolia, mainnet],
  ssr: false,
});

// Create QueryClient outside component to prevent re-initialization
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

export default function Provider({ children }: { children: ReactNode }) {
  // Memoize theme to prevent re-creation on every render
  const theme = useMemo(() => darkTheme({
    accentColor: '#10b981', // Green-500
    accentColorForeground: 'white',
    borderRadius: 'medium',
    fontStack: 'system',
    overlayBlur: 'small',
  }), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={theme}
          showRecentTransactions={true}
          coolMode={false} // Disable cool mode for better performance
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
