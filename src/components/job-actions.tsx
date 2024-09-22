/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Job, VerificationResult, AttestationResult } from "@/types";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { submitWork, approveWork } from '@/utils/blockchain';
import { createWalletClient, custom } from 'viem';

interface JobActionsProps {
  selectedJob: Job;
  onJobUpdated: (updatedJob: Job) => void;
  onVerificationResult: (result: VerificationResult) => void;
  onAttestationResult: (result: AttestationResult) => void;
}

interface Chain {
  id: number;
  name: string;
  network: string;
  rpcUrls: {
    default: {
      http: string[];
    };
  };
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

const chiadoTestnet: Chain = {
  id: 10200,
  name: 'Chiado Testnet',
  network: 'chiado',
  rpcUrls: {
    default: { http: ['https://rpc.chiadochain.net'] },
  },
  nativeCurrency: {
    name: 'Gnosis',
    symbol: 'xDAI',
    decimals: 18,
  },
};

const getWalletClient = (provider: any) => {
  if (!provider) {
    throw new Error('Provider is undefined');
  }
  return createWalletClient({
    chain: chiadoTestnet,
    transport: custom(provider),
  });
};

export function JobActions({ selectedJob, onJobUpdated, onVerificationResult, onAttestationResult }: JobActionsProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState({
    acceptJob: false,
    submitContent: false,
    verifyContent: false,
    createAttestation: false,
  });
  const { toast } = useToast();
  const { primaryWallet } = useDynamicContext();

  useEffect(() => {
    if (!primaryWallet) {
      console.error("No wallet connected");
    } else {
      console.log("Wallet connected:", primaryWallet);
    }
  }, [primaryWallet]);

  const handleAcceptJob = async () => {
    setIsLoading(prev => ({ ...prev, acceptJob: true }));
    try {
      onJobUpdated({ ...selectedJob, status: 'accepted', worker: primaryWallet?.address || '' });
      toast({ title: "Success", description: "You have successfully accepted the job." });
    } catch (err) {
      console.error('Error accepting job:', err);
      toast({ title: "Error", description: "Failed to accept job. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(prev => ({ ...prev, acceptJob: false }));
    }
  };

  const handleSubmitContent = async () => {
    if (!content.trim()) {
      toast({ title: "Error", description: "Please enter content.", variant: "destructive" });
      return;
    }
    if (!primaryWallet) {
      toast({ title: "Error", description: "Please connect your wallet.", variant: "destructive" });
      return;
    }
    setIsLoading(prev => ({ ...prev, submitContent: true }));
    try {
      const provider = (window as any).ethereum;
      if (!provider) {
        throw new Error('Ethereum provider (MetaMask) not found');
      }
      const walletClient = getWalletClient(provider);
      const txHash = await submitWork(walletClient, selectedJob.id, content);
      console.log('Work submitted:', txHash);
      onJobUpdated({ ...selectedJob, status: 'submitted', content, isFulfilled: true });
      toast({ title: "Success", description: "Your content has been successfully submitted." });
      setContent('');
    } catch (err) {
      console.error('Error submitting content:', err);
      toast({ title: "Error", description: "Failed to submit content. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(prev => ({ ...prev, submitContent: false }));
    }
  };

  const handleVerifyContent = async () => {
    setIsLoading(prev => ({ ...prev, verifyContent: true }));
    try {
      const response = await fetch('/api/phala-ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verifyContent',
          data: { requestId: selectedJob.id }
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify content');
      }
      const data: VerificationResult = await response.json();
      onVerificationResult(data);

      if (data.isValid) {
        await handleCreateAttestation();
      }

      toast({ 
        title: "Content verified", 
        description: data.isValid ? "The content meets all requirements." : "The content does not meet the requirements.",
        variant: data.isValid ? "default" : "destructive",
      });
    } catch (err) {
      console.error('Error verifying content:', err);
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to verify content. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(prev => ({ ...prev, verifyContent: false }));
    }
  };

  const handleCreateAttestation = async () => {
    setIsLoading(prev => ({ ...prev, createAttestation: true }));
    try {
      const response = await fetch('/api/phala-viem-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          jobCid: selectedJob.id, 
          status: 'completed' 
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create attestation');
      }
  
      const data = await response.json();
      onAttestationResult(data);
      if (data.success && data.attestation) {
        await handleApproveWork();
        toast({ 
          title: "Attestation created", 
          description: `Attestation ID: ${data.attestation.attestationId}. Funds released to provider.`,
        });
      } else {
        throw new Error(data.error || 'Failed to create attestation');
      }
    } catch (err) {
      console.error('Error creating attestation:', err);
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to create attestation. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(prev => ({ ...prev, createAttestation: false }));
    }
  };

  const handleApproveWork = async () => {
    if (!primaryWallet) {
      toast({ title: "Error", description: "Please connect your wallet.", variant: "destructive" });
      return;
    }
    try {
      const provider = (window as any).ethereum;
      if (!provider) {
        throw new Error('Ethereum provider (MetaMask) not found');
      }
      const walletClient = getWalletClient(provider);
      const txHash = await approveWork(walletClient, selectedJob.id);
      console.log('Work approved:', txHash);
      onJobUpdated({ ...selectedJob, status: 'completed', isApproved: true });
    } catch (err) {
      console.error('Error approving work:', err);
      toast({ title: "Error", description: "Failed to approve work. Please try again.", variant: "destructive" });
    }
  };

  if (selectedJob.status === 'open') {
    return (
      <Button onClick={handleAcceptJob} disabled={isLoading.acceptJob}>
        {isLoading.acceptJob ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Accepting...</> : 'Accept Job'}
      </Button>
    );
  }

  if (selectedJob.status === 'accepted') {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Submit Service Content</CardTitle>
          <CardDescription>Provide the content for the requested service.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Enter your service content here..." 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleSubmitContent} disabled={isLoading.submitContent}>
            {isLoading.submitContent ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Content'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (selectedJob.status === 'submitted') {
    return (
      <Button onClick={handleVerifyContent} disabled={isLoading.verifyContent || isLoading.createAttestation}>
        {isLoading.verifyContent ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : 
         isLoading.createAttestation ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Attestation...</> : 
         'Verify Content'}
      </Button>
    );
  }

  return null;
}