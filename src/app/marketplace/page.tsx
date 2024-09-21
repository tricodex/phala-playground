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

interface Job {
  id: string;
  requirements: string;
  status: 'open' | 'in_progress' | 'completed';
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
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [attestationResult, setAttestationResult] = useState<AttestationResult | null>(null);
  const [isLoading, setIsLoading] = useState({
    createRequest: false,
    submitContent: false,
    verifyContent: false,
    createAttestation: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    // Fetch jobs from the temporary JSON storage
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    // In a real application, this would be an API call
    // For now, we'll use a mock JSON file
    const response = await fetch('/api/jobs');
    const data = await response.json();
    setJobs(data);
  };

  const handleCreateRequest = async () => {
    if (!requirements.trim()) {
      toast({ title: "Error", description: "Please enter the service requirements.", variant: "destructive" });
      return;
    }
    setIsLoading(prev => ({ ...prev, createRequest: true }));
    try {
      const response = await fetch('/api/phala-ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createRequest', data: { requirements } }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create request');
      
      // Add the new job to the list
      setJobs(prev => [...prev, { id: data.requestId, requirements, status: 'open' }]);
      
      toast({ 
        title: "Request created", 
        description: `Your request ID is ${data.requestId}. Keep this ID for future reference.`,
        action: <ToastAction altText="Copy ID" onClick={() => navigator.clipboard.writeText(data.requestId)}>Copy ID</ToastAction>,
      });
      setRequirements('');
    } catch (err) {
      console.error('Error creating request:', err);
      toast({ title: "Error", description: "Failed to create request. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(prev => ({ ...prev, createRequest: false }));
    }
  };

  const handleSubmitContent = async () => {
    if (!selectedJob || !content.trim()) {
      toast({ title: "Error", description: "Please select a job and enter content.", variant: "destructive" });
      return;
    }
    setIsLoading(prev => ({ ...prev, submitContent: true }));
    try {
      const response = await fetch('/api/phala-ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submitContent', data: { requestId: selectedJob, content } }),
      });
      if (!response.ok) throw new Error('Failed to submit content');
      
      // Update the job status
      setJobs(prev => prev.map(job => 
        job.id === selectedJob ? { ...job, status: 'in_progress' } : job
      ));
      
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
        body: JSON.stringify({ action: 'verifyContent', data: { requestId: selectedJob } }),
      });
      const data: VerificationResult = await response.json();
      if (!response.ok) throw new Error(data.reason || 'Failed to verify content');
      setVerificationResult(data);
      toast({ 
        title: "Content verified", 
        description: data.isValid ? "The content meets all requirements." : "The content does not meet the requirements.",
        variant: data.isValid ? "default" : "destructive",
      });
      
      if (data.isValid) {
        // If content is valid, update job status and create attestation
        setJobs(prev => prev.map(job => 
          job.id === selectedJob ? { ...job, status: 'completed' } : job
        ));
        handleCreateAttestation();
      }
    } catch (err) {
      console.error('Error verifying content:', err);
      toast({ title: "Error", description: "Failed to verify content. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(prev => ({ ...prev, verifyContent: false }));
    }
  };

//   const handleCreateAttestation = async () => {
//     if (!selectedJob) {
//       toast({ title: "Error", description: "Please select a job to create attestation.", variant: "destructive" });
//       return;
//     }
//     setIsLoading(prev => ({ ...prev, createAttestation: true }));
//     try {
//       console.log('Creating attestation for job:', selectedJob);
//       const response = await fetch('/api/phala-viem-sign', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ jobCid: selectedJob, status: 'completed' }),
//       });
  
//       console.log('Response status:', response.status);
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error('Error response:', errorData);
//         throw new Error(errorData.error || 'Failed to create attestation');
//       }
  
//       const data = await response.json();
//       console.log('Attestation creation response:', data);
  
//       setAttestationResult(data);
//       if (data.success && data.attestation) {
//         toast({ 
//           title: "Attestation created", 
//           description: `Attestation ID: ${data.attestation.attestationId}`,
//           action: <ToastAction altText="Copy ID" onClick={() => navigator.clipboard.writeText(data.attestation.attestationId)}>Copy ID</ToastAction>,
//         });
//       } else {
//         throw new Error(data.error || 'Failed to create attestation');
//       }
//     } catch (err) {
//       console.error('Error creating attestation:', err);
//       toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to create attestation. Please try again.", variant: "destructive" });
//     } finally {
//       setIsLoading(prev => ({ ...prev, createAttestation: false }));
//     }
//   };
const handleCreateAttestation = async () => {
    if (!selectedJob) {
      toast({ title: "Error", description: "Please select a job to create attestation.", variant: "destructive" });
      return;
    }
    setIsLoading(prev => ({ ...prev, createAttestation: true }));
    try {
      console.log('Creating attestation for job:', selectedJob);
      const response = await fetch('/api/phala-viem-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobCid: selectedJob, status: 'completed' }),
      });
  
      console.log('Response status:', response.status);
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to create attestation');
      }
  
      const data = await response.json();
      console.log('Attestation creation response:', data);
  
      if (data.body) {
        const parsedBody = JSON.parse(data.body);
        setAttestationResult(parsedBody);
        if (parsedBody.success && parsedBody.attestation) {
          toast({ 
            title: "Attestation created", 
            description: `Attestation ID: ${parsedBody.attestation.attestationId}`,
            action: <ToastAction altText="Copy ID" onClick={() => navigator.clipboard.writeText(parsedBody.attestation.attestationId)}>Copy ID</ToastAction>,
          });
        } else {
          throw new Error(parsedBody.error || 'Failed to create attestation');
        }
      } else {
        throw new Error('Invalid response format');
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
              <CardDescription>Specify your requirements for the service.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Enter your service requirements here..." 
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="mb-4"
              />
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
                  {jobs.filter(job => job.status !== 'completed').map(job => (
                    <SelectItem key={job.id} value={job.id}>
                      Job {job.id} - {job.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedJob && (
                <div className="mt-4">
                  <h4 className="font-semibold">Requirements:</h4>
                  <p>{jobs.find(job => job.id === selectedJob)?.requirements}</p>
                </div>
              )}
            </CardContent>
          </Card>
          {selectedJob && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Verify Content</CardTitle>
                <CardDescription>Verify the submitted content for your request.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleVerifyContent} disabled={isLoading.verifyContent}>
                  {isLoading.verifyContent ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : 'Verify Content'}
                </Button>
              </CardContent>
            </Card>
          )}
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
                      Job {job.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedJob && (
                <div className="mt-4">
                  <h4 className="font-semibold">Requirements:</h4>
                  <p>{jobs.find(job => job.id === selectedJob)?.requirements}</p>
                </div>
              )}
            </CardContent>
          </Card>
          {selectedJob && (
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
                <p className="text-sm text-muted-foreground">Attestation ID: {attestationResult.attestation.attestationId}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}