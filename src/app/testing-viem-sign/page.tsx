'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";

export default function TestingViemSign() {
  const [jobCid, setJobCid] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleCreateAttestation = async () => {
    if (!jobCid || !status) {
      toast({ title: "Error", description: "Please fill in both Job CID and Status fields.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Creating attestation for job:', jobCid);
      const response = await fetch('/api/phala-viem-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobCid, status }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to create attestation');
      }

      const data = await response.json();
      console.log('Attestation creation response:', data);

      setResult(data);
      if (data.success && data.attestation) {
        toast({ 
          title: "Attestation created", 
          description: `Attestation ID: ${data.attestation.attestationId}`,
          action: <ToastAction altText="Copy ID" onClick={() => navigator.clipboard.writeText(data.attestation.attestationId)}>Copy ID</ToastAction>,
        });
      } else {
        throw new Error(data.error || 'Failed to create attestation');
      }
    } catch (err) {
      console.error('Error creating attestation:', err);
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to create attestation. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Viem Sign Attestation</CardTitle>
          <CardDescription>Create an attestation using the Phala Viem Sign agent.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="jobCid" className="block text-sm font-medium text-gray-700">Job CID</label>
              <Input
                id="jobCid"
                type="text"
                placeholder="Enter Job CID"
                value={jobCid}
                onChange={(e) => setJobCid(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <Input
                id="status"
                type="text"
                placeholder="Enter Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateAttestation} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Attestation...
              </>
            ) : (
              'Create Attestation'
            )}
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Attestation Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}