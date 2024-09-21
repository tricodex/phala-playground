import { NextRequest, NextResponse } from 'next/server';
// import fs from 'fs/promises';
// import path from 'path';
import { saveJobs, getJobs } from '../job/route';

const PHALA_GATEWAY_URL = 'https://wapo-testnet.phala.network';
const OPENAI_AGENT_CID = 'QmbbGCwhQuij7e2mxC8DNKNEvxuJYz9u5r8DkSug6C1Lgj';
const SECRET_KEY = process.env.PHALA_OPENAI_SECRET_KEY || '';

export async function POST(request: NextRequest) {
  try {
    console.log('Received POST request to phala-ai-agent');
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    const { action, data } = body;

    switch (action) {
      case 'verifyContent':
        return handleVerifyContent(data);
      default:
        console.error('Invalid action:', action);
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function handleVerifyContent(data: { requestId: string }) {
    try {
      console.log('Verifying content with data:', JSON.stringify(data, null, 2));
      const { requestId } = data;
      
      // Check if the job exists
      const jobs = await getJobs(); // Import this function from api/job/route.ts
      const job = jobs.find(j => j.id === requestId);
      
      if (!job) {
        console.error(`Job not found for requestId: ${requestId}`);
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
  
      // Use job data instead of reading from separate files
      const requirements = job.requirements;
      const content = job.content || '';
  
      const queryParams = new URLSearchParams({
        requirements: requirements,
        content: content,
        key: SECRET_KEY,
      });
  
      const phalaResponse = await fetch(`${PHALA_GATEWAY_URL}/ipfs/${OPENAI_AGENT_CID}?${queryParams.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (!phalaResponse.ok) {
        const errorText = await phalaResponse.text();
        console.error('Phala API error:', phalaResponse.status, errorText);
        throw new Error(`Phala API error: ${phalaResponse.status} ${phalaResponse.statusText}`);
      }
  
      const verificationResult = await phalaResponse.json();
      
      // Update job status based on verification result
      job.status = verificationResult.isValid ? 'validated' : 'submitted';
      await saveJobs(jobs); // Import this function from api/job/route.ts
  
      console.log('Verification result saved for request ID:', requestId);
      return NextResponse.json(verificationResult);
    } catch (error) {
      console.error('Error in handleVerifyContent:', error);
      return NextResponse.json({ error: 'Failed to verify content' }, { status: 500 });
    }
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// async function saveJSON(type: string, id: string, data: any) {
//   try {
//     const dir = path.join(process.cwd(), 'data', type);
//     await fs.mkdir(dir, { recursive: true });
//     await fs.writeFile(path.join(dir, `${id}.json`), JSON.stringify(data, null, 2));
//     console.log(`JSON saved: ${type}/${id}`);
//   } catch (error) {
//     console.error(`Error saving JSON: ${type}/${id}`, error);
//     throw error;
//   }
// }

// async function readJSON(type: string, id: string) {
//   try {
//     const filePath = path.join(process.cwd(), 'data', type, `${id}.json`);
//     const data = await fs.readFile(filePath, 'utf8');
//     console.log(`JSON read: ${type}/${id}`);
//     return JSON.parse(data);
//   } catch (error) {
//     console.error(`Error reading JSON: ${type}/${id}`, error);
//     throw error;
//   }
// }