// src/types/index.ts


export interface Job {
  id: string;
  requirements: string;
  status: 'open' | 'accepted' | 'submitted' | 'validated' | 'completed';
  escrowAmount: bigint;
  content?: string;
  requester: string;
  worker: string;
  isFulfilled: boolean;
  isApproved: boolean;
  transactionHash?: string; // Add this line
}
  
  export interface VerificationResult {
    isValid: boolean;
    reason: string;
  }
  
  export interface AttestationResult {
    success: boolean;
    attestation?: {
      attestationId: string;
    };
    error?: string;
  }