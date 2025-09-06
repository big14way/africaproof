"use client";

import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSignMessage } from 'wagmi';
import { parseEther, keccak256, toBytes } from 'viem';

// Mock contract address - replace with actual deployed address
const SELF_VERIFICATION_CONTRACT = '0x1234567890123456789012345678901234567890' as const;

// Mock ABI - replace with actual contract ABI
const SELF_VERIFICATION_ABI = [
  {
    name: 'selfVerifyWithSIWE',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'country', type: 'string' },
      { name: 'message', type: 'string' },
      { name: 'signature', type: 'bytes' },
      { name: 'socialProofHash', type: 'bytes32' }
    ],
    outputs: []
  },
  {
    name: 'selfVerifyWithDocument',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'country', type: 'string' },
      { name: 'documentHash', type: 'bytes32' },
      { name: 'documentType', type: 'string' }
    ],
    outputs: []
  },
  {
    name: 'requestCommunityAttestation',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'country', type: 'string' }
    ],
    outputs: []
  },
  {
    name: 'addCommunityAttestation',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'attestationType', type: 'string' },
      { name: 'data', type: 'string' }
    ],
    outputs: []
  },
  {
    name: 'getUserProfile',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'isVerified', type: 'bool' },
      { name: 'country', type: 'string' },
      { name: 'ensName', type: 'string' },
      { name: 'verificationTimestamp', type: 'uint256' },
      { name: 'trustScore', type: 'uint256' },
      { name: 'primaryMethod', type: 'uint8' },
      { name: 'isActive', type: 'bool' }
    ]
  }
] as const;

export interface VerificationData {
  method: string;
  country: string;
  trustScore?: number;
  timestamp?: number;
  additionalData?: any;
}

export interface UserProfile {
  isVerified: boolean;
  country: string;
  ensName: string;
  verificationTimestamp: number;
  trustScore: number;
  primaryMethod: number;
  isActive: boolean;
}

export function useSelfVerification() {
  const { address } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const { signMessage, isPending: isSigningPending } = useSignMessage();
  
  const [loading, setLoading] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // SIWE + Social Proof Verification
  const verifyWithSIWE = useCallback(async (
    country: string,
    socialProofs: Array<{ platform: string; url: string }> = []
  ) => {
    if (!address) throw new Error('Wallet not connected');
    
    setLoading(true);
    setVerificationError(null);
    
    try {
      // Create verification message
      const message = `I am verifying my identity for AfricanProof from ${country}.\n\nAddress: ${address}\nTimestamp: ${Date.now()}\nCountry: ${country}\nProject: AfricanProof by gwill.eth`;
      
      // Sign the message
      const signature = await signMessage({ message });
      
      // Create social proof hash
      const socialProofData = JSON.stringify(socialProofs);
      const socialProofHash = keccak256(toBytes(socialProofData));
      
      // Submit to contract
      writeContract({
        address: SELF_VERIFICATION_CONTRACT,
        abi: SELF_VERIFICATION_ABI,
        functionName: 'selfVerifyWithSIWE',
        args: [country, message, signature as `0x${string}`, socialProofHash],
      });
      
      return { success: true, hash, message, signature };
    } catch (err: any) {
      const errorMsg = err.message || 'SIWE verification failed';
      setVerificationError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [address, signMessage, writeContract, hash]);

  // Document Upload Verification
  const verifyWithDocument = useCallback(async (
    country: string,
    documentFile: File,
    documentType: string
  ) => {
    if (!address) throw new Error('Wallet not connected');
    
    setLoading(true);
    setVerificationError(null);
    
    try {
      // In a real implementation, upload to IPFS
      const documentHash = keccak256(toBytes(`mock-document-${documentFile.name}-${Date.now()}`));
      
      writeContract({
        address: SELF_VERIFICATION_CONTRACT,
        abi: SELF_VERIFICATION_ABI,
        functionName: 'selfVerifyWithDocument',
        args: [country, documentHash, documentType],
      });
      
      return { success: true, hash, documentHash };
    } catch (err: any) {
      const errorMsg = err.message || 'Document verification failed';
      setVerificationError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [address, writeContract, hash]);

  // Community Attestation Request
  const requestCommunityAttestation = useCallback(async (country: string) => {
    if (!address) throw new Error('Wallet not connected');
    
    setLoading(true);
    setVerificationError(null);
    
    try {
      writeContract({
        address: SELF_VERIFICATION_CONTRACT,
        abi: SELF_VERIFICATION_ABI,
        functionName: 'requestCommunityAttestation',
        args: [country],
      });
      
      return { success: true, hash };
    } catch (err: any) {
      const errorMsg = err.message || 'Community attestation request failed';
      setVerificationError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [address, writeContract, hash]);

  // Add Community Attestation (for trusted attestors)
  const addCommunityAttestation = useCallback(async (
    userAddress: string,
    attestationType: string,
    attestationData: string
  ) => {
    if (!address) throw new Error('Wallet not connected');
    
    setLoading(true);
    setVerificationError(null);
    
    try {
      writeContract({
        address: SELF_VERIFICATION_CONTRACT,
        abi: SELF_VERIFICATION_ABI,
        functionName: 'addCommunityAttestation',
        args: [userAddress as `0x${string}`, attestationType, attestationData],
      });
      
      return { success: true, hash };
    } catch (err: any) {
      const errorMsg = err.message || 'Adding community attestation failed';
      setVerificationError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [address, writeContract, hash]);

  // Phone + Location Verification (simplified)
  const verifyWithPhoneLocation = useCallback(async (
    country: string,
    phoneNumber: string,
    locationData: { lat: number; lng: number; accuracy: number }
  ) => {
    if (!address) throw new Error('Wallet not connected');
    
    setLoading(true);
    setVerificationError(null);
    
    try {
      // In a real implementation, this would involve:
      // 1. SMS verification
      // 2. Location verification
      // 3. Cross-referencing with country boundaries
      
      // For now, simulate the verification
      const verificationData = {
        method: 'phone_location',
        country,
        phoneNumber: phoneNumber.replace(/\d(?=\d{4})/g, '*'), // Mask phone number
        location: locationData,
        timestamp: Date.now()
      };
      
      // Mock hash for demonstration
      const dataHash = keccak256(toBytes(JSON.stringify(verificationData)));
      
      // In real implementation, call contract method
      console.log('Phone + Location verification data:', verificationData);
      
      return { success: true, verificationData, dataHash };
    } catch (err: any) {
      const errorMsg = err.message || 'Phone + Location verification failed';
      setVerificationError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Multi-Factor Verification (combines multiple methods)
  const verifyWithMultiFactor = useCallback(async (
    country: string,
    methods: Array<{
      type: 'siwe' | 'document' | 'phone' | 'social';
      data: any;
    }>
  ) => {
    if (!address) throw new Error('Wallet not connected');
    
    setLoading(true);
    setVerificationError(null);
    
    try {
      const results = [];
      
      for (const method of methods) {
        switch (method.type) {
          case 'siwe':
            const siweResult = await verifyWithSIWE(country, method.data.socialProofs);
            results.push({ type: 'siwe', result: siweResult });
            break;
          case 'document':
            const docResult = await verifyWithDocument(country, method.data.file, method.data.type);
            results.push({ type: 'document', result: docResult });
            break;
          case 'phone':
            const phoneResult = await verifyWithPhoneLocation(country, method.data.phone, method.data.location);
            results.push({ type: 'phone', result: phoneResult });
            break;
          default:
            console.warn(`Unknown verification method: ${method.type}`);
        }
      }
      
      const successfulMethods = results.filter(r => r.result.success);
      const trustScore = Math.min(95, 60 + (successfulMethods.length * 15)); // Base 60% + 15% per method
      
      return { 
        success: successfulMethods.length > 0, 
        results, 
        trustScore,
        methodsUsed: successfulMethods.length 
      };
    } catch (err: any) {
      const errorMsg = err.message || 'Multi-factor verification failed';
      setVerificationError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [address, verifyWithSIWE, verifyWithDocument, verifyWithPhoneLocation]);

  // Get user profile
  const getUserProfile = useCallback(async (userAddress?: string) => {
    const targetAddress = userAddress || address;
    if (!targetAddress) return null;
    
    try {
      // In a real implementation, this would call the contract
      // For now, return mock data
      const mockProfile: UserProfile = {
        isVerified: false,
        country: '',
        ensName: 'gwill.eth',
        verificationTimestamp: 0,
        trustScore: 0,
        primaryMethod: 0,
        isActive: false
      };
      
      setUserProfile(mockProfile);
      return mockProfile;
    } catch (err: any) {
      console.error('Failed to get user profile:', err);
      return null;
    }
  }, [address]);

  // Refresh user data
  const refreshData = useCallback(async () => {
    if (address) {
      await getUserProfile(address);
    }
  }, [address, getUserProfile]);

  return {
    // Verification methods
    verifyWithSIWE,
    verifyWithDocument,
    requestCommunityAttestation,
    addCommunityAttestation,
    verifyWithPhoneLocation,
    verifyWithMultiFactor,
    
    // Data fetching
    getUserProfile,
    refreshData,
    
    // State
    loading: loading || isPending || isConfirming || isSigningPending,
    error: verificationError || error?.message,
    hash,
    isConfirmed,
    userProfile,
    
    // Computed values
    isVerified: userProfile?.isVerified || false,
    trustScore: userProfile?.trustScore || 0,
    verificationMethod: userProfile?.primaryMethod || 0,
    userCountry: userProfile?.country || '',
    ensName: userProfile?.ensName || 'gwill.eth'
  };
}
