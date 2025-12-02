import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import {
  initContract,
  registerProduct as registerProductUtil,
  transferOwnership as transferOwnershipUtil,
  getProduct as getProductUtil,
  getProductHistory as getProductHistoryUtil,
  verifyProduct as verifyProductUtil,
  setFarmerRole as setFarmerRoleUtil,
  setEntityRole as setEntityRoleUtil,
  isVerifiedFarmer as isVerifiedFarmerUtil,
  isAuthorizedEntity as isAuthorizedEntityUtil,
  updateStatus as updateStatusUtil,
  getContractOwner as getContractOwnerUtil,
  getDistributorInventory as getDistributorInventoryUtil,
  getDeliveryQueue as getDeliveryQueueUtil,
  getReceivedProducts as getReceivedProductsUtil,
  getDeliveryHistory as getDeliveryHistoryUtil,
  getAvailableProducts as getAvailableProductsUtil,
  placeOrder as placeOrderUtil,
  getMyOrders as getMyOrdersUtil
} from '../Utils/contractUtils';


const ContractContext = createContext();

export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within ContractProvider');
  }
  return context;
};

export const ContractProvider = ({ children }) => {
  const { web3, account, isConnected } = useAuth();
  const [contract, setContract] = useState(null);
  const [contractOwner, setContractOwner] = useState(null);
  const [isFarmer, setIsFarmer] = useState(false);
  const [isDistributor, setIsDistributor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


  const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "productId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "productId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmer",
          "type": "address"
        }
      ],
      "name": "ProductRegistered",
      "type": "event"
    },

    {
      "inputs": [],
      "name": "contractOwner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "isVerifiedFarmer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "products",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "currentOwner",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "origin",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "isAuthentic",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "ipfsHash",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "setFarmerRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "setEntityRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "isAuthorizedEntity",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_origin",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_ipfsHash",
          "type": "string"
        }
      ],
      "name": "registerProduct",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        }
      ],
      "name": "getProduct",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "currentOwner",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "origin",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "isAuthentic",
          "type": "bool"
        },
        {
          "internalType": "enum SupplyChain.State",
          "name": "state",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "ipfsHash",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        }
      ],
      "name": "getProductHistory",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        }
      ],
      "name": "verifyProduct",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        },
        {
          "internalType": "enum SupplyChain.State",
          "name": "_state",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "_ipfsData",
          "type": "string"
        }
      ],
      "name": "updateStatus",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getDistributorInventory",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "currentOwner",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "origin",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "isAuthentic",
              "type": "bool"
            },
            {
              "internalType": "address[]",
              "name": "ownershipHistory",
              "type": "address[]"
            },
            {
              "internalType": "string",
              "name": "ipfsHash",
              "type": "string"
            },
            {
              "internalType": "enum SupplyChain.State",
              "name": "state",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "orderedBy",
              "type": "address"
            }
          ],
          "internalType": "struct SupplyChain.Product[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getDeliveryQueue",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "currentOwner",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "origin",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "isAuthentic",
              "type": "bool"
            },
            {
              "internalType": "address[]",
              "name": "ownershipHistory",
              "type": "address[]"
            },
            {
              "internalType": "string",
              "name": "ipfsHash",
              "type": "string"
            },
            {
              "internalType": "enum SupplyChain.State",
              "name": "state",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "orderedBy",
              "type": "address"
            }
          ],
          "internalType": "struct SupplyChain.Product[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getReceivedProducts",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "currentOwner",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "origin",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "isAuthentic",
              "type": "bool"
            },
            {
              "internalType": "address[]",
              "name": "ownershipHistory",
              "type": "address[]"
            },
            {
              "internalType": "string",
              "name": "ipfsHash",
              "type": "string"
            },
            {
              "internalType": "enum SupplyChain.State",
              "name": "state",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "orderedBy",
              "type": "address"
            }
          ],
          "internalType": "struct SupplyChain.Product[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getDeliveryHistory",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "currentOwner",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "origin",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "isAuthentic",
              "type": "bool"
            },
            {
              "internalType": "address[]",
              "name": "ownershipHistory",
              "type": "address[]"
            },
            {
              "internalType": "string",
              "name": "ipfsHash",
              "type": "string"
            },
            {
              "internalType": "enum SupplyChain.State",
              "name": "state",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "orderedBy",
              "type": "address"
            }
          ],
          "internalType": "struct SupplyChain.Product[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getAvailableProducts",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "currentOwner",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "origin",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "isAuthentic",
              "type": "bool"
            },
            {
              "internalType": "address[]",
              "name": "ownershipHistory",
              "type": "address[]"
            },
            {
              "internalType": "enum SupplyChain.State",
              "name": "state",
              "type": "uint8"
            },
            {
              "internalType": "string",
              "name": "ipfsHash",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "orderedBy",
              "type": "address"
            }
          ],
          "internalType": "struct SupplyChain.Product[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        }
      ],
      "name": "placeOrder",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMyOrders",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "currentOwner",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "origin",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "isAuthentic",
              "type": "bool"
            },
            {
              "internalType": "address[]",
              "name": "ownershipHistory",
              "type": "address[]"
            },
            {
              "internalType": "enum SupplyChain.State",
              "name": "state",
              "type": "uint8"
            },
            {
              "internalType": "string",
              "name": "ipfsHash",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "orderedBy",
              "type": "address"
            }
          ],
          "internalType": "struct SupplyChain.Product[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    }
  ];
  const CONTRACT_ADDRESS = '0x3ba7fe9160D7465e8d8B716Dc2941535AaCcF926';

 
  useEffect(() => {
    if (isConnected && web3 && CONTRACT_ABI.length > 0 && CONTRACT_ADDRESS) {
      try {
        const contractInstance = initContract(CONTRACT_ABI, CONTRACT_ADDRESS);
        setContract(contractInstance);
      } catch (err) {
        console.error('Error initializing contract:', err);
        setError(err.message);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, web3]);


  useEffect(() => {
    const checkRoles = async () => {
      if (contract && account) {
        try {

          const owner = await getContractOwnerUtil();
          setContractOwner(owner);
          setIsAdmin(owner.toLowerCase() === account.toLowerCase());


          const farmerStatus = await isVerifiedFarmerUtil(account);
          setIsFarmer(farmerStatus);

          // Check if distributor (authorized entity but NOT farmer)
          const entityStatus = await isAuthorizedEntityUtil(account);
          setIsDistributor(entityStatus && !farmerStatus);
        } catch (err) {
          console.error('Error checking roles:', err);
        }
      }
    };

    checkRoles();
  }, [contract, account]);


  const registerProduct = async (productId, productName, origin, ipfsHash) => {
    setIsLoading(true);
    setError(null);

    try {
      const receipt = await registerProductUtil(productId, productName, origin, ipfsHash, account);
      setIsLoading(false);
      return { success: true, receipt };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  
  const transferOwnership = async (productId, newOwner) => {
    setIsLoading(true);
    setError(null);

    try {
      const receipt = await transferOwnershipUtil(productId, newOwner, account);
      setIsLoading(false);
      return { success: true, receipt };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  
  const getProduct = async (productId) => {
    setIsLoading(true);
    setError(null);

    try {
      const product = await getProductUtil(productId);
      setIsLoading(false);
      return { success: true, product };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  
  const getProductHistory = async (productId) => {
    setIsLoading(true);
    setError(null);

    try {
      const history = await getProductHistoryUtil(productId);
      setIsLoading(false);
      return { success: true, history };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

 
  const verifyProduct = async (productId) => {
    setIsLoading(true);
    setError(null);

    try {
      const isAuthentic = await verifyProductUtil(productId);
      setIsLoading(false);
      return { success: true, isAuthentic };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };


  const setFarmerRole = async (userAddress) => {
    setIsLoading(true);
    setError(null);

    try {
      const receipt = await setFarmerRoleUtil(userAddress, account);
      setIsLoading(false);
      return { success: true, receipt };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };


  const setEntityRole = async (userAddress) => {
    setIsLoading(true);
    setError(null);

    try {
      const receipt = await setEntityRoleUtil(userAddress, account);
      setIsLoading(false);
      return { success: true, receipt };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };


  const updateStatus = async (productId, newState, ipfsData) => {
    setIsLoading(true);
    setError(null);

    try {
      const receipt = await updateStatusUtil(productId, newState, ipfsData, account);
      setIsLoading(false);
      return { success: true, receipt };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };


  const isAuthorizedEntity = async (address) => {
    setIsLoading(true);
    setError(null);

    try {
      const isEntity = await isAuthorizedEntityUtil(address);
      setIsLoading(false);
      return { success: true, isEntity };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  // ========== DISTRIBUTOR FUNCTIONS ==========

  const getDistributorInventory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const inventory = await getDistributorInventoryUtil();
      setIsLoading(false);
      return { success: true, inventory };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  const getDeliveryQueue = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queue = await getDeliveryQueueUtil();
      setIsLoading(false);
      return { success: true, queue };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  const getReceivedProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const received = await getReceivedProductsUtil();
      setIsLoading(false);
      return { success: true, received };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  const getDeliveryHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const history = await getDeliveryHistoryUtil();
      setIsLoading(false);
      return { success: true, history };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  // ========== CONSUMER FUNCTIONS ==========

  const getAvailableProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const products = await getAvailableProductsUtil();
      setIsLoading(false);
      return { success: true, products };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  const placeOrder = async (productId) => {
    setIsLoading(true);
    setError(null);

    try {
      const receipt = await placeOrderUtil(productId, account);
      setIsLoading(false);
      return { success: true, receipt };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  const getMyOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const orders = await getMyOrdersUtil();
      setIsLoading(false);
      return { success: true, orders };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  const value = {
    contract,
    contractOwner,
    isFarmer,
    isDistributor,
    isAdmin,
    isLoading,
    error,
    registerProduct,
    transferOwnership,
    getProduct,
    getProductHistory,
    verifyProduct,
    setFarmerRole,
    setEntityRole,
    updateStatus,
    isAuthorizedEntity,
    getDistributorInventory,
    getDeliveryQueue,
    getReceivedProducts,
    getDeliveryHistory,
    getAvailableProducts,
    placeOrder,
    getMyOrders
  };

  return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>;
};

export default ContractContext;

