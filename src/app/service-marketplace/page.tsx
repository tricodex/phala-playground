'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateRequest } from '@/components/create-request';
import { JobList } from '@/components/job-list';
import { JobActions } from '@/components/job-actions';
import { AttestationDetails } from '@/components/attestation-details';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { readJobCounter, getJobDetails } from '@/utils/blockchain';
import { Job, VerificationResult, AttestationResult } from "@/types";

export default function ServiceMarketplace() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [attestationResult, setAttestationResult] = useState<AttestationResult | null>(null);
  const { primaryWallet } = useDynamicContext();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const jobCount = await readJobCounter();
      if (typeof jobCount !== 'bigint') {
        throw new Error('Invalid job count');
      }
      const jobPromises = [];
      for (let i = BigInt(1); i <= jobCount; i++) {
        jobPromises.push(getJobDetails(i));
      }
      const jobDetails = await Promise.all(jobPromises);
      const formattedJobs: Job[] = jobDetails.map((job, index) => {
        if (typeof job !== 'object' || job === null) {
          throw new Error('Invalid job data');
        }
        const typedJob = job as {
          requestDescription: string;
          isApproved: boolean;
          isFulfilled: boolean;
          worker: string;
          amount: bigint;
          workerSubmissionCID: string;
          requester: string;
        };
        return {
          id: (BigInt(index) + BigInt(1)).toString(),
          requirements: typedJob.requestDescription,
          status: typedJob.isApproved ? 'completed' : 
                  typedJob.isFulfilled ? 'submitted' : 
                  typedJob.worker !== '0x0000000000000000000000000000000000000000' ? 'accepted' : 'open',
          escrowAmount: typedJob.amount,
          content: typedJob.workerSubmissionCID,
          requester: typedJob.requester,
          worker: typedJob.worker,
          isFulfilled: typedJob.isFulfilled,
          isApproved: typedJob.isApproved,
        };
      });
      setJobs(formattedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleJobCreated = (newJob: Job) => {
    setJobs(prev => [...prev, newJob]);
  };

  const handleJobUpdated = (updatedJob: Job) => {
    setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job));
    if (selectedJob && selectedJob.id === updatedJob.id) {
      setSelectedJob(updatedJob);
    }
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
            jobs={jobs.filter(job => job.requester === primaryWallet?.address)}
            selectedJob={selectedJob}
            onJobSelect={setSelectedJob}
          />
          {selectedJob && selectedJob.status === 'submitted' && (
            <JobActions
              selectedJob={selectedJob}
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
            jobs={jobs.filter(job => job.status === 'open' || job.worker === primaryWallet?.address)}
            selectedJob={selectedJob}
            onJobSelect={setSelectedJob}
          />
          {selectedJob && (
            <JobActions
              selectedJob={selectedJob}
              onJobUpdated={handleJobUpdated}
              onVerificationResult={handleVerificationResult}
              onAttestationResult={handleAttestationResult}
            />
          )}
        </TabsContent>
      </Tabs>
      {attestationResult && attestationResult.success && attestationResult.attestation && (
        <AttestationDetails 
          jobId={selectedJob?.id || ''} 
          attestationId={attestationResult.attestation.attestationId} 
        />
      )}
    </div>
  );
}