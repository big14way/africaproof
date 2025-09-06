"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Globe,
  Wallet,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Shield,
  Users,
  Calendar,
  MapPin,
} from "lucide-react";

import { Example, ExampleABI } from "@/lib/const";
import { client, walletClient } from "@/lib/client";
import { useAccount } from "wagmi";
import { Navbar } from "@/components/Navbar";

export default function CommunityFundPage() {
  const [isEligible, setIsEligible] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reliefProgram, setReliefProgram] = useState<any>(null);
  const [isLoadingProgram, setIsLoadingProgram] = useState(true);
  const [txHash, setTxHash] = useState<string>("");
  const [isLoadingEligibility, setIsLoadingEligibility] = useState(false);
  const { address } = useAccount();

  // Check eligibility and claim status when address changes
  useEffect(() => {
    if (address) {
      checkUserStatus();
    }
  }, [address]);

  const checkUserStatus = async () => {
    if (!address) return;

    setIsLoadingEligibility(true);
    try {
      // Check if user is eligible
      const eligible = await checkEligibility(address);
      setIsEligible(Boolean(eligible));

      // Check if user has already claimed
      const claim = await checkClaim(address);
      // Parse claim data: [claimant, programId, amount, timestamp, claimed]
      const alreadyClaimed =
        claim && Array.isArray(claim) && claim.length >= 5 && claim[4];
      setHasClaimed(Boolean(alreadyClaimed));

      console.log("User status:", { eligible, alreadyClaimed, claim });
    } catch (error) {
      console.error("Error checking user status:", error);
    } finally {
      setIsLoadingEligibility(false);
    }
  };

  const fetchProgram = async () => {
    try {
      setIsLoadingProgram(true);
      const program = await client.readContract({
        address: Example,
        abi: ExampleABI,
        functionName: "getProgram",
        args: [1],
      });
      console.log("Program data:", program);
      setReliefProgram(program);
    } catch (error) {
      console.error("Error fetching program:", error);
    } finally {
      setIsLoadingProgram(false);
    }
  };

  const checkEligibility = async (address: `0x${string}`) => {
    const bool = await client.readContract({
      address: Example,
      abi: ExampleABI,
      functionName: "checkEligibility",
      args: [address as `0x${string}`],
    });
    return bool;
  };

  const checkClaim = async (address: `0x${string}`) => {
    const claim = await client.readContract({
      address: Example,
      abi: ExampleABI,
      functionName: "getClaim",
      args: [1, address as `0x${string}`],
    });
    return claim;
  };

  useEffect(() => {
    fetchProgram();
  }, []);

  // Parse program data from smart contract response
  const programData = reliefProgram
    ? {
        id: Number(reliefProgram[0]),
        name: reliefProgram[1],
        amount: reliefProgram[2], // BigInt amount
        maxClaims: Number(reliefProgram[3]),
        totalClaimed: Number(reliefProgram[4]),
        active: reliefProgram[5],
        startDate: Number(reliefProgram[6]),
        endDate: Number(reliefProgram[7]),
      }
    : null;

  const progressPercentage = programData
    ? (programData.totalClaimed / programData.maxClaims) * 100
    : 0;
  const remainingClaims = programData
    ? programData.maxClaims - programData.totalClaimed
    : 0;

  const handleClaim = async () => {
    if (!address) {
      console.error("No wallet address");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Starting claim transaction...");

      const tx = await walletClient?.writeContract({
        address: Example,
        abi: ExampleABI,
        functionName: "claimRelief",
        args: [1],
        account: address as `0x${string}`,
      });

      if (!tx) {
        throw new Error("Transaction failed to start");
      }

      console.log("Transaction hash:", tx);
      setTxHash(tx);

      // Wait for transaction confirmation
      console.log("Waiting for transaction confirmation...");
      const receipt = await client.waitForTransactionReceipt({
        hash: tx as `0x${string}`,
      });
      console.log("Transaction confirmed:", receipt);

      // Refresh program data to get updated claim count
      await fetchProgram();

      setHasClaimed(true);
    } catch (error) {
      console.error("Claim failed:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-3xl mx-auto p-6 lg:p-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Community Development Fund</h1>
          <p className="text-lg text-gray-400">
            Empowering verified African citizens with direct financial support
          </p>
        </div>

        {/* Eligibility Rules Section */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center">
              <Shield className="mr-2 h-5 w-5 text-green-400" />
              Community Fund Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-green-400" />
                <div>
                  <p className="font-medium text-white">
                    🌍 African Identity
                  </p>
                  <p className="text-sm text-gray-400">
                    Government-verified citizenship
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-green-400" />
                <div>
                  <p className="font-medium text-white">🔐 Unique Verification</p>
                  <p className="text-sm text-gray-400">
                    One claim per verified person
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-green-400" />
                <div>
                  <p className="font-medium text-white">🏷️ ENS Domain</p>
                  <p className="text-sm text-gray-400">
                    Country-linked identity (e.g., kwame.gha.gwill.eth)
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-green-400" />
                <div>
                  <p className="font-medium text-white">⚡ Active Program</p>
                  <p className="text-sm text-gray-400">
                    Funds available for community development
                  </p>
                </div>
              </div>
            </div>

            {/* Community Impact Info */}
            <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-green-400 text-lg">💡</div>
                <div>
                  <h4 className="text-green-300 font-medium mb-1">Community Impact</h4>
                  <p className="text-sm text-gray-300">
                    These funds support agricultural development, education initiatives,
                    and healthcare access across African communities. Each verified citizen
                    can claim once to ensure fair distribution.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Relief Program Card */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              {isLoadingProgram
                ? "Loading..."
                : programData?.name || "Program Not Found"}
            </CardTitle>
            {!isLoadingProgram && programData && (
              <div className="flex items-center justify-center space-x-4 mt-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-sky-400">
                    {Number(programData.amount) / 10 ** 18}
                  </p>
                  <p className="text-sm text-gray-400">ASANTE Tokens</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {remainingClaims}
                  </p>
                  <p className="text-sm text-gray-400">Claims Left</p>
                </div>
              </div>
            )}
          </CardHeader>
          {!isLoadingProgram && programData && (
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white">
                    {programData.totalClaimed} / {programData.maxClaims}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </CardContent>
          )}
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            {isLoadingEligibility ? (
              <div className="flex items-center space-x-3 p-4 bg-gray-900/20 border border-gray-800 rounded-lg">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-sky-400 rounded-full animate-spin" />
                <div>
                  <p className="font-semibold text-gray-200">
                    Checking Eligibility...
                  </p>
                  <p className="text-sm text-gray-400">Verifying your status</p>
                </div>
              </div>
            ) : isEligible ? (
              <div className="flex items-center space-x-3 p-4 bg-green-900/20 border border-green-800 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <div>
                  <p className="font-semibold text-green-200">
                    Eligible for Community Fund
                  </p>
                  <p className="text-sm text-green-400">
                    Address: {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-400" />
                <div>
                  <p className="font-semibold text-red-200">Not Eligible</p>
                  <p className="text-sm text-red-400">
                    {address
                      ? "Verification required"
                      : "Please connect your wallet"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            {hasClaimed ? (
              <div className="text-center space-y-4 py-8">
                <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Already Claimed!
                  </h3>
                  <p className="text-gray-400">
                    You have already received your community development funds
                  </p>
                  {txHash && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-gray-400">Transaction Hash:</p>
                      <p className="text-xs font-mono text-gray-300 break-all bg-gray-800 p-2 rounded">
                        {txHash}
                      </p>
                      <a
                        href={`https://alfajores.celoscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 hover:underline transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        View on CeloScan
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Ready to Claim
                  </h3>
                  <p className="text-gray-400">
                    One-time community development fund for verified African citizens
                  </p>
                </div>

                <Button
                  onClick={handleClaim}
                  disabled={
                    !isEligible ||
                    isLoading ||
                    isLoadingProgram ||
                    !programData ||
                    !address
                  }
                  className="w-full bg-sky-400 hover:bg-sky-500 text-white disabled:opacity-50"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Claim{" "}
                      {programData
                        ? `${Number(programData.amount) / 10 ** 18} ASANTE`
                        : "Loading..."}
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
