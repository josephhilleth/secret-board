import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Wallet, keccak256, toUtf8Bytes, hexlify, getBytes } from "ethers";
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { SecretBoard, SecretBoard__factory } from "../types";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function deriveKey(randomAddress: string): Uint8Array {
  const normalized = randomAddress.toLowerCase();
  return getBytes(keccak256(toUtf8Bytes(normalized)));
}

function encryptMessage(content: string, randomAddress: string): string {
  const key = deriveKey(randomAddress);
  const data = encoder.encode(content);
  const result = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ key[i % key.length];
  }

  return hexlify(result);
}

function decryptMessage(cipherHex: string, randomAddress: string): string {
  const key = deriveKey(randomAddress);
  const data = getBytes(cipherHex);
  const result = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ key[i % key.length];
  }

  return decoder.decode(result);
}

async function deployFixture() {
  const factory = (await ethers.getContractFactory("SecretBoard")) as SecretBoard__factory;
  const secretBoard = (await factory.deploy()) as SecretBoard;
  const contractAddress = await secretBoard.getAddress();

  return { secretBoard, contractAddress };
}

describe("SecretBoard", function () {
  let signers: Signers;
  let secretBoard: SecretBoard;
  let contractAddress: string;

  before(async function () {
    const ethSigners = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("Skipping SecretBoard tests outside mock environment");
      this.skip();
    }

    ({ secretBoard, contractAddress } = await deployFixture());
  });

  it("stores encrypted messages and enables public decryption", async function () {
    const plainText = "Hello from Zama";
    const randomWallet = Wallet.createRandom();
    const encryptedContent = encryptMessage(plainText, randomWallet.address);

    const encryptedHandle = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .addAddress(randomWallet.address)
      .encrypt();

    const tx = await secretBoard
      .connect(signers.alice)
      .postMessage(encryptedContent, encryptedHandle.handles[0], encryptedHandle.inputProof);
    await tx.wait();

    const stored = await secretBoard.getMessage(0);

    expect(stored.author).to.equal(signers.alice.address);
    expect(stored.timestamp).to.be.greaterThan(0);
    expect(stored.encryptedContent).to.equal(encryptedContent);
    expect(stored.encryptedKey).to.not.equal(ethers.ZeroHash);

    const decryptedAddress = await fhevm.publicDecryptEaddress(stored.encryptedKey);
    expect(decryptedAddress.toLowerCase()).to.equal(randomWallet.address.toLowerCase());

    const decryptedMessage = decryptMessage(stored.encryptedContent, decryptedAddress);
    expect(decryptedMessage).to.equal(plainText);
  });

  it("tracks total number of messages", async function () {
    expect(await secretBoard.messageCount()).to.equal(0);

    const firstWallet = Wallet.createRandom();
    const firstCipher = encryptMessage("First", firstWallet.address);
    const firstHandle = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .addAddress(firstWallet.address)
      .encrypt();
    await (
      await secretBoard
        .connect(signers.alice)
        .postMessage(firstCipher, firstHandle.handles[0], firstHandle.inputProof)
    ).wait();

    expect(await secretBoard.messageCount()).to.equal(1);

    const secondWallet = Wallet.createRandom();
    const secondCipher = encryptMessage("Second", secondWallet.address);
    const secondHandle = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .addAddress(secondWallet.address)
      .encrypt();
    await (
      await secretBoard
        .connect(signers.alice)
        .postMessage(secondCipher, secondHandle.handles[0], secondHandle.inputProof)
    ).wait();

    expect(await secretBoard.messageCount()).to.equal(2);

    const allMessages = await secretBoard.getMessages();
    expect(allMessages.length).to.equal(2);
    expect(allMessages[0].encryptedContent).to.equal(firstCipher);
    expect(allMessages[1].encryptedContent).to.equal(secondCipher);
  });
});
