import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

describe("Agent", function () {
  async function deploy() {
    const [owner] = await ethers.getSigners();

    const Oracle = await ethers.getContractFactory("Oracle");
    const oracle = await Oracle.deploy();

    const Agent = await ethers.getContractFactory("Agent");
    const agent = await Agent.deploy(oracle.target);
    await agent.setOracleAddress(oracle.target);

    return {agent, oracle, owner};
  }

  describe("Agent", function () {
    it("Should fetch tweets", async () => {
      const {agent, oracle, owner} = await loadFixture(deploy);
      await agent.setOracleAddress(oracle.target);
      await oracle.updateWhitelist(owner.address, true);

      const tx = await agent.runAgent("VitalikButerin");
      const res = await tx.wait();
      const id = res.logs[1].args[0]
      let functionId = 0;

      // Step 0
      await oracle.addFunctionResponse(functionId, id, "295218901", "");
      let run = await agent.agentRuns(id);
      expect(run.iteration).to.equal(1);
      // console.log(run.lastCode);
      functionId++;

      // Step 1
      await oracle.addFunctionResponse(functionId, id, "1729251834404249696|2023-11-27T21:32:19.000Z|I criticize parts of *both* the e/acc and EA camps for being too willing to put their trust in a single centralized actor, whether a nonprofit or a national government, in their solutions. https://t.co/rwalZlGSGv", "");
      run = await agent.agentRuns(id);
      expect(run.iteration).to.equal(2);
      expect(run.isFinished).to.equal(true);

      const user = await agent.getUserByLogin("VitalikButerin");
      expect(user.id).to.equal("295218901");
      expect(user.login).to.equal("VitalikButerin");
      expect(user.isProcessing).to.equal(false);
      expect(user.tweets[0][0]).to.equal("1729251834404249696");
      expect(user.tweets[0][1]).to.equal("2023-11-27T21:32:19.000Z");
      expect(user.tweets[0][2]).to.equal("I criticize parts of *both* the e/acc and EA camps for being too willing to put their trust in a single centralized actor, whether a nonprofit or a national government, in their solutions. https://t.co/rwalZlGSGv");
    });
  });
});
