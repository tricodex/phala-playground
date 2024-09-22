// src/app/api/phala-viem-sign/route.ts

import { NextRequest, NextResponse } from 'next/server';

const PHALA_GATEWAY_URL = 'https://wapo-testnet.phala.network';
const VIEM_AGENT_CID = process.env.VIEM_AGENT_CID;
const SECRET_KEY = process.env.PHALA_VIEM_SECRET_KEY;

export async function POST(request: NextRequest) {
  console.log('Received POST request to /api/phala-viem-sign');
  console.log('Request headers:', Object.fromEntries(request.headers));

  try {
    const body = await request.json();
    console.log('Parsed request payload:', body);

    const { jobCid, status, content } = body;

    if (!jobCid || !status || !content) {
      return NextResponse.json({ error: 'Missing jobCid, status, or content' }, { status: 400 });
    }

    const url = new URL(`${PHALA_GATEWAY_URL}/ipfs/${VIEM_AGENT_CID}`);
    url.searchParams.append('key', SECRET_KEY as string);
    console.log('Constructed Phala API URL:', url.toString());

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobCid, status, content }),
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

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing Phala API response:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in Phala API response' }, { status: 500 });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Unhandled error in phala-viem-sign route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}