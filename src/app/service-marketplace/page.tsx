'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateRequest } from '@/components/create-request';
import { JobList } from '@/components/job-list';
import { JobActions } from '@/components/job-actions';
import { AttestationDetails } from '@/components/attestation-details';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [attestationResult, setAttestationResult] = useState<AttestationResult | null>(null);

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
    }
  };

  const handleJobCreated = (newJob: Job) => {
    setJobs(prev => [...prev, newJob]);
  };

  const handleJobUpdated = (updatedJob: Job) => {
    setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job));
  };

  const handleVerificationResult = (result: VerificationResult) => {
    setVerificationResult(result);
  };

  const handleAttestationResult = (result: AttestationResult) => {
    setAttestationResult(result);
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
          <CreateRequest onRequestCreated={handleJobCreated} />
          <JobList 
            jobs={jobs}
            selectedJob={selectedJob}
            onJobSelect={setSelectedJob}
          />
          {selectedJob && jobs.find(job => job.id === selectedJob)?.status === 'submitted' && (
            <JobActions
              selectedJob={selectedJob}
              jobStatus="submitted"
              onJobUpdated={handleJobUpdated}
              onVerificationResult={handleVerificationResult}
              onAttestationResult={handleAttestationResult}
            />
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
          <JobList 
            jobs={jobs.filter(job => job.status === 'open')}
            selectedJob={selectedJob}
            onJobSelect={setSelectedJob}
          />
          {selectedJob && (
            <JobActions
              selectedJob={selectedJob}
              jobStatus={jobs.find(job => job.id === selectedJob)?.status || 'open'}
              onJobUpdated={handleJobUpdated}
              onVerificationResult={handleVerificationResult}
              onAttestationResult={handleAttestationResult}
            />
          )}
        </TabsContent>
      </Tabs>
      {attestationResult && attestationResult.success && attestationResult.attestation && (
        <AttestationDetails 
          jobId={selectedJob} 
          attestationId={attestationResult.attestation.attestationId} 
        />
      )}
    </div>
  );
}