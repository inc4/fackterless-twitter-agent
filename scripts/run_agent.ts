import { Agent__factory } from '../typechain-types';

async function main() {
  if (!process.env.CONTRACT_ADDRESS) {
    throw new Error("CONTRACT_ADDRESS env variable is not set.");
  }
  if (!process.env.TWITTER_LOGIN) {
    throw new Error("TWITTER_LOGIN env variable is not set.");
  }

  const contractAddress = process.env.CONTRACT_ADDRESS;
  const [signer] = await ethers.getSigners();

  const contract = Agent__factory.connect(contractAddress, signer);

  const login = process.env.TWITTER_LOGIN;
  const transactionResponse = await contract.runAgent(login);
  const receipt = await transactionResponse.wait();
  console.log(`Tx: ${receipt.hash}`);
  console.log(`Run Id: ${receipt.logs[1].args[0]}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
