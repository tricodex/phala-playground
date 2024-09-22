/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { createJob, fetchXdaiPrice } from '@/utils/blockchain';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import type { Job } from '@/types';
import { createWalletClient, custom } from 'viem';

interface CreateRequestProps {
  onRequestCreated: (newJob: Job) => void;
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

// Fetch the wallet client based on the provider (MetaMask, etc.)
const getWalletClient = (provider: any) => {
  if (!provider) {
    throw new Error('Provider is undefined');
  }
  return createWalletClient({
    chain: chiadoTestnet,
    transport: custom(provider),
  });
};

export function CreateRequest({ onRequestCreated }: CreateRequestProps) {
  const [requirements, setRequirements] = useState('');
  const [escrowAmount, setEscrowAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { primaryWallet } = useDynamicContext();
  console.log('primaryWallet:', primaryWallet);

  useEffect(() => {
    if (primaryWallet && !primaryWallet.connector) {
      console.error('Wallet connected but connector is undefined');
      toast({ title: "Error", description: "Wallet connection issue. Please reconnect.", variant: "destructive" });
    }
  }, [primaryWallet, toast]);

  const handleCreateRequest = async () => {
    console.log('handleCreateRequest called');
    if (!requirements.trim() || !escrowAmount) {
      toast({ title: "Error", description: "Please enter the service requirements and escrow amount.", variant: "destructive" });
      return;
    }
    if (!primaryWallet || !primaryWallet.connector) {
      toast({ title: "Error", description: "Please connect your wallet.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const xdaiPrice = await fetchXdaiPrice(); 
      console.log('xDAI price:', xdaiPrice);
      // const MINIMUM_ESCROW_AMOUNT_USD = 0.000001; 
      const MINIMUM_ESCROW_AMOUNT_XDAI = 0.000001;
      console.log('Minimum escrow amount (xDAI):', MINIMUM_ESCROW_AMOUNT_XDAI);
      console.log('Entered escrow amount:', escrowAmount);

      if (parseFloat(escrowAmount) < MINIMUM_ESCROW_AMOUNT_XDAI) {
        toast({ 
          title: "Error", 
          description: `Minimum escrow amount is ${MINIMUM_ESCROW_AMOUNT_XDAI} xDAI`, 
          variant: "destructive" 
        });
        setIsLoading(false);
        return;
      }

      const provider = (window as any).ethereum;
      if (!provider) {
        toast({ title: "Error", description: "MetaMask not found. Please install MetaMask or open the browser extension.", variant: "destructive" });
        return;
      }

      const walletClient = getWalletClient(provider);
      const escrowAmountWei = BigInt(Math.floor(parseFloat(escrowAmount) * 1e18));

      console.log('Calling createJob with:', { requirements, escrowAmountWei });
      const txHash = await createJob(walletClient, requirements, escrowAmountWei);
      console.log('Job created:', txHash);

      onRequestCreated({
        id: txHash, 
        requirements,
        escrowAmount: escrowAmountWei,
        requester: primaryWallet.address,
        worker: '',
        isFulfilled: false,
        isApproved: false,
        status: 'open',
      });

      toast({ 
        title: "Request created", 
        description: `Your request has been created with an escrow amount of ${escrowAmount} xDAI.`,
        action: <ToastAction altText="OK">OK</ToastAction>,
      });

      setRequirements('');
      setEscrowAmount('');

    } catch (err) {
      console.error('Error creating request:', err);
      toast({ title: "Error", description: "Failed to create request. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Create Service Request</CardTitle>
        <CardDescription>Specify your requirements and set escrow amount.</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea 
          placeholder="Enter your service requirements here..." 
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          className="mb-4"
        />
        <div className="mb-4">
          <Label htmlFor="escrow-amount">Escrow Amount (xDAI)</Label>
          <Input
            id="escrow-amount"
            type="float"
            placeholder="Enter escrow amount"
            value={escrowAmount}
            onChange={(e) => setEscrowAmount(e.target.value)}
          />
        </div>
        <Button onClick={handleCreateRequest} disabled={isLoading}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Create Request'}
        </Button>
      </CardContent>
    </Card>
  );
}
