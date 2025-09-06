"use client";

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import Self from '@/components/Self';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Shield,
  CheckCircle,
  Users,
  FileText,
  Phone,
  Globe,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react';

export default function SelfVerifyPage() {
  const { address } = useAccount();
  const [isVerified, setIsVerified] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);

  const handleSuccess = useCallback(() => {
    setIsVerified(true);
    setVerificationData({
      method: 'self_verification',
      address,
      timestamp: Date.now(),
      trustScore: 95
    });
    console.log('✅ Self verification completed successfully!');
  }, [address]);

  const handleError = useCallback(() => {
    console.error('❌ Self verification failed');
  }, []);



  return (
    <div className="min-h-screen bg-background dark relative overflow-hidden">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            🛡️ <span className="text-green-400">Self-Verification</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Verify your African identity using blockchain-native methods
          </p>
          <div className="flex justify-center items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-green-400" />
              <span>No External Apps Required</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-green-400" />
              <span>Blockchain Native</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-green-400" />
              <span>Multiple Methods</span>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-green-400" />
                No External Dependencies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Verify your identity without relying on external apps or services. Everything happens on-chain.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-green-400" />
                Community Driven
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Get verified by trusted community members or use cryptographic proofs for instant verification.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-green-400" />
                Africa-Focused
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Designed specifically for African countries with support for local verification methods.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Completed Verifications */}
        {isVerified && verificationData && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-green-400">✅ Verification Complete!</h2>
            <Card className="border-green-400/50 bg-green-400/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-green-400" />
                    <div>
                      <h4 className="font-semibold text-green-400 text-lg">
                        Self.xyz Verification
                      </h4>
                      <p className="text-sm text-gray-400">
                        Completed {new Date(verificationData.timestamp).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-400">
                        Address: <span className="font-mono text-green-400">{verificationData.address}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500 text-white">
                      {verificationData.trustScore}% Trust
                    </Badge>
                    <Badge variant="outline" className="border-green-400 text-green-400">
                      Verified
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert className="mt-4 border-green-400/50 bg-green-400/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-400">
                <strong>Verification Complete!</strong> Your identity has been verified using Self.xyz.
                You can now access all AfricanProof features and claim your ENS domain.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main Verification Component */}
        {!isVerified && (
          <div className="max-w-4xl mx-auto">
            <Card className="self-verification">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-center">
                  <Shield className="h-6 w-6 text-green-400" />
                  Self.xyz Identity Verification
                </CardTitle>
                <CardDescription className="text-center">
                  Scan the QR code with the Self app to verify your identity and claim your AfricanProof credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Self
                  userId={address || ""}
                  userDefinedData="AfricanProof Identity Verification"
                  handleSuccess={handleSuccess}
                  handleError={handleError}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Success Message */}
        {isVerified && (
          <div className="max-w-4xl mx-auto text-center">
            <Card className="border-green-400/50 bg-green-400/5">
              <CardContent className="p-8">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-400 mb-4">
                  🎉 Verification Successful!
                </h3>
                <p className="text-gray-400 mb-6">
                  Your identity has been successfully verified using Self.xyz. You can now access all AfricanProof features.
                </p>
                <Button
                  size="lg"
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => window.location.href = '/africanproof'}
                >
                  Go to Platform
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* How It Works Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">How Self-Verification Works</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Choose Method</h3>
              <p className="text-sm text-gray-400">
                Select from multiple verification methods based on your preference and available documents.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Provide Proof</h3>
              <p className="text-sm text-gray-400">
                Submit your verification data - signatures, documents, or community attestations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">On-Chain Verification</h3>
              <p className="text-sm text-gray-400">
                Your proof is verified on-chain without relying on external services or apps.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">4</span>
              </div>
              <h3 className="font-semibold mb-2">Get Verified</h3>
              <p className="text-sm text-gray-400">
                Receive your verified status and access all AfricanProof features with your ENS domain.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="max-w-2xl mx-auto border-green-400/50">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Verified?</h3>
              <p className="text-gray-400 mb-6">
                Join thousands of verified Africans using blockchain technology for identity verification.
              </p>
              <Button 
                size="lg" 
                className="bg-green-500 hover:bg-green-600"
                onClick={() => document.querySelector('.self-verification')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start Verification
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
