**README.md**

**Web3 Fiverr - Decentralized Service Marketplace**

**Overview**

This project implements a decentralized service marketplace on the Phala Network, enabling users to request and provide services in a trustless and transparent manner. It leverages World ID for authentication, Phala Network's AI agent for content verification, and the Viem agent for on-chain attestation and escrow management.

**Key Features**

* **Service Requests:** Users can create service requests specifying their requirements and deposit an escrow amount.
* **Service Provision:** Providers can browse open requests, accept them, and submit completed work.
* **Content Verification:** Phala Network's AI agent verifies the submitted content against the requirements.
* **On-Chain Attestation:** Upon successful verification, an on-chain attestation is created using the Viem agent, and the escrow is released to the provider.
* **World ID Authentication:** Users authenticate using World ID, ensuring unique human identity verification.

**Tech Stack**

* **Frontend:** Next.js 13 App Directory
* **Styling:** Tailwind CSS, Radix UI
* **State Management:** React Context (for global state)
* **Authentication:** NextAuth.js with Worldcoin provider
* **Backend:** Next.js API routes
* **Blockchain Interaction:** Viem
* **External Services:** Phala Network AI agent, World ID

**Project Structure**

* **`app`:** Contains the main application pages and layouts.
* **`components`:** Reusable UI components.
* **`hooks`:** Custom React hooks for state management and data fetching.
* **`lib`:** Utility functions.
* **`public`:** Static assets like fonts and images.
* **`types`:** TypeScript type definitions.

**Setup and Run**

1. Clone the repository.
2. Install dependencies: `npm install`
3. Set up environment variables:
   * `WLD_CLIENT_ID`: Your World ID client ID
   * `WLD_CLIENT_SECRET`: Your World ID client secret
   * `PRIVATE_KEY`: Your private key for blockchain interactions
   * `VIEM_AGENT_CID`: The CID of your Phala Viem agent
   * `PHALA_VIEM_SECRET_KEY`: The secret key for your Phala Viem agent
   * `PHALA_OPENAI_SECRET_KEY`: The secret key for the Phala OpenAI agent
4. Run the development server: `npm run dev`

**Workflow**

1. **Requester:**
   * Creates a service request, specifying requirements and escrow amount.
2. **Provider:**
   * Browses open requests and accepts one.
   * Completes the work and submits the content.
3. **Requester:**
   * Verifies the content using the Phala AI agent.
   * If valid, creates an on-chain attestation using the Viem agent, releasing the escrow to the provider.



