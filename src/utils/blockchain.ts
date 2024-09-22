/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/blockchain.ts
import { createPublicClient, http, createWalletClient, custom } from 'viem';
import contractAbi from '@/utils/singapore_abi.json';


interface Chain {
  id: number;
  name: string;
  network: string;
  rpcUrls: {
    default: {
      http: string[];
    };
  };
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

const chiadoTestnet: Chain = {
  id: 10200,
  name: 'Chiado Testnet',
  network: 'chiado',
  rpcUrls: {
    default: { http: ['https://rpc.chiadochain.net'] },
  },
  nativeCurrency: {
    name: 'Gnosis',
    symbol: 'xDAI',
    decimals: 18,
  },
};

const contractAddress = '0xCF7A5C9a05482FA1dcd6C45DC65465df309Cf601';

const publicClient = createPublicClient({
  chain: chiadoTestnet,
  transport: http(),
});

export const getWalletClient = (provider: any) => {
  if (!provider) {
    throw new Error('Provider is undefined');
  }
  return createWalletClient({
    chain: chiadoTestnet,
    transport: custom(provider),
  });
};

export const readJobCounter = async () => {
  try {
    const data = await publicClient.readContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'jobCounter',
    });
    return data;
  } catch (error) {
    console.error('Error reading jobCounter:', error);
    throw error;
  }
};

export const createJob = async (provider: any, description: string, value: bigint) => {
  try {
    console.log('Creating job with:', { provider, description, value });
    if (!provider) {
      throw new Error('Provider is undefined');
    }
    const walletClient = getWalletClient(provider);
    const [address] = await walletClient.getAddresses();
    console.log('Wallet address:', address);

    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'createJob',
      args: [description, value],
      account: address,
      value: value,
    });
    console.log('Simulation successful');

    const txHash = await walletClient.writeContract(request);
    console.log('Transaction sent:', txHash);
    return txHash;
  } catch (error) {
    console.error('Error in createJob:', error);
    throw error;
  }
};

export const submitWork = async (walletClient: any, jobId: string, submissionCID: string) => {
  const [address] = await walletClient.getAddresses();

  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'submitWork',
    args: [BigInt(jobId), submissionCID],
    account: address,
  });

  return walletClient.writeContract(request);
};

export const approveWork = async (walletClient: any, jobId: string) => {
  const [address] = await walletClient.getAddresses();

  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'approveWork',
    args: [BigInt(jobId)],
    account: address,
  });

  return walletClient.writeContract(request);
};

export const getJobDetails = async (jobId: bigint) => {
  try {
    const data = await publicClient.readContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'jobs',
      args: [jobId],
    });
    return data;
  } catch (error) {
    console.error('Error reading job details:', error);
    throw error;
  }
};

export async function fetchXdaiPrice(): Promise<number> {
  // Hardcoded xDAI price based 22/9/24 huehueu
  const hardcodedXdaiPrice = 1.01;

  return hardcodedXdaiPrice;
}