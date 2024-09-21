//SPDX-License-Identifier: Unlicense
pragma solidity =0.8.9;

contract Singapore {

    // Struct to hold details about each job
    struct Job {
        address requester;        // Address of the person requesting the service
        uint256 amount;           // Amount of Ether placed in escrow by requester
        string requestDescription;// Description of the task (e.g., "Write cover letter")
        address worker;           // Address of the person fulfilling the task
        string workerSubmissionCID; // CID to the worker's submitted work (e.g., IPFS CID)
        bool isFulfilled;         // Whether the task has been fulfilled
        bool isApproved;          // Whether the task is approved by the requester or AI
    }

    mapping(uint256 => Job) public jobs; // Mapping of jobId to Job struct
    uint256 public jobCounter;           // Counter for unique job IDs

    // Events
    event JobCreated(uint256 jobId, address requester, string description, uint256 amount);
    event JobSubmitted(uint256 jobId, address worker, string submissionCID);
    event JobApproved(uint256 jobId, address approver);
    event JobRejected(uint256 jobId, address approver);

    // Modifier to ensure only the requester can approve or reject the job
    modifier onlyRequester(uint256 jobId) {
        require(jobs[jobId].requester == msg.sender, "Only the requester can approve or reject this job.");
        _;
    }

    // Modifier to ensure only the worker can submit the job
    modifier onlyWorker(uint256 jobId) {
        require(jobs[jobId].worker == msg.sender, "Only the assigned worker can submit work.");
        _;
    }

    // Modifier to ensure the job has not already been fulfilled
    modifier jobNotFulfilled(uint256 jobId) {
        require(!jobs[jobId].isFulfilled, "Job already fulfilled.");
        _;
    }

	// Function to create a new job and deposit Ether into escrow
	function createJob(
		string memory _requestDescription,
		uint256 _value
	) public payable {
		require(_value > 0, "You must specify some Ether for the job.");
		require(msg.value == _value, "Sent value does not match the specified value.");

		// Increment job ID counter
		uint256 jobId = jobCounter++;

		// Create a new job and store it in the mapping
		jobs[jobId] = Job({
			requester: msg.sender,
			amount: _value,
			requestDescription: _requestDescription,
			worker: address(0),
			workerSubmissionCID: "",
			isFulfilled: false,
			isApproved: false
		});

		emit JobCreated(jobId, msg.sender, _requestDescription, _value);
	}
	
	// Function for the worker to submit their work
	function submitWork(uint256 jobId, string memory _submissionCID)
		public
		jobNotFulfilled(jobId)
	{
		uint256 adjustedJobId = jobId - 1;  // Adjust jobId to match array index

		// Store the worker's submission CID and address
		jobs[adjustedJobId].worker = msg.sender;  // Set the worker's address
		jobs[adjustedJobId].workerSubmissionCID = _submissionCID;
		jobs[adjustedJobId].isFulfilled = true;

		emit JobSubmitted(jobId, msg.sender, _submissionCID);
	}

	// Function for the requester to approve the submitted work and release the payment
	function approveWork(uint256 jobId)
		public
		jobNotFulfilled(jobId)
	{
		uint256 adjustedJobId = jobId - 1;  // Adjust jobId to match array index

		require(jobs[adjustedJobId].isFulfilled, "Work has not been submitted yet.");
		require(jobs[adjustedJobId].worker != address(0), "No worker assigned to the job.");

		// Approve the job
		jobs[adjustedJobId].isApproved = true;

		// Transfer funds to the worker using call
		(bool success, ) = payable(jobs[adjustedJobId].worker).call{ value: jobs[adjustedJobId].amount }("");
		require(success, "Transfer failed.");

		emit JobApproved(jobId, msg.sender);  // Emit the original jobId (1-based)
	}

    // Function for the contract to receive Ether
    receive() external payable {}
}
