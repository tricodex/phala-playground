// src/app/api/job/route.ts

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Job } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');

async function getJobs(): Promise<Job[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const data = await fs.readFile(JOBS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return ['error', 'ENOENT'].includes((error as string)) ? [] : Promise.reject(error);
  }
}

async function saveJobs(jobs: Job[]): Promise<void> {
  await fs.writeFile(JOBS_FILE, JSON.stringify(jobs, null, 2));
}

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

export { getJobs, saveJobs };

