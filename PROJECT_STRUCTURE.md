# Project Structure Overview

## Complete File Structure

```
food-supplychain/
├── public/
│   └── index.html                          # HTML template
├── src/
│   ├── Components/                         # Reusable components
│   │   └── Modals/
│   │       ├── RegisterProductModal.js     # Product registration form
│   │       ├── ProductDetailsModal.js      # Product details display
│   │       └── TransferOwnershipModal.js   # Ownership transfer form
│   ├── Pages/                              # Page components
│   │   ├── Admin/
│   │   │   ├── Admin.js                    # Admin dashboard
│   │   │   └── Admin.css
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.js                # Main dashboard
│   │   │   └── Dashboard.css
│   │   ├── Farmers/
│   │   │   ├── Farmers.js                  # Farmers page
│   │   │   └── Farmers.css
│   │   ├── Products/
│   │   │   ├── Products.js                 # Products page
│   │   │   └── Products.css
│   │   └── Profile.js                      # User profile
│   ├── Services/                           # Business logic
│   │   ├── Contexts/
│   │   │   ├── AuthContext.js              # Authentication context
│   │   │   └── ContractContext.js          # Contract interaction context
│   │   └── Utils/
│   │       ├── web3Utils.js                # Web3 utilities
│   │       └── contractUtils.js            # Contract utilities
│   ├── Layouts/                            # Layout components
│   │   ├── Navbar/
│   │   │   ├── Navbar.js                   # Navigation bar
│   │   │   └── Navbar.css
│   │   └── Main/
│   │       ├── MainLayout.js               # Main layout wrapper
│   │       └── MainLayout.css
│   ├── Smart-Contract/                     # Truffle project
│   │   ├── contracts/
│   │   │   ├── SupplyChain.sol             # Main smart contract
│   │   │   └── Migrations.sol              # Truffle migrations
│   │   ├── migrations/
│   │   │   ├── 1_initial_migration.js
│   │   │   └── 2_deploy_contracts.js
│   │   ├── truffle-config.js               # Truffle configuration
│   │   └── package.json                    # Smart contract dependencies
│   ├── App.js                              # Main app component
│   ├── App.css                             # Global styles
│   ├── index.js                            # Entry point
│   └── index.css                           # Base styles
├── package.json                            # Frontend dependencies
├── README.md                               # Main documentation
├── SETUP_GUIDE.md                          # Setup instructions
├── PROJECT_STRUCTURE.md                    # This file
├── github_repository_link.txt              # GitHub link placeholder
└── .gitignore                              # Git ignore rules
```

## Component Descriptions

### Frontend Components

#### Pages
- **Dashboard**: Main landing page with overview and quick actions
- **Products**: Search, view, and manage products
- **Farmers**: View verified farmers
- **Admin**: Admin panel for verifying farmers (admin only)
- **Profile**: User profile and role information

#### Modals
- **RegisterProductModal**: Form for farmers to register new products
- **ProductDetailsModal**: Display product details and ownership history
- **TransferOwnershipModal**: Form to transfer product ownership

#### Layouts
- **Navbar**: Navigation bar with wallet connection
- **MainLayout**: Main layout wrapper for all pages

### Services

#### Contexts
- **AuthContext**: Manages MetaMask connection and user authentication
- **ContractContext**: Manages smart contract interactions and user roles

#### Utils
- **web3Utils.js**: Web3 initialization and helper functions
- **contractUtils.js**: Smart contract function wrappers

### Smart Contract

#### Contracts
- **SupplyChain.sol**: Main contract with product registration and tracking
- **Migrations.sol**: Truffle migrations contract

#### Migrations
- **1_initial_migration.js**: Initial migration
- **2_deploy_contracts.js**: Deploy SupplyChain contract

## Key Features by File

### AuthContext.js
- Connect/disconnect wallet
- Handle account changes
- Manage connection state
- Auto-reconnect on page load

### ContractContext.js
- Initialize contract instance
- Check user roles (admin, farmer)
- Wrapper functions for all contract methods
- Error handling for transactions

### web3Utils.js
- Initialize Web3 with MetaMask
- Get current account
- Listen for account/network changes
- Wei/Ether conversion utilities

### contractUtils.js
- registerProduct()
- transferOwnership()
- getProduct()
- getProductHistory()
- verifyProduct()
- setFarmerRole()
- isVerifiedFarmer()
- getContractOwner()

### SupplyChain.sol
- Product struct definition
- Role-based access control
- Product registration
- Ownership transfer
- Product verification
- Ownership history tracking

## Data Flow

1. **User connects wallet** → AuthContext → Web3 initialized
2. **Contract initialized** → ContractContext → Contract instance created
3. **User roles checked** → ContractContext → Admin/Farmer status determined
4. **User performs action** → Page/Modal → ContractContext → contractUtils → Smart Contract
5. **Transaction confirmed** → Event emitted → UI updated

## Technology Stack

### Frontend
- React 17
- React Router v6
- Bootstrap 5
- Web3.js v1.6.0

### Smart Contract
- Solidity 0.8.0
- Truffle
- Ganache

### Development Tools
- MetaMask
- Node.js
- npm

## Configuration Files

### package.json
- Frontend dependencies
- Scripts (start, build, test)

### truffle-config.js
- Network configuration (Ganache)
- Compiler settings (Solidity 0.8.0)

### .gitignore
- node_modules
- build artifacts
- environment variables

## Important Notes

1. **Contract Address & ABI**: Must be updated in ContractContext.js after deployment
2. **Admin Account**: First Ganache account that deploys the contract
3. **Network**: Ganache on localhost:7545
4. **Chain ID**: 1337 for Ganache

## Next Steps for Development

1. Deploy contract to Ganache
2. Update CONTRACT_ADDRESS and CONTRACT_ABI in ContractContext.js
3. Test all features
4. Add error handling
5. Add loading states
6. Add success/error notifications
7. Write tests
8. Deploy to testnet
9. Final production deployment

