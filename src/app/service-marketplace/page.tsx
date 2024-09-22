// 'use client';

// import { useState, useEffect } from 'react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { CreateRequest } from '@/components/create-request';
// import { JobList } from '@/components/job-list';
// import { JobActions } from '@/components/job-actions';
// import { AttestationDetails } from '@/components/attestation-details';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
// import { readJobCounter, getJobDetails } from '@/utils/blockchain';
// import { Job, VerificationResult, AttestationResult } from "@/types";

// export default function ServiceMarketplace() {
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [selectedJob, setSelectedJob] = useState<Job | null>(null);
//   const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
//   const [attestationResult, setAttestationResult] = useState<AttestationResult | null>(null);
//   const { primaryWallet } = useDynamicContext();

//   useEffect(() => {
//     fetchJobs();
//   }, []);

//   useEffect(() => {
//     if (!primaryWallet) {
//       console.error("No wallet connected");
//     } else {
//       console.log("Wallet connected:", primaryWallet);
//     }
//   }, [primaryWallet]);

//   const fetchJobs = async () => {
//     try {
//       const jobCount = await readJobCounter();
//       if (typeof jobCount !== 'bigint') {
//         throw new Error('Invalid job count');
//       }
//       const jobPromises = [];
//       for (let i = BigInt(1); i <= jobCount; i++) {
//         jobPromises.push(getJobDetails(i));
//       }
//       const jobDetails = await Promise.all(jobPromises);
//       const formattedJobs: Job[] = jobDetails.map((job, index) => {
//         if (typeof job !== 'object' || job === null) {
//           throw new Error('Invalid job data');
//         }
//         const typedJob = job as {
//           requestDescription: string;
//           isApproved: boolean;
//           isFulfilled: boolean;
//           worker: string;
//           amount: bigint;
//           workerSubmissionCID: string;
//           requester: string;
//         };
//         return {
//           id: (BigInt(index) + BigInt(1)).toString(),
//           requirements: typedJob.requestDescription,
//           status: typedJob.isApproved ? 'completed' : 
//                   typedJob.isFulfilled ? 'submitted' : 
//                   typedJob.worker !== '0x0000000000000000000000000000000000000000' ? 'accepted' : 'open',
//           escrowAmount: typedJob.amount,
//           content: typedJob.workerSubmissionCID,
//           requester: typedJob.requester,
//           worker: typedJob.worker,
//           isFulfilled: typedJob.isFulfilled,
//           isApproved: typedJob.isApproved,
//         };
//       });
//       setJobs(formattedJobs);
//     } catch (error) {
//       console.error('Error fetching jobs:', error);
//     }
//   };

//   const handleJobCreated = (newJob: Job) => {
//     setJobs(prev => [...prev, newJob]);
//   };

//   const handleJobUpdated = (updatedJob: Job) => {
//     setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job));
//     if (selectedJob && selectedJob.id === updatedJob.id) {
//       setSelectedJob(updatedJob);
//     }
//   };

//   const handleVerificationResult = (result: VerificationResult) => {
//     setVerificationResult(result);
//   };

//   const handleAttestationResult = (result: AttestationResult) => {
//     setAttestationResult(result);
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-4">Decentralized Service Marketplace</h1>
//       <Tabs defaultValue="requester">
//         <TabsList className="mb-4">
//           <TabsTrigger value="requester">Service Requester</TabsTrigger>
//           <TabsTrigger value="provider">Service Provider</TabsTrigger>
//         </TabsList>
//         <TabsContent value="requester">
//           <CreateRequest onRequestCreated={handleJobCreated} />
//           <JobList 
//             jobs={jobs.filter(job => job.requester === primaryWallet?.address)}
//             selectedJob={selectedJob}
//             onJobSelect={setSelectedJob}
//           />
//           {selectedJob && selectedJob.status === 'submitted' && (
//             <JobActions
//               selectedJob={selectedJob}
//               onJobUpdated={handleJobUpdated}
//               onVerificationResult={handleVerificationResult}
//               onAttestationResult={handleAttestationResult}
//             />
//           )}
//           {verificationResult && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>Verification Result</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className={verificationResult.isValid ? "text-green-600" : "text-red-600"}>
//                   Valid: {verificationResult.isValid ? 'Yes' : 'No'}
//                 </p>
//                 <p className="mt-2">Reason: {verificationResult.reason}</p>
//               </CardContent>
//             </Card>
//           )}
//         </TabsContent>
//         <TabsContent value="provider">
//           <JobList 
//             jobs={jobs.filter(job => job.status === 'open' || job.worker === primaryWallet?.address)}
//             selectedJob={selectedJob}
//             onJobSelect={setSelectedJob}
//           />
//           {selectedJob && (
//             <JobActions
//               selectedJob={selectedJob}
//               onJobUpdated={handleJobUpdated}
//               onVerificationResult={handleVerificationResult}
//               onAttestationResult={handleAttestationResult}
//             />
//           )}
//         </TabsContent>
//       </Tabs>
//       {attestationResult && attestationResult.success && attestationResult.attestation && (
//         <AttestationDetails 
//           jobId={selectedJob?.id || ''} 
//           attestationId={attestationResult.attestation.attestationId} 
//         />
//       )}
//     </div>
//   );
// }

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

  useEffect(() => {
    if (!primaryWallet) {
      console.error("No wallet connected");
    } else {
      console.log("Wallet connected:", primaryWallet);
    }
  }, [primaryWallet]);

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
    transactionHash: string;
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
    transactionHash: typedJob.transactionHash // Ensure this property is included
  };
});
setJobs(formattedJobs);
} catch (error) {
  console.error('Error fetching jobs:', error);
}}

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

  const mockJobRequests = [
    {
      id: '1',
      title: 'AI Model Fine-Tuning for Image Recognition',
      description: 'Fine-tune an AI model for recognizing objects in satellite images.',
      price: '2 XDAI',
    },
    {
      id: '2',
      title: 'Smart Contract Audit for DeFi Protocol',
      description: 'Audit a new smart contract for a decentralized finance platform.',
      price: '3 XDAI',
    },
    {
      id: '3',
      title: 'NFT Collection Art Creation',
      description: 'Design a unique set of 100 digital art pieces for an NFT collection.',
      price: '5 XDAI',
    },
    {
      id: '4',
      title: 'Blockchain Game Development',
      description: 'Develop a simple blockchain-based game with in-game assets.',
      price: '8 XDAI',
    },
    {
      id: '5',
      title: 'AI-Powered Personalized Learning Plan',
      description: 'Create a personalized learning path for a student using AI analytics.',
      price: '1.5 XDAI',
    },
  ];

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

      {/* Mock Job Requests Section */}
      <h2 className="text-2xl font-semibold my-4">Explore Job Opportunities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockJobRequests.map(job => (
          <Card key={job.id} className="bg-white border rounded-lg p-4 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{job.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{job.description}</p>
              <p className="font-bold text-indigo-600 mt-2">Budget: {job.price}</p>
              <button 
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                onClick={() => setSelectedJob(null)} // Placeholder for action
              >
                Apply Now
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {attestationResult && attestationResult.success && attestationResult.attestation && (
        <AttestationDetails 
          jobId={selectedJob?.id || ''} 
          attestationId={attestationResult.attestation.attestationId} 
        />
      )}
    </div>
  );
}
