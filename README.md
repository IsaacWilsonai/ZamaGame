# 🏰 ZamaGame - Encrypted Equipment RPG

[![License](https://img.shields.io/badge/License-BSD_3--Clause--Clear-blue.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.26.0-yellow)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)](https://react.dev/)
[![Deployed](https://img.shields.io/badge/Deployed-Sepolia-success)](https://sepolia.etherscan.io/address/0xAC8119750D7a1b344d4c2A818083c1b676aA7e3a)

> A revolutionary blockchain RPG game demonstrating **Fully Homomorphic Encryption (FHE)** for confidential on-chain gaming with encrypted NFT equipment stats.

## 🎮 Overview

ZamaGame is an innovative blockchain-based RPG that leverages Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine) to create a truly confidential gaming experience. Players battle monsters to earn encrypted NFT equipment where item types and attack power remain hidden on-chain until explicitly decrypted by the owner.

### 🌟 Key Features

- **🔐 True Privacy**: Equipment stats (type, attack power) are encrypted on-chain using FHE
- **⚔️ Battle Mechanics**: Attack monsters to receive randomized encrypted equipment
- **🎒 NFT Collection**: Collect unique equipment pieces with hidden attributes
- **🔓 Owner-Only Decryption**: Only equipment owners can decrypt and view their item stats
- **🌐 Web3 Integration**: Seamless wallet connection via RainbowKit
- **📱 Modern UI**: Beautiful, responsive React interface with real-time updates

## 💡 What Makes ZamaGame Unique

### The Privacy Problem in Blockchain Gaming

Traditional blockchain games face a fundamental limitation: **all on-chain data is public**. This means:
- Item stats, rarities, and attributes are visible to everyone
- Game strategies can be easily reverse-engineered
- Players lose the excitement of "unboxing" or discovering rare items
- Cheating and exploits become easier when all game state is transparent

### Our FHE-Powered Solution

ZamaGame solves these problems using **Fully Homomorphic Encryption (FHE)**:

1. **Encrypted State**: Equipment attributes are encrypted when created and stored encrypted on-chain
2. **Confidential Computation**: The blockchain can perform operations on encrypted data without decrypting it
3. **Selective Disclosure**: Players choose when to decrypt their items, creating genuine surprise and discovery
4. **Provably Fair**: Randomness and game logic are verifiable while maintaining privacy

This represents a **paradigm shift** in blockchain gaming - bringing the excitement and mystery of traditional games while preserving blockchain's trustless and verifiable properties.

## 🏗️ Architecture

### Smart Contracts

#### `ZamaGame.sol` - Main Game Contract
```
contracts/
└── ZamaGame.sol          # Core FHE-based RPG logic
    ├── attackMonster()   # Generate random encrypted equipment
    ├── getMyEquipment()  # Retrieve player's encrypted items
    └── getPlayerEquipmentCount() # Get total items owned
```

**Key Design Decisions:**
- Uses `euint8` for equipment types (0: Weapon, 1: Shoes, 2: Shield)
- Uses `euint32` for attack power (1-100 range)
- Implements ACL (Access Control List) to grant decryption rights only to owners
- Pseudo-random generation using `block.prevrandao` (demo only - production would use VRF)

#### `FHECounter.sol` - Example Contract
Simple counter demonstrating FHE operations with encrypted increment/decrement.

### Frontend Application

```
app/
├── src/
│   ├── components/
│   │   ├── home.tsx         # Main game interface
│   │   └── Header.tsx       # Navigation header
│   ├── config/
│   │   ├── wagmi.ts         # Web3 wallet configuration
│   │   └── zamagame-abi.ts  # Contract ABI definitions
│   ├── hooks/               # Custom React hooks
│   └── styles/              # CSS styling
```

**Technology Stack:**
- **React 19.1.1**: Latest React with modern hooks
- **Viem 2.37**: Lightweight Ethereum library
- **Wagmi 2.17**: React hooks for Ethereum
- **RainbowKit 2.2**: Beautiful wallet connection UI
- **Zama Relayer SDK 0.2**: FHE encryption/decryption client
- **TypeScript**: Full type safety
- **Vite**: Lightning-fast build tool

### FHEVM Integration

ZamaGame integrates with Zama's FHE infrastructure on Sepolia testnet:

```
FHEVM Components:
├── Executor Contract      → 0x848B0066793BcC60346Da1F49049357399B8D595
├── ACL Contract          → 0x687820221192C5B662b25367F70076A37bc79b6c
├── KMS Verifier          → 0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC
├── Input Verifier        → 0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4
├── Decryption Oracle     → 0xa02Cda4Ca3a71D7C46997716F4283aa851C28812
└── Relayer Service       → https://relayer.testnet.zama.cloud
```

## 🚀 Technologies Used

### Blockchain & Smart Contracts

| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | ^0.8.24 | Smart contract language |
| **Hardhat** | 2.26.0 | Development environment |
| **@fhevm/solidity** | 0.8.0 | FHE operations library |
| **@zama-fhe/oracle-solidity** | 0.1.0 | Decryption oracle integration |
| **Ethers.js** | 6.15.0 | Ethereum interaction library |

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI framework |
| **TypeScript** | 5.8.3 | Type safety |
| **Vite** | 7.1.6 | Build tool |
| **Wagmi** | 2.17.0 | React hooks for Ethereum |
| **Viem** | 2.37.6 | Ethereum library |
| **RainbowKit** | 2.2.8 | Wallet connection UI |
| **@tanstack/react-query** | 5.89.0 | Data fetching & caching |
| **@zama-fhe/relayer-sdk** | 0.2.0 | FHE client operations |

### Development Tools

| Tool | Purpose |
|------|---------|
| **TypeChain** | Generate TypeScript types from contracts |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Solhint** | Solidity linting |
| **Hardhat Deploy** | Deployment management |
| **Hardhat Gas Reporter** | Gas usage analysis |

## 🔧 Installation & Setup

### Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 7.0.0
- **Git**
- **Metamask** or compatible Web3 wallet

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ZamaGame.git
cd ZamaGame
```

### 2. Install Dependencies

#### Root Project (Smart Contracts)
```bash
npm install
```

#### Frontend Application
```bash
cd app
npm install
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```env
# Wallet Configuration
PRIVATE_KEY=your_private_key_here

# API Keys
INFURA_API_KEY=your_infura_key_here
ETHERSCAN_API_KEY=your_etherscan_key_here

# Network Configuration
MNEMONIC="your twelve word mnemonic phrase here"
```

⚠️ **Security Warning**: Never commit your `.env` file or share your private keys!

### 4. Compile Smart Contracts

```bash
npm run compile
```

This generates:
- Contract artifacts in `artifacts/`
- TypeScript types in `types/`

### 5. Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run coverage

# Run on Sepolia testnet
npm run test:sepolia
```

### 6. Deploy Contracts

#### Local Development (Hardhat Network)
```bash
npx hardhat deploy
```

#### Sepolia Testnet
```bash
npm run deploy:sepolia
```

The deployed contract address will be saved in `deployments/sepolia/ZamaGame.json`.

### 7. Launch Frontend

```bash
cd app
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📖 Usage Guide

### For Players

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select your wallet provider
   - Approve connection to Sepolia testnet
   - Ensure you have Sepolia ETH for gas

2. **Battle Monsters**
   - Click "⚔️ Attack Monster" button
   - Confirm the transaction in your wallet
   - Wait for transaction confirmation
   - Receive encrypted equipment NFT

3. **Decrypt Equipment**
   - View your equipment collection in "Your Arsenal"
   - Click "🔓 Reveal Stats" on any encrypted item
   - Sign EIP-712 message to authorize decryption
   - View revealed type (Weapon/Shoes/Shield) and attack power

### For Developers

#### Interacting with Smart Contracts

```javascript
import { ethers } from 'ethers';
import { ZAMAGAME_ABI } from './config/zamagame-abi';

const CONTRACT_ADDRESS = '0xAC8119750D7a1b344d4c2A818083c1b676aA7e3a';

// Connect to contract
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const game = new ethers.Contract(CONTRACT_ADDRESS, ZAMAGAME_ABI, signer);

// Attack monster to get equipment
const tx = await game.attackMonster();
await tx.wait();

// Get equipment count
const count = await game.getPlayerEquipmentCount(userAddress);

// Get encrypted equipment (returns encrypted handles)
const [encType, encPower, exists] = await game.getMyEquipment(0);
```

#### Decrypting Equipment

```javascript
import { initSDK, createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

// Initialize FHE SDK
await initSDK();
const instance = await createInstance({
  ...SepoliaConfig,
  network: window.ethereum
});

// Generate keypair for decryption
const keypair = instance.generateKeypair();

// Create EIP-712 signature
const eip712 = instance.createEIP712(
  keypair.publicKey,
  [CONTRACT_ADDRESS],
  Math.floor(Date.now() / 1000).toString(),
  '7' // days
);

// Sign with wallet
const signature = await signer.signTypedData(
  eip712.domain,
  { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
  eip712.message
);

// Decrypt equipment stats
const result = await instance.userDecrypt(
  [
    { handle: encType, contractAddress: CONTRACT_ADDRESS },
    { handle: encPower, contractAddress: CONTRACT_ADDRESS }
  ],
  keypair.privateKey,
  keypair.publicKey,
  signature.replace('0x', ''),
  [CONTRACT_ADDRESS],
  userAddress,
  startTimeStamp,
  '7'
);

console.log('Type:', result[encType]);
console.log('Power:', result[encPower]);
```

## 🧩 Solved Problems

### 1. **On-Chain Privacy in Gaming**

**Problem**: Traditional blockchain games expose all game state publicly, eliminating surprise and enabling cheating.

**Solution**: FHE allows game state to remain encrypted on-chain while still being verifiable and computable.

**Impact**: Creates genuine discovery moments in blockchain gaming.

### 2. **Trusted Random Number Generation**

**Problem**: Players need to trust that item generation is fair and not manipulated.

**Solution**: On-chain pseudo-random generation with encrypted outputs means even the contract deployer cannot predict individual item stats.

**Future Enhancement**: Integration with Chainlink VRF or similar for production-grade randomness.

### 3. **Selective Disclosure**

**Problem**: Players want privacy but also need to prove ownership and stats when desired.

**Solution**: FHE ACL (Access Control List) allows granular control - owners can decrypt their items while keeping them hidden from others.

**Impact**: Enables future features like private trading, stat comparisons, etc.

### 4. **Gas Efficiency vs Privacy**

**Problem**: FHE operations are computationally expensive.

**Solution**:
- Strategic use of encrypted types (euint8 for types, euint32 for power)
- Minimal on-chain computation
- Off-chain decryption via relayer network
- Transient permissions for temporary access

**Result**: Reasonable gas costs (~150-300k gas per attack) while maintaining strong privacy.

### 5. **User Experience with Encryption**

**Problem**: Encryption typically requires complex key management.

**Solution**:
- Automatic key generation in browser
- EIP-712 signature for authorization
- Zama Relayer SDK abstracts complexity
- One-click decryption experience

**Impact**: Non-technical users can use FHE features without understanding the cryptography.

## 🛣️ Roadmap & Future Plans

### Phase 1: Core Enhancement (Q2 2025)
- [ ] **PvP Battles**: Player vs player combat using encrypted stats
- [ ] **Equipment Crafting**: Combine items to create stronger equipment
- [ ] **Enhanced Randomness**: Integrate Chainlink VRF for production-grade RNG
- [ ] **Multiple Monster Types**: Different enemies with varying loot tables
- [ ] **Equipment Rarity Tiers**: Common, Rare, Epic, Legendary classifications

### Phase 2: Economic System (Q3 2025)
- [ ] **Marketplace**: Trade encrypted equipment (with optional stat revelation)
- [ ] **Token Economy**: In-game currency for transactions
- [ ] **Staking Mechanism**: Stake tokens to boost drop rates
- [ ] **Equipment Rental**: Lend equipment to other players
- [ ] **Auction System**: Bid on mystery equipment

### Phase 3: Advanced Gameplay (Q4 2025)
- [ ] **Guild System**: Team-based gameplay with shared rewards
- [ ] **Dungeon Raids**: Multi-player challenges with encrypted loot distribution
- [ ] **Leaderboards**: Privacy-preserving ranking system
- [ ] **Quests & Achievements**: Encrypted progress tracking
- [ ] **Character Progression**: Level up system with encrypted attributes

### Phase 4: Mainnet & Scaling (Q1 2026)
- [ ] **Mainnet Deployment**: Launch on Ethereum mainnet with FHEVM
- [ ] **Layer 2 Integration**: Deploy on Zama's optimized L2 solutions
- [ ] **Mobile App**: Native iOS/Android applications
- [ ] **Cross-Chain**: Bridge equipment to other FHE-enabled chains
- [ ] **3D Graphics**: Enhanced visual experience

### Phase 5: Advanced Features (Q2 2026)
- [ ] **AI-Powered NPCs**: Intelligent enemies with adaptive strategies
- [ ] **Governance DAO**: Community-driven game development
- [ ] **User-Generated Content**: Player-created dungeons and items
- [ ] **Encrypted Social Features**: Private messaging, guilds, and alliances
- [ ] **Real-World Integrations**: NFT equipment with physical merchandise

### Research & Innovation
- [ ] **Zero-Knowledge Proofs**: Hybrid ZK+FHE for ultra-efficient verification
- [ ] **Homomorphic Machine Learning**: AI-powered game balancing on encrypted data
- [ ] **FHE Optimizations**: Reduce gas costs through protocol improvements
- [ ] **Cross-Game Interoperability**: Use equipment across multiple FHE games
- [ ] **Privacy-Preserving Analytics**: Aggregate game statistics without exposing individual data

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Report Bugs**: Open issues for any bugs you find
2. **Suggest Features**: Propose new gameplay mechanics or improvements
3. **Submit PRs**: Fix bugs, add features, or improve documentation
4. **Improve Tests**: Expand test coverage
5. **Write Documentation**: Help others understand the codebase

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Lint your code (`npm run lint`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Standards

- Follow existing code style
- Write comprehensive tests for new features
- Update documentation as needed
- Use meaningful commit messages
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the **BSD-3-Clause-Clear License** - see the [LICENSE](LICENSE) file for details.

Key points:
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ Patent use explicitly NOT granted

## 🔗 Links & Resources

### Official Links
- **Live Demo**: [https://zamagame.netlify.app](https://zamagame.netlify.app)
- **Contract (Sepolia)**: [0xAC8119750D7a1b344d4c2A818083c1b676aA7e3a](https://sepolia.etherscan.io/address/0xAC8119750D7a1b344d4c2A818083c1b676aA7e3a)
- **Documentation**: [docs/](docs/)

### Zama Resources
- **Zama Website**: [https://zama.ai](https://zama.ai)
- **FHEVM Docs**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Zama Discord**: [https://discord.gg/zama](https://discord.fhe.org)
- **GitHub**: [https://github.com/zama-ai](https://github.com/zama-ai)
- **Relayer API**: [https://relayer.testnet.zama.cloud](https://relayer.testnet.zama.cloud)

### Learning Resources
- [FHE Basics](https://www.zama.ai/introduction-to-homomorphic-encryption)
- [FHEVM Tutorial](docs/zama_llm.md)
- [Hardhat Documentation](https://hardhat.org/docs)
- [React + Web3 Guide](https://wagmi.sh/react/getting-started)

## 🙏 Acknowledgments

- **Zama Team**: For pioneering FHE technology and providing excellent developer tools
- **FHEVM Community**: For inspiration and technical guidance
- **OpenZeppelin**: For secure smart contract patterns
- **Hardhat Team**: For the best Ethereum development environment
- **RainbowKit**: For beautiful wallet connection UX

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/ZamaGame/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ZamaGame/discussions)
- **Twitter**: [@ZamaGame](https://twitter.com/ZamaGame) (Coming Soon)
- **Discord**: Join our community server (Coming Soon)

---

<div align="center">

**Built with ❤️ using Zama's FHEVM**

[⬆ Back to Top](#-zamagame---encrypted-equipment-rpg)

</div>