import { createPublicClient, http } from 'viem';
import contractAbi from '@/utils/singapore_abi.json';

// Define the Chain interface manually
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

// Setup the RPC URL for the Chiado Testnet
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

// Replace this with your smart contract address on Chiado
const contractAddress = '0xCF7A5C9a05482FA1dcd6C45DC65465df309Cf601';

// Create a viem client for the Chiado testnet
const client = createPublicClient({
  chain: chiadoTestnet,
  transport: http(),
});

// Function to read the jobCounter from the contract
export const readJobCounter = async () => {
  try {
    const data = await client.readContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'jobCounter', // Hardcode the functionName to 'jobCounter'
    });

    return data; // Return the value of jobCounter
  } catch (error) {
    console.error('Error reading jobCounter:', error);
    throw error;
  }
};
