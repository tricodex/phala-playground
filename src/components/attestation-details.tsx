// src/components/attestation-details.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AttestationDetailsProps {
  jobId: string;
  attestationId: string;
}

interface AttestationInfo {
  id: string;
  attester: string;
  data: string;
}

export function AttestationDetails({ jobId, attestationId }: AttestationDetailsProps) {
  const [attestationInfo, setAttestationInfo] = useState<AttestationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttestationInfo = async () => {
      setIsLoading(true);
      setError(null);  // Clear any previous errors
      try {
        const response = await fetch(`/api/attestation-info?attestationId=${attestationId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch attestation info');
        }
        const data = await response.json();
        setAttestationInfo(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error:any) {
        console.error('Error fetching attestation info:', error);
        setError(error.message);  // Set error state
      } finally {
        setIsLoading(false);
      }
    };
  
    if (attestationId) {
      fetchAttestationInfo();
    }
  }, [attestationId]);

  if (isLoading) {
    return <Card><CardContent>Loading attestation details...</CardContent></Card>;
  }

  if (error) {
    return <Card><CardContent>Error: {error}</CardContent></Card>;
  }

  if (!attestationInfo) {
    return <Card><CardContent>No attestation information available.</CardContent></Card>;
  }

  const blockscoutUrl = `https://gnosis-chiado.blockscout.com/address/${attestationInfo.attester}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attestation Details</CardTitle>
        <CardDescription>Job ID: {jobId}</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="default">
          <AlertTitle>Attestation Successful</AlertTitle>
          <AlertDescription>Details of the attestation are displayed below.</AlertDescription>
        </Alert>

        <div className="space-y-2 mt-4">
          <p><strong>Attestation ID:</strong> <Badge variant="outline">{attestationInfo.id}</Badge></p>
          <p><strong>Attester:</strong> {attestationInfo.attester}</p>

          <div className="space-y-2">
            <p><strong>Data:</strong></p>
            <ScrollArea className="h-24 p-2 border rounded-md bg-gray-100">
              <p className="break-all">{attestationInfo.data}</p>
            </ScrollArea>
          </div>

          <Button variant="outline" onClick={() => window.open(blockscoutUrl, '_blank')}>
            View on Blockscout
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
