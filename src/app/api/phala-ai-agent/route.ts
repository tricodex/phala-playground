/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/phala-ai-agent/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PHALA_GATEWAY_URL = 'https://wapo-testnet.phala.network';
const AGENT_CID = 'QmbbGCwhQuij7e2mxC8DNKNEvxuJYz9u5r8DkSug6C1Lgj';
const SECRET_KEY = process.env.PHALA_SECRET_KEY;

export async function POST(request: Request) {
  try {
    console.log('Received POST request');
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    const { action, data } = body;
    
    switch (action) {
      case 'createRequest':
        return handleCreateRequest(data);
      case 'submitContent':
        return handleSubmitContent(data);
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

async function handleCreateRequest(data: any) {
  try {
    console.log('Creating request with data:', JSON.stringify(data, null, 2));
    const { requirements } = data;
    const requestId = Date.now().toString();
    await saveJSON('requests', requestId, { requirements, status: 'pending' });
    console.log('Request created with ID:', requestId);
    return NextResponse.json({ requestId });
  } catch (error) {
    console.error('Error in handleCreateRequest:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}

async function handleSubmitContent(data: any) {
  try {
    console.log('Submitting content with data:', JSON.stringify(data, null, 2));
    const { requestId, content } = data;
    await saveJSON('contents', requestId, { content });
    console.log('Content submitted for request ID:', requestId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in handleSubmitContent:', error);
    return NextResponse.json({ error: 'Failed to submit content' }, { status: 500 });
  }
}

async function handleVerifyContent(data: any) {
  try {
    console.log('Verifying content with data:', JSON.stringify(data, null, 2));
    const { requestId } = data;
    const request = await readJSON('requests', requestId);
    const content = await readJSON('contents', requestId);
    
    console.log('Sending request to Phala API');
    const phalaResponse = await fetch(`${PHALA_GATEWAY_URL}/ipfs/${AGENT_CID}?key=${SECRET_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GET',
        path: '/ipfs/CID',
        queries: {
          requirements: [request.requirements],
          content: [content.content],
        },
        secret: { openaiApiKey: process.env.OPENAI_API_KEY },
        headers: {},
      }),
    });
    
    console.log('Phala API response status:', phalaResponse.status);
    console.log('Phala API response headers:', Object.fromEntries(phalaResponse.headers.entries()));

    if (!phalaResponse.ok) {
      const errorText = await phalaResponse.text();
      console.error('Phala API error:', phalaResponse.status, errorText);
      throw new Error(`Phala API error: ${phalaResponse.status} ${phalaResponse.statusText}`);
    }

    const responseText = await phalaResponse.text();
    console.log('Phala API response body:', responseText);

    let verificationResult;
    try {
      verificationResult = JSON.parse(responseText);
    } catch (error) {
      console.error('Error parsing Phala API response:', error);
      throw new Error('Invalid JSON response from Phala API');
    }

    await saveJSON('verifications', requestId, verificationResult);
    console.log('Verification result saved for request ID:', requestId);
    return NextResponse.json(verificationResult);
  } catch (error) {
    console.error('Error in handleVerifyContent:', error);
    return NextResponse.json({ error: 'Failed to verify content' }, { status: 500 });
  }
}

async function saveJSON(type: string, id: string, data: any) {
  try {
    const dir = path.join(process.cwd(), 'data', type);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, `${id}.json`), JSON.stringify(data, null, 2));
    console.log(`JSON saved: ${type}/${id}`);
  } catch (error) {
    console.error(`Error saving JSON: ${type}/${id}`, error);
    throw error;
  }
}

async function readJSON(type: string, id: string) {
  try {
    const filePath = path.join(process.cwd(), 'data', type, `${id}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    console.log(`JSON read: ${type}/${id}`);
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading JSON: ${type}/${id}`, error);
    throw error;
  }
}