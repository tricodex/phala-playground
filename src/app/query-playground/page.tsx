// src/app/query-playground/page.tsx
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface AttestationInfo {
  id: string;
  schemaId: string;
  attester: string;
  data: string;
  timestamp: number;
}

export default function QueryPlayground() {
  const [attestationId, setAttestationId] = useState<string>('');
  const [attestationData, setAttestationData] = useState<AttestationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttestation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/attestation-info?attestationId=${attestationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch attestation');
      }
      const data = await response.json();
      setAttestationData(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err:any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Playground</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="text"
          placeholder="Enter Attestation ID"
          value={attestationId}
          onChange={(e) => setAttestationId(e.target.value)}
        />
        <Button variant="outline" onClick={fetchAttestation} disabled={isLoading || !attestationId}>
          {isLoading ? 'Loading...' : 'Fetch Attestation'}
        </Button>
        {error && <p className="text-red-500">{error}</p>}
        {attestationData && (
          <div className="space-y-2">
            <p><strong>ID:</strong> {attestationData.id}</p>
            <p><strong>Schema ID:</strong> {attestationData.schemaId}</p>
            <p><strong>Attester:</strong> {attestationData.attester}</p>
            <p><strong>Timestamp:</strong> {new Date(attestationData.timestamp * 1000).toLocaleString()}</p>
            <p><strong>Data:</strong> {attestationData.data}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
