# Blockchain for Transparency and Authenticity in Food Supply Chains

## Project Description

This project implements a **Blockchain-Based Supply Chain Provenance System** that leverages Ethereum smart contracts to build a decentralized and tamper-proof record of a product's journey from origin to consumer. The system uses Solidity for role-based verification and a React-based frontend for user interaction.

### Key Features
- **Decentralized Traceability**: Immutable record of product ownership and movement
- **Role-Based Access Control**: Different permissions for farmers, distributors, retailers, and consumers
- **Product Authentication**: Verify product authenticity and ownership history
- **Transparent Supply Chain**: Complete visibility into product journey
- **Tamper-Proof Records**: Blockchain ensures data integrity

---

## Team Members
- **Sankalp Mucherla Srinath** (1233531314) - Project Lead & Integration Coordinator
- **Nikhil Swami** (1233379331) - Smart Contract Developer
- **Ayushmaan Kaushik** (1234080707) - Front-End Developer
- **Avaneesh Rajendra Shetti** (1233765743) - Back-End & Database Engineer
- **Deepikaa Anjan Kumar** (1233513829) - Research & Documentation Lead

---

## Dependencies & Setup Instructions

### Prerequisites
- **Node.js** >= 10.16 and **npm** >= 5.6
- **Git** for version control
- **Truffle** - Install globally: `npm install -g truffle`
- **Ganache** - Download from [Truffle Suite](https://trufflesuite.com/ganache/)
- **MetaMask** - Browser extension for wallet management

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-github-repo-url>
   cd food-supplychain
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install smart contract dependencies**
   ```bash
   cd src/Smart-Contract
   npm install
   ```

4. **Setup Ganache**
   - Open Ganache and create a new workspace
   - Set RPC Server to `HTTP://127.0.0.1:7545`
   - Note the network ID and accounts

5. **Compile and deploy smart contracts**
   ```bash
   cd src/Smart-Contract
   truffle compile
   truffle migrate --reset
   ```

6. **Update contract configuration**
   - After deployment, copy the contract address from Ganache
   - Copy the contract ABI from `src/Smart-Contract/build/contracts/SupplyChain.json`
   - Update `CONTRACT_ADDRESS` and `CONTRACT_ABI` in `src/Services/Contexts/ContractContext.js`

7. **Start the React application**
   ```bash
   # From project root
   npm start
   ```

8. **Configure MetaMask**
   - Add Ganache network to MetaMask (RPC: http://127.0.0.1:7545, Chain ID: 1337)
   - Import an account from Ganache using its private key

---

## How to Use & Deploy

### Local Development

1. **Start Ganache** - Open Ganache and ensure it's running on port 7545
2. **Deploy Contracts** - Run `truffle migrate --reset` in `src/Smart-Contract`
3. **Update Contract Info** - Copy contract address and ABI to ContractContext.js
4. **Connect MetaMask** - Add Ganache network and import an account
5. **Start React App** - Run `npm start` in project root
6. **Access Application** - Open http://localhost:3000

### User Roles

- **Admin**: Verifies and approves farmers (first Ganache account is admin)
- **Farmer**: Registers products and initiates transfers
- **Consumer**: Views product history and verifies authenticity

### Main Workflows

1. **Verify Farmer** (Admin)
   - Connect with admin account (contract deployer)
   - Navigate to Admin page
   - Enter farmer address and click "Verify Farmer"

2. **Register Product** (Farmer)
   - Connect with verified farmer account
   - Navigate to Products page
   - Click "Register Product"
   - Enter Product ID, Name, and Origin
   - Submit transaction

3. **Transfer Ownership** (Current Owner)
   - Navigate to Products page
   - Search for product by ID
   - Click "Transfer Ownership"
   - Enter new owner address
   - Confirm transaction

4. **Verify Product** (Any User)
   - Navigate to Products page
   - Search for product ID
   - View complete ownership history
   - Check authenticity status

---

## Smart Contract Architecture

### SupplyChain.sol

**Core Data Structure:**
```solidity
struct Product {
    uint256 id;
    string name;
    address currentOwner;
    string origin;
    bool isAuthentic;
    address[] ownershipHistory;
}
```

**Key Functions:**

1. **setFarmerRole(address _user)** - Admin only
   - Grants verified farmer role to user
   - Allows farmer to register products
   - Emits no event

2. **registerProduct(uint256 _id, string _name, string _origin)** - Farmer only
   - Creates new product with unique ID
   - Sets initial owner as caller
   - Adds caller to ownership history
   - Emits ProductRegistered event

3. **transferOwnership(uint256 _id, address _newOwner)** - Current owner only
   - Transfers product to new owner
   - Records transfer in ownership history
   - Emits OwnershipTransferred event

4. **getProduct(uint256 _id)** - Public view
   - Returns complete product details
   - Includes all metadata and current owner

5. **getProductHistory(uint256 _id)** - Public view
   - Returns array of all previous owners
   - Shows complete product journey

6. **verifyProduct(uint256 _id)** - Public view
   - Returns authenticity status
   - Confirms product is genuine

**Events:**
- `ProductRegistered(uint256 productId, string name, address indexed farmer)`
- `OwnershipTransferred(uint256 productId, address indexed from, address indexed to)`

**Access Control:**
- `onlyOwner` - Contract owner only (admin functions)
- `onlyFarmer` - Verified farmers only (product registration)

---

## Frontend Architecture

### Technology Stack
- **React.js** 17 - UI framework
- **React Router v6** - Navigation
- **Web3.js** v1.6.0 - Blockchain interaction
- **Bootstrap 5** - Styling
- **MetaMask** - Wallet integration

### Folder Structure
```
src/
├── Components/          # Reusable UI components
│   └── Modals/         # Modal components
├── Pages/              # Page components
│   ├── Admin/          # Admin dashboard
│   ├── Dashboard/      # Main dashboard
│   ├── Farmers/        # Farmer management
│   ├── Products/       # Product listing
│   └── Profile.js      # User profile
├── Services/           # Business logic
│   ├── Contexts/       # React contexts (Auth, Contract)
│   └── Utils/          # Helper functions (web3, contract)
├── Layouts/            # Layout components
│   ├── Navbar/         # Navigation bar
│   └── Main/           # Main layout wrapper
└── Smart-Contract/     # Truffle project
    ├── contracts/      # Solidity contracts
    ├── migrations/     # Deployment scripts
    └── ABI/            # Contract ABIs
```

### Main Pages
- **Dashboard** - Overview and quick actions
- **Products** - Browse and trace products
- **Farmers** - View registered farmers
- **Admin** - Verify and manage farmers (admin only)
- **Profile** - User information and role

---

## High-Level Component Functionality

### Contexts
- **AuthContext** - Manages user authentication and wallet connection
  - Connects to MetaMask
  - Handles account changes
  - Manages connection state

- **ContractContext** - Manages blockchain interactions and contract calls
  - Initializes contract instance
  - Provides contract function wrappers
  - Manages user roles (admin, farmer)

### Key Components
- **Navbar** - Navigation and wallet connection status
- **Dashboard** - Statistics and quick action cards
- **RegisterProductModal** - Form to register new products
- **TransferOwnershipModal** - Form to transfer product ownership
- **ProductDetailsModal** - Shows complete product history and details

### Utilities
- **web3Utils.js** - Web3 initialization and provider management
  - Initialize Web3 with MetaMask
  - Get current account
  - Listen for account/network changes

- **contractUtils.js** - Contract function calls and interactions
  - Register products
  - Transfer ownership
  - Get product details and history
  - Verify products
  - Manage farmer roles

---

## Status
🚀 **In Development** - This is a draft submission for the assignment

### Completed
- ✅ Smart contract implementation
- ✅ Frontend folder structure
- ✅ Web3 integration utilities
- ✅ Context providers (Auth & Contract)
- ✅ All main pages (Dashboard, Products, Farmers, Admin, Profile)
- ✅ All modals (Register, Transfer, Details)
- ✅ Navigation and layout components
- ✅ Truffle configuration and migrations

### To Be Completed (Future Work)
- ⏳ Contract deployment to testnet
- ⏳ Comprehensive testing
- ⏳ Additional features (reviews, ratings)
- ⏳ Production deployment

---

## References
- [Ethereum Documentation](https://ethereum.org/en/developers)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [React Documentation](https://reactjs.org/)
- [Truffle Suite Documentation](https://trufflesuite.com/docs/)

---

## License
MIT License - Educational Project for CSE 540

---

## Notes
This is a draft submission for the course assignment. The smart contract is complete and functional. The frontend code structure is implemented with all necessary components, pages, and blockchain integration utilities. Further testing and deployment will be completed in the final submission.

