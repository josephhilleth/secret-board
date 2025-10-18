# Secret Board

A decentralized encrypted message board built with **Fully Homomorphic Encryption (FHE)** technology powered by Zama's fhEVM. Secret Board allows users to post encrypted messages on-chain that can be publicly decrypted without exposing the decryption keys during the encryption process—a revolutionary approach to privacy-preserving blockchain applications.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Advantages](#advantages)
- [Problems Solved](#problems-solved)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running Locally](#running-locally)
  - [Deployment](#deployment)
- [Usage](#usage)
  - [Posting a Message](#posting-a-message)
  - [Decrypting Messages](#decrypting-messages)
  - [Command-Line Interface](#command-line-interface)
- [Smart Contract](#smart-contract)
  - [Contract Functions](#contract-functions)
  - [Events](#events)
  - [Testing](#testing)
- [Frontend Application](#frontend-application)
  - [Components](#components)
  - [Hooks](#hooks)
  - [Utilities](#utilities)
- [Security Considerations](#security-considerations)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Overview

Secret Board is a proof-of-concept application demonstrating the powerful capabilities of Fully Homomorphic Encryption (FHE) in blockchain environments. Unlike traditional encrypted messaging systems where keys must be shared or messages decrypted off-chain, Secret Board leverages Zama's fhEVM to:

1. **Encrypt messages** using randomly generated addresses as encryption keys
2. **Store encrypted content and encrypted keys** directly on the blockchain
3. **Enable public decryption** of the encryption keys through FHE operations
4. **Maintain privacy during encryption** without ever exposing the random address in plaintext during the posting process

This approach creates a unique use case where messages are publicly decryptable (intentionally) but the encryption process itself preserves privacy through homomorphic encryption.

## Key Features

### Privacy-First Architecture
- **End-to-end encryption** with randomly generated ephemeral keys
- **On-chain encrypted key storage** using Zama's encrypted address (eaddress) type
- **Public decryptability** through FHE operations without compromising the encryption process
- **No centralized key management** required

### Blockchain Integration
- **Fully on-chain** message storage with cryptographic integrity
- **Immutable message history** preserved on Ethereum-compatible networks
- **Transparent operations** with verifiable encryption and decryption
- **Gas-optimized** smart contract design

### User-Friendly Interface
- **Modern React frontend** with Web3 wallet integration
- **RainbowKit wallet connection** supporting multiple wallet providers
- **Real-time message feed** with automatic updates
- **One-click decryption** of messages directly in the browser
- **Responsive design** for desktop and mobile devices

### Developer Tools
- **Hardhat development environment** with TypeScript support
- **Comprehensive test suite** using Chai and Mocha
- **CLI commands** for contract interaction and testing
- **Type-safe contracts** with TypeChain auto-generation
- **Deployment scripts** for multiple networks (local, Sepolia testnet)

## How It Works

### The Encryption Flow

1. **Message Composition**: User writes a plaintext message in the frontend
2. **Random Key Generation**: A random Ethereum wallet is generated ephemerally
3. **Client-Side Encryption**: The message is encrypted using XOR cipher with a key derived from the random wallet address
4. **FHE Encryption of Key**: The random wallet address is encrypted using Zama's relayer SDK
5. **On-Chain Storage**: Both the encrypted message and encrypted key are submitted to the smart contract
6. **Public Decryptability**: The smart contract marks the encrypted key as publicly decryptable

### The Decryption Flow

1. **Fetch Messages**: Any user can retrieve all messages from the smart contract
2. **Request Decryption**: User initiates decryption of a specific message
3. **FHE Decryption**: Zama's FHE system publicly decrypts the encrypted address
4. **Client-Side Decryption**: The decrypted random address is used to XOR-decrypt the message content
5. **Display Plaintext**: The original message is revealed to the user

### Encryption Algorithm

The project uses a simple but effective XOR-based encryption scheme:

```typescript
function deriveKey(randomAddress: string): Uint8Array {
  // Normalize and hash the address to create a 32-byte key
  const normalized = randomAddress.toLowerCase();
  return getBytes(keccak256(toUtf8Bytes(normalized)));
}

function encryptMessage(content: string, randomAddress: string): string {
  const key = deriveKey(randomAddress);
  const data = encoder.encode(content);
  const result = new Uint8Array(data.length);

  // XOR each byte with the derived key
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ key[i % key.length];
  }

  return hexlify(result);
}
```

This approach ensures that:
- The encryption is deterministic and reversible
- The key is cryptographically derived from the random address
- The implementation is simple and verifiable
- The process is compatible with both on-chain and off-chain operations

## Technology Stack

### Smart Contracts
- **Solidity ^0.8.24**: Smart contract programming language
- **fhEVM by Zama**: Fully Homomorphic Encryption for Ethereum Virtual Machine
  - `@fhevm/solidity ^0.8.0`: Core FHE library with encrypted types
  - `@zama-fhe/oracle-solidity ^0.1.0`: Decryption oracle integration
- **OpenZeppelin Contracts**: Industry-standard contract libraries (inherited through dependencies)
- **Hardhat ^2.26.0**: Development environment and testing framework
  - `@fhevm/hardhat-plugin ^0.1.0`: FHE-specific tooling for Hardhat
  - `hardhat-deploy ^0.11.45`: Deployment management
  - `@typechain/hardhat ^9.1.0`: TypeScript bindings for contracts

### Frontend
- **React ^19.1.1**: Modern UI library with hooks and concurrent features
- **TypeScript ~5.8.3**: Type-safe JavaScript for robust development
- **Vite ^7.1.6**: Lightning-fast build tool and dev server
- **Wagmi ^2.17.0**: React hooks for Ethereum interactions
  - Account management
  - Contract reads/writes
  - Transaction handling
- **RainbowKit ^2.2.8**: Beautiful wallet connection UI
  - Multi-wallet support
  - Network switching
  - Responsive design
- **TanStack React Query ^5.89.0**: Async state management and caching
- **ethers.js ^6.15.0**: Ethereum library for signing and contract interaction
- **Zama Relayer SDK ^0.2.0**: FHE encryption/decryption client

### Development Tools
- **TypeScript**: Full-stack type safety
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Solhint**: Solidity linting
- **Mocha & Chai**: Testing framework with assertions
- **Hardhat Network Helpers**: Advanced testing utilities
- **Solidity Coverage**: Test coverage analysis
- **Hardhat Gas Reporter**: Gas usage optimization

### Infrastructure
- **Infura**: Ethereum node provider for Sepolia testnet
- **Etherscan**: Contract verification and explorer
- **Netlify** (configured): Frontend deployment platform
- **Git**: Version control with deployment workflows

## Advantages

### Revolutionary Privacy Model
- **Encrypted Storage, Public Decryption**: Unlike traditional systems where either data is public or keys must be shared privately, Secret Board demonstrates a unique model where data remains encrypted on-chain but can be decrypted publicly through FHE operations.
- **No Key Distribution Problem**: Traditional encrypted systems require secure key distribution mechanisms. Secret Board eliminates this by encrypting the keys themselves with FHE.
- **Compute on Encrypted Data**: Demonstrates FHE's ability to perform operations (making data publicly decryptable) on encrypted values without decryption.

### Blockchain Benefits
- **Immutability**: Messages cannot be altered or deleted once posted
- **Transparency**: All operations are verifiable on-chain
- **Decentralization**: No central authority controls the message board
- **Censorship Resistance**: Messages persist regardless of any single party's actions
- **Auditability**: Complete history of all messages and operations

### Developer Experience
- **Type Safety**: TypeScript across the entire stack prevents runtime errors
- **Hot Reloading**: Vite provides instant feedback during development
- **Comprehensive Testing**: Full test coverage with mock FHE environment
- **Clear Architecture**: Separation of concerns between contracts, frontend, and utilities
- **Modern Tooling**: Industry-standard tools and frameworks

### User Experience
- **Simple Interface**: Clean, intuitive UI for posting and reading messages
- **One-Click Operations**: Wallet connection, posting, and decryption are streamlined
- **Real-Time Updates**: Message feed refreshes to show latest posts
- **Visual Feedback**: Clear status messages and loading states
- **No Complex Setup**: Users just connect their wallet and start interacting

## Problems Solved

### 1. The Privacy-Transparency Paradox

**Problem**: Blockchain applications face a fundamental tension between privacy and transparency. Public blockchains are transparent by default, but many applications require privacy.

**Solution**: Secret Board demonstrates how FHE can resolve this paradox by:
- Storing encrypted data on the transparent blockchain
- Enabling selective decryption through FHE operations
- Maintaining cryptographic integrity throughout the process
- Proving that privacy and transparency can coexist

### 2. Key Management in Decentralized Systems

**Problem**: Traditional encrypted messaging requires complex key distribution, key storage, and key recovery mechanisms. In decentralized systems, there's no central authority to manage keys.

**Solution**: Secret Board uses FHE to:
- Generate ephemeral keys for each message
- Encrypt the keys themselves with FHE
- Store encrypted keys on-chain without exposure
- Enable public decryption without sharing raw keys
- Eliminate the need for key management infrastructure

### 3. Verifiable Encryption

**Problem**: In traditional systems, users must trust that encryption was performed correctly. There's no way to verify that data was encrypted with the claimed key without having the key.

**Solution**: Secret Board provides:
- On-chain proof of encrypted message storage
- Verifiable encryption through FHE proofs
- Transparent decryption process that anyone can audit
- Cryptographic guarantees from Zama's FHE system

### 4. Privacy-Preserving Public Data

**Problem**: Many applications need data to be private during creation but public later (time-delayed transparency, sealed-bid auctions, etc.). Traditional solutions require trusted third parties or complex cryptographic protocols.

**Solution**: Secret Board demonstrates:
- Encrypting data with FHE during submission
- Storing encrypted data immutably on-chain
- Enabling public decryption when desired
- All without trusted intermediaries

### 5. Educational Gap in FHE

**Problem**: Fully Homomorphic Encryption is a complex topic with limited practical examples for developers to learn from.

**Solution**: Secret Board provides:
- A working, deployable FHE application
- Clear code examples for encryption and decryption
- Integration patterns for Zama's fhEVM
- Complete development and testing workflow
- Documentation of best practices

## Architecture

### Smart Contract Layer

```
SecretBoard.sol
├── Message struct
│   ├── author: address       // Message author's wallet
│   ├── timestamp: uint256    // Block timestamp
│   ├── encryptedContent: string  // XOR-encrypted message
│   └── encryptedKey: eaddress    // FHE-encrypted random address
│
├── Functions
│   ├── postMessage()         // Submit encrypted message
│   ├── getMessage()          // Retrieve single message
│   ├── getMessages()         // Retrieve all messages
│   └── messageCount()        // Get total count
│
└── Events
    └── MessagePosted         // Emitted on new message
```

### Frontend Architecture

```
app/
├── src/
│   ├── components/
│   │   ├── Header.tsx           // Navigation and wallet connection
│   │   └── BoardApp.tsx         // Main message board interface
│   │
│   ├── hooks/
│   │   ├── useZamaInstance.ts   // FHE client initialization
│   │   └── useEthersSigner.ts   // Wagmi to ethers adapter
│   │
│   ├── utils/
│   │   └── encryption.ts        // XOR encryption utilities
│   │
│   ├── config/
│   │   ├── wagmi.ts             // Blockchain connection config
│   │   └── contracts.ts         // Contract ABI and address
│   │
│   └── App.tsx                  // Root component
```

### Data Flow

```
User Input → Frontend
             ↓
    Generate Random Wallet
             ↓
    XOR Encrypt Message
             ↓
    FHE Encrypt Random Address (via Zama SDK)
             ↓
    Submit Transaction
             ↓
Smart Contract (SecretBoard)
             ↓
    Store: {
        encryptedContent,
        encryptedKey (marked publicly decryptable),
        author,
        timestamp
    }
             ↓
Blockchain Storage
             ↓
    User Requests Decryption
             ↓
    FHE Public Decrypt (via Zama Oracle)
             ↓
    Retrieve Random Address
             ↓
    XOR Decrypt Message
             ↓
    Display Plaintext
```

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0
- **npm** >= 7.0.0
- **Git** for version control
- **A Web3 wallet** (MetaMask, Rainbow, Coinbase Wallet, etc.)
- **Infura account** for Ethereum node access (for testnet deployment)
- **Sepolia ETH** (for testnet deployment - get from [Sepolia faucet](https://sepoliafaucet.com/))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/secret-board.git
cd secret-board
```

2. **Install smart contract dependencies**

```bash
npm install
```

3. **Install frontend dependencies**

```bash
cd app
npm install
cd ..
```

### Configuration

1. **Create environment file**

Create a `.env` file in the project root:

```bash
# Deployment
DEPLOYER_PRIVATE_KEY=your_private_key_here
MNEMONIC=your_mnemonic_here

# Node Provider
INFURA_API_KEY=your_infura_api_key

# Etherscan Verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional
REPORT_GAS=true
```

2. **Configure frontend**

Edit `app/src/config/contracts.ts` with your deployed contract address:

```typescript
export const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";
```

3. **Configure network** (optional)

The project is pre-configured for Sepolia testnet. To add other networks, edit `hardhat.config.ts`.

### Running Locally

#### 1. Start Local Hardhat Node (for development)

```bash
npm run chain
```

This starts a local Hardhat node with fhEVM support.

#### 2. Deploy Contracts Locally

In a new terminal:

```bash
npm run deploy:localhost
```

#### 3. Run Tests

```bash
npm test
```

#### 4. Start Frontend Development Server

```bash
cd app
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Deployment

#### Deploy to Sepolia Testnet

1. **Ensure you have Sepolia ETH** in your deployer wallet

2. **Deploy the contract**

```bash
npm run deploy:sepolia
```

3. **Verify the contract** (optional)

```bash
npm run verify:sepolia
```

4. **Update frontend configuration**

Copy the deployed contract address to `app/src/config/contracts.ts`.

5. **Build and deploy frontend**

```bash
cd app
npm run build
```

Deploy the `app/dist` folder to your hosting provider (Netlify, Vercel, etc.).

## Usage

### Posting a Message

1. **Connect Your Wallet**
   - Click "Connect Wallet" in the header
   - Select your preferred wallet provider
   - Approve the connection

2. **Write Your Message**
   - Enter your message in the text area (max 420 characters)
   - Click "Publish message"

3. **Confirm Transaction**
   - Your wallet will prompt you to sign the transaction
   - Approve the transaction (requires gas fees)
   - Wait for confirmation

4. **View Your Message**
   - Your encrypted message appears in the feed
   - The message is now stored immutably on the blockchain

### Decrypting Messages

1. **Browse the Message Feed**
   - All encrypted messages are displayed
   - You can see the encrypted content and key handle

2. **Decrypt a Message**
   - Click "Decrypt message" on any message
   - The FHE system will decrypt the encryption key
   - The plaintext message will be revealed

3. **Hide Decrypted Content**
   - Click "Hide" to collapse the decrypted message
   - You can decrypt again at any time

### Command-Line Interface

The project includes Hardhat tasks for command-line interaction:

#### Get Contract Address

```bash
npx hardhat task:address --network sepolia
```

#### Post a Message via CLI

```bash
npx hardhat task:post-message \
  --content "Hello from the command line" \
  --network sepolia
```

#### Retrieve and Decrypt a Message

```bash
npx hardhat task:get-message \
  --id 0 \
  --network sepolia
```

## Smart Contract

### Contract Functions

#### `postMessage()`

Stores an encrypted message on the blockchain.

```solidity
function postMessage(
    string calldata encryptedContent,
    externalEaddress encryptedRandomAddress,
    bytes calldata inputProof
) external returns (uint256 messageId)
```

**Parameters:**
- `encryptedContent`: XOR-encrypted message (hex string)
- `encryptedRandomAddress`: FHE-encrypted random wallet address
- `inputProof`: Zero-knowledge proof for the encrypted input

**Returns:**
- `messageId`: Index of the newly created message

**Reverts:**
- `EmptyContent()`: If the encrypted content is empty

#### `getMessage()`

Retrieves a single message by ID.

```solidity
function getMessage(uint256 messageId)
    external
    view
    returns (Message memory)
```

**Parameters:**
- `messageId`: Index of the message to retrieve

**Returns:**
- `Message`: Struct containing author, timestamp, encrypted content, and encrypted key

**Reverts:**
- `MessageDoesNotExist()`: If the message ID is invalid

#### `getMessages()`

Retrieves all messages.

```solidity
function getMessages()
    external
    view
    returns (Message[] memory)
```

**Returns:**
- Array of all messages stored in the contract

#### `messageCount()`

Returns the total number of messages.

```solidity
function messageCount()
    external
    view
    returns (uint256)
```

**Returns:**
- Total count of messages

### Events

#### `MessagePosted`

Emitted when a new message is posted.

```solidity
event MessagePosted(
    uint256 indexed messageId,
    address indexed author,
    string encryptedContent,
    bytes32 encryptedKeyHandle
)
```

### Testing

The test suite covers all contract functionality:

```bash
# Run all tests
npm test

# Run tests with gas reporting
REPORT_GAS=true npm test

# Run tests with coverage
npm run coverage

# Run Sepolia testnet tests
npm run test:sepolia
```

**Test Coverage:**
- ✅ Message posting with FHE encryption
- ✅ Public decryption of encrypted keys
- ✅ Message retrieval (single and batch)
- ✅ Message count tracking
- ✅ Empty content validation
- ✅ Invalid message ID handling
- ✅ End-to-end encryption/decryption flow

## Frontend Application

### Components

#### `Header.tsx`

Navigation bar with wallet connection.

**Features:**
- RainbowKit wallet integration
- Network display
- Responsive design

#### `BoardApp.tsx`

Main application interface.

**Features:**
- Message composition form
- Encrypted message feed
- One-click decryption
- Real-time updates
- Error handling and user feedback

### Hooks

#### `useZamaInstance()`

Initializes and manages the Zama FHE client.

```typescript
const { instance, isLoading, error } = useZamaInstance();
```

**Returns:**
- `instance`: Zama FheInstance for encryption/decryption
- `isLoading`: Boolean indicating initialization status
- `error`: Error message if initialization fails

#### `useEthersSigner()`

Converts Wagmi account to ethers.js signer.

```typescript
const signerPromise = useEthersSigner();
const signer = await signerPromise;
```

**Returns:**
- Promise resolving to ethers.js Signer

### Utilities

#### `encryption.ts`

Cryptographic utilities for message encryption.

**Functions:**

- `createEphemeralWallet()`: Generates a random wallet
- `encryptMessage(content, address)`: XOR-encrypts content with derived key
- `decryptMessage(cipherHex, address)`: XOR-decrypts content with derived key

## Security Considerations

### Current Implementation

- **XOR Encryption**: The current implementation uses XOR cipher for simplicity and educational purposes. While the key is securely derived from a keccak256 hash, XOR encryption is not suitable for production use with sensitive data.

- **Publicly Decryptable by Design**: Messages are intentionally designed to be publicly decryptable. This is a feature, not a bug, demonstrating FHE capabilities.

- **No Message Authentication**: Messages can be decrypted by anyone, and there's no verification of who decrypted them.

### Best Practices

- **Private Keys**: Never commit private keys or mnemonics to version control
- **Environment Variables**: Use `.env` files for sensitive configuration (already gitignored)
- **Wallet Security**: Use hardware wallets for mainnet deployments
- **Contract Verification**: Always verify contracts on Etherscan after deployment
- **Frontend Security**: Sanitize user inputs and validate contract responses
- **Dependency Audits**: Regularly update dependencies and check for vulnerabilities

### Production Recommendations

If adapting this code for production:

1. **Replace XOR with AES**: Use proper symmetric encryption (AES-256-GCM)
2. **Add Access Controls**: Implement role-based permissions if needed
3. **Message Limits**: Add rate limiting and size restrictions
4. **Gas Optimization**: Further optimize storage and computation
5. **Comprehensive Audits**: Conduct professional smart contract audits
6. **Error Handling**: Add circuit breakers and emergency stops
7. **Monitoring**: Implement event monitoring and alerting

## Future Roadmap

### Short-Term (Next 3 Months)

- [ ] **Enhanced Encryption**: Upgrade from XOR to AES-256-GCM encryption
- [ ] **Message Reactions**: Allow users to react to messages (thumbs up, heart, etc.)
- [ ] **User Profiles**: Display ENS names and profile pictures
- [ ] **Time-Delayed Decryption**: Messages that become decryptable after a specific timestamp
- [ ] **Gas Optimization**: Reduce transaction costs through optimized storage
- [ ] **Mobile App**: Native mobile applications for iOS and Android
- [ ] **IPFS Integration**: Store message content on IPFS, only metadata on-chain

### Mid-Term (3-6 Months)

- [ ] **Private Messaging**: Enable FHE-encrypted direct messages between users
- [ ] **Group Channels**: Create topic-based channels with access control
- [ ] **Selective Decryption**: Allow authors to specify who can decrypt messages
- [ ] **Search Functionality**: Full-text search on decrypted messages (client-side)
- [ ] **Message Threading**: Reply to messages and create conversation threads
- [ ] **Rich Media Support**: Support for encrypted images and files
- [ ] **Multi-Chain Deployment**: Deploy to additional FHE-enabled networks
- [ ] **Governance System**: Community voting on platform changes

### Long-Term (6-12 Months)

- [ ] **Zero-Knowledge Proofs**: Prove message properties without revealing content
- [ ] **Federated Instances**: Allow anyone to deploy their own Secret Board
- [ ] **Token Integration**: Native token for governance and incentives
- [ ] **Attestations**: Verifiable credentials for message authors
- [ ] **Advanced Analytics**: Privacy-preserving usage statistics
- [ ] **Developer SDK**: Easy integration of Secret Board into other dApps
- [ ] **Layer 2 Support**: Deploy to FHE-enabled L2s for lower costs
- [ ] **Cross-Chain Messaging**: Bridge messages between different chains

### Research & Innovation

- [ ] **Homomorphic Message Filtering**: Filter messages without decrypting them
- [ ] **Encrypted Voting**: Vote on messages without revealing votes
- [ ] **Privacy-Preserving Moderation**: Detect spam without reading messages
- [ ] **FHE Machine Learning**: Sentiment analysis on encrypted messages
- [ ] **Sealed-Bid Auctions**: Use the same technology for auction systems
- [ ] **Confidential Governance**: Private voting for DAOs

## Contributing

We welcome contributions from the community! Here's how you can help:

### Types of Contributions

- **Bug Reports**: Found a bug? Open an issue with detailed reproduction steps
- **Feature Requests**: Have an idea? Open an issue describing the feature
- **Code Contributions**: Submit pull requests for bug fixes or new features
- **Documentation**: Improve README, code comments, or create tutorials
- **Testing**: Add test cases or improve test coverage
- **Design**: Contribute UI/UX improvements or design assets

### Development Process

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow the existing code style
4. **Write tests**: Ensure your changes are covered by tests
5. **Run the test suite**: `npm test` (all tests must pass)
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to your fork**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**: Describe your changes in detail

### Code Standards

- **TypeScript**: All code must be type-safe
- **Linting**: Code must pass ESLint and Solhint checks
- **Formatting**: Use Prettier for consistent formatting
- **Testing**: Maintain or improve test coverage
- **Comments**: Document complex logic and public APIs
- **Commits**: Write clear, descriptive commit messages

### Questions?

Join our discussions in the GitHub Issues or reach out to the maintainers.

## License

This project is licensed under the **BSD-3-Clause-Clear License**.

See the [LICENSE](LICENSE) file for details.

### What This Means

- ✅ You can use this code for personal or commercial projects
- ✅ You can modify and distribute the code
- ✅ You must include the original license and copyright notice
- ❌ The license does not grant any patent rights
- ❌ No warranty is provided

## Acknowledgments

### Technology Partners

- **[Zama](https://www.zama.ai/)**: For developing fhEVM and making Fully Homomorphic Encryption accessible to blockchain developers. Their groundbreaking work enables privacy-preserving smart contracts.

- **[Ethereum Foundation](https://ethereum.org/)**: For creating the blockchain platform that powers this application.

### Open Source Libraries

This project builds upon the work of numerous open-source contributors:

- **Hardhat**: Ethereum development environment
- **React**: UI library from Meta
- **Wagmi**: React hooks for Ethereum
- **RainbowKit**: Wallet connection UI
- **ethers.js**: Ethereum library
- **Vite**: Build tool
- **TypeScript**: Programming language
- **OpenZeppelin**: Secure smart contract libraries

### Inspiration

- **Privacy-focused blockchain projects** that pioneered confidential transactions
- **The Web3 community** for continuous innovation in decentralized technologies
- **Early adopters and testers** who provided valuable feedback

### Special Thanks

- All contributors who have submitted pull requests, reported bugs, or suggested features
- The Zama team for their excellent documentation and developer support
- The broader Ethereum and Web3 community for fostering innovation

---

**Built with ❤️ using Zama's fhEVM**

*Secret Board is a demonstration project showcasing Fully Homomorphic Encryption in blockchain applications. It is provided as-is for educational and experimental purposes.*

For questions, issues, or collaboration opportunities, please open an issue on GitHub or reach out to the maintainers.

**[⬆ Back to Top](#secret-board)**
