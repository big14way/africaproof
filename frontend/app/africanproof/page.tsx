"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  Globe,
  CreditCard,
  AlertCircle,
  Loader2,
  ExternalLink,
  CheckCircle,
  Users,
  Shield,
  Copy,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { useAfricanProof } from "@/hooks/useAfricanProof";
import { SUPPORTED_COUNTRIES } from "@/lib/contracts";
import { EFPIntegration } from "@/components/EFPIntegration";
import { Navbar } from "@/components/Navbar";
import { ENSDisplay } from "@/components/ENSDisplay";


export default function AfricanProofPage() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const {
    userProfile,
    userSubdomain,
    hasValidSession,
    loading,
    isConfirming,
    isConfirmed,
    error,
    hash,
    verifyUser,
    setTextRecord,
    mintSubdomain,
    sendMicroPayment,
    sendRemittance,
    addAttestation,
    addCredential,
    refreshData,
    isVerified,
    userCountry,
    ensName,
  } = useAfricanProof();

  // Form states
  const [selectedCountry, setSelectedCountry] = useState('');
  const [verificationData, setVerificationData] = useState('');
  const [textKey, setTextKey] = useState('');
  const [textValue, setTextValue] = useState('');
  const [paymentRecipient, setPaymentRecipient] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('0.01');
  const [attestationTarget, setAttestationTarget] = useState('');
  const [attestationType, setAttestationType] = useState('');
  const [attestationDescription, setAttestationDescription] = useState('');

  // Check if on correct network
  const isCorrectNetwork = chainId === 84532; // Base Sepolia

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background dark relative overflow-hidden">
        <Navbar />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-88px)]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Wallet className="h-6 w-6" />
                Loading...
              </CardTitle>
              <CardDescription>
                Initializing AfricanProof platform...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background dark relative overflow-hidden">
        <Navbar />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-88px)]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Wallet className="h-6 w-6" />
                Wallet Required
              </CardTitle>
              <CardDescription>
                Please connect your wallet using the button in the top navigation to access the AfricanProof platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-sm text-muted-foreground">
                <p>Make sure you're on Base Sepolia testnet</p>
                <p>Chain ID: 84532</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark relative overflow-hidden">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            🌍 <span className="text-green-400">AfricanProof</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Complete Web3 Identity Ecosystem for Africa
          </p>
          <div className="flex justify-center mb-4">
            <ENSDisplay />
          </div>
        </div>

        {/* Network Check */}
        {!isCorrectNetwork && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Please switch to Base Sepolia testnet (Chain ID: 84532)</span>
              <Button onClick={() => switchChain({ chainId: 84532 })} size="sm">
                Switch Network
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Wallet Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Status
              </span>
              <div className="flex gap-2">
                <Button onClick={refreshData} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button onClick={() => disconnect()} variant="outline" size="sm">
                  Disconnect
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Address</Label>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                  <Button 
                    onClick={() => copyToClipboard(address || '')} 
                    variant="ghost" 
                    size="sm"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label>Network</Label>
                <p className="text-sm">Base Sepolia</p>
              </div>
              <div>
                <Label>Verification Status</Label>
                <div className="flex items-center gap-2">
                  {isVerified ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Verified ({userCountry})</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Not Verified</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <Label>ENS Subdomain</Label>
                <p className="text-sm font-mono">{userSubdomain || 'Not minted'}</p>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Error/Success Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isConfirmed && hash && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Transaction confirmed!</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`https://sepolia.basescan.org/tx/${hash}`, '_blank')}
              >
                View on BaseScan <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Functionality Tabs */}
        <Tabs defaultValue="platform" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="platform">🌍 Platform</TabsTrigger>
            <TabsTrigger value="payments">💰 Payments</TabsTrigger>
            <TabsTrigger value="community">🤝 Community</TabsTrigger>
          </TabsList>

          {/* Platform Tab - Identity Verification */}
          <TabsContent value="platform">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-green-400" />
                    Identity Verification
                  </CardTitle>
                  <CardDescription>
                    Verify your African identity to access all platform features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <p className="text-gray-400">
                      Complete identity verification to unlock full platform access
                    </p>
                    <Button
                      size="lg"
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => window.location.href = '/self-verify'}
                    >
                      Start Verification
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Setup</CardTitle>
                  <CardDescription>
                    Add text records to your profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="text-key">Record Key</Label>
                    <Select value={textKey} onValueChange={setTextKey}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="profile.name">Profile Name</SelectItem>
                        <SelectItem value="profile.bio">Bio</SelectItem>
                        <SelectItem value="profile.occupation">Occupation</SelectItem>
                        <SelectItem value="profile.location">Location</SelectItem>
                        <SelectItem value="contact.email">Email</SelectItem>
                        <SelectItem value="contact.phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="text-value">Record Value</Label>
                    <Input
                      id="text-value"
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      placeholder="Enter value"
                    />
                  </div>
                  
                  <Button 
                    onClick={() => setTextRecord(textKey, textValue)}
                    disabled={!textKey || !textValue || loading || !isVerified}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Setting...
                      </>
                    ) : (
                      'Set Text Record'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>



          {/* Payments Tab */}
          <TabsContent value="payments">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Cross-border Remittance
                  </CardTitle>
                  <CardDescription>
                    Send money across African borders with low fees
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="remittance-recipient">Recipient Address</Label>
                    <Input
                      id="remittance-recipient"
                      value={paymentRecipient}
                      onChange={(e) => setPaymentRecipient(e.target.value)}
                      placeholder="0x..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="remittance-country">Recipient Country</Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SUPPORTED_COUNTRIES).map(([code, info]) => (
                          <SelectItem key={code} value={code}>
                            {info.flag} {info.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="remittance-amount">Amount (ETH)</Label>
                    <Input
                      id="remittance-amount"
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.01"
                    />
                  </div>

                  <Button
                    onClick={() => sendRemittance(paymentRecipient, selectedCountry, paymentAmount)}
                    disabled={!paymentRecipient || !selectedCountry || !paymentAmount || !isVerified || loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Remittance'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community">
            <div className="space-y-6">
              {/* Ethereum Follow Protocol Integration */}
              <EFPIntegration
                onSuccess={(action, address) => {
                  console.log(`EFP ${action}:`, address);
                }}
                onError={(error) => {
                  console.error("EFP Error:", error);
                }}
              />

              {/* Traditional Attestations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Community Attestation
                    </CardTitle>
                    <CardDescription>
                      Attest for other community members
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="attestation-target">Target Address</Label>
                      <Input
                        id="attestation-target"
                        value={attestationTarget}
                        onChange={(e) => setAttestationTarget(e.target.value)}
                        placeholder="0x..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="attestation-type">Attestation Type</Label>
                      <Select value={attestationType} onValueChange={setAttestationType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="business_partner">Business Partner</SelectItem>
                          <SelectItem value="product_quality">Product Quality</SelectItem>
                          <SelectItem value="farming_expertise">Farming Expertise</SelectItem>
                          <SelectItem value="trading_reliability">Trading Reliability</SelectItem>
                          <SelectItem value="technical_skills">Technical Skills</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="attestation-description">Description</Label>
                      <Input
                        id="attestation-description"
                        value={attestationDescription}
                        onChange={(e) => setAttestationDescription(e.target.value)}
                        placeholder="Describe your attestation"
                      />
                    </div>

                    <Button
                      onClick={() => addAttestation(attestationTarget, attestationType, attestationDescription)}
                      disabled={!attestationTarget || !attestationType || !attestationDescription || !isVerified || loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Attestation'
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Verifiable Credential</CardTitle>
                    <CardDescription>
                      Add professional credentials
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="credential-type">Credential Type</Label>
                      <Select value={attestationType} onValueChange={setAttestationType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="certification">Certification</SelectItem>
                          <SelectItem value="license">Professional License</SelectItem>
                          <SelectItem value="employment">Employment</SelectItem>
                          <SelectItem value="skill">Skill Verification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="credential-hash">IPFS Hash</Label>
                      <Input
                        id="credential-hash"
                        value={`Qm${Date.now()}`}
                        onChange={(e) => setAttestationDescription(e.target.value)}
                        placeholder="QmXXXXXX..."
                      />
                    </div>

                    <Button
                      onClick={() => addCredential(attestationType, `Qm${Date.now()}`)}
                      disabled={!attestationType || !isVerified || loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Credential'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Contract Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📋 Contract Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <Label>Core Contract</Label>
                <p className="font-mono">0xBC358610EC9d2232b6837018A328b54E9D72cB26</p>
              </div>
              <div>
                <Label>Durin Integration</Label>
                <p className="font-mono">0x3F149bdcA4146bD271F2E43fb07d1D9e3eb76086</p>
              </div>
              <div>
                <Label>SIWE Auth</Label>
                <p className="font-mono">0x9d52E2f98E81E76cb1d72b032eD98135faEa1CcE</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
