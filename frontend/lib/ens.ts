import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

// Create a public client for ENS resolution
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http('https://eth-mainnet.g.alchemy.com/v2/demo'),
});

// Your ENS name for the project
export const PROJECT_ENS_NAME = 'gwill.eth';

// Resolve ENS name to address
export async function resolveEnsName(ensName: string): Promise<string | null> {
  try {
    const address = await publicClient.getEnsAddress({
      name: ensName,
    });
    return address;
  } catch (error) {
    console.error('Failed to resolve ENS name:', error);
    return null;
  }
}

// Resolve address to ENS name
export async function resolveEnsAddress(address: string): Promise<string | null> {
  try {
    const ensName = await publicClient.getEnsName({
      address: address as `0x${string}`,
    });
    return ensName;
  } catch (error) {
    console.error('Failed to resolve ENS address:', error);
    return null;
  }
}

// Get ENS avatar
export async function getEnsAvatar(ensName: string): Promise<string | null> {
  try {
    const avatar = await publicClient.getEnsAvatar({
      name: ensName,
    });
    return avatar;
  } catch (error) {
    console.error('Failed to get ENS avatar:', error);
    return null;
  }
}

// Check if address matches project ENS
export async function isProjectOwner(address: string): Promise<boolean> {
  try {
    const projectAddress = await resolveEnsName(PROJECT_ENS_NAME);
    return projectAddress?.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Failed to check project owner:', error);
    return false;
  }
}

// Get display name (ENS name or shortened address)
export function getDisplayName(address: string, ensName?: string | null): string {
  if (ensName) {
    return ensName;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
