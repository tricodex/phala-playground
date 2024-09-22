import { NextRequest, NextResponse } from 'next/server';
import { updateJob } from '@/lib/job-utils';  // Ensure this utility is correctly importing
import { Job } from '@/types';  // Adjust based on your Job type definition
import { ethers } from 'ethers';  // Ethers.js to decode ABI

// Constants for Phala Gateway and OpenAI integration
const PHALA_GATEWAY_URL = 'https://wapo-testnet.phala.network';
const OPENAI_AGENT_CID = 'QmbbGCwhQuij7e2mxC8DNKNEvxuJYz9u5r8DkSug6C1Lgj';
const SECRET_KEY = process.env.PHALA_OPENAI_SECRET_KEY || '';  // Make sure this environment variable is set

// Fetch xDai price, could potentially be from an API or set as a constant if fixed
const fetchXdaiPrice = async (): Promise<number> => 1.01;

// POST handler to route between actions: `verifyContent` and `createRequest`
export async function POST(request: NextRequest) {
  try {
    console.log('Received POST request to phala-ai-agent');
    const body = await request.json();  // Parse the request body
    console.log('Request body:', JSON.stringify(body, null, 2));
    const { action, data } = body;

    switch (action) {
      case 'verifyContent':
        return await handleVerifyContent(data);
      case 'createRequest':
        return await handleCreateRequest(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle job creation by validating escrow amount and creating a new job
async function handleCreateRequest(data: { requirements: string, escrowAmount: string, requester: string }): Promise<NextResponse> {
  try {
    const { requirements, escrowAmount = '1', requester } = data;

    if (!requester) {
      return NextResponse.json({ error: 'Missing requester address' }, { status: 400 });
    }

    const xdaiPrice = await fetchXdaiPrice();
    const MINIMUM_ESCROW_AMOUNT_USD = 1;
    const MINIMUM_ESCROW_AMOUNT_XDAI = Math.ceil(MINIMUM_ESCROW_AMOUNT_USD / xdaiPrice);

    const escrowAmountNumber = parseFloat(escrowAmount);
    if (escrowAmountNumber < MINIMUM_ESCROW_AMOUNT_XDAI) {
      return NextResponse.json({ error: `Minimum escrow amount is ${MINIMUM_ESCROW_AMOUNT_XDAI} xDAI` }, { status: 400 });
    }

    // Create a new Job object
    const newJob: Job = {
      id: `0x${Date.now().toString(16)}`,  // Unique job ID based on current time
      requirements,
      status: 'open',
      escrowAmount: BigInt(Math.floor(escrowAmountNumber * 1e18)),
      requester,
      worker: '',
      isFulfilled: false,
      isApproved: false,
      content: '',
    };

    return NextResponse.json({
      success: true,
      job: {
        ...newJob,
        escrowAmount,  // Return escrowAmount as a string for display purposes
      },
    });
  } catch (error) {
    console.error('Error in handleCreateRequest:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}

// Function to decode transaction input using ethers.js
function decodeInput(input: string) {
  // ABI definition for the method `createJob(string _requestDescription, uint256 _value)`
  const abi = [
    "function createJob(string _requestDescription, uint256 _value)"
  ];

  // Create an Interface instance with the ABI
  const iface = new ethers.Interface(abi);

  // Decode the input data
  const decoded = iface.decodeFunctionData("createJob", input);

  // Return the decoded result (which contains `_requestDescription` and `_value`)
  return {
    requestDescription: decoded._requestDescription,
    value: decoded._value.toString(),
  };
}

// Handle content verification using transaction details from Blockscout API
async function handleVerifyContent(data: { requestId: string, content: string }): Promise<NextResponse> {
  try {
    console.log('Verifying content with data:', JSON.stringify(data, null, 2));
    const { requestId, content } = data;

    // Fetch transaction details from Blockscout API
    const response = await fetch(`https://gnosis-chiado.blockscout.com/api?module=transaction&action=gettxinfo&txhash=${requestId}`);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch transaction details' }, { status: response.status });
    }

    const transaction = await response.json();
    console.log('Transaction details:', JSON.stringify(transaction, null, 2));

    if (!transaction || !transaction.result) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Decode the input field to extract the _requestDescription
    const decodedInput = decodeInput(transaction.result.input);
    const { requestDescription, value } = decodedInput;
    console.log(`Decoded requestDescription: ${requestDescription}, value: ${value}`);

    // Build the job data object with required properties
    const jobData: Job = { 
      id: transaction.result.hash,
      requirements: requestDescription,  // Use decoded requestDescription as requirements
      escrowAmount: BigInt(value),  // Convert to BigInt
      requester: transaction.result.from,
      content,
      status: 'submitted',  // Initial status for submitted jobs
      worker: '',  // Empty worker as a placeholder
      isFulfilled: false,  // Job is not fulfilled yet
      isApproved: false,  // Approval status is false by default
    };

    // Validate the content with Phala AI gateway
    const queryParams = new URLSearchParams({
      requirements: jobData.requirements,
      content,
      key: SECRET_KEY,
    });

    const phalaResponse = await fetch(`${PHALA_GATEWAY_URL}/ipfs/${OPENAI_AGENT_CID}?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!phalaResponse.ok) {
      const errorText = await phalaResponse.text();
      throw new Error(`Phala API error: ${phalaResponse.status} ${phalaResponse.statusText}, details: ${errorText}`);
    }

    const verificationResult = await phalaResponse.json();

    // Update job status based on verification result
    jobData.status = verificationResult.isValid ? 'validated' : 'submitted';
    jobData.content = content;  // Store the content in the job
    updateJob(jobData);  // Assuming `updateJob` persists the job in a database

    return NextResponse.json(verificationResult);
  } catch (error) {
    console.error('Error in handleVerifyContent:', error);
    return NextResponse.json({ error: 'Failed to verify content' }, { status: 500 });
  }
}
