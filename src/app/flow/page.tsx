'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Loader2 } from "lucide-react"

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

export default function Home() {
  const [requestId, setRequestId] = useState('');
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
      setRequestId(data.requestId);
      toast({ 
        title: "Request created", 
        description: `Your request ID is ${data.requestId}. Keep this ID for future reference.`,
        action: <ToastAction altText="Copy ID" onClick={() => navigator.clipboard.writeText(data.requestId)}>Copy ID</ToastAction>,
      });
    } catch (err) {
      console.error('Error creating request:', err);
      toast({ title: "Error", description: "Failed to create request. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(prev => ({ ...prev, createRequest: false }));
    }
  };

  const handleSubmitContent = async () => {
    if (!requestId.trim() || !content.trim()) {
      toast({ title: "Error", description: "Please enter both request ID and content.", variant: "destructive" });
      return;
    }
    setIsLoading(prev => ({ ...prev, submitContent: true }));
    try {
      const response = await fetch('/api/phala-ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submitContent', data: { requestId, content } }),
      });
      if (!response.ok) throw new Error('Failed to submit content');
      toast({ title: "Success", description: "Your content has been successfully submitted." });
    } catch (err) {
      console.error('Error submitting content:', err);
      toast({ title: "Error", description: "Failed to submit content. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(prev => ({ ...prev, submitContent: false }));
    }
  };

  const handleVerifyContent = async () => {
    if (!requestId.trim()) {
      toast({ title: "Error", description: "Please enter the request ID.", variant: "destructive" });
      return;
    }
    setIsLoading(prev => ({ ...prev, verifyContent: true }));
    try {
      const response = await fetch('/api/phala-ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verifyContent', data: { requestId } }),
      });
      const data: VerificationResult = await response.json();
      if (!response.ok) throw new Error(data.reason || 'Failed to verify content');
      setVerificationResult(data);
      toast({ 
        title: "Content verified", 
        description: data.isValid ? "The content meets all requirements." : "The content does not meet the requirements.",
        variant: data.isValid ? "default" : "destructive",
      });
    } catch (err) {
      console.error('Error verifying content:', err);
      toast({ title: "Error", description: "Failed to verify content. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(prev => ({ ...prev, verifyContent: false }));
    }
  };

  const handleCreateAttestation = async () => {
    if (!requestId.trim()) {
      toast({ title: "Error", description: "Please enter the request ID.", variant: "destructive" });
      return;
    }
    setIsLoading(prev => ({ ...prev, createAttestation: true }));
    try {
      const response = await fetch('/api/phala-viem-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schemaId: '0x1', jobCid: requestId, status: 'completed' }),
      });
      const data: AttestationResult = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create attestation');
      setAttestationResult(data);
      if (data.success && data.attestation) {
        toast({ 
          title: "Attestation created", 
          description: `Attestation ID: ${data.attestation.attestationId}`,
          action: <ToastAction altText="Copy ID" onClick={() => navigator.clipboard.writeText(data.attestation!.attestationId)}>Copy ID</ToastAction>,
        });
      } else {
        throw new Error(data.error || 'Failed to create attestation');
      }
    } catch (err) {
      console.error('Error creating attestation:', err);
      toast({ title: "Error", description: "Failed to create attestation. Please try again.", variant: "destructive" });
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
            {requestId && (
              <CardFooter>
                <p className="text-sm text-muted-foreground">Request ID: {requestId}</p>
              </CardFooter>
            )}
          </Card>
          <Card className="mb-4">
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
              <Button onClick={handleVerifyContent} disabled={isLoading.verifyContent}>
                {isLoading.verifyContent ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : 'Verify Content'}
              </Button>
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
              <Button onClick={handleSubmitContent} disabled={isLoading.submitContent}>
                {isLoading.submitContent ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Content'}
              </Button>
            </CardContent>
          </Card>
          <Card>
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
              <Button onClick={handleCreateAttestation} disabled={isLoading.createAttestation}>
                {isLoading.createAttestation ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Create Attestation'}
              </Button>
            </CardContent>
            {attestationResult && attestationResult.success && attestationResult.attestation && (
              <CardFooter>
                <p className="text-sm text-muted-foreground">Attestation ID: {attestationResult.attestation.attestationId}</p>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}