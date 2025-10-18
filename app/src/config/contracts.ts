// const addressFromEnv = (import.meta as any).env?.VITE_SECRET_BOARD_ADDRESS as `0x${string}` | undefined;

export const CONTRACT_ADDRESS =  '0x10Bc5baC714bB6298f002B087D02De17b14a1367' as `0x${string}`;

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "EmptyContent",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MessageDoesNotExist",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "messageId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "author",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "encryptedContent",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "encryptedKeyHandle",
        "type": "bytes32"
      }
    ],
    "name": "MessagePosted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "messageId",
        "type": "uint256"
      }
    ],
    "name": "getMessage",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "author",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "encryptedContent",
            "type": "string"
          },
          {
            "internalType": "eaddress",
            "name": "encryptedKey",
            "type": "bytes32"
          }
        ],
        "internalType": "struct SecretBoard.Message",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMessages",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "author",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "encryptedContent",
            "type": "string"
          },
          {
            "internalType": "eaddress",
            "name": "encryptedKey",
            "type": "bytes32"
          }
        ],
        "internalType": "struct SecretBoard.Message[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "messageCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "encryptedContent",
        "type": "string"
      },
      {
        "internalType": "externalEaddress",
        "name": "encryptedRandomAddress",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "postMessage",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "messageId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "protocolId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  }
] as const;
