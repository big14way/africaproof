"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { useState, useEffect } from "react";
import { resolveEnsName, getDisplayName } from "@/lib/siwe";
import { SiweMessage } from "siwe";
import { ChevronDown, User, LogOut, Loader2, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const CustomConnectButton = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [ensName, setEnsName] = useState<string | null>(null);
  const [isLoadingEns, setIsLoadingEns] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [siweAuthenticated, setSiweAuthenticated] = useState(false);
  const [siweLoading, setSiweLoading] = useState(false);

  // SIWE Authentication function
  const signInWithEthereum = async () => {
    if (!address || !isConnected) return;

    setSiweLoading(true);
    try {
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: "Sign in to AfricanProof with your Ethereum account.",
        uri: window.location.origin,
        version: "1",
        chainId: 84532, // Base Sepolia
        nonce: Math.random().toString(36).substring(2, 15),
        issuedAt: new Date().toISOString(),
      });

      const messageString = message.prepareMessage();
      const signature = await signMessageAsync({ message: messageString });

      // Verify signature
      const recoveredMessage = new SiweMessage(messageString);
      const fields = await recoveredMessage.verify({ signature });

      if (fields.success) {
        setSiweAuthenticated(true);
      }
    } catch (error) {
      console.error("SIWE authentication failed:", error);
    } finally {
      setSiweLoading(false);
    }
  };

  // Resolve ENS name when wallet connects
  useEffect(() => {
    if (address && isConnected) {
      setIsLoadingEns(true);
      resolveEnsName(address)
        .then((resolved) => {
          setEnsName(resolved);
          setDisplayName(getDisplayName(address, resolved));
        })
        .catch((error) => {
          console.error("ENS resolution failed:", error);
          setEnsName(null);
          setDisplayName(getDisplayName(address, null));
        })
        .finally(() => {
          setIsLoadingEns(false);
        });
    } else {
      setEnsName(null);
      setDisplayName(null);
      setIsLoadingEns(false);
      setSiweAuthenticated(false);
    }
  }, [address, isConnected]);

  return (
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
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              // Not connected to wallet
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-colors flex items-center font-medium shadow-sm border border-gray-200"
                  >
                    Connect Wallet
                  </button>
                );
              }

              // Wrong network
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

              // Connected - show ENS name with dropdown
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm border border-gray-200"
                    >
                      {isLoadingEns ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          {displayName || account.displayName}
                          <ChevronDown size={16} />
                        </>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {ensName ? "ENS Profile" : "Wallet Profile"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {address}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* Profile Information */}
                    <div className="px-2 py-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">
                              {ensName || "No ENS Name"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {ensName
                                ? "Resolved from Sepolia/Mainnet"
                                : "No ENS name registered"}
                            </p>
                          </div>
                        </div>

                        {/* SIWE Authentication Status */}
                        <div className="flex items-center gap-2">
                          <Shield size={16} className={siweAuthenticated ? "text-green-500" : "text-gray-500"} />
                          <div>
                            <p className="text-sm font-medium">
                              {siweAuthenticated ? "SIWE Authenticated" : "Not Authenticated"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {siweAuthenticated ? "Signed in with Ethereum" : "Sign message to authenticate"}
                            </p>
                          </div>
                        </div>

                        {account.displayBalance && (
                          <div className="text-sm">
                            <span className="text-gray-500">Balance: </span>
                            <span className="font-medium">
                              {account.displayBalance}
                            </span>
                          </div>
                        )}

                        <div className="text-sm">
                          <span className="text-gray-500">Network: </span>
                          <span className="font-medium">{chain.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* SIWE Authentication Button */}
                    {!siweAuthenticated && (
                      <>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-2">
                          <Button
                            onClick={signInWithEthereum}
                            disabled={siweLoading}
                            size="sm"
                            className="w-full"
                          >
                            {siweLoading ? (
                              <>
                                <Loader2 size={14} className="mr-2 animate-spin" />
                                Signing...
                              </>
                            ) : (
                              <>
                                <Shield size={14} className="mr-2" />
                                Sign-In With Ethereum
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => disconnect()}
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                    >
                      <LogOut size={16} className="mr-2" />
                      Disconnect Wallet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};


