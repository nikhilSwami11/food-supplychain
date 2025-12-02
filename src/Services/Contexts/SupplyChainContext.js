import React, { createContext, useState, useEffect, useContext } from 'react';
import { initWeb3, onAccountChange, onNetworkChange, getWeb3 } from '../Utils/web3Utils';

/**
 * Supply Chain Context
 * Unified context for authentication, contract, and role-based operations
 * 
 * Roles: admin | farmer | distributor | consumer
 * States: Created(0) | Ordered(1) | InTransit(2) | Stored(3) | Delivered(4)
 * 
 * State Transitions:
 * - Created → Ordered: Consumer places order
 * - Ordered → InTransit: Farmer transfers to Distributor
 * - InTransit → Stored: Distributor marks as stored
 * - Stored → Delivered: Distributor delivers to Consumer
 */

const SupplyChainContext = createContext();

// Product State Enum (matches Solidity contract)
export const ProductState = {
  CREATED: 0,
  ORDERED: 1,
  IN_TRANSIT: 2,
  STORED: 3,
  DELIVERED: 4
};

export const ProductStateLabels = {
  [ProductState.CREATED]: 'Created',
  [ProductState.ORDERED]: 'Ordered',
  [ProductState.IN_TRANSIT]: 'In Transit',
  [ProductState.STORED]: 'Stored',
  [ProductState.DELIVERED]: 'Delivered'
};

// Role Enum
export const Role = {
  ADMIN: 'admin',
  FARMER: 'farmer',
  DISTRIBUTOR: 'distributor',
  CONSUMER: 'consumer'
};

export const useSupplyChain = () => {
  const context = useContext(SupplyChainContext);
  if (!context) {
    throw new Error('useSupplyChain must be used within SupplyChainProvider');
  }
  return context;
};

// Contract ABI (will be loaded from ContractContext)
const CONTRACT_ABI = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"productId","type":"uint256"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"productId","type":"uint256"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":true,"internalType":"address","name":"farmer","type":"address"}],"name":"ProductRegistered","type":"event"},
  {"inputs":[],"name":"contractOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isVerifiedFarmer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isAuthorizedEntity","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},
  {"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"setFarmerRole","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"setEntityRole","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_origin","type":"string"},{"internalType":"string","name":"_ipfsHash","type":"string"}],"name":"registerProduct","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"},{"internalType":"address","name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"},{"internalType":"enum SupplyChain.State","name":"_state","type":"uint8"},{"internalType":"string","name":"_ipfsData","type":"string"}],"name":"updateStatus","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"getProduct","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"currentOwner","type":"address"},{"internalType":"string","name":"origin","type":"string"},{"internalType":"bool","name":"isAuthentic","type":"bool"},{"internalType":"enum SupplyChain.State","name":"state","type":"uint8"},{"internalType":"string","name":"ipfsHash","type":"string"}],"stateMutability":"view","type":"function","constant":true},
  {"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"getProductHistory","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function","constant":true},
  {"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"verifyProduct","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},
  {"inputs":[],"name":"getAvailableProducts","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"currentOwner","type":"address"},{"internalType":"string","name":"origin","type":"string"},{"internalType":"bool","name":"isAuthentic","type":"bool"},{"internalType":"address[]","name":"ownershipHistory","type":"address[]"},{"internalType":"enum SupplyChain.State","name":"state","type":"uint8"},{"internalType":"string","name":"ipfsHash","type":"string"},{"internalType":"address","name":"orderedBy","type":"address"}],"internalType":"struct SupplyChain.Product[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function","constant":true},
  {"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"placeOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"getMyOrders","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"currentOwner","type":"address"},{"internalType":"string","name":"origin","type":"string"},{"internalType":"bool","name":"isAuthentic","type":"bool"},{"internalType":"address[]","name":"ownershipHistory","type":"address[]"},{"internalType":"enum SupplyChain.State","name":"state","type":"uint8"},{"internalType":"string","name":"ipfsHash","type":"string"},{"internalType":"address","name":"orderedBy","type":"address"}],"internalType":"struct SupplyChain.Product[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function","constant":true},
  {"inputs":[],"name":"getDistributorInventory","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"currentOwner","type":"address"},{"internalType":"string","name":"origin","type":"string"},{"internalType":"bool","name":"isAuthentic","type":"bool"},{"internalType":"address[]","name":"ownershipHistory","type":"address[]"},{"internalType":"enum SupplyChain.State","name":"state","type":"uint8"},{"internalType":"string","name":"ipfsHash","type":"string"},{"internalType":"address","name":"orderedBy","type":"address"}],"internalType":"struct SupplyChain.Product[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function","constant":true},
  {"inputs":[],"name":"getDeliveryQueue","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"currentOwner","type":"address"},{"internalType":"string","name":"origin","type":"string"},{"internalType":"bool","name":"isAuthentic","type":"bool"},{"internalType":"address[]","name":"ownershipHistory","type":"address[]"},{"internalType":"enum SupplyChain.State","name":"state","type":"uint8"},{"internalType":"string","name":"ipfsHash","type":"string"},{"internalType":"address","name":"orderedBy","type":"address"}],"internalType":"struct SupplyChain.Product[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function","constant":true},
  {"inputs":[],"name":"getReceivedProducts","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"currentOwner","type":"address"},{"internalType":"string","name":"origin","type":"string"},{"internalType":"bool","name":"isAuthentic","type":"bool"},{"internalType":"address[]","name":"ownershipHistory","type":"address[]"},{"internalType":"enum SupplyChain.State","name":"state","type":"uint8"},{"internalType":"string","name":"ipfsHash","type":"string"},{"internalType":"address","name":"orderedBy","type":"address"}],"internalType":"struct SupplyChain.Product[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function","constant":true},
  {"inputs":[],"name":"getDeliveryHistory","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"currentOwner","type":"address"},{"internalType":"string","name":"origin","type":"string"},{"internalType":"bool","name":"isAuthentic","type":"bool"},{"internalType":"address[]","name":"ownershipHistory","type":"address[]"},{"internalType":"enum SupplyChain.State","name":"state","type":"uint8"},{"internalType":"string","name":"ipfsHash","type":"string"},{"internalType":"address","name":"orderedBy","type":"address"}],"internalType":"struct SupplyChain.Product[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function","constant":true}
];

const CONTRACT_ADDRESS = '0x3ba7fe9160D7465e8d8B716Dc2941535AaCcF926';

export const SupplyChainProvider = ({ children }) => {
  // Connection state
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Contract state
  const [contract, setContract] = useState(null);
  const [contractOwner, setContractOwner] = useState(null);
  
  // Role state (single role per user)
  const [role, setRole] = useState(Role.CONSUMER); // Default to consumer
  
  // Loading/Error state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to determine role priority
  // Priority: Admin > Farmer > Distributor > Consumer
  const determineRole = async (contractInstance, userAccount, owner) => {
    try {
      if (owner && userAccount.toLowerCase() === owner.toLowerCase()) {
        return Role.ADMIN;
      }
      const isFarmer = await contractInstance.methods.isVerifiedFarmer(userAccount).call();
      if (isFarmer) {
        return Role.FARMER;
      }
      const isEntity = await contractInstance.methods.isAuthorizedEntity(userAccount).call();
      if (isEntity) {
        return Role.DISTRIBUTOR;
      }
      return Role.CONSUMER;
    } catch (err) {
      console.error('Error determining role:', err);
      return Role.CONSUMER;
    }
  };

  // ========== WALLET CONNECTION ==========
  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { web3: web3Instance, account: userAccount, networkId: netId } = await initWeb3();
      setWeb3(web3Instance);
      setAccount(userAccount);
      setNetworkId(netId);
      setIsConnected(true);
      localStorage.setItem('walletConnected', 'true');

      // Initialize contract
      const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      setContract(contractInstance);

      // Get contract owner and determine role
      const owner = await contractInstance.methods.contractOwner().call();
      setContractOwner(owner);
      const userRole = await determineRole(contractInstance, userAccount, owner);
      setRole(userRole);

      return { success: true, account: userAccount, role: userRole };
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
    setNetworkId(null);
    setIsConnected(false);
    setContract(null);
    setContractOwner(null);
    setRole(Role.CONSUMER);
    setError(null);
    localStorage.removeItem('walletConnected');
    window.location.reload();
  };

  // Handle account/network changes
  const handleAccountChange = async (accounts) => {
    if (accounts && accounts.length > 0) {
      window.location.reload();
    } else {
      disconnectWallet();
    }
  };

  const handleNetworkChange = () => {
    window.location.reload();
  };

  // Auto-connect on mount
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected');
    if (wasConnected === 'true') {
      connectWallet();
    }
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (isConnected) {
      onAccountChange(handleAccountChange);
      onNetworkChange(handleNetworkChange);
    }
  }, [isConnected]);

  // ========== COMMON FUNCTIONS (Read-only, available to all) ==========
  const common = {
    getProduct: async (productId) => {
      if (!contract) throw new Error('Contract not initialized');
      const p = await contract.methods.getProduct(productId).call();
      return { id: p[0], name: p[1], currentOwner: p[2], origin: p[3], isAuthentic: p[4], state: p[5], ipfsHash: p[6] };
    },
    getProductHistory: async (productId) => {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.methods.getProductHistory(productId).call();
    },
    verifyProduct: async (productId) => {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.methods.verifyProduct(productId).call();
    }
  };

  // ========== ADMIN FUNCTIONS ==========
  const admin = {
    verifyFarmer: async (userAddress) => {
      if (role !== Role.ADMIN) throw new Error('Only admin can verify farmers');
      if (!contract) throw new Error('Contract not initialized');
      return await contract.methods.setFarmerRole(userAddress).send({ from: account });
    },
    authorizeDistributor: async (userAddress) => {
      if (role !== Role.ADMIN) throw new Error('Only admin can authorize distributors');
      if (!contract) throw new Error('Contract not initialized');
      return await contract.methods.setEntityRole(userAddress).send({ from: account });
    }
  };

  // ========== FARMER FUNCTIONS ==========
  const farmer = {
    // Register a new product (State: Created)
    registerProduct: async (productId, productName, origin, ipfsHash) => {
      if (role !== Role.FARMER && role !== Role.ADMIN) throw new Error('Only farmers can register products');
      if (!contract) throw new Error('Contract not initialized');
      return await contract.methods.registerProduct(productId, productName, origin, ipfsHash).send({ from: account });
    },
    // Get products registered by this farmer (products I own)
    getMyProducts: async () => {
      if (!contract) throw new Error('Contract not initialized');
      const inventory = await contract.methods.getDistributorInventory().call({ from: account });
      return inventory;
    },
    // Get orders for my products (products I own that have been ordered)
    getOrders: async () => {
      if (!contract) throw new Error('Contract not initialized');
      console.log('farmer.getOrders - account:', account);

      // Try getDistributorInventory first (returns all products owned by caller)
      try {
        const allMyProducts = await contract.methods.getDistributorInventory().call({ from: account });
        console.log('farmer.getOrders - all my products:', allMyProducts);

        // Filter to only show products in ORDERED state with an orderedBy address
        const filtered = allMyProducts.filter(p => {
          const hasOrder = p.orderedBy !== '0x0000000000000000000000000000000000000000';
          const isOrderedState = parseInt(p.state) === ProductState.ORDERED;
          console.log(`Product ${p.id}: hasOrder=${hasOrder}, isOrderedState=${isOrderedState}, state=${p.state}, orderedBy=${p.orderedBy}`);
          return hasOrder && isOrderedState;
        });
        console.log('farmer.getOrders - filtered orders:', filtered);
        return filtered;
      } catch (err) {
        console.error('farmer.getOrders error:', err);
        return [];
      }
    },
    // Transfer product to distributor (State: Ordered → InTransit)
    transferToDistributor: async (productId, distributorAddress) => {
      if (role !== Role.FARMER && role !== Role.ADMIN) throw new Error('Only farmers can transfer to distributors');
      if (!contract) throw new Error('Contract not initialized');
      // First update status to InTransit
      await contract.methods.updateStatus(productId, ProductState.IN_TRANSIT, '').send({ from: account });
      // Then transfer ownership
      return await contract.methods.transferOwnership(productId, distributorAddress).send({ from: account });
    }
  };

  // ========== DISTRIBUTOR FUNCTIONS ==========
  const distributor = {
    // Get products received (State: InTransit, owned by me)
    getReceivedProducts: async () => {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.methods.getReceivedProducts().call({ from: account });
    },
    // Mark product as stored (State: InTransit → Stored)
    markAsStored: async (productId) => {
      if (role !== Role.DISTRIBUTOR && role !== Role.ADMIN) throw new Error('Only distributors can mark as stored');
      if (!contract) throw new Error('Contract not initialized');
      return await contract.methods.updateStatus(productId, ProductState.STORED, '').send({ from: account });
    },
    // Get products ready for delivery (State: Stored, owned by me)
    getDeliveryQueue: async () => {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.methods.getDeliveryQueue().call({ from: account });
    },
    // Deliver product to consumer (State: Stored → Delivered + transfer ownership)
    deliverToConsumer: async (productId, consumerAddress) => {
      if (role !== Role.DISTRIBUTOR && role !== Role.ADMIN) throw new Error('Only distributors can deliver');
      if (!contract) throw new Error('Contract not initialized');
      // First update status to Delivered
      await contract.methods.updateStatus(productId, ProductState.DELIVERED, '').send({ from: account });
      // Then transfer ownership to consumer
      return await contract.methods.transferOwnership(productId, consumerAddress).send({ from: account });
    },
    // Get full inventory (all products owned by me)
    getInventory: async () => {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.methods.getDistributorInventory().call({ from: account });
    },
    // Get delivery history
    getDeliveryHistory: async () => {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.methods.getDeliveryHistory().call({ from: account });
    }
  };

  // ========== CONSUMER FUNCTIONS ==========
  const consumer = {
    // Get available products (State: Created)
    getAvailableProducts: async () => {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.methods.getAvailableProducts().call();
    },
    // Place order (State: Created → Ordered)
    placeOrder: async (productId) => {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.methods.placeOrder(productId).send({ from: account });
    },
    // Get my orders (products I ordered)
    getMyOrders: async () => {
      if (!contract) throw new Error('Contract not initialized');
      const orders = await contract.methods.getMyOrders().call({ from: account });
      // Filter to only show products where I am the orderedBy
      return orders.filter(p => p.orderedBy.toLowerCase() === account.toLowerCase());
    }
  };

  // Role check helpers
  const isAdmin = role === Role.ADMIN;
  const isFarmer = role === Role.FARMER;
  const isDistributor = role === Role.DISTRIBUTOR;
  const isConsumer = role === Role.CONSUMER;

  // Top-level convenience functions
  const getProductHistory = common.getProductHistory;
  const getMyOrders = consumer.getMyOrders;

  return (
    <SupplyChainContext.Provider value={{
      // Connection state
      account, web3, networkId, isConnected, isLoading, error,
      connectWallet, disconnectWallet,

      // Role state
      role, isAdmin, isFarmer, isDistributor, isConsumer,
      contractOwner, contract,

      // Role-based function namespaces
      common, admin, farmer, distributor, consumer,

      // Top-level convenience functions
      getProductHistory, getMyOrders,

      // State enums for reference
      ProductState, ProductStateLabels, Role
    }}>
      {children}
    </SupplyChainContext.Provider>
  );
};

export default SupplyChainContext;

