// // src/app/api/attestation-info/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { SignProtocolClient, SpMode, EvmChains } from "@ethsign/sp-sdk";
// import { privateKeyToAccount } from 'viem/accounts';

// const PRIVATE_KEY = process.env.PRIVATE_KEY;
// const SCHEMA_ID = process.env.SCHEMA_ID;

// export async function GET(request: NextRequest) {
//   const attestationId = request.nextUrl.searchParams.get('attestationId');

//   if (!attestationId) {
//     return NextResponse.json({ error: 'Missing attestationId' }, { status: 400 });
//   }

//   if (!PRIVATE_KEY || !SCHEMA_ID) {
//     return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
//   }

//   try {
//     const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
//     const client = new SignProtocolClient(SpMode.OnChain, {
//       chain: EvmChains.gnosisChiado,
//       account: account,
//     });

//     const attestation = await client.getAttestation(attestationId);

//     return NextResponse.json(attestation);
//   } catch (error) {
//     console.error('Error fetching attestation info:', error);
//     return NextResponse.json({ error: 'Failed to fetch attestation info' }, { status: 500 });
//   }
// }

// latest

// import { NextRequest, NextResponse } from 'next/server';
// import { SignProtocolClient, SpMode, EvmChains } from "@ethsign/sp-sdk";
// import { privateKeyToAccount } from 'viem/accounts';

// const PRIVATE_KEY = process.env.PRIVATE_KEY;
// const SCHEMA_ID = process.env.SCHEMA_ID;

// export async function GET(request: NextRequest) {
//   console.log('Received GET request to /api/attestation-info');

//   const attestationId = request.nextUrl.searchParams.get('attestationId');
//   console.log('Requested AttestationId:', attestationId);

//   if (!PRIVATE_KEY || !SCHEMA_ID) {
//     console.error('Missing environment variables: PRIVATE_KEY or SCHEMA_ID');
//     return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
//   }

//   try {
//     console.log('Initializing SignProtocolClient');
//     const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
//     const client = new SignProtocolClient(SpMode.OnChain, {
//       chain: EvmChains.gnosisChiado,
//       account: account,
//     });

//     console.log('Fetching latest attestation');
//     // Instead of fetching a specific attestation, let's get the latest one
//     const attestations = await client.({ 
//       schema: SCHEMA_ID,
//       take: 1,
//       orderBy: {
//         time: 'desc'
//       }
//     });

//     if (attestations.length === 0) {
//       console.log('No attestations found');
//       return NextResponse.json({ error: 'No attestations found' }, { status: 404 });
//     }

//     const latestAttestation = attestations[0];
//     console.log('Latest attestation:', JSON.stringify(latestAttestation, null, 2));

//     // Construct a more detailed response
//     const response = {
//       id: latestAttestation.id,
//       schemaId: latestAttestation.schemaId,
//       recipient: latestAttestation.recipient,
//       attester: latestAttestation.attester,
//       time: new Date(latestAttestation.time * 1000).toISOString(),
//       expirationTime: latestAttestation.expirationTime ? new Date(latestAttestation.expirationTime * 1000).toISOString() : 'N/A',
//       revocationTime: latestAttestation.revocationTime ? new Date(latestAttestation.revocationTime * 1000).toISOString() : 'N/A',
//       refUID: latestAttestation.refUID,
//       data: latestAttestation.data
//     };

//     console.log('Returning attestation info:', JSON.stringify(response, null, 2));
//     return NextResponse.json(response);
//   } catch (error) {
//     console.error('Error fetching attestation info:', error);
//     if (error instanceof Error) {
//       return NextResponse.json({ error: `Failed to fetch attestation info: ${error.message}` }, { status: 500 });
//     }
//     return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
//   }
// }