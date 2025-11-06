import Web3 from 'web3';

/**
 * Web3 Utilities for blockchain interaction
 * Handles MetaMask connection and Web3 initialization
 */

let web3Instance = null;

/**
 * Initialize Web3 with MetaMask provider
 * @returns {Object} Web3 instance and account
 */
export const initWeb3 = async () => {
  try {
    // Check if MetaMask is installed
    if (window.ethereum) {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create Web3 instance
      web3Instance = new Web3(window.ethereum);
      
      // Get connected accounts
      const accounts = await web3Instance.eth.getAccounts();
      
      // Get network ID
      const networkId = await web3Instance.eth.net.getId();
      
      return {
        web3: web3Instance,
        account: accounts[0],
        networkId: networkId
      };
    } else {
      throw new Error('MetaMask is not installed. Please install MetaMask to use this application.');
    }
  } catch (error) {
    console.error('Error initializing Web3:', error);
    throw error;
  }
};

/**
 * Get current Web3 instance
 * @returns {Object} Web3 instance
 */
export const getWeb3 = () => {
  if (!web3Instance) {
    throw new Error('Web3 not initialized. Call initWeb3() first.');
  }
  return web3Instance;
};

/**
 * Get current connected account
 * @returns {string} Account address
 */
export const getCurrentAccount = async () => {
  try {
    const web3 = getWeb3();
    const accounts = await web3.eth.getAccounts();
    return accounts[0];
  } catch (error) {
    console.error('Error getting current account:', error);
    throw error;
  }
};

/**
 * Listen for account changes
 * @param {Function} callback - Callback function to execute on account change
 */
export const onAccountChange = (callback) => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      callback(accounts[0]);
    });
  }
};

/**
 * Listen for network changes
 * @param {Function} callback - Callback function to execute on network change
 */
export const onNetworkChange = (callback) => {
  if (window.ethereum) {
    window.ethereum.on('chainChanged', (chainId) => {
      callback(chainId);
    });
  }
};

/**
 * Convert Wei to Ether
 * @param {string} wei - Amount in Wei
 * @returns {string} Amount in Ether
 */
export const weiToEther = (wei) => {
  const web3 = getWeb3();
  return web3.utils.fromWei(wei, 'ether');
};

/**
 * Convert Ether to Wei
 * @param {string} ether - Amount in Ether
 * @returns {string} Amount in Wei
 */
export const etherToWei = (ether) => {
  const web3 = getWeb3();
  return web3.utils.toWei(ether, 'ether');
};

