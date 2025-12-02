# CSE 540: **Blockchain-Based Supply Chain Provenance System** (Team 11)


This project aims to develop a decentralized application (DApp) that leverages the Ethereum blockchain to ensure **authenticity, transparency, and end-to-end traceability** for products moving through a supply chain network.

The core of the system is the **SupplyChain.sol** smart contract, which consolidates all necessary logic, access control, and asset tracking into a single, efficient unit.

---

## 1. Project Description

The system is organized into three interconnected, logical modules, listed below:

1.  **Traceability System:** Tracks the location and movement of each product via a unique serial ID using **Event-Based Logging** for gas efficiency.
2.  **Trading Mechanism:** Allows for secure, cryptographically verifiable transfer of product ownership between verified stakeholders (Farmer, Distributor, Consumer).
3.  **State Management:** Utilizes a centralized `SupplyChainContext` to manage authentication, contract interaction, and role-based access control (RBAC) across the DApp.

### Key Features
- **Decentralized Traceability**: Immutable record of product ownership and movement via Solidity Events.
- **Role-Based Access Control**: Strict permissions for Admin, Farmer, Distributor, and Consumer roles.
- **Product Authentication**: Verify product authenticity and ownership history.
- **Transparent Supply Chain**: Complete visibility into product journey (Created -> Ordered -> In Transit -> Stored -> Delivered).
- **Tamper-Proof Records**: Blockchain ensures data integrity.

---

## 2. Dependencies and Setup Instructions

This project is built using the standard Ethereum development stack.

1.  **Node.js & npm:** Node.js (Version $\ge 10.16$) and npm (Version $\ge 5.6$) must be installed.
2.  **Truffle Framework:** Install Truffle globally for contract compilation and deployment:
    ```bash
    npm install -g truffle
    ```
3.  **Ganache:** Use the Ganache desktop application to run a local, private Ethereum network for fast testing.
4.  **MetaMask:** The browser extension is required for interacting with the DApp (client-side).
5.  **Clone Repository:** Clone the project locally:
    ```bash
    git clone https://github.com/nikhilSwami11/food-supplychain.git
    ```
6.  **Compile & Deploy:** Start Ganache and then run the standard migration process:
    ```bash
    truffle compile
    truffle migrate --reset
    ```

## 3. How to Use or Deploy (Core Workflow)

The DApp workflow is strictly controlled by **Role-Based Access Control (RBAC)** enforced in the contract:

1.  **Connect Wallet:** Connect MetaMask to the Ganache local blockchain.
2.  **Admin Setup:** The **`contractOwner`** calls `setFarmerRole(address)` and `setEntityRole(address)` to authorize Farmers and Distributors.
3.  **Register Product (Farmer):** A verified Farmer uses `registerProduct()` to create an item.
4.  **Place Order (Consumer):** A Consumer views available products and calls `placeOrder()` to initiate a purchase.
5.  **Transfer & Deliver (Distributor):** The Farmer transfers to a Distributor, who then manages the logistics (In Transit -> Stored -> Delivered) using `updateStatus()`.
6.  **View Traceability:** Any user can view the complete, immutable history of the product, fetched from blockchain **Events**.

## 4. Draft Contract Components and Signatures

The core logic resides in `contracts/SupplyChain.sol`. This table outlines the public interface (signatures) and high-level functionality.

| Function/Component | Signature/Interface | High-Level Functionality |
| :--- | :--- | :--- |
| **`Product` Struct** | `struct Product { ... }` | Defines the physical asset (ID, name, owner, origin, state, history). |
| **`setFarmerRole()`** | `function setFarmerRole(address _user) public onlyOwner` | **Admin function** to grant Farmer role. |
| **`setEntityRole()`** | `function setEntityRole(address _user) public onlyOwner` | **Admin function** to grant Distributor role. |
| **`registerProduct()`** | `function registerProduct(...) public onlyFarmer` | Registers a new product (State: Created). |
| **`placeOrder()`** | `function placeOrder(uint256 _id) public` | Consumer places an order for a product (State: Ordered). |
| **`updateStatus()`** | `function updateStatus(uint256 _id, State _state, string _ipfs) public` | Updates the product status (In Transit, Stored, Delivered). |
| **`transferOwnership()`** | `function transferOwnership(uint256 _id, address _newOwner) public` | Transfers legal ownership of the asset. |
| **`getProductHistory()`** | *(Frontend Only)* | Retrieves history by querying **indexed Events** (`ProductRegistered`, `OwnershipTransferred`, `StatusUpdated`). |
| **`onlyFarmer`** | `modifier onlyFarmer()` | Restricts access to verified Farmers. |

---

## 5. Team Members

| Name | Student ID | Role |
| :--- | :--- | :--- |
| **Sankalp Mucherla Srinath** | 1233531314 | Project Lead & Integration Coordinator |
| **Nikhil Swami** | 1233379331 | Smart Contract Developer |
| **Ayushmaan Kaushik** | 1234080707 | Front-End Developer |
| **Avaneesh Rajendra Shetti** | 1233765743 | Back-End & Database Engineer |
| **Deepikaa Anjan Kumar** | 1233513829 | Research & Documentation Lead |
