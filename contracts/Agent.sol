// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IOracle.sol";
import "hardhat/console.sol";

contract Agent {
    mapping(uint => User) public users;

    struct User {
	string id;
	string login;
	Tweet[] tweets;
    }

    struct Tweet {
	uint256 userId;
	uint256 tweetId;
	string text;
	uint256 timestamp;
    }

    uint private agentRunCount;
    mapping(uint => AgentRun) public agentRuns;
    struct AgentRun {
        address owner;
	string twitterLogin;
        IOracle.Message[] messages;
        uint iteration;
        bool is_finished;
    }

    // @notice Address of the contract owner
    address private owner;

    // @notice Address of the oracle contract
    address public oracleAddress;

    // @notice Last response received from the oracle
    string public lastResponse;

    // @notice Event emitted when the oracle address is updated
    event OracleAddressUpdated(address indexed newOracleAddress);

    // @param initialOracleAddress Initial address of the oracle contract
    constructor(address initialOracleAddress) {
        owner = msg.sender;
        oracleAddress = initialOracleAddress;
    }

    // @notice Ensures the caller is the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    // @notice Ensures the caller is the oracle contract
    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Caller is not oracle");
        _;
    }

    // @notice Updates the oracle address
    // @param newOracleAddress The new oracle address to set
    function setOracleAddress(address newOracleAddress) public onlyOwner {
        oracleAddress = newOracleAddress;
        emit OracleAddressUpdated(newOracleAddress);
    }

    function runAgent(string memory twitterLogin) public returns (uint) {
        AgentRun storage run = agentRuns[agentRunCount];

        run.owner = msg.sender;
	run.twitterLogin = twitterLogin;

	uint currentId = agentRunCount;
        agentRunCount++;
	console.log("Agent run created with id: %d", currentId);

	console.log("Creating function call: {}", oracleAddress);
        IOracle(oracleAddress).createFunctionCall(
            currentId,
            "code_interpreter",

            "import requests;"
	    "token = requests.get('http://157.230.22.0/token').text.strip();"
	    "d = requests.get('https://api.twitter.com/2/users/by?usernames=alex', headers={'Authorization': 'Bearer '+token}).json();"
	    "print(d['data'][0]['id']);"
        );
	// emit RunCreated(run.id, run.owner, run.iteration);

        return currentId;
    }

    function onOracleFunctionResponse(
        uint /*runId*/,
        string memory response,
        string memory errorMessage
    ) public onlyOracle {
	console.log("Received response: %s", response);
        if (keccak256(abi.encodePacked(errorMessage)) != keccak256(abi.encodePacked(""))) {
            lastResponse = errorMessage;
        } else {
            lastResponse = response;
        }
    }

    // @notice Handles the response from the oracle for an OpenAI LLM call
    // @param runId The ID of the agent run
    // @param response The response from the oracle
    // @param errorMessage Any error message
    // @dev Called by teeML oracle
    function onOracleOpenAiLlmResponse(
        uint runId,
        IOracle.OpenAiResponse memory response,
        string memory errorMessage
    ) public onlyOracle {
	/*
        AgentRun storage run = agentRuns[runId];

        if (!compareStrings(errorMessage, "")) {
            IOracle.Message memory newMessage = createTextMessage("assistant", errorMessage);
            run.messages.push(newMessage);
            run.responsesCount++;
            run.is_finished = true;
            return;
        }
        if (run.responsesCount >= run.max_iterations) {
            run.is_finished = true;
            return;
        }
        if (!compareStrings(response.content, "")) {
            IOracle.Message memory newMessage = createTextMessage("assistant", response.content);
            run.messages.push(newMessage);
            run.responsesCount++;
        }
        if (!compareStrings(response.functionName, "")) {
            IOracle(oracleAddress).createFunctionCall(runId, response.functionName, response.functionArguments);
            return;
        }
        run.is_finished = true;
	*/
    }
}
