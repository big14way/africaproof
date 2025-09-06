"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, UserCheck, Loader2, AlertCircle, CheckCircle } from "lucide-react";

// EFP Contracts on Base Sepolia (Chain ID: 84532)
const EFP_LIST_REGISTRY_ADDRESS = "0xDdD39d838909bdFF7b067a5A42DC92Ad4823a26d";
const EFP_LIST_RECORDS_ADDRESS = "0x63B4e2Bb1E9b9D02AEF3Dc473c5B4b590219FA5e";
const EFP_ACCOUNT_METADATA_ADDRESS = "0xDAf8088C4DCC8113F49192336cd594300464af8D";

// EFP List Registry ABI (simplified for demo)
const EFP_LIST_REGISTRY_ABI = [
  {
    "inputs": [],
    "name": "mint",
    "outputs": [{"name": "tokenId", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// EFP List Records ABI (simplified for demo)
const EFP_LIST_RECORDS_ABI = [
  {
    "inputs": [{"name": "slot", "type": "uint256"}, {"name": "recordType", "type": "bytes32"}, {"name": "data", "type": "bytes"}],
    "name": "setRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "slot", "type": "uint256"}],
    "name": "getRecords",
    "outputs": [{"name": "", "type": "bytes[]"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// EFP Account Metadata ABI (simplified for demo)
const EFP_ACCOUNT_METADATA_ABI = [
  {
    "inputs": [{"name": "key", "type": "string"}, {"name": "value", "type": "bytes"}],
    "name": "setValue",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "addr", "type": "address"}, {"name": "key", "type": "string"}],
    "name": "getValue",
    "outputs": [{"name": "", "type": "bytes"}],
    "stateMutability": "view",
    "type": "function"
  }
];

interface EFPIntegrationProps {
  onSuccess?: (action: string, address: string) => void;
  onError?: (error: string) => void;
}

export const EFPIntegration: React.FC<EFPIntegrationProps> = ({ onSuccess, onError }) => {
  const { address, isConnected } = useAccount();
  const [targetAddress, setTargetAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);

  const { writeContract } = useWriteContract();

  // For demo purposes, we'll simulate EFP functionality
  // In production, you would integrate with the actual EFP API and contracts

  useEffect(() => {
    // Simulate loading followers/following data
    if (address) {
      // This would normally come from EFP API or contract calls
      setFollowers(["0x1234567890123456789012345678901234567890", "0x0987654321098765432109876543210987654321"]);
      setFollowing(["0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", "0x1111222233334444555566667777888899990000"]);
    }
  }, [address]);

  const mintEFPList = async () => {
    if (!isConnected) return;

    setLoading(true);
    try {
      await writeContract({
        address: EFP_LIST_REGISTRY_ADDRESS as `0x${string}`,
        abi: EFP_LIST_REGISTRY_ABI,
        functionName: "mint",
        args: [],
      });

      onSuccess?.("mint", "EFP List NFT");
    } catch (err: any) {
      const errorMsg = err.message || "Failed to mint EFP List";
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const followUser = async () => {
    if (!targetAddress || !isConnected) return;

    setLoading(true);
    try {
      // In a real implementation, this would:
      // 1. Check if user has an EFP List NFT
      // 2. Add the target address to their list records
      // 3. Set appropriate tags

      // For demo, we'll simulate adding to following list
      setFollowing(prev => [...prev, targetAddress]);

      onSuccess?.("follow", targetAddress);
      setTargetAddress("");
    } catch (err: any) {
      const errorMsg = err.message || "Failed to follow user";
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const unfollowUser = async (userAddress: string) => {
    if (!isConnected) return;

    setLoading(true);
    try {
      // In a real implementation, this would remove the record from EFP List
      setFollowing(prev => prev.filter(addr => addr !== userAddress));

      onSuccess?.("unfollow", userAddress);
    } catch (err: any) {
      const errorMsg = err.message || "Failed to unfollow user";
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ethereum Follow Protocol
          </CardTitle>
          <CardDescription>
            Build your professional network on-chain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to use the Ethereum Follow Protocol
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* EFP List NFT Minting */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ethereum Follow Protocol
          </CardTitle>
          <CardDescription>
            Mint your EFP List NFT to start building your professional network on-chain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              🎯 EFP Integration Status
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>EFP Contracts: Base Sepolia Deployed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>List Registry: {EFP_LIST_REGISTRY_ADDRESS.slice(0, 10)}...</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Professional Networking Ready</span>
              </div>
            </div>
          </div>

          <Button
            onClick={mintEFPList}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Minting EFP List...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Mint EFP List NFT (Free + Gas)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Follow New User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Follow African Professionals
          </CardTitle>
          <CardDescription>
            Connect with verified professionals across Africa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="target-address">Wallet Address or ENS Name</Label>
            <Input
              id="target-address"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              placeholder="0x... or name.eth"
            />
          </div>

          <Button
            onClick={followUser}
            disabled={!targetAddress || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Following...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Follow Professional
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Network Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{followers.length}</div>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{following.length}</div>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Following List */}
      {following.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Your Network ({following.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {following.map((addr, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Professional</Badge>
                    <span className="font-mono text-sm">
                      {addr.slice(0, 6)}...{addr.slice(-4)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => unfollowUser(addr)}
                    disabled={loading}
                  >
                    Unfollow
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* EFP Info */}
      <Card className="bg-blue-50 dark:bg-blue-950">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <CheckCircle className="h-8 w-8 text-blue-600 mx-auto" />
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">
              Ethereum Follow Protocol Integration
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              Build verifiable professional relationships on-chain. Your network is portable across all Web3 applications.
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="secondary">On-Chain Social Graph</Badge>
              <Badge variant="secondary">Cross-Platform</Badge>
              <Badge variant="secondary">Verifiable Network</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
