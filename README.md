# AI-Powered Decentralized Trustless Service Marketplace

This project implements a cutting-edge decentralized service marketplace leveraging AI for content verification and blockchain technology for secure attestations. It provides a trustless environment for service requesters and providers to interact, with built-in quality assurance mechanisms powered by Phala Network AI agents.

## Key Features

1. **AI Content Verification**: Utilizes OpenAI's GPT models through Phala Network AI agents to assess submitted work against specified requirements.
2. **Blockchain Attestations**: Employs the Sign Protocol on the Gnosis Chiado network for creating on-chain attestations of verified work.
3. **Decentralized Architecture**: Leverages Phala Network for secure, decentralized execution of AI agents and off-chain computations.
4. **Privacy-Preserving**: Utilizes Phala's Trusted Execution Environment (TEE) to ensure data privacy and security.

## How It Works

### 1. Service Request Creation
- Users create service requests specifying requirements.
- Requests are stored securely using Phala Network's infrastructure.

### 2. Service Provision
- Providers browse and accept open requests.
- Upon completion, providers submit their work through the platform.

### 3. AI Content Verification
The system uses a Phala Network AI agent for content verification:

- **Agent**: OpenAI-powered AI agent hosted on Phala Network
- **Functionality**: 
  - Assesses submitted content against both general and specific requirements.
  - Uses OpenAI's GPT models for intelligent evaluation.
  - Checks for originality, grammatical correctness, coherence, and relevance.
- **Output**: Produces a verification result including validity status and reasoning.

### 4. Blockchain Attestation
Upon successful verification, an on-chain attestation is created:

- **Agent**: Viem Sign Agent hosted on Phala Network
- **Functionality**:
  - Creates attestations on the Gnosis Chiado network using the Sign Protocol.
  - Securely manages private keys for signing transactions within Phala's TEE.
- **Output**: Generates a unique attestation ID for the completed job.

### 5. Escrow Release
- Upon successful attestation, the escrow is automatically released to the service provider.

## Technical Stack

- **AI Agents**: Phala Network AI agents (OpenAI integration)
- **Blockchain Interaction**: Viem for Ethereum interactions
- **Attestation Protocol**: Sign Protocol on Gnosis Chiado
- **Secure Computation**: Phala Network's Trusted Execution Environment (TEE)

## Unique Selling Points

1. **AI-Powered Quality Assurance**: Ensures high-quality service delivery through intelligent content verification.
2. **Trustless Operations**: Eliminates the need for intermediaries through blockchain attestations.
3. **Enhanced Privacy and Security**: Utilizes Phala Network's TEE for secure, private computations.
4. **Decentralized AI Execution**: Runs AI models in a decentralized manner, ensuring availability and censorship resistance.
5. **Scalable Infrastructure**: Leverages Phala Network's distributed computing power for efficient processing.

This platform represents a significant advancement in decentralized marketplaces, combining the power of AI with the security and privacy of Phala Network's TEE infrastructure. It creates a robust, efficient, and trustworthy environment for digital services, ensuring both quality and confidentiality in service delivery.