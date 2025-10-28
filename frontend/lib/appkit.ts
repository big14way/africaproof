// lib/appkit.ts - Reown AppKit Configuration
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { coinbaseWallet, walletConnect } from '@wagmi/connectors';
import { base, baseSepolia, mainnet } from 'wagmi/chains';

// WalletConnect Project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '1eebe528ca0ce94a99ceaa2e915058d7';

// Define metadata for the application
const metadata = {
  name: 'AfricanProof',
  description: 'African Identity Verification Platform',
  url: process.env.NODE_ENV === 'production' ? 'https://africanproof.app' : 'http://localhost:3000',
  icons: ['https://i.postimg.cc/mrmVf9hm/self.png'],
};

// Define chains - Base, Base Sepolia, and Ethereum Mainnet
const chains = [base, baseSepolia, mainnet];

// Create Wagmi Adapter with connectors
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks: chains as any,
  connectors: [
    // Coinbase Smart Wallet (CDP) - Email login
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0],
      preference: 'smartWalletOnly', // Force email-based Smart Wallet
      version: '4',
    }),

    // WalletConnect - Mobile wallets via QR code
    walletConnect({
      projectId,
      metadata,
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'light',
        themeVariables: {
          '--wcm-z-index': '1000',
        },
      },
    }),
  ],
});

// Create AppKit modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: chains as any,
  defaultNetwork: base as any,
  metadata,
  features: {
    analytics: true,
    email: true,
    socials: [],
    emailShowWallets: true,
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#0052FF',
  },
});

// Export config for use in components
export const config = wagmiAdapter.wagmiConfig;
