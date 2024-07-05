const {ethers} = require("hardhat");

async function main() {
  const contractABI = [
    "function runAgent() public returns (uint)",
    "function lastResponse() public view returns (string)"
  ];

  if (!process.env.CONTRACT_ADDRESS) {
    throw new Error("CONTRACT_ADDRESS env variable is not set.");
  }

  const contractAddress = process.env.CONTRACT_ADDRESS;
  const [signer] = await ethers.getSigners();

  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  const transactionResponse = await contract.runAgent();
  const receipt = await transactionResponse.wait();
  console.log(`Transaction sent, hash: ${receipt.hash}.\nExplorer: https://explorer.galadriel.com/tx/${receipt.hash}`)

  let lastResponse = await contract.lastResponse();
  let newResponse = lastResponse;

  process.stdout.write("Waiting for response: ");
  while (newResponse === lastResponse) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    newResponse = await contract.lastResponse();
    process.stdout.write(".");
  }
  console.log();

  console.log(`Response: ${newResponse}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
