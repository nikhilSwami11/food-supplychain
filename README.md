# CSE 540: **Blockchain-Based Supply Chain Provenance System** (Team 11)

This project aims to develop a decentralized application (DApp) that leverages the Ethereum blockchain to ensure **authenticity, transparency, and end-to-end traceability** for products moving through a supply chain network.

The core of the system is the **SupplyChain.sol** smart contract, which consolidates all necessary logic, access control, and asset tracking into a single, efficient unit.

---

## 1. Project Description

The system is organized into three interconnected, logical modules:

1.  **Traceability System:** Tracks the location and movement of each product via a unique serial ID.
2.  **Trading Mechanism:** Allows for secure, cryptographically verifiable transfer of product ownership between verified stakeholders (e.g., Farmer to Distributor).
3.  **(Future) Reputation System:** Designed to incorporate immutable consumer reviews to build consumer trust.

### Key Features
- **Decentralized Traceability**: Immutable record of product ownership and movement
- **Role-Based Access Control**: Different permissions for farmers, distributors, retailers, and consumers
- **Product Authentication**: Verify product authenticity and ownership history
- **Transparent Supply Chain**: Complete visibility into product journey
- **Tamper-Proof Records**: Blockchain ensures data integrity

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
2.  **Admin Setup:** The **`contractOwner`** (the account that deployed the contract) calls `setFarmerRole(address)` to authorize initial stakeholders.
3.  **Register Product (Farmer):** A verified Farmer uses `registerProduct()` to create an item and inject it into the supply chain.
4.  **Transfer Ownership (Trading):** The current owner calls `transferOwnership(new_owner_address)` to move the item to the next stakeholder.
5.  **View Traceability:** Any user can call the view function `getProductHistory(id)` on the web interface to view the complete, immutable path of the product.

## 4. Draft Contract Components and Signatures

The core logic resides in `contracts/SupplyChain.sol`. This table outlines the public interface (signatures) and high-level functionality.

| Function/Component | Signature/Interface | High-Level Functionality |
| :--- | :--- | :--- |
| **`Product` Struct** | `struct Product { ... }` | Defines the physical asset (ID, name, owner, origin, history). |
| **`setFarmerRole()`** | `function setFarmerRole(address _user) public onlyOwner` | **Admin function** used by the `contractOwner` to grant permission to a Farmer address. |
| **`registerProduct()`** | `function registerProduct(uint256 _id, string memory _name, string memory _origin) public onlyFarmer` | Registers a new product. Restricted to authorized Farmers via the `onlyFarmer` modifier. |
| **`transferOwnership()`** | `function transferOwnership(uint256 _id, address _newOwner) public` | Updates product ownership to track movement (Trading Module). Requires caller to be the current owner. |
| **`getProductHistory()`** | `function getProductHistory(uint256 _id) public view returns (address[] memory)` | **Retrieves the complete, historical trace** of all addresses that have owned the product (Traceability). |
| **`verifyProduct()`** | `function verifyProduct(uint256 _id) public view returns (bool)` | Checks and returns the current authenticity status of the product. |
| **`onlyFarmer`** | `modifier onlyFarmer()` | Reusable code used to enforce that only verified addresses can register products. |

---

## 5. Team Members

| Name | Student ID | Role |
| :--- | :--- | :--- |
| **Sankalp Mucherla Srinath** | 1233531314 | Project Lead & Integration Coordinator |
| **Nikhil Swami** | 1233379331 | Smart Contract Developer |
| **Ayushmaan Kaushik** | 1234080707 | Front-End Developer |
| **Avaneesh Rajendra Shetti** | 1233765743 | Back-End & Database Engineer |
| **Deepikaa Anjan Kumar** | 1233513829 | Research & Documentation Lead |
