import { getWeb3 } from './web3Utils';

/**
 * Contract Utilities for smart contract interaction
 * Handles contract initialization and function calls
 */

let contractInstance = null;

/**
 * Initialize contract instance
 * @param {Object} contractABI - Contract ABI
 * @param {string} contractAddress - Deployed contract address
 * @returns {Object} Contract instance
 */
export const initContract = (contractABI, contractAddress) => {
  try {
    const web3 = getWeb3();
    contractInstance = new web3.eth.Contract(contractABI, contractAddress);
    return contractInstance;
  } catch (error) {
    console.error('Error initializing contract:', error);
    throw error;
  }
};

/**
 * Get current contract instance
 * @returns {Object} Contract instance
 */
export const getContract = () => {
  if (!contractInstance) {
    throw new Error('Contract not initialized. Call initContract() first.');
  }
  return contractInstance;
};

/**
 * Register a new product (Farmer only)
 * @param {number} productId - Unique product ID
 * @param {string} productName - Product name
 * @param {string} origin - Product origin
 * @param {string} fromAddress - Sender address
 * @returns {Object} Transaction receipt
 */
export const registerProduct = async (productId, productName, origin, fromAddress) => {
  try {
    const contract = getContract();
    const receipt = await contract.methods
      .registerProduct(productId, productName, origin)
      .send({ from: fromAddress });
    return receipt;
  } catch (error) {
    console.error('Error registering product:', error);
    throw error;
  }
};

/**
 * Transfer product ownership
 * @param {number} productId - Product ID
 * @param {string} newOwner - New owner address
 * @param {string} fromAddress - Current owner address
 * @returns {Object} Transaction receipt
 */
export const transferOwnership = async (productId, newOwner, fromAddress) => {
  try {
    const contract = getContract();
    const receipt = await contract.methods
      .transferOwnership(productId, newOwner)
      .send({ from: fromAddress });
    return receipt;
  } catch (error) {
    console.error('Error transferring ownership:', error);
    throw error;
  }
};

/**
 * Get product details
 * @param {number} productId - Product ID
 * @returns {Object} Product details
 */
export const getProduct = async (productId) => {
  try {
    const contract = getContract();
    const product = await contract.methods.getProduct(productId).call();
    return {
      id: product.id,
      name: product.name,
      currentOwner: product.currentOwner,
      origin: product.origin,
      isAuthentic: product.isAuthentic,
      ownershipHistory: product.ownershipHistory
    };
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
};

/**
 * Get product ownership history
 * @param {number} productId - Product ID
 * @returns {Array} Array of owner addresses
 */
export const getProductHistory = async (productId) => {
  try {
    const contract = getContract();
    const history = await contract.methods.getProductHistory(productId).call();
    return history;
  } catch (error) {
    console.error('Error getting product history:', error);
    throw error;
  }
};

/**
 * Verify product authenticity
 * @param {number} productId - Product ID
 * @returns {boolean} Authenticity status
 */
export const verifyProduct = async (productId) => {
  try {
    const contract = getContract();
    const isAuthentic = await contract.methods.verifyProduct(productId).call();
    return isAuthentic;
  } catch (error) {
    console.error('Error verifying product:', error);
    throw error;
  }
};

/**
 * Set farmer role (Admin only)
 * @param {string} userAddress - User address to grant farmer role
 * @param {string} fromAddress - Admin address
 * @returns {Object} Transaction receipt
 */
export const setFarmerRole = async (userAddress, fromAddress) => {
  try {
    const contract = getContract();
    const receipt = await contract.methods
      .setFarmerRole(userAddress)
      .send({ from: fromAddress });
    return receipt;
  } catch (error) {
    console.error('Error setting farmer role:', error);
    throw error;
  }
};

/**
 * Check if address is verified farmer
 * @param {string} address - Address to check
 * @returns {boolean} Farmer status
 */
export const isVerifiedFarmer = async (address) => {
  try {
    const contract = getContract();
    const isFarmer = await contract.methods.isVerifiedFarmer(address).call();
    return isFarmer;
  } catch (error) {
    console.error('Error checking farmer status:', error);
    throw error;
  }
};

/**
 * Get contract owner address
 * @returns {string} Contract owner address
 */
export const getContractOwner = async () => {
  try {
    const contract = getContract();
    const owner = await contract.methods.contractOwner().call();
    return owner;
  } catch (error) {
    console.error('Error getting contract owner:', error);
    throw error;
  }
};

