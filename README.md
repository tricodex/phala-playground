# 3er: Decentralized Service Marketplace

<div align="center">
  <img src="public/logo.svg" alt="Web3er Logo" width="200" height="200">
  <h1>Web3er Freelance Marketplace</h1>
  <p>Connect, Create, and Verify with AI-Powered Trust</p>
</div>

## 🚀 Overview

Web3er is a cutting-edge decentralized service marketplace that leverages blockchain technology, AI, and decentralized infrastructure to create a trustless, efficient, and secure platform for freelancers and clients. Built on the Gnosis Chiado testnet and powered by Phala Network's decentralized computation framework, Web3er revolutionizes the way digital services are bought, sold, and verified.

## 🌟 Key Features

- **Blockchain-based Escrow**: Smart contracts ensure secure and transparent transactions.
- **AI-Powered Content Verification**: Utilizes OpenAI's GPT models to assess and validate submitted work.
- **Decentralized Computation**: Leverages Phala Network for secure, private, and censorship-resistant task execution.
- **Web3 Authentication**: Integrates with World ID for robust identity verification.
- **Flexible Job Creation**: Easily create and manage service requests with customizable requirements.
- **Attestations**: On-chain proof of completed work using the EAS (Ethereum Attestation Service) protocol.

## 🛠 Technology Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Smart Contracts**: Solidity (deployed on Gnosis Chiado testnet)
- **Blockchain Interaction**: viem
- **AI Integration**: OpenAI API
- **Decentralized Computation**: Phala Network Phat Contracts
- **Authentication**: Dynamic's Web3 Auth, World ID
- **Attestations**: EAS (Ethereum Attestation Service)

## 🏗 Architecture

Web3er's architecture combines on-chain and off-chain components to create a robust and scalable marketplace:

1. **Smart Contracts**: Handle escrow, job creation, and payment release.
2. **Frontend dApp**: Provides a user-friendly interface for interacting with the marketplace.
3. **Phala Network Agents**: 
   - **AI Verification Agent**: Assesses submitted work using OpenAI's models.
   - **Attestation Agent**: Creates on-chain attestations for completed and verified work.
4. **World ID Integration**: Ensures Sybil-resistant user authentication.

## 🔒 Escrow Contract

The escrow contract is a crucial component of Web3er, ensuring trust and security in transactions:

- **Location**: `contracts/ServiceMarketplace.sol` (not included in the provided codebase, but referenced in `utils/blockchain.ts`)
- **Key Functions**:
  - `createJob`: Allows clients to create new job requests with locked funds.
  - `submitWork`: Enables freelancers to submit completed work.
  - `approveWork`: Releases funds to the freelancer upon client approval.

The contract interactions are handled through the `utils/blockchain.ts` file, which provides a clean interface for the frontend to interact with the smart contract.

## 🤖 Phala Network Agents

Web3er utilizes two key Phala Network agents to enhance the platform's capabilities:

1. **AI Verification Agent** (`ai-agent-template-openai/src/index.ts`):
   - Assesses submitted work against job requirements.
   - Utilizes OpenAI's GPT models for content evaluation.
   - Provides a trustless and decentralized verification process.

2. **Attestation Agent** (`ai-agent-contract-viem/src/index.ts`):
   - Creates on-chain attestations for completed and verified work.
   - Integrates with the EAS protocol for permanent proof of work.

These agents run in a secure, decentralized environment, ensuring privacy and integrity of the verification and attestation processes.

## 🚀 Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/your-username/web3er-marketplace.git
   cd web3er-marketplace
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Edit `.env` with your API keys and configuration.

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

Run the test suite:
```
npm run test
```

## 📦 Deployment

1. Build the project:
   ```
   npm run build
   ```

2. Deploy Phala Network agents:
   ```
   cd ai-agent-template-openai
   npm run publish-agent
   
   cd ../ai-agent-contract-viem
   npm run publish-agent
   ```

3. Deploy the frontend to your preferred hosting service (e.g., Vercel, Netlify).

## 🙏 Acknowledgements

- [Phala Network](https://phala.network/)
- [OpenAI](https://openai.com/)
- [Gnosis Chain](https://www.gnosis.io/)
- [World ID](https://worldcoin.org/world-id)



