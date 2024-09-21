// src/app/marketplace/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Job {
  id: string;
  requirements: string;
  status: 'open' | 'accepted' | 'submitted' | 'validated' | 'completed';
  escrowAmount: number;
  content?: string;
}

interface VerificationResult {
  isValid: boolean;
  reason: string;
}

interface AttestationResult {
  success: boolean;
  attestation?: {
    attestationId: string;
  };
  error?: string;
}

export default function ServiceMarketplace() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [requirements, setRequirements] = useState('');
  const [content, setContent] = useState('');
  const [escrowAmount, setEscrowAmount] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [attestationResult, setAttestationResult] = useState<AttestationResult | null>(null);
  const [isLoading, setIsLoading] = useState({
    createRequest: false,
    acceptJob: false,
    submitContent: false,
    verifyContent: false,
    createAttestation: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/job');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({ title: "Error", description: "Failed to fetch jobs. Please try again.", variant: "destructive" });
    }
  };

  const handleCreateRequest = async () => {
    if (!requirements.trim() || !escrowAmount) {
      toast({ title: "Error", description: "Please enter the service requirements and escrow amount.", variant: "destructive" });
      return;
    }
    setIsLoading(prev => ({ ...prev, createRequest: true }));
    try {
      const response = await fetch('/api/job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements, escrowAmount: parseFloat(escrowAmount) }),
      });
      if (!response.ok) throw new Error('Failed to create request');
      const data = await response.json();
      
      setJobs(prev => [...prev, data.job]);
      
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
      setIsLoading(prev => ({ ...prev, createRequest: false }));
    }
  };

  const handleAcceptJob = async () => {
    if (!selectedJob) {
      toast({ title: "Error", description: "Please select a job to accept.", variant: "destructive" });
      return;
    }
    setIsLoading(prev => ({ ...prev, acceptJob: true }));
    try {
      const response = await fetch('/api/job', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedJob, status: 'accepted' }),
      });
      if (!response.ok) throw new Error('Failed to accept job');
      const data = await response.json();
      
      setJobs(prev => prev.map(job => job.id === selectedJob ? data.job : job));
      
      toast({ title: "Success", description: "You have successfully accepted the job." });
    } catch (err) {
      console.error('Error accepting job:', err);
      toast({ title: "Error", description: "Failed to accept job. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(prev => ({ ...prev, acceptJob: false }));
    }
  };

  const handleSubmitContent = async () => {
    if (!selectedJob || !content.trim()) {
      toast({ title: "Error", description: "Please select a job and enter content.", variant: "destructive" });
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
      
      setJobs(prev => prev.map(job => job.id === selectedJob ? data.job : job));
      
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
    if (!selectedJob) {
      toast({ title: "Error", description: "Please select a job to verify.", variant: "destructive" });
      return;
    }
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
      setVerificationResult(data);
      
      // Update the local job status
      setJobs(prev => prev.map(job => 
        job.id === selectedJob ? { ...job, status: data.isValid ? 'validated' : 'submitted' } : job
      ));
      
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
    if (!selectedJob) {
      toast({ title: "Error", description: "Please select a job to create attestation.", variant: "destructive" });
      return;
    }
    setIsLoading(prev => ({ ...prev, createAttestation: true }));
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
      setAttestationResult(data);
      if (data.success && data.attestation) {
        setJobs(prev => prev.map(job => 
          job.id === selectedJob ? { ...job, status: 'completed' } : job
        ));
        toast({ 
          title: "Attestation created", 
          description: `Attestation ID: ${data.attestation.attestationId}. Funds released to provider.`,
          action: <ToastAction altText="Copy ID" onClick={() => navigator.clipboard.writeText(data.attestation.attestationId)}>Copy ID</ToastAction>,
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


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Decentralized Service Marketplace</h1>
      <Tabs defaultValue="requester">
        <TabsList className="mb-4">
          <TabsTrigger value="requester">Service Requester</TabsTrigger>
          <TabsTrigger value="provider">Service Provider</TabsTrigger>
        </TabsList>
        <TabsContent value="requester">
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
              <Button onClick={handleCreateRequest} disabled={isLoading.createRequest}>
                {isLoading.createRequest ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Create Request'}
              </Button>
            </CardContent>
          </Card>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Your Requests</CardTitle>
              <CardDescription>View and manage your service requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={setSelectedJob} value={selectedJob}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map(job => (
                    <SelectItem key={job.id} value={job.id}>
                      Job {job.id} - <Badge variant={job.status === 'completed' ? 'default' : 'outline'}>{job.status}</Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedJob && (
                <div className="mt-4">
                  <h4 className="font-semibold">Requirements:</h4>
                  <p>{jobs.find(job => job.id === selectedJob)?.requirements}</p>
                  <h4 className="font-semibold mt-2">Escrow Amount:</h4>
                  <p>{jobs.find(job => job.id === selectedJob)?.escrowAmount} ETH</p>
                  {jobs.find(job => job.id === selectedJob)?.status === 'submitted' && (
                    <Button onClick={handleVerifyContent} disabled={isLoading.verifyContent} className="mt-2">
                      {isLoading.verifyContent ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : 'Verify Content'}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          {verificationResult && (
            <Card>
              <CardHeader>
                <CardTitle>Verification Result</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={verificationResult.isValid ? "text-green-600" : "text-red-600"}>
                  Valid: {verificationResult.isValid ? 'Yes' : 'No'}
                </p>
                <p className="mt-2">Reason: {verificationResult.reason}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="provider">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Available Jobs</CardTitle>
              <CardDescription>Select a job to work on.</CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={setSelectedJob} value={selectedJob}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.filter(job => job.status === 'open').map(job => (
                    <SelectItem key={job.id} value={job.id}>
                      Job {job.id} - {job.escrowAmount} ETH
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedJob && (
                <div className="mt-4">
                  <h4 className="font-semibold">Requirements:</h4>
                  <p>{jobs.find(job => job.id === selectedJob)?.requirements}</p>
                  <h4 className="font-semibold mt-2">Escrow Amount:</h4>
                  <p>{jobs.find(job => job.id === selectedJob)?.escrowAmount} ETH</p>
                  <Button onClick={handleAcceptJob} disabled={isLoading.acceptJob} className="mt-2">
                    {isLoading.acceptJob ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Accepting...</> : 'Accept Job'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          {selectedJob && jobs.find(job => job.id === selectedJob)?.status === 'accepted' && (
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
          )}
          {attestationResult && attestationResult.success && attestationResult.attestation && (
            <Card>
              <CardHeader>
                <CardTitle>Attestation Created</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-600 font-semibold">Job Completed Successfully!</p>
                <p className="text-sm text-muted-foreground mt-2">Attestation ID: {attestationResult.attestation.attestationId}</p>
                <p className="text-sm text-muted-foreground">Funds have been released from escrow.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}