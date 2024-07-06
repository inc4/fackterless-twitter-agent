// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IOracle.sol";
import "hardhat/console.sol";

contract Agent {
    mapping(string => User) public usersById;
    mapping(string => string) public usersByLogin;

    struct User {
	string id;
	string login;
	bool isProcessing;
	Tweet[] tweets;
    }

    struct Tweet {
	string userId;
	string tweetId;
	string text;
	string timestamp;
    }

    uint private agentRunCount;
    mapping(uint => AgentRun) public agentRuns;
    struct AgentRun {
        address owner;
	string twitterLogin;
	string lastCode;
        string errorMessage;
        uint iteration;
        bool isFinished;
    }

    // @notice Address of the contract owner
    address private owner;

    // @notice Address of the oracle contract
    address public oracleAddress;

    // @notice Last response received from the oracle
    string public lastResponse;

    // @notice Event emitted when the oracle address is updated
    event OracleAddressUpdated(address indexed newOracleAddress);

    event RunCreated(uint256 indexed runId, address indexed owner);

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

    // View functions
    function getAgentRunCount() public view returns (uint) {
	return agentRunCount;
    }

    function getAgentRun(uint runId) public view returns (AgentRun memory) {
	return agentRuns[runId];
    }

    function getUser(string memory userId) public view returns (User memory) {
	return usersById[userId];
    }

    function getUserByLogin(string memory login) public view returns (User memory) {
	return usersById[usersByLogin[login]];
    }

    function getTweet(string memory userId, uint index) public view returns (Tweet memory) {
	return usersById[userId].tweets[index];
    }

    function runAgent(string memory twitterLogin) public returns (uint) {
        AgentRun storage run = agentRuns[agentRunCount];

        run.owner = msg.sender;
	run.twitterLogin = twitterLogin;

	uint runId = agentRunCount;
        agentRunCount++;

	stepFetchUserId(runId, twitterLogin);
	emit RunCreated(runId, run.owner);

        return runId;
    }

    function onOracleFunctionResponse(
        uint runId,
        string memory response,
        string memory errorMessage
    ) public onlyOracle {
	AgentRun storage run = agentRuns[runId];
	string memory login = run.twitterLogin;
	require(bytes(login).length > 0, "Agent run not found");
	require(!run.isFinished, "Agent run is already finished");

        if (bytes(errorMessage).length > 0) {
	    run.errorMessage = errorMessage;
	    run.isFinished = true;
	    return;
        }

	run.iteration++;
	agentRuns[runId] = run;
	if (run.iteration == 1) {
	    // TODO should not happen when user exists
	    string memory userId = response;
	    usersById[userId] = User(userId, login, true, new Tweet[](0));
	    usersByLogin[login] = userId;
	    stepFetchTweets(runId, response);
	} else if (run.iteration == 2) {
	    string[] memory parts = split(response, "|");
	    Tweet memory tweet = Tweet(parts[0], parts[1], parts[2], "");
	    string memory userId = usersByLogin[login];
	    usersById[userId].tweets.push(tweet);
	    usersById[userId].isProcessing = false;
	    run.isFinished = true;
	}
    }

    function stepFetchUserId(uint runId, string memory login) private {
	// TODO check if user exists, increment and go to next step
	string memory part1 = "import requests;"
            "token = requests.get('http://157.230.22.0/token').text.strip();"
            "url = 'https://api.twitter.com/2/users/by/username/";
	string memory part2 = "';"
            "d = requests.get(url, headers={'Authorization': 'Bearer '+token}).json();"
            "print(d['data']['id']);";
	string memory code = string(abi.encodePacked(part1, login, part2));
	AgentRun storage run = agentRuns[runId];
	run.lastCode = code;

        IOracle(oracleAddress).createFunctionCall(runId, "code_interpreter", code);
    }

    function stepFetchTweets(uint runId, string memory userId) private {
	string memory part1 = "import requests;"
            "token = requests.get('http://157.230.22.0/token').text.strip();"
            "userId = '";
	string memory part2 = "';"
	    "url = f'https://api.twitter.com/2/users/{userId}/tweets?max_results=100&exclude=retweets,replies&tweet.fields=created_at';"
            "data = requests.get(url, headers={'Authorization': 'Bearer '+token}).json();"
            "d = data['data'][-1];"
	    "print(f\"{d['id']}|{d['created_at']}|{d['text']}\");";
	string memory code = string(abi.encodePacked(part1, userId, part2));
	AgentRun storage run = agentRuns[runId];
	run.lastCode = code;

        IOracle(oracleAddress).createFunctionCall(runId, "code_interpreter", code);
    }

    function split(string memory _base, string memory _value) internal pure returns (string[] memory splitArr) {
        bytes memory _baseBytes = bytes(_base);
        uint _offset = 0;
        uint _splitsCount = 1;
        for (uint i = 0; i < _baseBytes.length; i++) {
            if (_baseBytes[i] == bytes(_value)[0]) {
                _splitsCount++;
            }
        }
        splitArr = new string[](_splitsCount);
        uint _splitIndex = 0;
        for (uint i = 0; i < _baseBytes.length; i++) {
            if (_baseBytes[i] == bytes(_value)[0]) {
                splitArr[_splitIndex] = substring(_base, _offset, i);
                _offset = i + 1;
                _splitIndex++;
            }
        }
        splitArr[_splitIndex] = substring(_base, _offset, _baseBytes.length);
        return splitArr;
    }

        function substring(string memory str, uint startIndex, uint endIndex) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }
}
