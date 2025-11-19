import React, { useState } from 'react';
import Web3 from 'web3';

const Debug = () => {
  const [output, setOutput] = useState([]);
  const [web3, setWeb3] = useState(null);

  const CONTRACT_ADDRESS = '0xAcbF8C4B81bA590D98c963615eB3e5c82B6EF095';
  const EXPECTED_NETWORK_ID = '5777';

  const log = (message, type = 'info') => {
    setOutput(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const clearOutput = () => {
    setOutput([]);
  };

  const connectWallet = async () => {
    clearOutput();
    
    try {
      if (!window.ethereum) {
        log('❌ MetaMask is not installed!', 'danger');
        return;
      }

      log('🔄 Requesting account access...', 'info');
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      
      log(`✅ Connected to account: ${accounts[0]}`, 'success');
      
      // Auto check connection after connecting
      setTimeout(() => checkConnection(web3Instance), 500);
      
    } catch (error) {
      log(`❌ Error: ${error.message}`, 'danger');
    }
  };

  const checkConnection = async (web3Instance = web3) => {
    if (!output.length) clearOutput();
    
    try {
      if (!window.ethereum) {
        log('❌ MetaMask is not installed!', 'danger');
        return;
      }

      const web3ToUse = web3Instance || new Web3(window.ethereum);
      
      // Get network info
      const chainId = await web3ToUse.eth.getChainId();
      const networkId = await web3ToUse.eth.net.getId();
      const accounts = await web3ToUse.eth.getAccounts();
      
      log('📊 Connection Status:', 'primary');
      log(`Chain ID: ${chainId}`, 'info');
      log(`Network ID: ${networkId}`, 'info');
      log(`Expected Network ID: ${EXPECTED_NETWORK_ID}`, 'info');
      log(`Connected Account: ${accounts[0] || 'None'}`, 'info');
      
      if (networkId.toString() === EXPECTED_NETWORK_ID) {
        log('✅ Connected to correct network (Ganache)!', 'success');
      } else {
        log(`❌ Wrong network! Please switch to Localhost 7545 (Network ID: ${EXPECTED_NETWORK_ID})`, 'danger');
        log('👉 Open MetaMask and select "Localhost 7545" from the network dropdown', 'warning');
      }
      
      // Check balance
      if (accounts[0]) {
        const balance = await web3ToUse.eth.getBalance(accounts[0]);
        const ethBalance = web3ToUse.utils.fromWei(balance, 'ether');
        log(`Balance: ${ethBalance} ETH`, 'info');
      }
      
    } catch (error) {
      log(`❌ Error: ${error.message}`, 'danger');
    }
  };

  const testContract = async () => {
    clearOutput();
    
    try {
      const web3ToUse = web3 || new Web3(window.ethereum);
      
      if (!window.ethereum) {
        log('❌ Please install MetaMask first!', 'danger');
        return;
      }

      log('🔄 Testing contract connection...', 'info');
      
      // Check if contract exists
      const code = await web3ToUse.eth.getCode(CONTRACT_ADDRESS);
      
      if (code === '0x' || code === '0x0') {
        log(`❌ No contract found at address: ${CONTRACT_ADDRESS}`, 'danger');
        log('The contract is not deployed to this network!', 'danger');
        log('👉 Make sure you are connected to Localhost 7545 network', 'warning');
      } else {
        log(`✅ Contract found at: ${CONTRACT_ADDRESS}`, 'success');
        log(`Contract bytecode length: ${code.length} characters`, 'info');
        
        // Try to call contractOwner
        const CONTRACT_ABI = [
          {
            "inputs": [],
            "name": "contractOwner",
            "outputs": [{"internalType": "address", "name": "", "type": "address"}],
            "stateMutability": "view",
            "type": "function"
          }
        ];
        
        const contract = new web3ToUse.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        const owner = await contract.methods.contractOwner().call();
        
        log(`✅ Contract Owner: ${owner}`, 'success');
        
        const accounts = await web3ToUse.eth.getAccounts();
        if (accounts[0] && accounts[0].toLowerCase() === owner.toLowerCase()) {
          log('🎉 You are the contract owner (Admin)!', 'success');
        } else {
          log('ℹ️ You are not the contract owner', 'info');
          log(`Your account: ${accounts[0]}`, 'info');
          log(`Owner account: ${owner}`, 'info');
        }
      }
      
    } catch (error) {
      log(`❌ Error testing contract: ${error.message}`, 'danger');
      console.error(error);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    log('✅ Storage cleared! Reloading page...', 'success');
    setTimeout(() => window.location.reload(), 1000);
  };

  const forceNetworkSwitch = async () => {
    clearOutput();

    try {
      if (!window.ethereum) {
        log('❌ MetaMask is not installed!', 'danger');
        return;
      }

      log('🔄 Requesting network switch to Localhost 7545 (Chain ID: 0x539 / 1337)...', 'info');

      // Try to switch to the network with Chain ID 0x539 (1337)
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x539' }], // 0x539 = 1337 in hex
        });
        log('✅ Switched to Localhost network (Chain ID: 1337)!', 'success');
      } catch (switchError) {
        log(`⚠️ Could not switch to Chain ID 1337: ${switchError.message}`, 'warning');
        log('This is normal if you configured MetaMask with a different Chain ID', 'info');
      }

      // After switching, check the connection
      setTimeout(() => checkConnection(), 1000);

    } catch (error) {
      log(`❌ Error: ${error.message}`, 'danger');
    }
  };

  const checkMetaMaskNetwork = async () => {
    clearOutput();

    try {
      if (!window.ethereum) {
        log('❌ MetaMask is not installed!', 'danger');
        return;
      }

      log('🔍 Checking MetaMask network directly...', 'info');

      // Get network info directly from MetaMask
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const networkVersion = window.ethereum.networkVersion;
      const selectedAddress = window.ethereum.selectedAddress;

      log(`📊 MetaMask Status:`, 'primary');
      log(`Chain ID (from MetaMask): ${chainId} (${parseInt(chainId, 16)} decimal)`, 'info');
      log(`Network Version: ${networkVersion}`, 'info');
      log(`Selected Address: ${selectedAddress || 'None'}`, 'info');

      if (parseInt(chainId, 16) === 1337) {
        log('✅ MetaMask is on Chain ID 1337 (Localhost)!', 'success');
      } else if (parseInt(chainId, 16) === 1) {
        log('❌ MetaMask is on Chain ID 1 (Ethereum Mainnet)!', 'danger');
        log('👉 Please switch to "Localhost 7545" in MetaMask', 'warning');
      } else {
        log(`⚠️ MetaMask is on Chain ID ${parseInt(chainId, 16)}`, 'warning');
      }

    } catch (error) {
      log(`❌ Error: ${error.message}`, 'danger');
    }
  };

  const getAlertClass = (type) => {
    switch(type) {
      case 'success': return 'alert-success';
      case 'danger': return 'alert-danger';
      case 'warning': return 'alert-warning';
      case 'primary': return 'alert-primary';
      default: return 'alert-info';
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h2>🔍 MetaMask Connection Debugger</h2>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <button className="btn btn-success me-2 mb-2" onClick={connectWallet}>
              Connect Wallet
            </button>
            <button className="btn btn-primary me-2 mb-2" onClick={() => checkConnection()}>
              Check Connection (Web3)
            </button>
            <button className="btn btn-outline-primary me-2 mb-2" onClick={checkMetaMaskNetwork}>
              Check MetaMask Directly
            </button>
            <button className="btn btn-info me-2 mb-2" onClick={testContract}>
              Test Contract
            </button>
            <button className="btn btn-danger me-2 mb-2" onClick={forceNetworkSwitch}>
              🔄 Force Network Switch
            </button>
            <button className="btn btn-warning me-2 mb-2" onClick={clearStorage}>
              Clear Storage & Reload
            </button>
            <button className="btn btn-secondary mb-2" onClick={clearOutput}>
              Clear Output
            </button>
          </div>

          <div className="mt-4">
            {output.length === 0 ? (
              <div className="alert alert-secondary">
                Click "Connect Wallet" to start debugging
              </div>
            ) : (
              output.map((item, index) => (
                <div key={index} className={`alert ${getAlertClass(item.type)} mb-2`}>
                  <small className="text-muted me-2">[{item.timestamp}]</small>
                  {item.message}
                </div>
              ))
            )}
          </div>

          <div className="mt-4">
            <h5>Expected Configuration:</h5>
            <ul>
              <li><strong>Network:</strong> Localhost 7545</li>
              <li><strong>Network ID:</strong> 5777</li>
              <li><strong>Contract Address:</strong> <code>{CONTRACT_ADDRESS}</code></li>
              <li><strong>Admin Account:</strong> <code>0xa6349a9582d9a6B6C997CCBa45C4CeE1D7b144BA</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Debug;

