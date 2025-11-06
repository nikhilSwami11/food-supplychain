# Quick Setup Guide

## Step-by-Step Instructions

### 1. Install Prerequisites
```bash
# Install Node.js and npm (if not already installed)
# Download from: https://nodejs.org/

# Install Truffle globally
npm install -g truffle

# Download and install Ganache
# Download from: https://trufflesuite.com/ganache/

# Install MetaMask browser extension
# Download from: https://metamask.io/
```

### 2. Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd food-supplychain

# Install frontend dependencies
npm install

# Install smart contract dependencies
cd src/Smart-Contract
npm install
cd ../..
```

### 3. Setup Ganache
1. Open Ganache
2. Click "New Workspace"
3. Set RPC Server to `HTTP://127.0.0.1:7545`
4. Save workspace
5. Note the first account address (this will be the admin)

### 4. Deploy Smart Contract
```bash
cd src/Smart-Contract
truffle compile
truffle migrate --reset
```

### 5. Update Contract Configuration
After deployment, you'll see output like:
```
SupplyChain: 0x1234567890abcdef...
```

1. Copy the contract address
2. Open `src/Smart-Contract/build/contracts/SupplyChain.json`
3. Copy the entire `abi` array
4. Open `src/Services/Contexts/ContractContext.js`
5. Replace `CONTRACT_ABI = []` with the copied ABI
6. Replace `CONTRACT_ADDRESS = ''` with the copied address

### 6. Configure MetaMask
1. Open MetaMask
2. Click network dropdown → "Add Network"
3. Enter:
   - Network Name: Ganache
   - RPC URL: http://127.0.0.1:7545
   - Chain ID: 1337
   - Currency Symbol: ETH
4. Click "Save"
5. Import account from Ganache:
   - Click account icon → "Import Account"
   - Copy private key from Ganache (click key icon next to account)
   - Paste and import

### 7. Start the Application
```bash
# From project root
npm start
```

The app will open at http://localhost:3000

### 8. Test the Application

**As Admin (First Account):**
1. Connect wallet with first Ganache account
2. Go to Admin page
3. Verify a farmer (use second Ganache account address)

**As Farmer (Second Account):**
1. Switch to second account in MetaMask
2. Go to Products page
3. Click "Register Product"
4. Fill in details and submit

**As Consumer (Any Account):**
1. Go to Products page
2. Search for product by ID
3. View product history

---

## Troubleshooting

### MetaMask shows wrong balance
- Reset account in MetaMask: Settings → Advanced → Reset Account

### Contract not found error
- Make sure you updated CONTRACT_ADDRESS and CONTRACT_ABI in ContractContext.js
- Redeploy contract: `truffle migrate --reset`

### Transaction fails
- Make sure you have enough ETH in your account
- Check if you're using the correct account (admin for admin functions, farmer for registration)

### Port already in use
- Change port in package.json: `"start": "PORT=3001 react-scripts start"`

---

## Quick Reference

**Admin Account:** First Ganache account (contract deployer)
**Contract Location:** `src/Smart-Contract/contracts/SupplyChain.sol`
**Frontend Entry:** `src/App.js`
**Contract Config:** `src/Services/Contexts/ContractContext.js`

---

## Next Steps

1. Test all features
2. Add more accounts in Ganache
3. Test ownership transfers
4. Verify product history tracking
5. Prepare for final submission

