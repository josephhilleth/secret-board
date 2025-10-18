import { Wallet, keccak256, toUtf8Bytes, getBytes, hexlify } from 'ethers';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function deriveKey(randomAddress: string): Uint8Array {
  const normalized = randomAddress.toLowerCase();
  return getBytes(keccak256(toUtf8Bytes(normalized)));
}

export function createEphemeralWallet() {
  return Wallet.createRandom();
}

export function encryptMessage(content: string, randomAddress: string): string {
  const key = deriveKey(randomAddress);
  const data = encoder.encode(content);
  const result = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i += 1) {
    result[i] = data[i] ^ key[i % key.length];
  }

  return hexlify(result);
}

export function decryptMessage(cipherHex: string, randomAddress: string): string {
  const key = deriveKey(randomAddress);
  const cipherBytes = getBytes(cipherHex);
  const result = new Uint8Array(cipherBytes.length);

  for (let i = 0; i < cipherBytes.length; i += 1) {
    result[i] = cipherBytes[i] ^ key[i % key.length];
  }

  return decoder.decode(result);
}
