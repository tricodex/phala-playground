import { NextRequest, NextResponse } from 'next/server';

const PHALA_GATEWAY_URL = 'https://wapo-testnet.phala.network';
const VIEM_AGENT_CID = process.env.VIEM_AGENT_CID;
const SECRET_KEY = process.env.PHALA_VIEM_SECRET_KEY;

console.log('API Route Initialization:');
console.log('PHALA_GATEWAY_URL:', PHALA_GATEWAY_URL);
console.log('VIEM_AGENT_CID:', VIEM_AGENT_CID);
console.log('SECRET_KEY:', SECRET_KEY ? 'Set (length: ' + SECRET_KEY.length + ')' : 'Not set');

if (!VIEM_AGENT_CID || !SECRET_KEY) {
  console.error('Missing environment variables: VIEM_AGENT_CID or PHALA_VIEM_SECRET_KEY');
}

export async function POST(request: NextRequest) {
  console.log('Received POST request to /api/phala-viem-sign');
  console.log('Request headers:', Object.fromEntries(request.headers));
  
  try {
    const bodyText = await request.text();
    console.log('Raw request body:', bodyText);
    
    let jobCid, status;
    try {
      const body = JSON.parse(bodyText);
      jobCid = body.jobCid;
      status = body.status;
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    console.log('Parsed request payload:', { jobCid, status });

    if (!jobCid || !status) {
      console.error('Missing required fields:', { jobCid, status });
      return NextResponse.json({ error: 'Missing jobCid or status' }, { status: 400 });
    }

    const url = new URL(`${PHALA_GATEWAY_URL}/ipfs/${VIEM_AGENT_CID}`);
    url.searchParams.append('key', SECRET_KEY as string);
    console.log('Constructed Phala API URL:', url.toString());

    const phalaRequestBody = JSON.stringify({
      method: 'POST',
      path: '/create-attestation',
      queries: {},
      secret: {},
      headers: {},
      body: JSON.stringify({ jobCid, status }),
    });
    console.log('Phala API request body:', phalaRequestBody);

    console.log('Sending request to Phala API...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: phalaRequestBody,
    });

    console.log('Phala API response status:', response.status);
    console.log('Phala API response headers:', Object.fromEntries(response.headers));

    const responseText = await response.text();
    console.log('Phala API response body:', responseText);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Phala API error: ${response.status} ${response.statusText}`, details: responseText },
        { status: response.status }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing Phala API response:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in Phala API response' }, { status: 500 });
    }

    console.log('Parsed response from Phala API:', data);

    if (data.body) {
      try {
        const parsedBody = JSON.parse(data.body);
        console.log('Parsed body from Phala API response:', parsedBody);
        return NextResponse.json(parsedBody);
      } catch (parseError) {
        console.error('Error parsing body from Phala API response:', parseError);
        return NextResponse.json({ error: 'Invalid JSON in Phala API response body' }, { status: 500 });
      }
    } else {
      console.error('Invalid response format from Phala API:', data);
      return NextResponse.json({ error: 'Invalid response format from Phala API' }, { status: 500 });
    }
  } catch (error) {
    console.error('Unhandled error in phala-viem-sign route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log('Received GET request to /api/phala-viem-sign');
  return NextResponse.json({ message: 'Phala Viem Sign API is running' });
}