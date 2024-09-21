/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/job.tsx
'use client';

import { useState } from 'react';
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

// Constants
const contractAddress = '0xCF7A5C9a05482FA1dcd6C45DC65465df309Cf601';

// Create public client to interact with the Chiado testnet
const publicClient = createPublicClient({
  chain: chiadoTestnet,
  transport: http(),
});

// Fetch the wallet client based on the provider (MetaMask, etc.)
const getWalletClient = (provider: any) => {
  if (!provider) {
    throw new Error('Provider is undefined');
  }
  return createWalletClient({
    chain: chiadoTestnet,
    transport: custom(provider),
  });
};

const JobPage = () => {
  const [description, setDescription] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [debug, setDebug] = useState<any>(null);

  // Handle the contract interaction and submission
  const handleCreateJob = async () => {
    setLoading(true);
    setError('');
    setTxHash('');
    setDebug(null);

    try {
      const provider = (window as any).ethereum;
      if (!provider) {
        throw new Error('Ethereum provider (MetaMask) not found');
      }

      // Request wallet connection
      await provider.request({ method: 'eth_requestAccounts' });
      
      // Get wallet client
      const walletClient = getWalletClient(provider);
      const [address] = await walletClient.getAddresses();
      console.log('Wallet address:', address);

      const valueInWei = BigInt(parseFloat(value) * 10 ** 18);

      // Simulate the contract interaction
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'createJob',
        args: [description, valueInWei],
        account: address,
        value: valueInWei,
      });

      // Debug information
      setDebug(request);

      // Send the transaction
      const txHash = await walletClient.writeContract(request);
      setTxHash(txHash);
      console.log('Transaction sent:', txHash);
    } catch (error: any) {
      console.error('Error creating job:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create a Job</h1>
      <div>
        <label>Description:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Job description"
        />
      </div>
      <div>
        <label>Value (in xDAI):</label>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Value in xDAI"
        />
      </div>
      <button onClick={handleCreateJob} disabled={loading}>
        {loading ? 'Creating Job...' : 'Submit'}
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {txHash && (
        <div>
          <h3>Transaction Hash</h3>
          <p>{txHash}</p>
        </div>
      )}
      {debug && (
        <div>
          <h3>Debug Info</h3>
          <pre>{JSON.stringify(debug, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default JobPage;
