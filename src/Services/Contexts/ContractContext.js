import React, { createContext, useState, useEffect, useContext } from 'react';
import { useSupplyChain } from './SupplyChainContext';
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


import SupplyChain from '../../Smart-Contract/SupplyChain.json';

const ContractContext = createContext();

export const ContractProvider = ({ children }) => {
  const { web3, account, isConnected } = useSupplyChain();
  const [contract, setContract] = useState(null);
  const [contractOwner, setContractOwner] = useState(null);
  const [isFarmer, setIsFarmer] = useState(false);
  const [isDistributor, setIsDistributor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (isConnected && web3) {
        try {
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = SupplyChain.networks[networkId];

          if (deployedNetwork) {
            const contractInstance = initContract(SupplyChain.abi, deployedNetwork.address);
            setContract(contractInstance);
          } else {
            console.error('Contract not deployed to detected network.');
            setError('Contract not deployed to detected network.');
          }
        } catch (err) {
          console.error('Error initializing contract:', err);
          setError(err.message);
        }
      }
    };
    init();
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

