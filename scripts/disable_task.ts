import { Agent__factory } from '../typechain-types';

async function main() {
  if (!process.env.CONTRACT_ADDRESS) {
    throw new Error("CONTRACT_ADDRESS env variable is not set.");
  }
  if (!process.env.RUN_ID) {
    throw new Error("RUN_ID env variable is not set.");
  }

  const contractAddress = process.env.CONTRACT_ADDRESS;
  const [signer] = await ethers.getSigners();

  const contract = Agent__factory.connect(contractAddress, signer);

  const runId = process.env.RUN_ID;
  const tx = await contract.disableAgentRun(runId);
  await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
