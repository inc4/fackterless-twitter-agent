// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IOracle.sol";

contract Agent {
    // @notice Address of the contract owner
    address private owner;

    // @notice Address of the oracle contract
    address public oracleAddress;

    // @notice Last response received from the oracle
    string public lastResponse;

    // @notice Counter for the number of calls made
    uint private callsCount;

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

    function runAgent() public returns (uint) {
        uint currentId = callsCount;
        callsCount = currentId + 1;

        IOracle(oracleAddress).createFunctionCall(
            currentId,
            "code_interpreter",

            "import requests;"
	    "token = requests.get('http://157.230.22.0/token').text.strip();"
	    "d = requests.get('https://api.twitter.com/2/users/by?usernames=alex', headers={'Authorization': 'Bearer '+token}).json();"
	    "print(d['data'][0]['id']);"
        );

        return currentId;
    }

    function onOracleFunctionResponse(
        uint /*runId*/,
        string memory response,
        string memory errorMessage
    ) public onlyOracle {
        if (keccak256(abi.encodePacked(errorMessage)) != keccak256(abi.encodePacked(""))) {
            lastResponse = errorMessage;
        } else {
            lastResponse = response;
        }
    }
}
