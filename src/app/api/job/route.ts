import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const jobsFilePath = path.join(process.cwd(), 'data', 'jobs.json');

export async function GET() {
  try {
    const jobsData = await fs.readFile(jobsFilePath, 'utf8');
    const jobs = JSON.parse(jobsData);
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error reading jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
      const job = await request.json();
      const jobsData = await fs.readFile(jobsFilePath, 'utf8');
      const jobs = JSON.parse(jobsData);
      jobs.push(job);
      await fs.writeFile(jobsFilePath, JSON.stringify(jobs, null, 2));
      return NextResponse.json({ success: true, job });
    } catch (error) {
      console.error('Error adding job:', error);
      return NextResponse.json({ error: 'Failed to add job' }, { status: 500 });
    }
  }
  
  export async function PUT(request: Request) {
    try {
      const updatedJob = await request.json();
      const jobsData = await fs.readFile(jobsFilePath, 'utf8');
      let jobs = JSON.parse(jobsData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jobs = jobs.map((job: any) => job.id === updatedJob.id ? updatedJob : job);
      await fs.writeFile(jobsFilePath, JSON.stringify(jobs, null, 2));
      return NextResponse.json({ success: true, job: updatedJob });
    } catch (error) {
      console.error('Error updating job:', error);
      return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
    }
  }