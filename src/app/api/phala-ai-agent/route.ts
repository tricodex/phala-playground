import { NextRequest, NextResponse } from 'next/server';
import { saveJobs, getJobs } from '@/lib/job-utils';
import { Job } from '@/types';

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
      case 'createRequest':
        return handleCreateRequest(data);
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

async function fetchXdaiPrice(): Promise<number> {
  // Hardcoded xDAI price based 22/9/24 huehueu
  const hardcodedXdaiPrice = 1.01;
  return hardcodedXdaiPrice;
}

async function handleCreateRequest(data: { requirements: string, escrowAmount: string }): Promise<NextResponse> {
  try {
    const { requirements, escrowAmount = '1' } = data;
    const jobs = await getJobs();

    const xdaiPrice = await fetchXdaiPrice();
    const MINIMUM_ESCROW_AMOUNT_USD = 1;
    const MINIMUM_ESCROW_AMOUNT_XDAI = Math.ceil(MINIMUM_ESCROW_AMOUNT_USD / xdaiPrice);

    const escrowAmountNumber = parseFloat(escrowAmount);
    if (escrowAmountNumber < MINIMUM_ESCROW_AMOUNT_XDAI) {
      return NextResponse.json({ error: `Minimum escrow amount is ${MINIMUM_ESCROW_AMOUNT_XDAI} xDAI` }, { status: 400 });
    }

    const newJob: Job = {
      id: Date.now().toString(),
      requirements,
      status: 'open',
      escrowAmount: BigInt(Math.floor(escrowAmountNumber * 1e18)),
      requester: '', // Set this to the requester's address if available
      worker: '',
      isFulfilled: false,
      isApproved: false,
    };

    jobs.push(newJob);
    await saveJobs(jobs);
    return NextResponse.json({ 
      success: true, 
      job: { 
        ...newJob, 
        escrowAmount: escrowAmount // Return the original string value
      } 
    });
  } catch (error) {
    console.error('Error in handleCreateRequest:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}

async function handleVerifyContent(data: { requestId: string }) {
  try {
    console.log('Verifying content with data:', JSON.stringify(data, null, 2));
    const { requestId } = data;
    
    const jobs = await getJobs();
    const job = jobs.find(j => j.id === requestId);
    
    if (!job) {
      console.error(`Job not found for requestId: ${requestId}`);
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

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
    
    job.status = verificationResult.isValid ? 'validated' : 'submitted';
    await saveJobs(jobs);

    console.log('Verification result saved for request ID:', requestId);
    return NextResponse.json(verificationResult);
  } catch (error) {
    console.error('Error in handleVerifyContent:', error);
    return NextResponse.json({ error: 'Failed to verify content' }, { status: 500 });
  }
}