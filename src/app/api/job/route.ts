import { NextRequest, NextResponse } from 'next/server';
import { Job } from '@/types';
import { getJobs, saveJobs } from '@/lib/job-utils';

export async function GET(): Promise<NextResponse<Job[]>> {
  const jobs = await getJobs();
  return NextResponse.json(jobs);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const jobData: Omit<Job, 'id' | 'status'> = await request.json();
  const jobs = await getJobs();
  const newJob: Job = {
    ...jobData,
    id: Date.now().toString(),
    status: 'open',
  };
  jobs.push(newJob);
  await saveJobs(jobs);
  return NextResponse.json({ job: newJob });
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const { id, status, content }: Partial<Job> = await request.json();
  const jobs = await getJobs();
  const jobIndex = jobs.findIndex(job => job.id === id);
  if (jobIndex !== -1) {
    jobs[jobIndex] = { ...jobs[jobIndex], status: status || 'open', content };
    await saveJobs(jobs);
    return NextResponse.json({ job: jobs[jobIndex] });
  }
  return NextResponse.json({ error: 'Job not found' }, { status: 404 });
}