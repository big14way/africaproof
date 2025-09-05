import { http, createConfig } from 'wagmi'
import { base, baseSepolia, mainnet } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'your-project-id'

export const config = createConfig({
  chains: [base, baseSepolia, mainnet],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'AfricanProof',
      appLogoUrl: 'https://i.postimg.cc/mrmVf9hm/self.png',
    }),
    walletConnect({ projectId }),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
