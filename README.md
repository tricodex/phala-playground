# Phala-agent-playground

**Overview**

Creating, submitting, and verifying content using a Phala Network AI agent. It involves both frontend (Next.js) and backend (API routes) components working in conjunction.

**Frontend (Next.js)**

* **`Home` Component:**
    * Manages the user interface and interaction flow.
    * Utilizes state variables to track the current step, requirements, content, request ID, and verification result.
    * Provides input fields for requirements and content.
    * Includes buttons to trigger actions: "Create Request," "Submit Content," and "Verify Content."
    * Displays the verification result in an alert and a formatted JSON block.

**Backend (API Routes)**

* **`/api/phala-ai-agent/route.ts`:**
    * Handles POST requests from the frontend.
    * Parses the request body to determine the `action` and associated `data`.
    * Implements three main handlers:
        * `handleCreateRequest`:
            * Generates a unique request ID.
            * Saves the requirements and a "pending" status to a JSON file in the `data/requests` directory.
        * `handleSubmitContent`:
            * Saves the submitted content to a JSON file in the `data/contents` directory, linked to the corresponding request ID.
        * `handleVerifyContent`:
            * Reads the requirements and content from their respective JSON files.
            * Constructs a GET request to the Phala AI agent, including the requirements, content and secret key as query parameters.
            * Fetches the response from the Phala agent.
            * Parses the response and saves the verification result (likely containing `isValid` and `reason`) to a JSON file in the `data/verifications` directory.
            * Returns the verification result to the frontend.

**Interaction Flow**

1. **User enters requirements and clicks "Create Request."**
   * The frontend sends a POST request to the backend API route.
   * The `handleCreateRequest` handler generates a request ID, saves the requirements, and returns the ID to the frontend.

2. **User enters content and clicks "Submit Content."**
   * The frontend sends another POST request to the backend.
   * The `handleSubmitContent` handler saves the content associated with the request ID.

3. **User clicks "Verify Content."**
   * The frontend sends a final POST request.
   * The `handleVerifyContent` handler:
     * Fetches the requirements and content.
     * Makes a GET request to the Phala AI agent with the necessary data.
     * Receives the verification result from the agent.
     * Saves the result and sends it back to the frontend.

4. **Frontend displays the verification result.**
   * The `Home` component shows whether the content is valid and the reason provided by the AI agent.

**Key Points**

* **Phala AI Agent:** The core verification logic resides within the Phala AI agent, which you've deployed separately. Its content hash (`AGENT_CID`) is used to access it.
* **Data Storage:** The system uses JSON files to store requests, content, and verification results locally.
* **API Interaction:** The frontend interacts with the backend via API routes, and the backend communicates with the Phala AI agent through GET requests.
* **Verification:** The AI agent performs the actual content verification based on the provided requirements and content, returning a result indicating validity and a reason. 
