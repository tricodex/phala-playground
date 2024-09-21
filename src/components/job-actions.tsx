import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Job, VerificationResult, AttestationResult } from "@/types";


interface JobActionsProps {
  selectedJob: string;
  jobStatus: string;
  onJobUpdated: (updatedJob: Job) => void;
  onVerificationResult: (result: VerificationResult) => void;
  onAttestationResult: (result: AttestationResult) => void;
}

export function JobActions({ selectedJob, jobStatus, onJobUpdated, onVerificationResult, onAttestationResult }: JobActionsProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState({
    acceptJob: false,
    submitContent: false,
    verifyContent: false,
  });
  const { toast } = useToast();

  const handleAcceptJob = async () => {
    setIsLoading(prev => ({ ...prev, acceptJob: true }));
    try {
      const response = await fetch('/api/job', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedJob, status: 'accepted' }),
      });
      if (!response.ok) throw new Error('Failed to accept job');
      const data = await response.json();
      
      onJobUpdated(data.job);
      
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
    setIsLoading(prev => ({ ...prev, submitContent: true }));
    try {
      const response = await fetch('/api/job', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedJob, status: 'submitted', content }),
      });
      if (!response.ok) throw new Error('Failed to submit content');
      const data = await response.json();
      
      onJobUpdated(data.job);
      
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
          data: { requestId: selectedJob }
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
    try {
      const response = await fetch('/api/phala-viem-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          jobCid: selectedJob, 
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
        onJobUpdated({ id: selectedJob, status: 'completed' } as Job);
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
    }
  };

  if (jobStatus === 'open') {
    return (
      <Button onClick={handleAcceptJob} disabled={isLoading.acceptJob}>
        {isLoading.acceptJob ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Accepting...</> : 'Accept Job'}
      </Button>
    );
  }

  if (jobStatus === 'accepted') {
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

  if (jobStatus === 'submitted') {
    return (
      <Button onClick={handleVerifyContent} disabled={isLoading.verifyContent}>
        {isLoading.verifyContent ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : 'Verify Content'}
      </Button>
    );
  }

  return null;
}