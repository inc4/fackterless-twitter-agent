import {ethers} from "hardhat";

async function main() {
  if (!process.env.ORACLE_ADDRESS) {
    throw new Error("ORACLE_ADDRESS env variable is not set.");
  }
  const oracleAddress: string = process.env.ORACLE_ADDRESS;

  const agent = await ethers.deployContract("Agent", [oracleAddress], {});
  await agent.waitForDeployment();

  console.log(`Quickstart contract deployed to ${agent.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
