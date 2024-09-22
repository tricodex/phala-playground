// lib/job-utils.ts
import { Job   } from "@/types";
const jobStore: Job[] = []; // This is the in-memory store for jobs

export function getJobs(): Job[] {
  return jobStore; // Returns the array of jobs
}

export function saveJob(job: Job): void {
  jobStore.push(job); // Save a single job to the store
}

export function updateJob(updatedJob: Job): void {
  const index = jobStore.findIndex(job => job.id === updatedJob.id || job.transactionHash === updatedJob.transactionHash);
  if (index !== -1) {
    jobStore[index] = updatedJob; // Update the job at the found index
  }
}
