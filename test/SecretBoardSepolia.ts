import { ethers, deployments, fhevm } from "hardhat";
import { expect } from "chai";
import { SecretBoard } from "../types";

describe("SecretBoardSepolia", function () {
  let secretBoardContract: SecretBoard;

  before(async function () {
    if (fhevm.isMock) {
      console.warn("SecretBoardSepolia tests run only against Sepolia");
      this.skip();
    }

    try {
      const deployment = await deployments.get("SecretBoard");
      secretBoardContract = await ethers.getContractAt("SecretBoard", deployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }
  });

  it("reads current message count", async function () {
    this.timeout(60_000);

    const count = await secretBoardContract.messageCount();
    expect(count).to.be.at.least(0);
    console.log(`SecretBoard currently stores ${count} messages on Sepolia.`);
  });
});
