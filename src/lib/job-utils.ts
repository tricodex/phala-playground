import fs from 'fs/promises';
import path from 'path';
import { Job } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');

export async function getJobs(): Promise<Job[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const data = await fs.readFile(JOBS_FILE, 'utf8');
    const jobs = JSON.parse(data);
    return jobs.map((job: { escrowAmount: string }) => ({
      ...job,
      escrowAmount: BigInt(Math.floor(parseFloat(job.escrowAmount) * 1e18))
    }));
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ['error', 'ENOENT'].includes((error as any).code) ? [] : Promise.reject(error);
  }
}

export async function saveJobs(jobs: Job[]): Promise<void> {
  const serializedJobs = jobs.map(job => ({
    ...job,
    escrowAmount: (Number(job.escrowAmount) / 1e18).toString()
  }));
  await fs.writeFile(JOBS_FILE, JSON.stringify(serializedJobs, null, 2));
}