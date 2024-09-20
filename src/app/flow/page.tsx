'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

interface VerificationResult {
  isValid: boolean;
  reason: string;
}

interface AttestationResult {
  attestation: {
    attestationId: string;
  };
}

export default function Home() {
  const [requestId, setRequestId] = useState('');
  const [requirements, setRequirements] = useState('');
  const [content, setContent] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [attestationResult, setAttestationResult] = useState<AttestationResult | null>(null);
  const { toast } = useToast();

  const handleCreateRequest = async () => {
    try {
      toast({ title: "Creating request...", description: "Please wait while we process your request." });
      const response = await fetch('/api/phala-ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createRequest', data: { requirements } }),
      });
      const data = await response.json();
      setRequestId(data.requestId);
      toast({ 
        title: "Request created", 
        description: `Your request ID is ${data.requestId}`,
        action: <ToastAction altText="Copy ID">Copy ID</ToastAction>,
      });
    } catch (err) {
      console.error('Error creating request:', err);
      toast({ title: "Error", description: "Failed to create request. Please try again.", variant: "destructive" });
    }
  };

  const handleSubmitContent = async () => {
    try {
      toast({ title: "Submitting content...", description: "Please wait while we submit your content." });
      await fetch('/api/phala-ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submitContent', data: { requestId, content } }),
      });
      toast({ title: "Content submitted", description: "Your content has been successfully submitted." });
    } catch (err) {
      console.error('Error submitting content:', err);
      toast({ title: "Error", description: "Failed to submit content. Please try again.", variant: "destructive" });
    }
  };

  const handleVerifyContent = async () => {
    try {
      toast({ title: "Verifying content...", description: "Please wait while we verify the submitted content." });
      const response = await fetch('/api/phala-ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verifyContent', data: { requestId } }),
      });
      const data: VerificationResult = await response.json();
      setVerificationResult(data);
      toast({ 
        title: "Content verified", 
        description: data.isValid ? "The content is valid." : "The content is invalid.",
        variant: data.isValid ? "default" : "destructive",
      });
    } catch (err) {
      console.error('Error verifying content:', err);
      toast({ title: "Error", description: "Failed to verify content. Please try again.", variant: "destructive" });
    }
  };

  const handleCreateAttestation = async () => {
    try {
      toast({ title: "Creating attestation...", description: "Please wait while we create the attestation." });
      const response = await fetch('/api/phala-viem-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schemaId: '0x1', jobCid: requestId, status: 'completed' }),
      });
      const data: AttestationResult = await response.json();
      setAttestationResult(data);
      toast({ 
        title: "Attestation created", 
        description: `Attestation ID: ${data.attestation.attestationId}`,
        action: <ToastAction altText="Copy ID">Copy ID</ToastAction>,
      });
    } catch (err) {
      console.error('Error creating attestation:', err);
      toast({ title: "Error", description: "Failed to create attestation. Please try again.", variant: "destructive" });
    }
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Decentralized Service Marketplace</h1>
      <Tabs defaultValue="requester">
        <TabsList>
          <TabsTrigger value="requester">Service Requester</TabsTrigger>
          <TabsTrigger value="provider">Service Provider</TabsTrigger>
        </TabsList>
        <TabsContent value="requester">
          <Card>
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
              <Button onClick={handleCreateRequest}>Create Request</Button>
            </CardContent>
            <CardFooter>
              {requestId && <p>Request ID: {requestId}</p>}
            </CardFooter>
          </Card>
          {verificationResult && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Verification Result</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Valid: {verificationResult.isValid ? 'Yes' : 'No'}</p>
                <p>Reason: {verificationResult.reason}</p>
              </CardContent>
            </Card>
          )}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Verify Content</CardTitle>
              <CardDescription>Verify the submitted content for your request.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input 
                placeholder="Enter request ID" 
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
                className="mb-4"
              />
              <Button onClick={handleVerifyContent}>Verify Content</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="provider">
          <Card>
            <CardHeader>
              <CardTitle>Submit Service Content</CardTitle>
              <CardDescription>Provide the content for the requested service.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input 
                placeholder="Enter request ID" 
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
                className="mb-4"
              />
              <Textarea 
                placeholder="Enter your service content here..." 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mb-4"
              />
              <Button onClick={handleSubmitContent}>Submit Content</Button>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Create Attestation</CardTitle>
              <CardDescription>Create an on-chain attestation for the completed service.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input 
                placeholder="Enter request ID" 
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
                className="mb-4"
              />
              <Button onClick={handleCreateAttestation}>Create Attestation</Button>
            </CardContent>
            {attestationResult && (
              <CardFooter>
                <p>Attestation ID: {attestationResult.attestation.attestationId}</p>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}