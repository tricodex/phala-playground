// src/components/attestation-details.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from 'lucide-react';

interface AttestationDetailsProps {
  jobId: string;
  attestationId: string;
}

interface AttestationInfo {
  id: string;
  schemaId: string;
  recipient: string;
  attester: string;
  time: number;
  expirationTime: number;
  revocationTime: number;
  refUID: string;
  data: string;
}

export function AttestationDetails({ jobId, attestationId }: AttestationDetailsProps) {
  const [attestationInfo, setAttestationInfo] = useState<AttestationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttestationInfo = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/attestation-info?attestationId=${attestationId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch attestation info');
        }
        const data = await response.json();
        setAttestationInfo(data);
      } catch (error) {
        console.error('Error fetching attestation info:', error);
        // You might want to set an error state here to display to the user
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
        <div className="space-y-2">
          <p><strong>Attestation ID:</strong> <Badge variant="outline">{attestationInfo.id}</Badge></p>
          <p><strong>Schema ID:</strong> {attestationInfo.schemaId}</p>
          <p><strong>Recipient:</strong> {attestationInfo.recipient}</p>
          <p><strong>Attester:</strong> {attestationInfo.attester}</p>
          <p><strong>Time:</strong> {new Date(attestationInfo.time * 1000).toLocaleString()}</p>
          <p><strong>Expiration:</strong> {attestationInfo.expirationTime ? new Date(attestationInfo.expirationTime * 1000).toLocaleString() : 'N/A'}</p>
          <Button variant="outline" onClick={() => window.open(blockscoutUrl, '_blank')}>
            View on Blockscout
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}