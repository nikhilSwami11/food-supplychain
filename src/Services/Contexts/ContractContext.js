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
  isVerifiedFarmer as isVerifiedFarmerUtil,
  getContractOwner as getContractOwnerUtil
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
            }
          ],
          "internalType": "struct SupplyChain.Product",
          "name": "",
          "type": "tuple"
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
    }
  ];
  const CONTRACT_ADDRESS = '0x8482C09E5Ee1f9C478E459bE1C84125D5781FD07';

 
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
        } catch (err) {
          console.error('Error checking roles:', err);
        }
      }
    };

    checkRoles();
  }, [contract, account]);

  
  const registerProduct = async (productId, productName, origin) => {
    setIsLoading(true);
    setError(null);

    try {
      const receipt = await registerProductUtil(productId, productName, origin, account);
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

  const value = {
    contract,
    contractOwner,
    isFarmer,
    isAdmin,
    isLoading,
    error,
    registerProduct,
    transferOwnership,
    getProduct,
    getProductHistory,
    verifyProduct,
    setFarmerRole
  };

  return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>;
};

export default ContractContext;

