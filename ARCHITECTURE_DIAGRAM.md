# System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                     (React Frontend - Port 3000)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │Dashboard │  │ Products │  │ Farmers  │  │  Admin   │      │
│  │   Page   │  │   Page   │  │   Page   │  │   Page   │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Modals                                │  │
│  │  • Register Product  • Transfer  • Product Details      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │   AuthContext    │              │ ContractContext  │        │
│  │                  │              │                  │        │
│  │ • Wallet Connect │              │ • Contract Init  │        │
│  │ • Account Mgmt   │              │ • Role Check     │        │
│  │ • Network Info   │              │ • Transactions   │        │
│  └──────────────────┘              └──────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      UTILITY LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │   web3Utils.js   │              │ contractUtils.js │        │
│  │                  │              │                  │        │
│  │ • Init Web3      │              │ • Register Prod  │        │
│  │ • Get Account    │              │ • Transfer Own   │        │
│  │ • Event Listen   │              │ • Get Product    │        │
│  └──────────────────┘              │ • Verify Product │        │
│                                    └──────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      WEB3 PROVIDER                              │
│                        (MetaMask)                               │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                   BLOCKCHAIN LAYER                              │
│                  (Ethereum - Ganache)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              SupplyChain.sol                             │  │
│  │                                                          │  │
│  │  • Product Struct                                        │  │
│  │  • Role-Based Access Control                            │  │
│  │  • Product Registration                                  │  │
│  │  • Ownership Transfer                                    │  │
│  │  • Product Verification                                  │  │
│  │  • Ownership History                                     │  │
│  │                                                          │  │
│  │  Events:                                                 │  │
│  │  • ProductRegistered                                     │  │
│  │  • OwnershipTransferred                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ 1. Connect Wallet
     ↓
┌─────────────────┐
│   AuthContext   │ ← MetaMask
└────┬────────────┘
     │
     │ 2. Initialize Contract
     ↓
┌──────────────────┐
│ ContractContext  │
└────┬─────────────┘
     │
     │ 3. User Action (Register Product)
     ↓
┌──────────────────┐
│  Page/Modal      │
└────┬─────────────┘
     │
     │ 4. Call Contract Function
     ↓
┌──────────────────┐
│ contractUtils.js │
└────┬─────────────┘
     │
     │ 5. Send Transaction
     ↓
┌──────────────────┐
│   Web3/MetaMask  │
└────┬─────────────┘
     │
     │ 6. Execute on Blockchain
     ↓
┌──────────────────┐
│ SupplyChain.sol  │
└────┬─────────────┘
     │
     │ 7. Emit Event
     ↓
┌──────────────────┐
│   Blockchain     │
└────┬─────────────┘
     │
     │ 8. Transaction Receipt
     ↓
┌──────────────────┐
│   UI Update      │
└──────────────────┘
```

---

## Component Hierarchy

```
App.js
│
├── AuthProvider
│   │
│   └── ContractProvider
│       │
│       └── Router
│           │
│           └── MainLayout
│               │
│               ├── Navbar
│               │
│               └── Routes
│                   │
│                   ├── Dashboard
│                   │
│                   ├── Products
│                   │   ├── RegisterProductModal
│                   │   ├── ProductDetailsModal
│                   │   └── TransferOwnershipModal
│                   │
│                   ├── Farmers
│                   │
│                   ├── Admin
│                   │
│                   └── Profile
```

---

## Smart Contract Structure

```
SupplyChain.sol
│
├── State Variables
│   ├── products (mapping)
│   ├── contractOwner (address)
│   └── isVerifiedFarmer (mapping)
│
├── Structs
│   └── Product
│       ├── id
│       ├── name
│       ├── currentOwner
│       ├── origin
│       ├── isAuthentic
│       └── ownershipHistory[]
│
├── Events
│   ├── ProductRegistered
│   └── OwnershipTransferred
│
├── Modifiers
│   ├── onlyOwner
│   └── onlyFarmer
│
└── Functions
    ├── setFarmerRole()
    ├── registerProduct()
    ├── transferOwnership()
    ├── getProduct()
    ├── getProductHistory()
    └── verifyProduct()
```

---

## User Role Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         ADMIN                               │
│  (Contract Owner - First Ganache Account)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Can:                                                       │
│  • Verify farmers (setFarmerRole)                          │
│  • View all products                                        │
│  • Access admin panel                                       │
│                                                             │
│  Cannot:                                                    │
│  • Register products (not a farmer)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          ↓ Verifies
┌─────────────────────────────────────────────────────────────┐
│                        FARMER                               │
│  (Verified by Admin)                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Can:                                                       │
│  • Register products (registerProduct)                      │
│  • Transfer ownership of their products                     │
│  • View all products                                        │
│                                                             │
│  Cannot:                                                    │
│  • Verify other farmers                                     │
│  • Transfer products they don't own                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          ↓ Registers Products
┌─────────────────────────────────────────────────────────────┐
│                       CONSUMER                              │
│  (Any Account)                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Can:                                                       │
│  • View products                                            │
│  • Verify product authenticity                             │
│  • View ownership history                                   │
│  • Receive transferred products                            │
│                                                             │
│  Cannot:                                                    │
│  • Register new products                                    │
│  • Verify farmers                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Product Lifecycle

```
1. REGISTRATION
   ┌──────────────────┐
   │  Farmer creates  │
   │  new product     │
   └────────┬─────────┘
            │
            ↓
   ┌──────────────────┐
   │ Product stored   │
   │ on blockchain    │
   │ ID: 1            │
   │ Owner: Farmer    │
   │ Origin: Farm     │
   └────────┬─────────┘
            │
            ↓
2. TRANSFER TO DISTRIBUTOR
   ┌──────────────────┐
   │ Farmer transfers │
   │ to Distributor   │
   └────────┬─────────┘
            │
            ↓
   ┌──────────────────┐
   │ Ownership updated│
   │ History: [Farmer,│
   │  Distributor]    │
   └────────┬─────────┘
            │
            ↓
3. TRANSFER TO RETAILER
   ┌──────────────────┐
   │ Distributor      │
   │ transfers to     │
   │ Retailer         │
   └────────┬─────────┘
            │
            ↓
   ┌──────────────────┐
   │ Ownership updated│
   │ History: [Farmer,│
   │  Distributor,    │
   │  Retailer]       │
   └────────┬─────────┘
            │
            ↓
4. TRANSFER TO CONSUMER
   ┌──────────────────┐
   │ Retailer sells   │
   │ to Consumer      │
   └────────┬─────────┘
            │
            ↓
   ┌──────────────────┐
   │ Final ownership  │
   │ History: [Farmer,│
   │  Distributor,    │
   │  Retailer,       │
   │  Consumer]       │
   └──────────────────┘
            │
            ↓
5. VERIFICATION
   ┌──────────────────┐
   │ Consumer verifies│
   │ complete history │
   │ and authenticity │
   └──────────────────┘
```

---

## Technology Stack Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  React 17  │  React Router v6  │  Bootstrap 5              │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                 BLOCKCHAIN INTEGRATION                      │
├─────────────────────────────────────────────────────────────┤
│  Web3.js v1.6.0  │  MetaMask  │  Context API               │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                   BLOCKCHAIN LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Ethereum  │  Solidity 0.8.0  │  Ganache (Local)           │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                  DEVELOPMENT TOOLS                          │
├─────────────────────────────────────────────────────────────┤
│  Truffle  │  Node.js  │  npm  │  Git                       │
└─────────────────────────────────────────────────────────────┘
```

---

This architecture ensures:
- ✅ Separation of concerns
- ✅ Reusable components
- ✅ Secure blockchain interaction
- ✅ Role-based access control
- ✅ Transparent and immutable records

