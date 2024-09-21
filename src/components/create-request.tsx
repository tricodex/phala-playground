import { useState } from 'react';
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

interface CreateRequestProps {
  onRequestCreated: (newJob: Job) => void;
}

export function CreateRequest({ onRequestCreated }: CreateRequestProps) {
  const [requirements, setRequirements] = useState('');
  const [escrowAmount, setEscrowAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { primaryWallet } = useDynamicContext();

  const handleCreateRequest = async () => {
    if (!requirements.trim() || !escrowAmount) {
      toast({ title: "Error", description: "Please enter the service requirements and escrow amount.", variant: "destructive" });
      return;
    }
    if (!primaryWallet) {
      toast({ title: "Error", description: "Please connect your wallet.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const xdaiPrice = await fetchXdaiPrice(); 
      const MINIMUM_ESCROW_AMOUNT_USD = 15; 
      const MINIMUM_ESCROW_AMOUNT_XDAI = Math.ceil(MINIMUM_ESCROW_AMOUNT_USD / xdaiPrice);

      if (parseFloat(escrowAmount) < MINIMUM_ESCROW_AMOUNT_XDAI) {
        toast({ 
          title: "Error", 
          description: `Minimum escrow amount is ${MINIMUM_ESCROW_AMOUNT_XDAI} xDAI`, 
          variant: "destructive" 
        });
        setIsLoading(false);
        return;
      }

      const escrowAmountWei = BigInt(Math.floor(parseFloat(escrowAmount) * 1e18));
      const txHash = await createJob(primaryWallet.connector, requirements, escrowAmountWei);
      console.log('Job created:', txHash);

      const response = await fetch('/api/phala-ai-agent', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'createRequest', 
          data: { 
            requirements, 
            escrowAmount // Send the original string value
          } 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create request');
      }

      const { job: newJob } = await response.json(); 
      onRequestCreated(newJob);

      toast({ 
        title: "Request created", 
        description: `Your request has been created with an escrow amount of ${escrowAmount} xDAI`,
        action: <ToastAction altText="OK" onClick={() => {}}>OK</ToastAction>,
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
            type="number"
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