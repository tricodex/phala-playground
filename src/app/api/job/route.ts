import { NextRequest, NextResponse } from 'next/server';
import { Job } from '@/types';
import { saveJob, updateJob, getJobs } from '@/lib/job-utils';

export async function GET(): Promise<NextResponse<Job[]>> {
  const jobs = await getJobs();
  return NextResponse.json(jobs);
}


export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const jobData: Omit<Job, 'id' | 'status'> = await request.json();
    const newJob: Job = {
      ...jobData,
      id: jobData.transactionHash ?? '', // Set the id or use transactionHash
      status: 'open',
    };
    saveJob(newJob); // Pass a single job object to saveJob, not an array
    return NextResponse.json({ job: newJob });
  } catch {
    return NextResponse.json({ error: 'Failed to save job' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const { id, status, content, transactionHash }: Partial<Job> = await request.json();
    const jobs = getJobs();
    const job = jobs.find(j => j.id === id || j.transactionHash === transactionHash);
    if (job) {
      const updatedJob: Job = { 
        ...job, 
        status: status || job.status, 
        content: content !== undefined ? content : job.content,
        transactionHash: transactionHash || job.transactionHash
      };
      updateJob(updatedJob); // Update the specific job
      return NextResponse.json({ job: updatedJob });
    }
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}
