import { SiweMessage } from "siwe";
import { createPublicClient, http } from "viem";
import { base, mainnet, sepolia } from "viem/chains";

// Create clients for different networks
const baseClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

// Generate a random nonce for SIWE
export function generateNonce(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Create SIWE message for AfricanProof
export function createSiweMessage(address: string, nonce: string): SiweMessage {
  return new SiweMessage({
    domain: "africanproof.app",
    address,
    statement:
      "Sign in to AfricanProof - African Identity & Professional Network",
    uri:
      typeof window !== "undefined"
        ? window.location.origin
        : "https://africanproof.app",
    version: "1",
    chainId: 8453, // Base
    nonce,
    resources: ["https://africanproof.app", "https://efp.app"],
  });
}

// Resolve ENS name for an address
export async function resolveEnsName(address: string): Promise<string | null> {
  try {
    // Try Sepolia testnet first
    try {
      const sepoliaEnsName = await sepoliaClient.getEnsName({
        address: address as `0x${string}`,
      });
      if (sepoliaEnsName) return sepoliaEnsName;
    } catch (sepoliaError) {
      console.log(`Sepolia ENS resolution failed:`, sepoliaError);
    }

    // Then try mainnet
    try {
      const mainnetEnsName = await mainnetClient.getEnsName({
        address: address as `0x${string}`,
      });
      if (mainnetEnsName) return mainnetEnsName;
    } catch (mainnetError) {
      console.log(`Mainnet ENS resolution failed:`, mainnetError);
    }

    return null;
  } catch (error) {
    console.error("ENS resolution failed:", error);
    return null;
  }
}

// Get display name (ENS name or shortened address)
export function getDisplayName(
  address: string,
  ensName?: string | null
): string {
  if (ensName) {
    return ensName;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
