"use client";

import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2, Shield } from "lucide-react";

interface SIWEAuthProps {
  onSuccess?: (message: string, signature: string) => void;
  onError?: (error: string) => void;
}

export const SIWEAuth: React.FC<SIWEAuthProps> = ({ onSuccess, onError }) => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSignature, setLastSignature] = useState<string | null>(null);

  const signInWithEthereum = async () => {
    if (!address || !isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create SIWE message
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
      
      // Sign the message
      const signature = await signMessageAsync({
        message: messageString,
      });

      // Verify the signature (in a real app, this would be done on the server)
      const recoveredMessage = new SiweMessage(messageString);
      const fields = await recoveredMessage.verify({ signature });

      if (fields.success) {
        setAuthenticated(true);
        setLastSignature(signature);
        onSuccess?.(messageString, signature);
      } else {
        throw new Error("Signature verification failed");
      }
    } catch (err: any) {
      const errorMsg = err.message || "Failed to sign in with Ethereum";
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setAuthenticated(false);
    setLastSignature(null);
    setError(null);
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sign-In With Ethereum
          </CardTitle>
          <CardDescription>
            Connect your wallet to sign in with Ethereum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet first to use Sign-In With Ethereum
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Sign-In With Ethereum (SIWE)
        </CardTitle>
        <CardDescription>
          Authenticate using your Ethereum wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {authenticated ? (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ Successfully authenticated with Ethereum!
              </AlertDescription>
            </Alert>
            
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Authenticated Address:
              </p>
              <p className="text-sm font-mono text-green-600 dark:text-green-300">
                {address}
              </p>
            </div>

            {lastSignature && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Signature:
                </p>
                <p className="text-xs font-mono text-blue-600 dark:text-blue-300 break-all">
                  {lastSignature.slice(0, 50)}...
                </p>
              </div>
            )}

            <Button onClick={signOut} variant="outline" className="w-full">
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click below to sign a message with your wallet to authenticate.
                This proves you own the wallet address without revealing your private key.
              </p>
            </div>

            <Button 
              onClick={signInWithEthereum} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Sign-In With Ethereum
                </>
              )}
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>🔒 This uses the SIWE (Sign-In With Ethereum) standard</p>
          <p>🌐 Network: Base Sepolia (Chain ID: 84532)</p>
          <p>🛡️ Your private key never leaves your wallet</p>
        </div>
      </CardContent>
    </Card>
  );
};
