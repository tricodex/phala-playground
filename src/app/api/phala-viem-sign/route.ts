import { NextResponse } from 'next/server';

const PHALA_GATEWAY_URL = 'https://wapo-testnet.phala.network';
const VIEM_AGENT_CID = 'QmXFchtsuJJS6NbnKjnKjxWABiWm8TZ962pQJCT1KwjEAv';
const SECRET_KEY = process.env.PHALA_VIEM_SECRET_KEY || '';

export async function POST(request: Request) {
  try {
    const { schemaId, jobCid, status } = await request.json();
    const response = await fetch(`${PHALA_GATEWAY_URL}/ipfs/${VIEM_AGENT_CID}?key=${SECRET_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        schemaId,
        jobCid,
        status,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Phala API error:', response.status, errorText);
      return NextResponse.json({ error: `Phala API error: ${response.status} ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Viem Sign route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}