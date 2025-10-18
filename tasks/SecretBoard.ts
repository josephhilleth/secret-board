import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { Wallet, keccak256, toUtf8Bytes, hexlify, getBytes } from "ethers";

function deriveKey(address: string): Uint8Array {
  const normalized = address.toLowerCase();
  const hash = keccak256(toUtf8Bytes(normalized));
  return getBytes(hash);
}

function xorTransform(content: string, key: Uint8Array): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const result = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ key[i % key.length];
  }

  return hexlify(result);
}

task("task:address", "Prints the SecretBoard address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const deployment = await deployments.get("SecretBoard");

  console.log(`SecretBoard address is ${deployment.address}`);
});

task("task:post-message", "Posts an encrypted message to SecretBoard")
  .addParam("content", "Plaintext message to encrypt and post")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const deployment = await deployments.get("SecretBoard");
    const [signer] = await ethers.getSigners();
    await fhevm.initializeCLIApi();

    const randomWallet = Wallet.createRandom();
    const encryptionKey = deriveKey(randomWallet.address);
    const encryptedContent = xorTransform(taskArguments.content, encryptionKey);

    const encryptedAddress = await fhevm
      .createEncryptedInput(deployment.address, signer.address)
      .addAddress(randomWallet.address)
      .encrypt();

    const secretBoard = await ethers.getContractAt("SecretBoard", deployment.address);
    const tx = await secretBoard
      .connect(signer)
      .postMessage(encryptedContent, encryptedAddress.handles[0], encryptedAddress.inputProof);

    console.log(`Broadcasting tx: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Confirmed in block ${receipt?.blockNumber}`);
    console.log(`Random key address: ${randomWallet.address}`);
  });

task("task:get-message", "Displays a stored message and decrypts it")
  .addParam("id", "Message id to retrieve")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const deployment = await deployments.get("SecretBoard");
    const secretBoard = await ethers.getContractAt("SecretBoard", deployment.address);

    const messageId = Number(taskArguments.id);
    if (!Number.isInteger(messageId) || messageId < 0) {
      throw new Error("Message id must be a non-negative integer");
    }

    const message = await secretBoard.getMessage(messageId);

    await fhevm.initializeCLIApi();
    const decryptedAddress = await fhevm.publicDecryptEaddress(message.encryptedKey);

    const plaintext = (() => {
      const key = deriveKey(decryptedAddress);
      const encryptedBytes = getBytes(message.encryptedContent);
      const result = new Uint8Array(encryptedBytes.length);
      for (let i = 0; i < encryptedBytes.length; i++) {
        result[i] = encryptedBytes[i] ^ key[i % key.length];
      }
      return new TextDecoder().decode(result);
    })();

    console.log(`Author: ${message.author}`);
    console.log(`Timestamp: ${message.timestamp}`);
    console.log(`Random address: ${decryptedAddress}`);
    console.log(`Encrypted content: ${message.encryptedContent}`);
    console.log(`Plaintext message: ${plaintext}`);
  });
