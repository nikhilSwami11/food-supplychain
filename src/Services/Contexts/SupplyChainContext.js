import React, { createContext, useState, useEffect, useContext } from 'react';
import { initWeb3, onAccountChange, onNetworkChange, getWeb3 } from '../Utils/web3Utils';
import SupplyChain from '../../Smart-Contract/SupplyChain.json';

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
// const CONTRACT_ABI = ... (Removed)
// const CONTRACT_ADDRESS = ... (Removed)

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
      const deployedNetwork = SupplyChain.networks[netId];
      if (!deployedNetwork) {
        throw new Error('Contract not deployed to detected network');
      }

      const contractInstance = new web3Instance.eth.Contract(
        SupplyChain.abi,
        deployedNetwork.address
      );
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

      try {
        // Get registration event (first owner)
        const registrationEvents = await contract.getPastEvents('ProductRegistered', {
          filter: { productId: productId },
          fromBlock: 0,
          toBlock: 'latest'
        });

        // Get transfer events (subsequent owners)
        const transferEvents = await contract.getPastEvents('OwnershipTransferred', {
          filter: { productId: productId },
          fromBlock: 0,
          toBlock: 'latest'
        });

        // Get status update events
        const statusEvents = await contract.getPastEvents('StatusUpdated', {
          filter: { productId: productId },
          fromBlock: 0,
          toBlock: 'latest'
        });

        let history = [];

        // Process Registration
        registrationEvents.forEach(event => {
          history.push({
            type: 'Registered',
            user: event.returnValues.farmer,
            blockNumber: event.blockNumber,
            details: 'Product Created'
          });
        });

        // Process Transfers
        transferEvents.forEach(event => {
          history.push({
            type: 'Transferred',
            user: event.returnValues.to,
            blockNumber: event.blockNumber,
            details: `Transferred from ${event.returnValues.from}`
          });
        });

        // Process Status Updates
        const statusLabels = ['Created', 'Ordered', 'In Transit', 'Stored', 'Delivered'];
        statusEvents.forEach(event => {
          history.push({
            type: 'StatusUpdated',
            user: event.returnValues.actor || 'Unknown',
            blockNumber: event.blockNumber,
            details: `Status updated to ${statusLabels[event.returnValues.newState]}`
          });
        });

        // Sort by block number
        history.sort((a, b) => a.blockNumber - b.blockNumber);

        return history;
      } catch (error) {
        console.error('Error getting product history:', error);
        return [];
      }
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
      setIsLoading(true);
      setError(null);

      try {
        if (!contract) throw new Error('Contract not initialized');
        const orders = await contract.methods.getMyOrders().call({ from: account });
        setIsLoading(false);
        return { success: true, orders };
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        return { success: false, error: err.message };
      }
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

