// src/types/index.ts

export interface Job {
    id: string;
    requirements: string;
    status: 'open' | 'accepted' | 'submitted' | 'validated' | 'completed';
    escrowAmount: number;
    content?: string;
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