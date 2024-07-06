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

  describe("Temporary", function () {
    /*
    it("test", async function () {
      const {agent, oracle, owner} = await loadFixture(deploy);
      const addUserTx = await agent.temp_addUser(1234, "alex");
      await addUserTx.wait();
      console.log(await agent.users(1234));
      console.log(await agent.users(1235));
    });
    */

    it("User can start agent run", async () => {
      const {agent, oracle, owner} = await loadFixture(deploy);
      await agent.setOracleAddress(oracle.target);
      await oracle.updateWhitelist(owner.address, true);

      await agent.runAgent("VitalikButerin");
      await oracle.addFunctionResponse(0, 0, "test respo", "");
      // const messages = await oracle.getMessagesAndRoles(0, 0);
      // console.log(messages);
      /*
      const messages = await oracle.getMessagesAndRoles(0, 0)
      expect(messages.length).to.equal(2)
      expect(messages[0].content[0].value).to.equal("system prompt")
      expect(messages[1].content[0].value).to.equal("which came first: the chicken or the egg?")
      */
    });
  });
});
