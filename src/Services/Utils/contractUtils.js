import { getWeb3 } from './web3Utils';



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
 * @param {string} ipfsHash - IPFS hash for product data
 * @param {string} fromAddress - Sender address
 * @returns {Object} Transaction receipt
 */
export const registerProduct = async (productId, productName, origin, ipfsHash, fromAddress) => {
  try {
    const contract = getContract();
    const receipt = await contract.methods
      .registerProduct(productId, productName, origin, ipfsHash)
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
      id: product[0],
      name: product[1],
      currentOwner: product[2],
      origin: product[3],
      isAuthentic: product[4],
      state: product[5],
      ipfsHash: product[6]
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

/**
 * Update product status (Current owner only)
 * @param {number} productId - Product ID
 * @param {number} newState - New state (0: Created, 1: InTransit, 2: Stored, 3: Delivered)
 * @param {string} ipfsData - IPFS hash for status update data
 * @param {string} fromAddress - Current owner address
 * @returns {Object} Transaction receipt
 */
export const updateStatus = async (productId, newState, ipfsData, fromAddress) => {
  try {
    const contract = getContract();
    const receipt = await contract.methods
      .updateStatus(productId, newState, ipfsData)
      .send({ from: fromAddress });
    return receipt;
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  }
};

/**
 * Set entity role (Admin only)
 * @param {string} userAddress - User address to grant entity role
 * @param {string} fromAddress - Admin address
 * @returns {Object} Transaction receipt
 */
export const setEntityRole = async (userAddress, fromAddress) => {
  try {
    const contract = getContract();
    const receipt = await contract.methods
      .setEntityRole(userAddress)
      .send({ from: fromAddress });
    return receipt;
  } catch (error) {
    console.error('Error setting entity role:', error);
    throw error;
  }
};

/**
 * Check if address is authorized entity
 * @param {string} address - Address to check
 * @returns {boolean} Entity authorization status
 */
export const isAuthorizedEntity = async (address) => {
  try {
    const contract = getContract();
    const isEntity = await contract.methods.isAuthorizedEntity(address).call();
    return isEntity;
  } catch (error) {
    console.error('Error checking entity status:', error);
    throw error;
  }
};

// ========== DISTRIBUTOR FUNCTIONS ==========

/**
 * Get all products currently owned by the caller (Distributor Inventory)
 * @returns {Array} Array of products owned by the caller
 */
export const getDistributorInventory = async () => {
  try {
    const contract = getContract();
    const inventory = await contract.methods.getDistributorInventory().call();
    return inventory;
  } catch (error) {
    console.error('Error getting distributor inventory:', error);
    throw error;
  }
};

/**
 * Get products that need to be delivered (in Stored state)
 * @returns {Array} Array of products in Stored state owned by the caller
 */
export const getDeliveryQueue = async () => {
  try {
    const contract = getContract();
    const queue = await contract.methods.getDeliveryQueue().call();
    return queue;
  } catch (error) {
    console.error('Error getting delivery queue:', error);
    throw error;
  }
};

/**
 * Get products that have been received but not yet stored (in InTransit state)
 * @returns {Array} Array of products in InTransit state owned by the caller
 */
export const getReceivedProducts = async () => {
  try {
    const contract = getContract();
    const received = await contract.methods.getReceivedProducts().call();
    return received;
  } catch (error) {
    console.error('Error getting received products:', error);
    throw error;
  }
};

/**
 * Get products that have been delivered (delivery history)
 * @returns {Array} Array of products that were delivered by the caller
 */
export const getDeliveryHistory = async () => {
  try {
    const contract = getContract();
    const history = await contract.methods.getDeliveryHistory().call();
    return history;
  } catch (error) {
    console.error('Error getting delivery history:', error);
    throw error;
  }
};

// ========== CONSUMER FUNCTIONS ==========

/**
 * Get all available products (in Created state)
 * @returns {Array} Array of available products
 */
export const getAvailableProducts = async () => {
  try {
    const contract = getContract();
    const products = await contract.methods.getAvailableProducts().call();
    return products;
  } catch (error) {
    console.error('Error getting available products:', error);
    throw error;
  }
};

/**
 * Place an order for a product (Consumer)
 * @param {number} productId - Product ID to order
 * @param {string} fromAddress - Consumer address
 * @returns {Object} Transaction receipt
 */
export const placeOrder = async (productId, fromAddress) => {
  try {
    const contract = getContract();
    const receipt = await contract.methods
      .placeOrder(productId)
      .send({ from: fromAddress });
    return receipt;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

/**
 * Get orders placed by the caller (Consumer)
 * @returns {Array} Array of products ordered by the caller
 */
export const getMyOrders = async () => {
  try {
    const contract = getContract();
    const web3 = getWeb3();
    const accounts = await web3.eth.getAccounts();
    const currentAccount = accounts[0];

    const orders = await contract.methods.getMyOrders().call({ from: currentAccount });
    return orders;
  } catch (error) {
    console.error('Error getting my orders:', error);
    throw error;
  }
};
