# Quick Commands Reference

## Installation Commands

### Install Global Dependencies
```bash
# Install Truffle globally
npm install -g truffle

# Verify installation
truffle version
```

### Install Project Dependencies
```bash
# Install frontend dependencies
npm install

# Install smart contract dependencies
cd src/Smart-Contract
npm install
cd ../..
```

---

## Smart Contract Commands

### Compile Contract
```bash
cd src/Smart-Contract
truffle compile
```

### Deploy Contract to Ganache
```bash
cd src/Smart-Contract
truffle migrate --reset
```

### Run Contract Tests (if you add tests)
```bash
cd src/Smart-Contract
truffle test
```

### Open Truffle Console
```bash
cd src/Smart-Contract
truffle console
```

---

## Frontend Commands

### Start Development Server
```bash
# From project root
npm start
```
Opens at http://localhost:3000

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

---

## Git Commands

### Initialize Repository
```bash
git init
```

### Add All Files
```bash
git add .
```

### Commit Changes
```bash
git commit -m "Initial commit - Supply Chain Blockchain Project"
```

### Add Remote Repository
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### Push to GitHub
```bash
git branch -M main
git push -u origin main
```

### Check Status
```bash
git status
```

### View Commit History
```bash
git log
```

---

## Ganache Commands

### Start Ganache (GUI)
- Open Ganache application
- Click "Quickstart" or "New Workspace"
- Ensure RPC Server is http://127.0.0.1:7545

### Start Ganache (CLI)
```bash
ganache-cli -p 7545
```

---

## MetaMask Setup

### Add Ganache Network
1. Open MetaMask
2. Click network dropdown
3. Click "Add Network"
4. Enter:
   - Network Name: Ganache
   - RPC URL: http://127.0.0.1:7545
   - Chain ID: 1337
   - Currency Symbol: ETH

### Import Account
1. Click account icon
2. Click "Import Account"
3. Copy private key from Ganache
4. Paste and import

### Reset Account (if needed)
1. Settings → Advanced
2. Click "Reset Account"

---

## Useful npm Commands

### Check npm Version
```bash
npm --version
```

### Check Node Version
```bash
node --version
```

### List Installed Packages
```bash
npm list --depth=0
```

### Update Packages
```bash
npm update
```

### Clear npm Cache
```bash
npm cache clean --force
```

---

## Troubleshooting Commands

### Kill Process on Port 3000
```bash
# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Remove node_modules and Reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

### Clear React Cache
```bash
rm -rf node_modules/.cache
```

---

## Contract Interaction (Truffle Console)

### Get Contract Instance
```javascript
let instance = await SupplyChain.deployed()
```

### Get Contract Owner
```javascript
let owner = await instance.contractOwner()
```

### Set Farmer Role
```javascript
let accounts = await web3.eth.getAccounts()
await instance.setFarmerRole(accounts[1], {from: accounts[0]})
```

### Register Product
```javascript
await instance.registerProduct(1, "Apple", "California", {from: accounts[1]})
```

### Get Product
```javascript
let product = await instance.getProduct(1)
console.log(product)
```

### Transfer Ownership
```javascript
await instance.transferOwnership(1, accounts[2], {from: accounts[1]})
```

### Get Product History
```javascript
let history = await instance.getProductHistory(1)
console.log(history)
```

---

## Quick Testing Workflow

### 1. Start Ganache
```bash
# Open Ganache GUI or run:
ganache-cli -p 7545
```

### 2. Deploy Contract
```bash
cd src/Smart-Contract
truffle migrate --reset
```

### 3. Copy Contract Info
- Copy contract address from deployment output
- Copy ABI from `src/Smart-Contract/build/contracts/SupplyChain.json`
- Update `src/Services/Contexts/ContractContext.js`

### 4. Start Frontend
```bash
# From project root
npm start
```

### 5. Connect MetaMask
- Switch to Ganache network
- Import account from Ganache

### 6. Test Features
- Connect wallet
- Verify farmer (as admin)
- Register product (as farmer)
- Transfer ownership
- View product history

---

## Environment Variables (Optional)

### Create .env file
```bash
# In project root
touch .env
```

### Add Variables
```
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_NETWORK_ID=1337
```

### Use in Code
```javascript
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS
```

---

## Helpful Aliases (Optional)

Add to your `.bashrc` or `.zshrc`:

```bash
# Smart contract aliases
alias tc='cd src/Smart-Contract && truffle compile'
alias tm='cd src/Smart-Contract && truffle migrate --reset'
alias tt='cd src/Smart-Contract && truffle test'

# Frontend aliases
alias ns='npm start'
alias nb='npm run build'

# Git aliases
alias gs='git status'
alias ga='git add .'
alias gc='git commit -m'
alias gp='git push'
```

---

## Quick Reference URLs

- **Ganache**: https://trufflesuite.com/ganache/
- **Truffle Docs**: https://trufflesuite.com/docs/
- **Web3.js Docs**: https://web3js.readthedocs.io/
- **React Docs**: https://reactjs.org/
- **Solidity Docs**: https://docs.soliditylang.org/
- **MetaMask**: https://metamask.io/

---

## Common Issues & Solutions

### Issue: "Module not found"
```bash
npm install
```

### Issue: "Port 3000 already in use"
```bash
# Kill process or use different port
PORT=3001 npm start
```

### Issue: "Contract not deployed"
```bash
cd src/Smart-Contract
truffle migrate --reset
```

### Issue: "MetaMask transaction fails"
- Reset account in MetaMask
- Check you have enough ETH
- Verify you're on correct network

### Issue: "Nonce too high"
- Reset account in MetaMask: Settings → Advanced → Reset Account

---

## Development Workflow

1. **Start Ganache** → Open Ganache GUI
2. **Deploy Contract** → `truffle migrate --reset`
3. **Update Config** → Copy address & ABI to ContractContext.js
4. **Start Frontend** → `npm start`
5. **Connect Wallet** → MetaMask to Ganache
6. **Test Features** → Use the application
7. **Make Changes** → Edit code
8. **Redeploy if needed** → `truffle migrate --reset`
9. **Refresh Browser** → See changes

---

## Before Submission

```bash
# 1. Ensure everything is committed
git status
git add .
git commit -m "Final submission"

# 2. Push to GitHub
git push origin main

# 3. Verify on GitHub
# Open repository in browser and check all files are there

# 4. Update github_repository_link.txt with your URL

# 5. Submit!
```

---

Good luck with your project! 🚀

