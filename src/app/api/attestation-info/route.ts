// src/app/api/attestation-info/route.ts
import { NextRequest, NextResponse } from 'next/server';

const GRAPHQL_ENDPOINT = 'https://api.goldsky.com/api/public/project_cls8h0isrycgi01wfgmhv3hrf/subgraphs/sp-gnosis-chiado/v1.1.0/gn';

export async function GET(request: NextRequest) {
  const attestationId = request.nextUrl.searchParams.get('attestationId');

  console.log(`Received attestationId: ${attestationId}`);  // Log attestation ID
  
  if (!attestationId) {
    console.error('No attestationId provided in the request');
    return NextResponse.json({ error: 'Missing attestationId' }, { status: 400 });
  }

  const query = `
    {
      attestation(id: "${attestationId.toLowerCase()}") {
        id
        schemaId
        attester
        data
        timestamp
      }
    }
  `;

  console.log('GraphQL query:', query);  // Log GraphQL query
  
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    console.log('Received response from GraphQL endpoint');  // Log response reception
    
    const result = await response.json();
    
    console.log('GraphQL response result:', result);  // Log entire GraphQL result
    
    const attestation = result?.data?.attestation;
    
    if (!attestation) {
      console.warn(`No attestation found for ID: ${attestationId}`);
      return NextResponse.json({ error: 'No attestation found for the ID' }, { status: 404 });
    }

    console.log('Returning attestation data:', attestation);  // Log attestation data
    return NextResponse.json(attestation);
  } catch (error) {
    console.error('Error fetching attestation info:', error);
    return NextResponse.json({ error: 'Failed to fetch attestation info' }, { status: 500 });
  }
}
