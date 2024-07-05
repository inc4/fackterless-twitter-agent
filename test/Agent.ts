import { expect } from "chai";

describe("Agent", function () {
  async function deploy() {
    const owner = await ethers.getSigners()[0];

    const Oracle = await ethers.getContractFactory("ChatOracle");
    const oracle = await Oracle.deploy();

    const Agent = await ethers.getContractFactory("Agent");
    const agent = await Agent.deploy("0x0000000000000000000000000000000000000000");

    return {agent, oracle, owner};
  }

  describe("Deployment", function () {
    it("Should be run", async function () {
      console.log("We will build our first Galadriel project!");
    });
  });
});
