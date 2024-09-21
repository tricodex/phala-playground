import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Job } from "@/types";

interface CreateRequestProps {
  onRequestCreated: (newJob: Job) => void;
}

export function CreateRequest({ onRequestCreated }: CreateRequestProps) {
  const [requirements, setRequirements] = useState('');
  const [escrowAmount, setEscrowAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateRequest = async () => {
    if (!requirements.trim() || !escrowAmount) {
      toast({ title: "Error", description: "Please enter the service requirements and escrow amount.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements, escrowAmount: parseFloat(escrowAmount) }),
      });
      if (!response.ok) throw new Error('Failed to create request');
      const data = await response.json();
      
      onRequestCreated(data.job);
      
      toast({ 
        title: "Request created", 
        description: `Your request ID is ${data.job.id}. Escrow amount: ${escrowAmount} ETH`,
        action: <ToastAction altText="Copy ID" onClick={() => navigator.clipboard.writeText(data.job.id)}>Copy ID</ToastAction>,
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
          <Label htmlFor="escrow-amount">Escrow Amount (ETH)</Label>
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