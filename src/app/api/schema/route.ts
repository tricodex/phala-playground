import { NextResponse } from 'next/server';
import { SignProtocolClient, SpMode, EvmChains } from "@ethsign/sp-sdk";
import { privateKeyToAccount } from 'viem/accounts';

export async function POST() {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('Private key not found in environment variables');
    }

    const account = privateKeyToAccount(`0x${privateKey}`);
    const client = new SignProtocolClient(SpMode.OnChain, {
      chain: EvmChains.gnosisChiado,
      account: account,
    });

    const createSchemaRes = await client.createSchema({
      name: "JobStatus",
      data: [
        { name: "jobCid", type: "string" },
        { name: "status", type: "string" }
      ],
    });

    return NextResponse.json({ success: true, schemaId: createSchemaRes.schemaId });
  } catch (error) {
    console.error('Error creating schema:', error);
    return NextResponse.json({ error: "Failed to create schema" }, { status: 500 });
  }
}