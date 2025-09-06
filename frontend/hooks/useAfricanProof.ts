import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACTS, AFRICAN_PROOF_ABI, DURIN_INTEGRATION_ABI, SIWE_AUTH_ABI } from '@/lib/contracts';
import { useState } from 'react';

export const useAfricanProof = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read user profile
  const { data: userProfile, refetch: refetchProfile } = useReadContract({
    address: CONTRACTS.AFRICAN_PROOF,
    abi: AFRICAN_PROOF_ABI,
    functionName: 'userProfiles',
    args: address ? [address] : undefined,
  });

  // Read user subdomain
  const { data: userSubdomain, refetch: refetchSubdomain } = useReadContract({
    address: CONTRACTS.DURIN_INTEGRATION,
    abi: DURIN_INTEGRATION_ABI,
    functionName: 'getUserSubdomain',
    args: address ? [address] : undefined,
  });

  // Read SIWE session
  const { data: hasValidSession, refetch: refetchSession } = useReadContract({
    address: CONTRACTS.SIWE_AUTH,
    abi: SIWE_AUTH_ABI,
    functionName: 'hasValidSession',
    args: address ? [address] : undefined,
  });

  // Verify user identity
  const verifyUser = async (country: string, verificationData: string) => {
    if (!address) throw new Error('Wallet not connected');
    
    setLoading(true);
    setError(null);
    
    try {
      writeContract({
        address: CONTRACTS.AFRICAN_PROOF,
        abi: AFRICAN_PROOF_ABI,
        functionName: 'verifyUser',
        args: [address, country, verificationData],
      });
      
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.message || 'Verification failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Set text record
  const setTextRecord = async (key: string, value: string) => {
    if (!address) throw new Error('Wallet not connected');
    
    setLoading(true);
    setError(null);
    
    try {
      writeContract({
        address: CONTRACTS.AFRICAN_PROOF,
        abi: AFRICAN_PROOF_ABI,
        functionName: 'setTextRecord',
        args: [key, value],
      });
      
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to set text record';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Mint ENS subdomain
  const mintSubdomain = async (subdomain: string, country: string) => {
    if (!address) throw new Error('Wallet not connected');
    
    setLoading(true);
    setError(null);
    
    try {
      writeContract({
        address: CONTRACTS.DURIN_INTEGRATION,
        abi: DURIN_INTEGRATION_ABI,
        functionName: 'mintUserSubdomain',
        args: [address, subdomain, country],
      });
      
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to mint subdomain';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Send micro payment
  const sendMicroPayment = async (recipient: string, amount: string, purpose: string) => {
    if (!address) throw new Error('Wallet not connected');
    
    setLoading(true);
    setError(null);
    
    try {
      writeContract({
        address: CONTRACTS.AFRICAN_PROOF,
        abi: AFRICAN_PROOF_ABI,
        functionName: 'sendMicroPayment',
        args: [recipient, purpose],
        value: parseEther(amount),
      });
      
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.message || 'Payment failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Send remittance
  const sendRemittance = async (recipient: string, country: string, amount: string) => {
    if (!address) throw new Error('Wallet not connected');
    
    setLoading(true);
    setError(null);
    
    try {
      writeContract({
        address: CONTRACTS.AFRICAN_PROOF,
        abi: AFRICAN_PROOF_ABI,
        functionName: 'sendRemittance',
        args: [recipient, country],
        value: parseEther(amount),
      });
      
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.message || 'Remittance failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Add community attestation
  const addAttestation = async (target: string, attestationType: string, description: string) => {
    if (!address) throw new Error('Wallet not connected');
    
    setLoading(true);
    setError(null);
    
    try {
      writeContract({
        address: CONTRACTS.AFRICAN_PROOF,
        abi: AFRICAN_PROOF_ABI,
        functionName: 'addCommunityAttestation',
        args: [target, attestationType, description],
      });
      
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to add attestation';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Add verifiable credential
  const addCredential = async (credentialType: string, ipfsHash: string) => {
    if (!address) throw new Error('Wallet not connected');
    
    setLoading(true);
    setError(null);
    
    try {
      writeContract({
        address: CONTRACTS.AFRICAN_PROOF,
        abi: AFRICAN_PROOF_ABI,
        functionName: 'addVerifiableCredential',
        args: [credentialType, ipfsHash],
      });
      
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to add credential';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Refresh all data
  const refreshData = () => {
    refetchProfile();
    refetchSubdomain();
    refetchSession();
  };

  return {
    // Data
    address,
    userProfile: userProfile as any,
    userSubdomain: userSubdomain as string,
    hasValidSession: hasValidSession as boolean,
    
    // State
    loading: loading || isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
    
    // Actions
    verifyUser,
    setTextRecord,
    mintSubdomain,
    sendMicroPayment,
    sendRemittance,
    addAttestation,
    addCredential,
    refreshData,
    
    // Helpers
    isVerified: userProfile ? (userProfile as any)[0] : false,
    userCountry: userProfile ? (userProfile as any)[1] : '',
    ensName: userProfile ? (userProfile as any)[2] : '',
  };
};
