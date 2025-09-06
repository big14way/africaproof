'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useAfricanProof } from '@/hooks/useAfricanProof';
import { SUPPORTED_COUNTRIES, DEMO_USERS } from '@/lib/contracts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Wallet, Globe, Users, CreditCard } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

export default function DemoPage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
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
  const [subdomainName, setSubdomainName] = useState('');
  const [textKey, setTextKey] = useState('');
  const [textValue, setTextValue] = useState('');
  const [paymentRecipient, setPaymentRecipient] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentPurpose, setPaymentPurpose] = useState('');
  const [activeDemo, setActiveDemo] = useState<string>('');

  // Demo data
  const demoUser = DEMO_USERS.KWAME;

  const handleQuickSetup = () => {
    setSelectedCountry(demoUser.country);
    setVerificationData(`${demoUser.country}-ID-${Date.now()}`);
    setSubdomainName(demoUser.subdomain);
    setTextKey('profile.name');
    setTextValue(demoUser.name);
  };

  const handleVerifyUser = async () => {
    if (!selectedCountry || !verificationData) return;
    setActiveDemo('verification');
    await verifyUser(selectedCountry, verificationData);
    setTimeout(refreshData, 2000);
  };

  const handleMintSubdomain = async () => {
    if (!subdomainName || !userCountry) return;
    setActiveDemo('subdomain');
    await mintSubdomain(subdomainName, userCountry);
    setTimeout(refreshData, 2000);
  };

  const handleSetTextRecord = async () => {
    if (!textKey || !textValue) return;
    setActiveDemo('textrecord');
    await setTextRecord(textKey, textValue);
  };

  const handleSendPayment = async () => {
    if (!paymentRecipient || !paymentAmount || !paymentPurpose) return;
    setActiveDemo('payment');
    await sendMicroPayment(paymentRecipient, paymentAmount, paymentPurpose);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background dark relative overflow-hidden">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Wallet className="h-6 w-6" />
                  Wallet Required
                </CardTitle>
                <CardDescription>
                  Please connect your wallet using the button in the top navigation to access the demo.
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark relative overflow-hidden">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">🌍 AfricanProof Demo</h1>
          <p className="text-xl text-muted-foreground">
            Complete Web3 Identity Ecosystem for Africa
          </p>
        </div>

        {/* Wallet Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Connected
              </span>
              <Button onClick={() => disconnect()} variant="outline" size="sm">
                Disconnect
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Address</Label>
                <p className="font-mono text-sm">{address}</p>
              </div>
              <div>
                <Label>Network</Label>
                <p>Base Sepolia (84532)</p>
              </div>
              <div>
                <Label>Status</Label>
                <div className="flex items-center gap-2">
                  {isVerified ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Verified ({userCountry})</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span>Not Verified</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Setup */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Quick Demo Setup</CardTitle>
            <CardDescription>
              Click to populate forms with demo data for Kwame (Ghanaian Farmer)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleQuickSetup} className="w-full">
              Setup Demo Data
            </Button>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Display */}
        {isConfirmed && hash && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Transaction confirmed! 
              <a 
                href={`https://sepolia.basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 underline"
              >
                View on BaseScan
              </a>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Step 1: Identity Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Step 1: Identity Verification
              </CardTitle>
              <CardDescription>
                Verify your identity for an African country
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="country">Country</Label>
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
                <Label htmlFor="verification-data">Verification Data</Label>
                <Input
                  id="verification-data"
                  value={verificationData}
                  onChange={(e) => setVerificationData(e.target.value)}
                  placeholder="Government ID or verification proof"
                />
              </div>
              
              <Button 
                onClick={handleVerifyUser}
                disabled={!selectedCountry || !verificationData || loading}
                className="w-full"
              >
                {loading && activeDemo === 'verification' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Identity'
                )}
              </Button>
              
              {isVerified && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-green-800 font-medium">✅ Verified for {userCountry}</p>
                  <p className="text-green-600 text-sm">ENS Name: {ensName}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: ENS Subdomain */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Step 2: Mint ENS Subdomain
              </CardTitle>
              <CardDescription>
                Get your hierarchical ENS identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subdomain">Subdomain Name</Label>
                <Input
                  id="subdomain"
                  value={subdomainName}
                  onChange={(e) => setSubdomainName(e.target.value.toLowerCase())}
                  placeholder="Enter subdomain"
                />
                {subdomainName && userCountry && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Preview: {subdomainName}.{userCountry.toLowerCase()}.gwill.eth
                  </p>
                )}
              </div>
              
              <Button 
                onClick={handleMintSubdomain}
                disabled={!subdomainName || !isVerified || loading}
                className="w-full"
              >
                {loading && activeDemo === 'subdomain' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Minting...
                  </>
                ) : (
                  'Mint Subdomain'
                )}
              </Button>
              
              {userSubdomain && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-medium">🏷️ Your ENS Domain:</p>
                  <p className="text-blue-600 font-mono">{userSubdomain}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Text Records */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Step 3: Profile Setup
              </CardTitle>
              <CardDescription>
                Add text records to your ENS domain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="text-key">Record Key</Label>
                <Input
                  id="text-key"
                  value={textKey}
                  onChange={(e) => setTextKey(e.target.value)}
                  placeholder="e.g., profile.name"
                />
              </div>
              
              <div>
                <Label htmlFor="text-value">Record Value</Label>
                <Input
                  id="text-value"
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="e.g., Kwame Asante"
                />
              </div>
              
              <Button 
                onClick={handleSetTextRecord}
                disabled={!textKey || !textValue || !isVerified || loading}
                className="w-full"
              >
                {loading && activeDemo === 'textrecord' ? (
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

          {/* Step 4: Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Step 4: Send Payment
              </CardTitle>
              <CardDescription>
                Send micro-payments or remittances
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  value={paymentRecipient}
                  onChange={(e) => setPaymentRecipient(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              
              <div>
                <Label htmlFor="amount">Amount (ETH)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.001"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.001"
                />
              </div>
              
              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                  id="purpose"
                  value={paymentPurpose}
                  onChange={(e) => setPaymentPurpose(e.target.value)}
                  placeholder="Payment description"
                />
              </div>
              
              <Button 
                onClick={handleSendPayment}
                disabled={!paymentRecipient || !paymentAmount || !paymentPurpose || !isVerified || loading}
                className="w-full"
              >
                {loading && activeDemo === 'payment' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Payment'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Demo Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📖 Demo Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">1. Connect Wallet</h4>
                <p className="text-sm text-muted-foreground">Connect your wallet to Base Sepolia testnet</p>
              </div>
              <div>
                <h4 className="font-semibold">2. Get Testnet ETH</h4>
                <p className="text-sm text-muted-foreground">
                  Get Base Sepolia ETH from{' '}
                  <a href="https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet" target="_blank" className="underline">
                    Base Sepolia Faucet
                  </a>
                </p>
              </div>
              <div>
                <h4 className="font-semibold">3. Follow the Steps</h4>
                <p className="text-sm text-muted-foreground">Complete each step in order to see the full AfricanProof experience</p>
              </div>
              <div>
                <h4 className="font-semibold">4. View Transactions</h4>
                <p className="text-sm text-muted-foreground">
                  All transactions are viewable on{' '}
                  <a href="https://sepolia.basescan.org" target="_blank" className="underline">
                    Base Sepolia Explorer
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
