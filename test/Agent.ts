import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

describe("Agent", function () {
    async function deploy() {
        const [owner] = await ethers.getSigners();

        const Oracle = await ethers.getContractFactory("Oracle");
        const oracle = await Oracle.deploy();
        await oracle.updateWhitelist(owner.address, true);

        const Agent = await ethers.getContractFactory("Agent");
        const agent = await Agent.deploy(oracle.target);
        await agent.setOracleAddress(oracle.target);

        return {agent, oracle, owner};
    }

    it("Should fetch tweets", async () => {
        const {agent, oracle, owner} = await loadFixture(deploy);

        const tx = await agent.runAgent("VitalikButerin");
        const res = await tx.wait();
        const id = res.logs[1].args[0]
        let functionId = 0;

        // Step 0
        await oracle.addFunctionResponse(functionId, id, "295218901", "");
        let run = await agent.agentRuns(id);
        // TODO assert lastCode
        expect(run.iteration).to.equal(1);
        functionId++;

        // Step 1
        await oracle.addFunctionResponse(functionId, id, "1729251834404249696|2023-11-27T21:32:19.000Z|I criticize parts of *both* the e/acc and EA camps for being too willing to put their trust in a single centralized actor, whether a nonprofit or a national government, in their solutions. https://t.co/rwalZlGSGv", "");
        run = await agent.agentRuns(id);
        expect(run.iteration).to.equal(2);
        expect(run.isFinished).to.equal(false);
        functionId++;

        // Step 2
        await oracle.addFunctionResponse(functionId, id, "1729251838581727232|2023-11-27T21:32:20.000Z|My philosophy: d/acc https://t.co/GDzrNrmQdz", "");
        run = await agent.agentRuns(id);
        expect(run.iteration).to.equal(3);
        functionId++;

        // Step 3
        await oracle.addFunctionResponse(functionId, id, "", "");
        run = await agent.agentRuns(id);
        expect(run.iteration).to.equal(4);
        expect(run.isFinished).to.equal(true);
        functionId++;

        const user = await agent.getUserByLogin("VitalikButerin");
        expect(user.id).to.equal("295218901");
        expect(user.login).to.equal("VitalikButerin");
        expect(user.isProcessing).to.equal(false);
        expect(user.tweets[0][0]).to.equal("295218901");
        expect(user.tweets[0][1]).to.equal("1729251834404249696");
        expect(user.tweets[0][2]).to.equal("2023-11-27T21:32:19.000Z");
        expect(user.tweets[0][3]).to.equal("I criticize parts of *both* the e/acc and EA camps for being too willing to put their trust in a single centralized actor, whether a nonprofit or a national government, in their solutions. https://t.co/rwalZlGSGv");
    });

    it("Continue to process twitter account", async () => {
        const {agent, oracle, owner} = await loadFixture(deploy);

        const login = "VitalikButerin";
        await (await agent.runAgent(login)).wait();
        await (await oracle.addFunctionResponse(0, 0, "295218901", "")).wait();
        await (await oracle.addFunctionResponse(1, 0, "1729251834404249696|2023-11-27T21:32:19.000Z|I criticize parts of *both* the e/acc and EA camps for being too willing to put their trust in a single centralized actor, whether a nonprofit or a national government, in their solutions. https://t.co/rwalZlGSGv", "")).wait();
        await (await oracle.addFunctionResponse(2, 0, "", "err")).wait();
        expect((await agent.agentRuns(0)).isFinished).to.equal(true);

        await (await agent.runAgent(login)).wait();
        await (await oracle.addFunctionResponse(3, 1, "1729251838581727232|2023-11-27T21:32:20.000Z|My philosophy: d/acc https://t.co/GDzrNrmQdz", "")).wait();
        const tweets = (await agent.getUserByLogin(login)).tweets;
        expect(tweets.length).to.equal(2);
        expect(tweets[0].tweetId).to.equal("1729251834404249696");
        expect(tweets[1].tweetId).to.equal("1729251838581727232");
    });

    it("Should process error on continue fetching", async () => {
        const {agent, oracle, owner} = await loadFixture(deploy);

        const login = "VitalikButerin";
        await (await agent.runAgent(login)).wait();
        await (await oracle.addFunctionResponse(0, 0, "295218901", "")).wait();
        await (await oracle.addFunctionResponse(1, 0, "1729251834404249696|2023-11-27T21:32:19.000Z|I criticize parts of *both* the e/acc and EA camps for being too willing to put their trust in a single centralized actor, whether a nonprofit or a national government, in their solutions. https://t.co/rwalZlGSGv", "")).wait();
        await (await oracle.addFunctionResponse(2, 0, "", "err")).wait();
        expect((await agent.agentRuns(0)).isFinished).to.equal(true);

        await (await agent.runAgent(login)).wait();
        await (await oracle.addFunctionResponse(3, 1, "Error", "")).wait();
        const tweets = (await agent.getUserByLogin(login)).tweets;
        expect(tweets.length).to.equal(1);
        expect(tweets[0].tweetId).to.equal("1729251834404249696");
    });

    it("Should stop the run", async () => {
        const {agent, oracle, owner} = await loadFixture(deploy);

        const login = "VitalikButerin";
        const tx = await agent.runAgent(login);
        const res = await tx.wait();
        await oracle.addFunctionResponse(0, 0, "295218901", "");

        expect((await agent.agentRuns(0)).isFinished).to.equal(false);
        expect((await agent.getUserByLogin(login)).isProcessing).to.equal(true);

        const tx2 = await agent.disableAgentRun(0);
        await tx2.wait();

        expect((await agent.agentRuns(0)).isFinished).to.equal(true);
        expect((await agent.getUserByLogin(login)).isProcessing).to.equal(false);
    });
});
