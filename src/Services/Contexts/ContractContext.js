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

/**
 * Contract Context
 * Manages smart contract interactions
 */

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

  // Contract ABI and Address (to be updated after deployment)
  const CONTRACT_ABI = []; // Add your contract ABI here
  const CONTRACT_ADDRESS = ''; // Add your deployed contract address here

  /**
   * Initialize contract on wallet connection
   */
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

  /**
   * Check user roles
   */
  useEffect(() => {
    const checkRoles = async () => {
      if (contract && account) {
        try {
          // Check if user is contract owner (admin)
          const owner = await getContractOwnerUtil();
          setContractOwner(owner);
          setIsAdmin(owner.toLowerCase() === account.toLowerCase());

          // Check if user is verified farmer
          const farmerStatus = await isVerifiedFarmerUtil(account);
          setIsFarmer(farmerStatus);
        } catch (err) {
          console.error('Error checking roles:', err);
        }
      }
    };

    checkRoles();
  }, [contract, account]);

  /**
   * Register a new product
   */
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

  /**
   * Transfer product ownership
   */
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

  /**
   * Get product details
   */
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

  /**
   * Get product history
   */
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

  /**
   * Verify product
   */
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

  /**
   * Set farmer role (Admin only)
   */
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

